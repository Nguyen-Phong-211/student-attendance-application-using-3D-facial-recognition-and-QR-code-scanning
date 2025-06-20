from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import LecturerListSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Lecturer

class LecturerListAPIView(generics.ListAPIView):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerListSerializer
    permission_classes = [permissions.IsAuthenticated]
