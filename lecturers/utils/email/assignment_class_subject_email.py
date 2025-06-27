from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

def send_assignment_email(to_email, full_name, subject_name, class_name):
    subject = "Thông báo phân công môn học - ATTEND 3D"
    from_email = "zephyrnguyen.vn@gmail.com"
    context = {
        "fullName": full_name,
        "assignmentSubject": subject_name,
        "assignmentClass": class_name,
    }
    html_content = render_to_string("lecturer/assignment_class_subject.html", context)
    
    msg = EmailMultiAlternatives(subject, "", from_email, [to_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()