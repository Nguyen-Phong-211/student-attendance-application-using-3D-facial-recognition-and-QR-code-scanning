import random
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

# cố gắng import các model từ đường dẫn phổ biến; chỉnh nếu project bạn để ở chỗ khác
from classes.models import Class as ClassModel
from subjects.models import Subject, LessonSlot
from rooms.models import Room
from classes.models import Schedule

# Attempt imports for Lecturer, LecturerSubject, SubjectClass, Semester
# (nhiều project đặt các model này ở app khác nhau -> thử nhiều chỗ)
Lecturer = None
LecturerSubject = None
SubjectClass = None
Semester = None

try:
    from lecturers.models import Lecturer
except Exception:
    try:
        from subjects.models import Lecturer  # fallback
    except Exception:
        Lecturer = None

for modpath in ("lecturer_subjects.models", "subjects.models", "lecturers.models"):
    if LecturerSubject is None:
        try:
            mod = __import__(modpath, fromlist=["LecturerSubject"])
            LecturerSubject = getattr(mod, "LecturerSubject")
        except Exception:
            LecturerSubject = LecturerSubject  # keep None

for modpath in ("subjects.models", "subject_classes.models"):
    if SubjectClass is None:
        try:
            mod = __import__(modpath, fromlist=["SubjectClass"])
            SubjectClass = getattr(mod, "SubjectClass")
        except Exception:
            SubjectClass = SubjectClass

for modpath in ("semesters.models", "subjects.models"):
    if Semester is None:
        try:
            mod = __import__(modpath, fromlist=["Semester"])
            Semester = getattr(mod, "Semester")
        except Exception:
            Semester = Semester


class Command(BaseCommand):
    help = "Seed schedules with rules: >=3 per subject, no conflict (room/class/lecturer), lab rooms for practical subjects."

    def add_arguments(self, parser):
        parser.add_argument(
            "--per-subject",
            type=int,
            default=3,
            help="Số schedules cần tạo cho mỗi subject (mặc định 3).",
        )
        parser.add_argument(
            "--max-tries",
            type=int,
            default=200,
            help="Số lần thử tối đa để tìm slot/phòng/giảng viên hợp lệ cho 1 lịch.",
        )
        parser.add_argument(
            "--include-sunday",
            action="store_true",
            help="Cho phép day_of_week = 7 (Chủ nhật).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Chạy thử mà không ghi vào DB.",
        )

    def handle(self, *args, **options):
        per_subject = options["per_subject"]
        max_tries = options["max_tries"]
        include_sunday = options["include_sunday"]
        dry_run = options["dry_run"]

        # load base data
        subjects = list(Subject.objects.select_related("department", "academic_year").all())
        slots = list(LessonSlot.objects.select_related("shift_id").all())
        rooms = list(Room.objects.all())
        classes = list(ClassModel.objects.select_related("department", "academic_year").all())

        if not subjects:
            self.stdout.write(self.style.ERROR("Không có Subject trong DB."))
            return
        if not slots:
            self.stdout.write(self.style.ERROR("Không có LessonSlot trong DB."))
            return
        if not rooms:
            self.stdout.write(self.style.ERROR("Không có Room trong DB."))
            return
        if not classes:
            self.stdout.write(self.style.ERROR("Không có Class trong DB."))
            return
        if LecturerSubject is None:
            self.stdout.write(self.style.WARNING(
                "Không tìm thấy model LecturerSubject; script sẽ không thể gán giảng viên chính xác. "
                "Hãy chắc chắn model LecturerSubject tồn tại hoặc sửa import."
            ))

        # days: 1 = Monday ... 6 = Saturday, optional 7
        valid_days = list(range(1, 8 if include_sunday else 7))

        # phân loại phòng: lab = A5.* hoặc room_type == 'Thực hành'
        lab_rooms = [r for r in rooms if (getattr(r, "room_type", "") == "Thực hành") or str(getattr(r, "room_name", "")).startswith("A5.")]
        theory_rooms = [r for r in rooms if r not in lab_rooms]

        # preload subject_class mapping (subject_id, class_id) -> lecturer_id (nếu có)
        sc_map = {}
        if SubjectClass is not None:
            for sc in SubjectClass.objects.all().only("subject_id", "class_id", "lecturer_id", "semester_id"):
                sc_map[(sc.subject_id, sc.class_id)] = sc.lecturer_id

        # preload used combinations từ DB (để tránh conflict với schedule đã có)
        used_room_slot_day = set()
        used_class_slot_day = set()
        used_lecturer_slot_day = set()

        # nếu có LecturerSubject & SubjectClass, ta có thể thu được giảng viên đã gán cho schedule hiện có
        existing_schedules = Schedule.objects.all().only("room_id", "slot_id", "day_of_week", "class_id", "subject_id")
        for s in existing_schedules:
            if s.day_of_week is None:
                continue
            used_room_slot_day.add((s.room_id, s.slot_id, s.day_of_week))
            used_class_slot_day.add((s.class_id, s.slot_id, s.day_of_week))
            # tìm giảng viên qua subject_class mapping
            lecturer_id = sc_map.get((s.subject_id, s.class_id))
            if lecturer_id:
                used_lecturer_slot_day.add((lecturer_id, s.slot_id, s.day_of_week))

        created = 0
        skipped_subjects = 0

        # lấy danh sách semester theo academic_year khi cần tạo SubjectClass
        semester_cache = {}
        if Semester is not None:
            for sem in Semester.objects.all().select_related("academic_year"):
                semester_cache.setdefault(sem.academic_year_id, []).append(sem)

        # bắt đầu tạo schedule
        for subject in subjects:
            # lấy danh sách giảng viên có mapping trong LecturerSubject (và cùng khoa)
            lecturers_qs = []
            if LecturerSubject is not None:
                lecturers_qs = list(LecturerSubject.objects.filter(subject=subject).select_related("lecturer"))
            # rút ra Lecture objects, và filter cùng khoa
            lecturers = []
            for ls in lecturers_qs:
                lec = getattr(ls, "lecturer", None)
                if lec is None:
                    continue
                # match department (nếu model Lecturer có trường department)
                try:
                    lec_dept = getattr(lec, "department", None)
                    if lec_dept and subject.department and lec_dept.pk != subject.department.pk:
                        continue
                except Exception:
                    # nếu không thể truy cập department, vẫn giữ lại
                    pass
                lecturers.append(lec)

            if not lecturers:
                self.stdout.write(self.style.WARNING(f"[SKIP] Subject '{subject}' không có lecturer trong LecturerSubject (bỏ qua)"))
                skipped_subjects += 1
                continue

            # chọn classes cùng academic_year + department (ưu tiên)
            candidate_classes = [c for c in classes if getattr(c, "academic_year_id", getattr(c, "academic_year", None) and c.academic_year.pk) == subject.academic_year_id and getattr(c, "department_id", getattr(c, "department", None) and c.department.pk) == subject.department_id]
            # try broader if none: same academic_year, or same department
            if not candidate_classes:
                candidate_classes = [c for c in classes if getattr(c, "academic_year_id", None) == subject.academic_year_id]
            if not candidate_classes:
                candidate_classes = [c for c in classes if getattr(c, "department_id", None) == subject.department_id]
            if not candidate_classes:
                candidate_classes = classes  # fallback

            # choose room pool based on practical credits
            try:
                practical = int(getattr(subject, "practical_credits", 0) or 0) > 0
            except Exception:
                practical = False

            room_pool = lab_rooms if practical and lab_rooms else (theory_rooms if theory_rooms else rooms)

            # create at least per_subject schedules
            made_for_subject = 0
            tries_for_subject = 0

            while made_for_subject < per_subject and tries_for_subject < max_tries:
                tries_for_subject += 1

                slot = random.choice(slots)
                day = random.choice(valid_days)
                room = random.choice(room_pool)
                class_obj = random.choice(candidate_classes)
                lecturer = random.choice(lecturers)

                # conflict checks
                key_room = (room.pk, slot.pk, day)
                if key_room in used_room_slot_day:
                    continue
                key_class = (class_obj.pk, slot.pk, day)
                if key_class in used_class_slot_day:
                    continue
                key_lect = (lecturer.pk, slot.pk, day)
                if key_lect in used_lecturer_slot_day:
                    continue

                # ensure subject & class academic_year match (to satisfy "gắn với academic_year phù hợp")
                try:
                    class_ay = getattr(class_obj, "academic_year", None)
                    class_ay_id = class_ay.pk if class_ay is not None else getattr(class_obj, "academic_year_id", None)
                except Exception:
                    class_ay_id = getattr(class_obj, "academic_year_id", None)
                subj_ay_id = getattr(subject, "academic_year_id", None)

                if class_ay_id != subj_ay_id:
                    # skip this combination to ensure matching academic year
                    # (we previously tried to filter classes to same academic_year; this is a safety)
                    continue

                # create/get SubjectClass mapping (so that lecturer assigned to this subject+class is recorded)
                # We need a semester for that mapping; pick one in the same academic year if possible
                chosen_semester = None
                if Semester is not None:
                    sems = semester_cache.get(subj_ay_id) or []
                    if sems:
                        chosen_semester = random.choice(sems)

                sc_created = False
                if SubjectClass is not None:
                    # try to find existing SubjectClass for (subject, class_obj)
                    sc_kwargs = {"subject": subject, "class_id": class_obj}
                    sc_defaults = {}
                    if chosen_semester is not None:
                        sc_kwargs_for_get = {"subject": subject, "class_id": class_obj, "semester": chosen_semester}
                    else:
                        sc_kwargs_for_get = {"subject": subject, "class_id": class_obj}
                    try:
                        sc_obj, sc_created = SubjectClass.objects.get_or_create(
                            **sc_kwargs_for_get,
                            defaults={"lecturer": lecturer}
                        )
                        # if exists but lecturer is not set, try to set it
                        if not sc_created:
                            # if sc has no lecturer, set it
                            if getattr(sc_obj, "lecturer_id", None) is None:
                                sc_obj.lecturer = lecturer
                                sc_obj.save(update_fields=["lecturer"])
                    except Exception:
                        # fallback: try get_or_create without semester
                        try:
                            sc_obj, sc_created = SubjectClass.objects.get_or_create(
                                subject=subject,
                                class_id=class_obj,
                                defaults={"lecturer": lecturer, "semester": chosen_semester} if chosen_semester else {"lecturer": lecturer}
                            )
                        except Exception:
                            sc_obj = None
                else:
                    sc_obj = None

                # Build start_time/end_time as datetime (use this week's Monday as baseline)
                today = timezone.localdate()
                monday = today - timedelta(days=today.weekday())
                date_for_day = monday + timedelta(days=day - 1)
                try:
                    start_dt = timezone.make_aware(datetime.combine(date_for_day, slot.start_time))
                    end_dt = timezone.make_aware(datetime.combine(date_for_day, slot.end_time))
                except Exception:
                    # if slot.start_time is a string or weird, fallback to naive combine (less ideal)
                    start_dt = datetime.combine(date_for_day, slot.start_time)
                    end_dt = datetime.combine(date_for_day, slot.end_time)

                # determine lesson_type from room (or fallback)
                room_name = str(getattr(room, "room_name", "") or "")
                room_type = getattr(room, "room_type", "") or ("Thực hành" if room_name.startswith("A5.") else "Lý thuyết")
                lesson_type = "Thực hành" if (room_type == "Thực hành" or room_name.startswith("A5.")) else "Lý thuyết"

                # Create schedule
                if not dry_run:
                    try:
                        Schedule.objects.create(
                            class_id=class_obj,
                            subject_id=subject,
                            start_time=start_dt,
                            end_time=end_dt,
                            repeat_weekly="1",
                            latitude=getattr(room, "latitude", 0) or 0,
                            longitude=getattr(room, "longitude", 0) or 0,
                            slot=slot,
                            room=room,
                            lesson_type=lesson_type,
                            day_of_week=day,
                        )
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Failed to create schedule for {subject} - {e}"))
                        continue

                # mark used
                used_room_slot_day.add((room.pk, slot.pk, day))
                used_class_slot_day.add((class_obj.pk, slot.pk, day))
                used_lecturer_slot_day.add((lecturer.pk, slot.pk, day))

                made_for_subject += 1
                created += 1

                self.stdout.write(self.style.SUCCESS(
                    f"Created schedule: Subject='{subject}' | Class='{class_obj}' | Lecturer='{lecturer}' | Room='{room.room_name}' | Slot='{slot.slot_name}' | Day={day}"
                ))

            if made_for_subject < per_subject:
                self.stdout.write(self.style.WARNING(
                    f"Subject '{subject}' chỉ tạo được {made_for_subject}/{per_subject} schedules (có thể do giới hạn tài nguyên/conflicts)."
                ))
                skipped_subjects += 1

        self.stdout.write(self.style.SUCCESS(f"Done. Created {created} schedules. Subjects with incomplete schedules: {skipped_subjects}"))
        if dry_run:
            self.stdout.write(self.style.WARNING("Dry-run: no DB changes were saved."))