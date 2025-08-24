from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

# ============== ROOM AND SCHEDULE ==============
class RoomScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = [
            'room_id', 'room_name', 'capacity', 'status'
        ]
