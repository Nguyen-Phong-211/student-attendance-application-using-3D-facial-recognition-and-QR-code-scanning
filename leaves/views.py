from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from students.models import Student
from classes.models import ClassStudent
from .serializers import LeaveRequestSerializer, SaveLeaveRequestSerializer
from lecturers.models import SubjectClass
from classes.models import Schedule
from django.db import connection
from rest_framework import viewsets
from .models import LeaveRequest

# ==================================================
# Class LeaveRequestView
# ==================================================
# class LeaveRequestView(APIView):
#     """
#     API gets leave request data
#     student_id, subject_id, academic_year_id, semester_id are passed in by frontend
#     """
#     def get(self, request, account_id, subject_id, academic_year_id, semester_id):
#         try:
#             student = Student.objects.filter(account_id=account_id).select_related("department").first()
#             if not student:
#                 return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

#             # Get active classes
#             class_students = ClassStudent.objects.filter(
#                 student=student,
#                 is_active="1",
#                 class_id__status="1",
#                 class_id__academic_year_id=academic_year_id
#             ).select_related("class_id")

#             data = []
#             for cs in class_students:
#                 subject_classes = cs.class_id.subject_classes.filter(
#                     subject_id=subject_id,
#                     semester_id=semester_id
#                 ).select_related("subject", "lecturer", "semester")

#                 for sc in subject_classes:
#                     # schedules join
#                     schedules = Schedule.objects.filter(
#                         class_id=cs.class_id,
#                         status="1",
#                         room__status="1"
#                     ).select_related("room", "slot")

#                     for sch in schedules:
#                         data.append({
#                             "student_id": student.student_id,
#                             "fullname": student.fullname,
#                             "student_code": student.student_code,
#                             "department_name": student.department.department_name if student.department else None,

#                             "class_id": cs.class_id.class_id,
#                             "class_name": cs.class_id.class_name,

#                             "subject_id": sc.subject.subject_id,
#                             "subject_name": sc.subject.subject_name,

#                             "lecturer_name": sc.lecturer.fullname if sc.lecturer else None,
#                             "lecturer_id": sc.lecturer.lecturer_id if sc.lecturer else None,

#                             "academic_year_id": cs.class_id.academic_year_id,
#                             "semester_id": sc.semester.semester_id,

#                             "schedule_id": sch.schedule_id,
#                             "day_of_week": sch.day_of_week,
#                             "room_id": sch.room.room_id,
#                             "room_name": sch.room.room_name,
#                             "slot_id": sch.slot.slot_id,
#                             "slot_name": sch.slot.slot_name,
#                         })

#             serializer = LeaveRequestSerializer(data, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ==================================================
# Class LeaveRequestView (similar to above version)
# ==================================================
class LeaveRequestRawView(APIView):
    """
    API Gets leave request data using raw SQL query
    """
    def get(self, request, account_id, subject_id, academic_year_id, semester_id):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    WITH students_cte AS 
                    ( 
                        SELECT 
                            st.student_code, 
                            st.fullname, 
                            d.department_name, 
                            st.student_id 
                        FROM students AS st 
                        JOIN departments AS d 
                            ON st.department_id = d.department_id 
                        JOIN accounts AS acc 
                            ON acc.account_id = st.account_id
                        WHERE acc.account_id = %s
                    ), 
                    class_cte AS 
                    ( 
                        SELECT 
                            cl.class_name, 
                            cl.class_id, 
                            sub.subject_name, 
                            sub.subject_id, 
                            le.fullname AS lecturer_name, 
                            le.lecturer_id, 
                            cl.academic_year_id, 
                            ay.academic_year_name,
                            se.semester_id,
                            se.semester_name,
                            se.start_date AS start_date_semester,
		                    se.end_date AS end_date_semester,
                            sch.schedule_id,
                            sch.day_of_week,
                            r.room_id,
                            r.room_name,
                            ls.slot_id,
                            ls.slot_name,
                            stsu.max_leave_days
                        FROM classes AS cl 
                        JOIN class_students AS cs 
                            ON cl.class_id = cs.class_id_id 
                        JOIN subject_classes AS sc 
                            ON sc.class_id_id = cl.class_id 
                        JOIN subjects AS sub 
                            ON sub.subject_id = sc.subject_id 
                        JOIN lecturers AS le 
                            ON le.lecturer_id = sc.lecturer_id 
                        JOIN semesters AS se 
                            ON se.academic_year_id = cl.academic_year_id 
                        JOIN academic_years ay 
	                        ON ay.academic_year_id = se.academic_year_id
                        JOIN schedules AS sch 
                            ON sch.class_id_id = cl.class_id
                        JOIN rooms AS r 
                            ON r.room_id = sch.room_id
                        JOIN lesson_slots ls 
                            ON ls.slot_id = sch.slot_id 
                        JOIN student_subjects AS stsu
	                        ON stsu.subject_id = sub.subject_id AND stsu.student_id = cs.student_id
                        WHERE sub.status = '1' 
                            AND cl.status = '1' 
                            AND cl.academic_year_id = %s
                            AND se.semester_id = %s
                            AND sch.status = '1'
                            AND r.status = '1'
                    ) 
                        SELECT DISTINCT ON (s.student_id) 
                            s.student_id, 
                            s.fullname, 
                            s.student_code, 
                            s.department_name, 
                            c.class_name, 
                            c.subject_name, 
                            c.lecturer_id,
                            c.lecturer_name, 
                            c.class_id, 
                            c.subject_id, 
                            c.academic_year_id, 
                            c.academic_year_name,
                            c.semester_id,
                            c.semester_name,
                            c.start_date_semester,
		                    c.end_date_semester,
                            c.day_of_week,
                            c.schedule_id,
                            c.room_id,
                            c.room_name,
                            c.slot_id,
                            c.slot_name,
                            c.max_leave_days
                        FROM students_cte s 
                            JOIN class_cte c 
                                ON c.class_id IN 
                                ( 
                                SELECT cs.class_id_id 
                                FROM class_students cs 
                                JOIN students st
                                    ON st.student_id = cs.student_id
                                JOIN accounts acc
                                    ON acc.account_id = st.account_id
                                WHERE acc.account_id = %s 
                                    AND c.subject_id = %s
                                    AND acc.is_locked = false
                                    AND st.status = '1'
                                );
                """, [account_id, academic_year_id, semester_id, account_id, subject_id])

                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]

            serializer = LeaveRequestSerializer(results, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
# ==================================================
# Class LeaveRequestView
# ==================================================
class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = SaveLeaveRequestSerializer