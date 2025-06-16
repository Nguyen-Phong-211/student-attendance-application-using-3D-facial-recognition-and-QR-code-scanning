from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from students.models import Student
from students.serializers import StudentSerializer
from admin_panel.permissions import IsAdmin 


# Get all students
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_all_students(request):
    students = Student.objects.select_related('user').all()
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)
