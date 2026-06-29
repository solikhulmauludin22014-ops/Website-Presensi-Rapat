from django import forms

from .models import Meeting


class MeetingForm(forms.ModelForm):
    class Meta:
        model = Meeting
        fields = ["title", "meeting_date", "meeting_time", "location", "leader", "status"]
        widgets = {
            "meeting_date": forms.DateInput(attrs={"type": "date"}),
            "meeting_time": forms.TimeInput(attrs={"type": "time"}),
        }


class AttendanceForm(forms.Form):
    name = forms.CharField(max_length=255, label="Nama Lengkap")
    nip = forms.CharField(max_length=50, label="NIP")
    signature_base64 = forms.CharField(widget=forms.HiddenInput(), required=False)
