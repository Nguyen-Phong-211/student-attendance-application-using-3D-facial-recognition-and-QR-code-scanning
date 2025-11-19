# from django.shortcuts import render

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from lecturers.models import Lecturer
# from students.models import Student
# from .models import LecturerContact  # app mới của bạn
# from .serializers import LecturerContactSerializer

# class LecturerContactCreateView(APIView):
#     """
#     ✅ API cho giảng viên gửi tin nhắn liên lạc
#     """
#     def post(self, request):
#         try:
#             account_id = request.data.get("account_id")
#             to_student_id = request.data.get("to_student_id")
#             message = request.data.get("message")

#             if not all([account_id, to_student_id, message]):
#                 return Response({"error": "Thiếu dữ liệu bắt buộc"}, status=400)

#             lecturer = Lecturer.objects.filter(account_id=account_id).first()
#             if not lecturer:
#                 return Response({"error": "Giảng viên không tồn tại"}, status=404)

#             student = Student.objects.filter(student_id=to_student_id).first()
#             if not student:
#                 return Response({"error": "Sinh viên không tồn tại"}, status=404)

#             contact = LecturerContact.objects.create(
#                 from_lecturer=lecturer,
#                 to_student=student,
#                 message=message
#             )

#             return Response(LecturerContactSerializer(contact).data, status=201)

#         except Exception as e:
#             return Response({"error": str(e)}, status=400)


# class LecturerContactListView(APIView):
#     """
#     ✅ API: Lấy danh sách tin nhắn mà giảng viên đã gửi hoặc nhận
#     """
#     def get(self, request, account_id):
#         try:
#             lecturer = Lecturer.objects.filter(account_id=account_id).first()
#             if not lecturer:
#                 return Response({"error": "Giảng viên không tồn tại"}, status=404)

#             contacts = LecturerContact.objects.filter(from_lecturer=lecturer).order_by("-created_at")
#             serializer = LecturerContactSerializer(contacts, many=True)
#             return Response(serializer.data, status=200)

#         except Exception as e:
#             return Response({"error": str(e)}, status=400)
