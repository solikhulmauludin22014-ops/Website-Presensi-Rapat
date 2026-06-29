import uuid

from django.db import models
from django.utils import timezone


class Meeting(models.Model):
    STATUS_ACTIVE = "aktif"
    STATUS_DONE = "selesai"
    STATUS_CANCELLED = "dibatalkan"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Aktif"),
        (STATUS_DONE, "Selesai"),
        (STATUS_CANCELLED, "Dibatalkan"),
    ]

    meeting_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    meeting_date = models.DateField()
    meeting_time = models.TimeField()
    location = models.CharField(max_length=255)
    leader = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.meeting_id})"


class Attendance(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="attendances")
    name = models.CharField(max_length=255)
    nip = models.CharField(max_length=50)
    timestamp = models.DateTimeField(default=timezone.now)
    signature_base64 = models.TextField(blank=True)

    class Meta:
        ordering = ["-timestamp"]
        constraints = [
            models.UniqueConstraint(fields=["meeting", "nip"], name="unique_attendance_per_meeting_nip"),
        ]

    def __str__(self):
        return f"{self.name} - {self.meeting_id}"
