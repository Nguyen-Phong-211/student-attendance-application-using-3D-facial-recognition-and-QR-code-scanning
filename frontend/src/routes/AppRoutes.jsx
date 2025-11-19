import React from "react";
import { Route, Routes } from "react-router-dom"; 
import Login from "../pages/account/Login"; //
import Signup from "../pages/account/Signup"; //
import Home from "../pages/home/Home";
import Contact from "../pages/contact/Contact";
import Notification from "../pages/notification/Notification";
import Introduction from "../pages/introduction/Introduction";
import ToDoList from "../pages/to-do-list/ToDoList";
import Term from "../pages/terms/Term";
import AddReminder from "../pages/add-event/AddReminder";
import AddRequestLeave from "../pages/add-event/AddRequestLeave";
import AddRequest from "../pages/add-event/AddRequest";
import AccountInformation from "../pages/account/AccountInformation"; //
import GeneralSetting from "../pages/general-setting/GeneralSetting";
import AdminDashboard from "../pages/admin/Dashboard"; //
import ForgotPassword from "../pages/account/ForgotPassword"; //
import OtpVerifyResetPassword from "../pages/account/OtpVerifyResetPassword";
import EntryPassword from "../pages/account/EntryPassword";

import AttendanceQRCode from "../pages/attendance/AttendanceQRCode";
import AttendanceFace from "../pages/attendance/AttendanceFace";

import VerifyOtp from "../pages/account/VerifyOtp"; //

import ProtectedRoute from "../routes/ProtectedRoute";
import ErrorPage from "../components/404";
import AttendanceStatistics from "../pages/attendance/AttendanceStatistics";
import AttendanceHistory from "../pages/attendance/AttendanceHistory";
import TimeTable from "../pages/timetable/TimeTable";
import Profile from "../pages/profile/Profile";

import StudentManagement from "../pages/admin/management/StudentManagement"; //
import StudentCreate from "../pages/admin/management/StudentCreate"; //
import LecturerManagement from "../pages/admin/management/LecturerManagement"; //
import LecturerCreate from "../pages/admin/management/LecturerCreate"; //

import RoleManagement from "../pages/admin/management/RoleManagement";
import RoleCreate from "../pages/admin/management/RoleCreate";
import PermissionAssignment from "../pages/admin/management/CreatePermission";
import AccountManagement from "../pages/admin/management/AccountManagement";
import RoomManagement from "../pages/admin/academics/RoomManagement";
import SubjectManagement from "../pages/admin/academics/SubjectManagement";
import AcademicYearManagement from "../pages/admin/academics/AcademicYearManagement";
import DepartmentManagement from "../pages/admin/academics/DepartmentManagement";
import MajorManagement from "../pages/admin/academics/MajorManagement";
import ClassManagement from "../pages/admin/academics/ClassManagement";
import ClassCreate from "../pages/admin/academics/ClassCreate";
import SubjectCreate from "../pages/admin/academics/SubjectCreate";
import NotificationManagement from "../pages/admin/Notifications"; //
import StudentList from "../pages/admin/students/StudentList";
import AStudentCreated from "../pages/admin/students/StudentCreate";
import ClassAssignment from "../pages/admin/students/ClassAssignment";
import SubjectAssignment from "../pages/admin/lecturers/SubjectAssignment";
import LecturerList from "../pages/admin/lecturers/LecturerList";
import AdminSchedule from "../pages/admin/Schedule";
import Audit from "../pages/admin/Audit";

// Giảng viên
import LecturersDashboard from "../pages/lecturers/Dashboard"; //
import NotificationManagementLecturers from "../pages/lecturers/Notifications"; //
import Teachingschedule from "../pages/lecturers/Schedule_QR/Lecturerschedule"; //
import QRCodeListManagement from "../pages/lecturers/QRCode/QRCodeList"; //
import QRCodeCreateManagement from "../pages/lecturers/QRCode/QRCodeCreate"; //
import Leaveapproval from "../pages/lecturers/LeaveRequest/leave_approval"; //
import ClassList from "../pages/lecturers/Attend/ClassList"; //
import Contactfeedback from "../pages/lecturers/ContactFeedback/Contactfeedback"; //
import Reportproblem from "../pages/lecturers/Reportproblem/Reportproblem"; //
import ProfileLecturers from "../pages/lecturers/profile/profile"; //

import Error403 from "../components/403";
import WaitingPage from "../components/Waiting";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/account/login/*" element={<Login />} />
            <Route path="/account/signup/*" element={<Signup />} />
            <Route path="/account/verify-otp/*" element={<VerifyOtp />} />
            <Route path="/" element={ <ProtectedRoute allowedRoles={["student", "admin", "superadmin"]}> <Home /> </ProtectedRoute> } />
            <Route path="/contact" element={<ProtectedRoute allowedRoles={["student"]}><Contact /></ProtectedRoute>} />
            <Route path="/notifications/all" element={<ProtectedRoute allowedRoles={["student"]}><Notification /></ProtectedRoute>} />
            <Route path="/introduction" element={<ProtectedRoute allowedRoles={["student"]}><Introduction /></ProtectedRoute>} />
            <Route path="/to-do-list/today" element={<ProtectedRoute allowedRoles={["student"]}><ToDoList /></ProtectedRoute>} />
            <Route path="/terms" element={<ProtectedRoute allowedRoles={["student", "lecturer"]}><Term /></ProtectedRoute>} />
            <Route path="/add-event/add-reminder" element={<ProtectedRoute allowedRoles={["student"]}><AddReminder /></ProtectedRoute>} />
            <Route path="/add-event/request-leave" element={<ProtectedRoute allowedRoles={["student"]}><AddRequestLeave /></ProtectedRoute>} />
            <Route path="/add-event/request-leave/request" element={<ProtectedRoute allowedRoles={["student"]}><AddRequest /></ProtectedRoute>} />
            <Route path="/general-setting" element={<ProtectedRoute allowedRoles={["student"]}><GeneralSetting /></ProtectedRoute>} />
            <Route path="/account/information/update/*" element={<ProtectedRoute allowedRoles={["student"]}><AccountInformation /></ProtectedRoute>} />
            <Route path="/attendance/statistics" element={<ProtectedRoute allowedRoles={["student"]}><AttendanceStatistics /></ProtectedRoute>} />
            <Route path="/attendance/attendance-history" element={<ProtectedRoute allowedRoles={["student"]}><AttendanceHistory /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute allowedRoles={["student"]}><TimeTable /></ProtectedRoute>} />
            <Route path="/profile/*" element={<ProtectedRoute allowedRoles={["student"]}><Profile /></ProtectedRoute>} />
            <Route path="/attendance/attendance-qr" element={<ProtectedRoute allowedRoles={["student"]}><AttendanceQRCode /></ProtectedRoute>} />
            <Route path="/attendance/add-face" element={<ProtectedRoute allowedRoles={["student"]}><AttendanceFace /></ProtectedRoute>} />
            <Route path="/account/forgot-password/*" element={<ForgotPassword />} />
            <Route path="/account/otp-verify-reset-password/*" element={<OtpVerifyResetPassword />} />
            <Route path="/account/entry-password/*" element={<EntryPassword />} />

            <Route path="/forbidden/pages/403" element={<Error403 />} />
            <Route path="*" element={<ErrorPage />} />

            <Route path="/waiting" element={<ProtectedRoute allowedRoles={["student"]}><WaitingPage /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

            <Route path="/admin/management/students" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><StudentManagement /></ProtectedRoute>} />
            <Route path="/admin/management/students/create" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><StudentCreate /></ProtectedRoute>} />
            <Route path="/admin/management/lecturers" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><LecturerManagement /></ProtectedRoute>} />
            <Route path="/admin/management/lecturers/create" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><LecturerCreate /></ProtectedRoute>} />

            <Route path="/admin/management/role" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><RoleManagement /></ProtectedRoute>} />
            <Route path="/admin/management/role/create" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><RoleCreate /></ProtectedRoute>} />
            <Route path="/admin/management/permission" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><PermissionAssignment /></ProtectedRoute>} />
            <Route path="/admin/management/account" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AccountManagement /></ProtectedRoute>} />

            <Route path="/admin/academics/rooms" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><RoomManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/subjects" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><SubjectManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/academic-years" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AcademicYearManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/departments" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><DepartmentManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/majors" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><MajorManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/classes" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><ClassManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/classes/create" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><ClassCreate /></ProtectedRoute>} />
            <Route path="/admin/academics/subjects/create" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><SubjectCreate /></ProtectedRoute>} />

            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><NotificationManagement /></ProtectedRoute>} />

            <Route path="/admin/students/list" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><StudentList /></ProtectedRoute>} />
            <Route path="/admin/students/list/create" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AStudentCreated /></ProtectedRoute>} />
            <Route path="/admin/students/assign-class" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><ClassAssignment /></ProtectedRoute>} />

            <Route path="/admin/lecturers/assign-class" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><SubjectAssignment /></ProtectedRoute>} />
            <Route path="/admin/lecturers/list" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><LecturerList /></ProtectedRoute>} />
            <Route path="/admin/schedule" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminSchedule /></ProtectedRoute>} />

            <Route path="/admin/management/log" element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><Audit /></ProtectedRoute>} />
            
            {/* Giảng viên */}
            <Route path="/lecturers/dashboard" element={<ProtectedRoute><LecturersDashboard /></ProtectedRoute>} />
            <Route path="/lecturers/notifications" element={<ProtectedRoute><NotificationManagementLecturers /></ProtectedRoute>} />
            <Route path="lecturers/lecturerschedule" element={<ProtectedRoute><Teachingschedule /></ProtectedRoute>} />
            <Route path="/lecturers/QRCodeList" element={<ProtectedRoute><QRCodeListManagement /></ProtectedRoute>} />
            <Route path="/lecturers/QRCodeCreate" element={<ProtectedRoute><QRCodeCreateManagement /></ProtectedRoute>} />
            <Route path="/lecturers/Leaveapproval" element={<ProtectedRoute><Leaveapproval /></ProtectedRoute>} />
            <Route path="/lecturers/ClassList" element={<ProtectedRoute><ClassList /></ProtectedRoute>} />
            <Route path="/lecturers/Contactfeedback" element={<ProtectedRoute><Contactfeedback /></ProtectedRoute>} />
            <Route path="/lecturers/Reportproblem" element={<ProtectedRoute><Reportproblem /></ProtectedRoute>} />
            <Route path="/lecturers/profile" element={<ProtectedRoute><ProfileLecturers /></ProtectedRoute>} />
        </Routes>
    );
};

export default AppRoutes;
