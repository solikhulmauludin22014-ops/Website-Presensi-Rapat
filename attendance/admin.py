from django.contrib import admin

from .models import Attendance, Meeting


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ("title", "meeting_date", "meeting_time", "location", "leader", "status", "created_at")
    search_fields = ("title", "location", "leader")
    list_filter = ("status", "meeting_date")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("meeting", "name", "nip", "timestamp")
    search_fields = ("name", "nip", "meeting__title")
