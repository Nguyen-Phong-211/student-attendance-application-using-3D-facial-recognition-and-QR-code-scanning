from students.models import Student
from lecturers.models import SubjectClass

def get_students_for_class_subject(class_id, subject_id, lecturer_account_id):
    """
    Trả về danh sách sinh viên theo lớp + môn mà giảng viên dạy.
    """
    try:
        is_teaching = SubjectClass.objects.filter(
            class_id_id=class_id,
            subject_id=subject_id,
            lecturer__account_id=lecturer_account_id
        ).exists()

        if not is_teaching:
            print("⚠️ Giảng viên không dạy lớp/môn này.")
            return []

        students = Student.objects.filter(
            class_students__class_id=class_id,
            studentsubject__subject_id=subject_id
        ).distinct().order_by("fullname")

        print(f"✅ Lấy được {students.count()} sinh viên trong lớp {class_id}, môn {subject_id}")
        return students

    except Exception as e:
        print(f"❌ Lỗi khi lấy sinh viên: {e}")
        return []
