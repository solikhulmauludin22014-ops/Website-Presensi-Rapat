from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("meetings/", views.meeting_list_create, name="meeting_list_create"),
    path("meetings/<uuid:meeting_id>/", views.meeting_detail, name="meeting_detail"),
    path("meetings/<uuid:meeting_id>/pdf/", views.meeting_pdf, name="meeting_pdf"),
    path("a/<uuid:meeting_id>/", views.attendance_form_view, name="attendance_form"),
]
