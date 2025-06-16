import random
from django.core.management.base import BaseCommand
from subjects.models import Subject, AcademicYear
from students.models import Department

class Command(BaseCommand):
    help = 'Seed 30-40 subjects for each department (ngành học)'

    def handle(self, *args, **options):
        departments = Department.objects.all()
        academic_years = AcademicYear.objects.all()

        subjects_by_department = {
            'Khoa Công nghệ thông tin': [
                "Lập trình Cơ bản", "Cấu trúc dữ liệu", "Mạng máy tính", "Cơ sở dữ liệu",
                "Hệ điều hành", "Trí tuệ nhân tạo", "Phân tích thiết kế hệ thống",
                "An toàn bảo mật", "Phát triển Web", "Lập trình di động", "Kiến trúc máy tính",
                "Toán rời rạc", "Công nghệ phần mềm", "Học máy", "Xử lý ảnh",
                "Thiết kế giao diện", "Điện toán đám mây", "Kiểm thử phần mềm",
                "Hệ thống nhúng", "Kỹ thuật số", "Xử lý ngôn ngữ tự nhiên",
                "Phát triển game", "Lập trình song song", "Cơ sở lý thuyết máy tính",
                "Lập trình nâng cao", "Quản trị mạng", "Thiết kế mạng", "Robot học",
                "Điều khiển tự động", "Tối ưu hóa thuật toán", "Phân tích dữ liệu"
            ],
            'Khoa Khoa học cơ bản': [
                "Toán cao cấp", "Vật lý đại cương", "Hóa học đại cương", "Sinh học cơ bản",
                "Giải tích", "Đại số tuyến tính", "Xác suất thống kê", "Toán rời rạc",
                "Vật lý lượng tử", "Hóa hữu cơ", "Sinh học phân tử", "Thống kê toán học",
                "Đại số trừu tượng", "Phương pháp tính toán", "Toán ứng dụng",
                "Vật lý chất rắn", "Hóa phân tích", "Sinh thái học", "Toán số",
                "Cơ học cổ điển", "Hóa vô cơ", "Sinh lý học", "Toán học tài chính",
                "Vật lý điện từ", "Hóa lý", "Sinh học tế bào", "Lý thuyết đồ thị",
                "Toán rời rạc nâng cao", "Cơ học lượng tử", "Hóa học môi trường",
                "Sinh học tiến hóa"
            ],
            'Khoa Ngoại ngữ': [
                "Tiếng Anh cơ bản", "Ngữ pháp tiếng Anh", "Kỹ năng nghe", "Kỹ năng nói",
                "Kỹ năng đọc", "Kỹ năng viết", "Tiếng Anh chuyên ngành", "Phiên dịch cơ bản",
                "Dịch thuật nâng cao", "Văn hóa Anh-Mỹ", "Tiếng Pháp cơ bản", "Tiếng Đức cơ bản",
                "Tiếng Trung cơ bản", "Tiếng Nhật cơ bản", "Ngôn ngữ học ứng dụng",
                "Giao tiếp thương mại", "Tiếng Anh cho du lịch", "Phương pháp giảng dạy ngoại ngữ",
                "Tiếng Anh học thuật", "Thực hành phiên dịch", "Lịch sử ngôn ngữ", "Văn học Anh",
                "Phương pháp nghiên cứu ngôn ngữ", "Ngôn ngữ và xã hội", "Tiếng Hàn cơ bản",
                "Tiếng Tây Ban Nha cơ bản", "Biên dịch pháp lý", "Phương tiện truyền thông đa ngôn ngữ",
                "Phát âm tiếng Anh", "Dịch phim và truyền hình"
            ],
            'Khoa Quản trị kinh doanh': [
                "Kinh tế vi mô", "Kinh tế vĩ mô", "Quản trị học", "Marketing căn bản",
                "Quản lý nhân sự", "Tài chính doanh nghiệp", "Kế toán tài chính", "Quản trị chiến lược",
                "Luật thương mại", "Quản trị sản xuất", "Kinh doanh quốc tế", "Phân tích dữ liệu kinh doanh",
                "Quản trị dự án", "Quản trị chất lượng", "Quản trị rủi ro", "Tâm lý học tổ chức",
                "Nghiên cứu thị trường", "Thuế và luật thuế", "Kinh doanh điện tử", "Quản trị đổi mới sáng tạo",
                "Quản trị logistics", "Đạo đức kinh doanh", "Quản trị chuỗi cung ứng", "Lãnh đạo doanh nghiệp",
                "Quản lý tài sản", "Quản trị tài chính quốc tế", "Phân tích tài chính", "Quản trị marketing số",
                "Kế toán quản trị", "Thương mại điện tử", "Phân tích chiến lược"
            ],
            'Khoa Kỹ thuật xây dựng': [
                "Vật liệu xây dựng", "Cơ học kết cấu", "Thiết kế kết cấu bê tông", "Thiết kế kết cấu thép",
                "Địa kỹ thuật", "Quản lý xây dựng", "Môi trường xây dựng", "Dự toán công trình",
                "Thiết kế kiến trúc", "Kỹ thuật nền móng", "Cơ học đất", "Thi công công trình",
                "Hệ thống điện trong xây dựng", "Quản lý dự án xây dựng", "Phân tích kết cấu",
                "Kỹ thuật giao thông", "Pháp luật xây dựng", "Thiết kế hệ thống nước", "Quản lý chất lượng",
                "Tổ chức thi công", "Quản trị an toàn lao động", "Thiết kế công trình dân dụng",
                "Hệ thống thông tin địa lý", "Phương pháp tính toán công trình", "Kỹ thuật địa vật lý",
                "Kỹ thuật thủy lợi", "Thiết kế đường giao thông", "Quản lý rủi ro xây dựng",
                "Thiết kế nhà cao tầng", "Phân tích địa chấn", "Thi công cầu đường"
            ],
            'Khoa Cơ khí': [
                "Cơ học kỹ thuật", "Nguyên lý máy", "Chế tạo máy", "Thiết kế chi tiết máy",
                "Công nghệ gia công", "Động lực học máy", "Vận hành máy", "Tự động hóa trong cơ khí",
                "Cơ điện tử", "Thiết kế khuôn mẫu", "Vật liệu cơ khí", "Động cơ đốt trong",
                "Hệ thống truyền động", "Robot công nghiệp", "Phân tích kết cấu máy",
                "Công nghệ hàn", "Điều khiển tự động", "Thiết kế hệ thống thủy lực", "Cơ khí chính xác",
                "Kỹ thuật đo lường", "Công nghệ CAD/CAM", "Công nghệ nhiệt", "Kỹ thuật môi trường",
                "Quản lý sản xuất cơ khí", "Kỹ thuật vật liệu", "Cơ học chất lỏng", "Máy công cụ",
                "Chế tạo thiết bị", "Phân tích dao động", "Kỹ thuật động cơ điện"
            ],
            'Khoa Thiết kế thời trang': [
                "Lịch sử thời trang", "Phác thảo thời trang", "Thiết kế trang phục", "Chất liệu vải",
                "Kỹ thuật may cơ bản", "Kỹ thuật may nâng cao", "Thiết kế phụ kiện", "Màu sắc học",
                "Công nghệ dệt may", "Thị trường thời trang", "Thiết kế đồ họa", "Phân tích xu hướng",
                "Quản lý sản xuất thời trang", "Kỹ thuật tạo mẫu", "Marketing thời trang",
                "Sáng tạo trong thiết kế", "Phát triển bộ sưu tập", "Thiết kế trang phục biểu diễn",
                "Thiết kế thời trang bền vững", "Quản lý thương hiệu thời trang", "Kinh doanh thời trang",
                "Chuỗi cung ứng thời trang", "Kỹ thuật chụp ảnh thời trang", "Phát triển sản phẩm mới",
                "Thiết kế kỹ thuật số", "Quản lý dự án thời trang", "Quản lý chất lượng sản phẩm",
                "Thương mại điện tử thời trang", "Thiết kế thời trang quốc tế", "Pháp luật thời trang"
            ],
            'Khoa Công nghệ ô tô': [
                "Cấu tạo ô tô", "Hệ thống động cơ", "Hệ thống truyền động", "Điều khiển ô tô",
                "Điện và điện tử ô tô", "Hệ thống phanh", "Hệ thống lái", "Kỹ thuật động lực học",
                "Bảo trì và sửa chữa", "Kỹ thuật nhiên liệu", "Cảm biến và thiết bị đo",
                "Quản lý sản xuất ô tô", "Hệ thống an toàn", "Công nghệ động cơ mới",
                "Điều khiển động cơ", "Thiết kế xe ô tô", "Phân tích kết cấu ô tô",
                "Kỹ thuật vật liệu ô tô", "Công nghệ điện tử ô tô", "Hệ thống truyền động điện",
                "Thiết kế hệ thống khí thải", "Phát triển sản phẩm ô tô", "Công nghệ nhiên liệu sinh học",
                "Kỹ thuật điều khiển tự động", "Quản lý bảo trì", "Phân tích tiếng ồn và rung động",
                "Kỹ thuật cảm biến", "Hệ thống điều khiển thân xe", "Quản lý chất lượng sản phẩm"
            ],
        }

        for department in departments:
            subject_names = subjects_by_department.get(department.department_name, [])
            if not subject_names:
                self.stdout.write(self.style.WARNING(f'Chưa có danh sách môn cho ngành {department.department_name}, bỏ qua'))
                continue

            num_subjects = random.randint(30, 40)

            extended_subject_names = (subject_names * ((num_subjects // len(subject_names)) + 1))[:num_subjects]

            for academic_year in academic_years:
                for subject_name in extended_subject_names:
                    theoretical_credits = random.choice([2, 3, 4])
                    practical_credits = random.choice([0, 1, 2])

                    full_subject_name = f"{subject_name}"

                    obj, created = Subject.objects.get_or_create(
                        subject_name=full_subject_name,
                        department=department,
                        academic_year=academic_year,
                        defaults={
                            'theoretical_credits': theoretical_credits,
                            'practical_credits': practical_credits,
                            'status': '1',
                        }
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(
                            f'Created subject: {obj.subject_name} - Dept: {department.department_name}'
                        ))
                    else:
                        self.stdout.write(f'Subject {obj.subject_name} already exists')