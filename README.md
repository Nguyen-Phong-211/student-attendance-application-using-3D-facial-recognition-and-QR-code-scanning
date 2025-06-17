# To create apps in Django

1. `python manage.py startapp accounts`
2. `python manage.py startapp students`
3. `python manage.py startapp lecturers`
4. `python manage.py startapp subjects`
5. `python manage.py startapp classes`
6. `python manage.py startapp attendance`
7. `python manage.py startapp leaves`
8. `python manage.py startapp notifications`
9. `python manage.py startapp audit`
10. `python manage.py startapp rooms`
11. `python manage.py startapp admin_panel`
12. `python manage.py startapp staffs`

# To migrate all app

1. `python manage.py makemigrations accounts`
2. `python manage.py makemigrations subjects`
3. `python manage.py makemigrations students`
4. `python manage.py makemigrations lecturers`
5. `python manage.py makemigrations classes`
6. `python manage.py makemigrations rooms`
7. `python manage.py makemigrations attendance`
8. `python manage.py makemigrations audit`
9. `python manage.py makemigrations leaves`
10. `python manage.py makemigrations notifications`
11. `python manage.py makemigrations staffs`

## Then 

1. `python manage.py migrate accounts`
2. `python manage.py migrate subjects`
3. `python manage.py migrate students`
4. `python manage.py migrate lecturers`
5. `python manage.py migrate classes`
6. `python manage.py migrate rooms`
7. `python manage.py migrate attendance`
8. `python manage.py migrate audit`
9. `python manage.py migrate leaves`
10. `python manage.py migrate notifications`
11. `python manage.py migrate staffs`

# To seed data like laravel, you can create folders: [your_name_apps]/management/commands/[your_name_file]
# Then you can run the command in the terminal like this: python manage.py [your_name_file]
# Beside, you must create files in management/__init__.py and commands/__init__.py
1. `python manage.py seed_role`
2. `python manage.py seed_room`
3. `python manage.py seed_department`
4. `python manage.py seed_major`
5. `python manage.py seed_academic_year`
6. `python manage.py seed_semester`
7. `python manage.py seed_class`
8. `python manage.py seed_subject`
9. `python manage.py seed_shift`