<p align="center">
  <img src="https://static.djangoproject.com/img/logos/django-logo-negative.svg" alt="Django Logo" width="220"/>
  <br/>
  <img src="https://attend3d.io/logo.png" alt="ATTEND 3D Logo" width="120"/>
</p>

<h1 align="center">ATTEND 3D</h1>
<p align="center">
  <strong>A modern, real-time, and secure attendance and classroom management system for universities and educational organizations.</strong>
  <br/><br/>
  <a href="https://attend3d.io/">Official Website</a> •
  <a href="mailto:zephyrnguyen.vn@gmail.com">Contact Support</a>
</p>

---

## 📝 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Email & Notification Templates](#email--notification-templates)
- [Contribution](#contribution)
- [Contact Information](#contact-information)

---

## 🚀 Introduction

**ATTEND 3D** is a modern attendance and classroom management platform built on Django, featuring real-time capabilities via WebSocket, optimized for schools, faculties, departments, and educational organizations. The system is professional, secure, and extensible, helping to automate and enhance classroom management experiences.

---

## ✨ Features

- **Real-time attendance management:** Intuitive interface with instant status synchronization via WebSocket.
- **Automated assignment of classes/subjects/instructors:** Automate assignment and notification via email.
- **Academic management:** Full support for entities such as Faculty, Major, Department, Class, Subject, Shift, Lesson Slot, Room, and more.
- **Secure email system:** Registration, OTP authentication, account-related notifications, reminders, feedback, etc.
- **Automated reminders:** Send email/SMS reminders for class, exams, and attendance.
- **Quick data seeding:** Easily initialize sample data with CLI commands.
- **User-friendly interface:** Responsive UI, easy to use for all roles (admin, lecturer, student, ...).
- **Security & role-based access:** OTP authentication, multi-level authorization, data protection.
- **Easy integration & extensibility:** RESTful API design, can be connected to other systems.

---

## 🏗️ Architecture

- **Backend:** Django, Django Channels (ASGI), REST API
- **Realtime:** WebSocket, Redis (Pub/Sub)
- **Database:** PostgreSQL (configurable)
- **Frontend:** (React, Tailwindcss, Ant Design)
- **Email/SMS:** SMTP, HTML Template
- **DevOps:** Docker-ready, cloud deployment supported

```
+-----------------+      WebSocket/HTTP      +------------------+      Redis Pub/Sub      +-----------+
|     Client      |  <------------------->   |     Django ASGI   |  <----------------->   |   Redis   |
+-----------------+                          +------------------+                        +-----------+
```

---

## ⚙️ Installation & Setup

### 1. Environment Setup

- Python 3.13.5
- Redis
- Django, Django Channels, required packages

```bash
git clone https://github.com/Nguyen-Phong-211/attend3d.git
cd attend3d
pip install -r requirements.txt
```

### 2. Install and Start Redis

```bash
# MacOS
brew install redis
brew services start redis

# Ubuntu
sudo apt update && sudo apt install redis-server
sudo systemctl enable redis-server.service
sudo systemctl start redis-server
```

### 3. Initialize Sample Data

Create seed commands similar to Laravel for generating sample data:

```bash
python manage.py seed_role
python manage.py seed_room
python manage.py seed_department
python manage.py seed_major
python manage.py seed_academic_year
python manage.py seed_semester
python manage.py seed_class
python manage.py seed_subject
python manage.py seed_shift
python manage.py seed_lesson_slot
```

**Note:**  
- Ensure `__init__.py` exists in both `management/` and `commands/` folders so Django recognizes the commands.
- Seed files are located in `[app_name]/management/commands/`.

### 4. Run the Real-time Server

```bash
daphne attend3d.asgi:application
# Or
daphne -b 127.0.0.1 -p 8000 attend3d.asgi:application
```

---

## To run environment python
source env/bin/activate

## To download and install all libraries
pip freeze > requirements.txt

## 💡 Usage Guide

- Log in to the system with your provided account.
- Assign lecturers, classes, and subjects via the admin dashboard.
- Lecturers/students perform attendance online and receive real-time notifications.
- View statistics, reports, and export attendance and activity history.
- Admins can edit, add, or delete entities: user, faculty, major, class, subject, etc.

---

## 📧 Email & Notification Templates

The system uses beautiful, professional HTML email templates for:

- Registration, OTP verification
- Account creation, password reset
- Attendance reminders, class/exam reminders
- Contact feedback, error reporting
- Responsive design, multi-language support (customizable)

---

## 🤝 Contribution

We welcome all contributions!  
To contribute code:

1. Fork the repository and create a new branch
2. Commit with clear messages and detailed descriptions
3. Create a Pull Request describing your changes
4. Follow code style, security, and thoroughly test before merging

---

## 📞 Contact Information

- Website: [https://attend3d.io](https://attend3d.io)
- Email: [zephyrnguyen.vn@gmail.com](mailto:zephyrnguyen.vn@gmail.com)
- Phone: 0825 025 347
- Facebook: [FACE CLASS - ATTEND 3D](https://facebook.com/faceclass.attend3d)

<p align="center">
  <img src="https://static.djangoproject.com/img/logos/django-logo-negative.svg" alt="Django Logo" width="100"/>
  <br/>
  <em>© 2025 ATTEND 3D. All rights reserved.</em>
</p>