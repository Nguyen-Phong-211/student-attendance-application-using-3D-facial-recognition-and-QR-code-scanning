import React from 'react';
import { Card } from 'antd';

export default function LeavePreview({ academicYears, subjects, selectedAcademicYear, selectedSubject, rangeDate, personalLeave, teacher, formattedDate }) {

    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <Card className="p-4">
            <div className="prose max-w-full">
                <p className="text-center font-bold text-lg uppercase">Cộng hoà xã hội chủ nghĩa Việt Nam</p>
                <p className="text-center font-bold text-base">Độc lập - Tự do - Hạnh phúc</p>
                <div className="border-t border-black w-40 mx-auto my-2"></div>

                <p className="text-center font-bold text-2xl mt-6 uppercase">Đơn xin nghỉ phép</p>

                <p className="mt-6"><strong>Kính gửi: </strong> Giảng viên {teacher}</p>

                <div className="grid grid-cols-2 gap-8 mt-4">
                    <p><strong>Em tên là: </strong> { user.fullname }</p>
                    <p><strong>Mã số sinh viên: </strong> 21080701</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <p><strong>Lớp: </strong> DHHTTT13B</p>
                    <p><strong>Khoa: </strong> Công nghệ thông tin</p>
                </div>

                <div className="space-y-4 mt-4">
                    <p><strong>Năm học - Học kỳ: </strong> {
                        academicYears.find(item => item.academic_year_id === selectedAcademicYear)?.academic_year_name || ''
                    }</p>
                    <p><strong>Môn học: </strong> {
                        subjects.find(item => item.value === selectedSubject)?.label || ''
                    }</p>
                    <p><strong>Thời gian nghỉ phép: </strong>
                        {
                            rangeDate ? (
                                `${rangeDate[0].format('HH:mm DD/MM/YYYY')} - ${rangeDate[1].format('HH:mm DD/MM/YYYY')}`
                            ) : (
                                ''
                            )
                        }
                    </p>
                    <p><strong>Lý do: </strong> {personalLeave}</p>
                </div>

                <p className="mt-4">Em xin cam kết việc nghỉ học trên là có lý do chính đáng và sẽ tự ôn tập, bổ sung kiến thức bị thiếu trong thời gian nghỉ.</p>
                <p className="mt-4">Em xin chân thành cảm ơn!</p>

                <div className="mt-8 flex justify-end">
                    <div className="text-center">
                        <p>{formattedDate}</p>
                        <p><strong>Người làm đơn</strong></p>
                        <p className="italic">(Ký và ghi rõ họ tên)</p>
                        <p className='mt-5'><strong>{ user.fullname }</strong></p>
                    </div>
                </div>
            </div>
        </Card>
    );
}