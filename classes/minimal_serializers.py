from rest_framework import serializers

class ClassSerializer(serializers.Serializer):
    class_id = serializers.IntegerField()
    class_name = serializers.CharField()