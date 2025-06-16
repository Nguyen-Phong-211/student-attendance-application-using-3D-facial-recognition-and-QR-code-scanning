from django.db import models

class Room(models.Model):
    room_id = models.BigAutoField(primary_key=True)
    room_name = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=10, decimal_places=5)
    longitude = models.DecimalField(max_digits=10, decimal_places=5)
    room_type = models.CharField(max_length=20)
    capacity = models.IntegerField()
    status = models.CharField(max_length=1, default='1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rooms'
        managed = True
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
    
    def __str__(self):
        return self.room_name

