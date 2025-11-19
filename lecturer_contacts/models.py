# from django.db import models

# # Create your models here.
# from django.db import models
# from lecturers.models import Lecturer
# from students.models import Student

# class LecturerContact(models.Model):
#     from_lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE, related_name="sent_contacts")
#     to_student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="received_contacts")
#     message = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         managed = False  # 🚫 Không tạo / xóa bảng
#         db_table = "contacts"  # ✅ Trỏ tới bảng cũ
#         ordering = ["-created_at"]

#     def __str__(self):
#         return f"{self.from_lecturer.fullname} → {self.to_student.fullname}"

