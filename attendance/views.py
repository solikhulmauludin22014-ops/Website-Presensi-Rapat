import base64
from io import BytesIO

import qrcode
from django.contrib import messages
from django.db import IntegrityError
from django.http import FileResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from fpdf import FPDF

from .forms import AttendanceForm, MeetingForm
from .models import Attendance, Meeting


def build_absolute_url(request, path):
    return request.build_absolute_uri(path)


def qrcode_for_meeting(request, meeting):
    url = build_absolute_url(request, reverse("attendance_form", args=[meeting.meeting_id]))
    qr = qrcode.QRCode(version=1, box_size=8, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer, url


def home(request):
    return redirect("meeting_list_create")


def meeting_list_create(request):
    meetings = Meeting.objects.all()
    form = MeetingForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        meeting = form.save()
        messages.success(request, f"Rapat dibuat: {meeting.meeting_id}")
        return redirect("meeting_detail", meeting_id=meeting.meeting_id)

    return render(request, "attendance/meeting_list.html", {"meetings": meetings, "form": form})


def meeting_detail(request, meeting_id):
    meeting = get_object_or_404(Meeting, meeting_id=meeting_id)
    attendances = meeting.attendances.order_by("timestamp")
    qr_buffer, qr_url = qrcode_for_meeting(request, meeting)
    qr_data_uri = base64.b64encode(qr_buffer.getvalue()).decode("ascii")

    return render(
        request,
        "attendance/meeting_detail.html",
        {
            "meeting": meeting,
            "attendances": attendances,
            "attendance_count": attendances.count(),
            "qr_url": qr_url,
            "qr_data_uri": qr_data_uri,
        },
    )


def attendance_form_view(request, meeting_id):
    meeting = get_object_or_404(Meeting, meeting_id=meeting_id)
    form = AttendanceForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        name = form.cleaned_data["name"].strip()
        nip = form.cleaned_data["nip"].strip()
        signature_base64 = form.cleaned_data.get("signature_base64", "")

        if not signature_base64:
            form.add_error(None, "Tanda tangan wajib diisi.")
        else:
            try:
                Attendance.objects.create(
                    meeting=meeting,
                    name=name,
                    nip=nip,
                    timestamp=timezone.now(),
                    signature_base64=signature_base64,
                )
                return render(request, "attendance/attendance_success.html", {"meeting": meeting})
            except IntegrityError:
                form.add_error(None, "NIP ini sudah absen untuk rapat ini.")

    return render(request, "attendance/attendance_form.html", {"meeting": meeting, "form": form})


class MeetingPDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 14)
        self.cell(0, 8, "NOTULENSI RAPAT", 0, 1, "C")
        self.ln(2)


def meeting_pdf(request, meeting_id):
    meeting = get_object_or_404(Meeting, meeting_id=meeting_id)
    attendances = meeting.attendances.order_by("timestamp")

    pdf = MeetingPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    pdf.cell(0, 8, f"Meeting ID: {meeting.meeting_id}", 0, 1)
    pdf.cell(0, 8, f"Judul: {meeting.title}", 0, 1)
    pdf.cell(0, 8, f"Tanggal: {meeting.meeting_date}", 0, 1)
    pdf.cell(0, 8, f"Waktu: {meeting.meeting_time}", 0, 1)
    pdf.cell(0, 8, f"Lokasi: {meeting.location}", 0, 1)
    pdf.cell(0, 8, f"Pimpinan: {meeting.leader}", 0, 1)
    pdf.ln(4)
    pdf.cell(0, 8, f"Daftar Hadir ({attendances.count()} peserta)", 0, 1)

    for index, attendance in enumerate(attendances, start=1):
        pdf.cell(0, 7, f"{index}. {attendance.name} | {attendance.nip} | {attendance.timestamp}", 0, 1)

    response = FileResponse(BytesIO(pdf.output(dest="S").encode("latin-1")), content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="notulensi_{meeting.meeting_id}.pdf"'
    return response
