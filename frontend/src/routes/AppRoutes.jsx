import React from "react";
import { Route, Routes } from "react-router-dom"; 
import Login from "../pages/account/Login"; //
import Signup from "../pages/account/Signup"; //
import Home from "../pages/home/Home";
import Attendance from "../pages/attendance/Attendance";
import Contact from "../pages/contact/Contact";
import AddFace from "../pages/add-face/AddFace";
import RegisterFace from "../pages/add-face/RegisterFace";
import AddReminder from "../pages/add-event/AddReminder";
import AddRequestLeave from "../pages/add-event/AddRequestLeave";
import AddRequest from "../pages/add-event/AddRequest";
import ChangePassword from "../pages/account/ChangePassword"; //
import AccountInformation from "../pages/account/AccountInformation"; //
import GeneralSetting from "../pages/general-setting/GeneralSetting";
import AdminDashboard from "../pages/admin/Dashboard"; //

import VerifyOtp from "../pages/account/VerifyOtp"; //

import ProtectedRoute from "../routes/ProtectedRoute";
import ErrorPage from "../components/404";
import AttendanceStatistics from "../pages/attendance-statistics/AttendanceStatistics";
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

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/account/login/*" element={<Login />} />
            <Route path="/account/signup/*" element={<Signup />} />
            <Route path="/account/verify-otp/*" element={<VerifyOtp />} />
            <Route path="/" element={ <ProtectedRoute> <Home /> </ProtectedRoute> } />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/add-face" element={<ProtectedRoute><AddFace /></ProtectedRoute>} />
            <Route path="/add-face/register-face" element={<ProtectedRoute><RegisterFace /></ProtectedRoute>} />
            <Route path="/add-event/add-reminder" element={<ProtectedRoute><AddReminder /></ProtectedRoute>} />
            <Route path="/add-event/request-leave" element={<ProtectedRoute><AddRequestLeave /></ProtectedRoute>} />
            <Route path="/add-event/request-leave/request" element={<ProtectedRoute><AddRequest /></ProtectedRoute>} />
            <Route path="/account/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/general-setting" element={<GeneralSetting />} />
            <Route path="/account/information/update/*" element={<ProtectedRoute><AccountInformation /></ProtectedRoute>} />
            <Route path="/attendance-statistics" element={<ProtectedRoute><AttendanceStatistics /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><TimeTable /></ProtectedRoute>} />
            <Route path="/profile/*" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<ErrorPage />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/management/students" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
            <Route path="/admin/management/students/create" element={<ProtectedRoute><StudentCreate /></ProtectedRoute>} />
            <Route path="/admin/management/lecturers" element={<ProtectedRoute><LecturerManagement /></ProtectedRoute>} />
            <Route path="/admin/management/lecturers/create" element={<ProtectedRoute><LecturerCreate /></ProtectedRoute>} />

            <Route path="/admin/management/role" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
            <Route path="/admin/management/role/create" element={<ProtectedRoute><RoleCreate /></ProtectedRoute>} />
            <Route path="/admin/management/permission" element={<ProtectedRoute><PermissionAssignment /></ProtectedRoute>} />
            <Route path="/admin/management/account" element={<ProtectedRoute><AccountManagement /></ProtectedRoute>} />

            <Route path="/admin/academics/rooms" element={<ProtectedRoute><RoomManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/subjects" element={<ProtectedRoute><SubjectManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/academic-years" element={<ProtectedRoute><AcademicYearManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/departments" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/majors" element={<ProtectedRoute><MajorManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/classes" element={<ProtectedRoute><ClassManagement /></ProtectedRoute>} />
            <Route path="/admin/academics/classes/create" element={<ProtectedRoute><ClassCreate /></ProtectedRoute>} />
            <Route path="/admin/academics/subjects/create" element={<ProtectedRoute><SubjectCreate /></ProtectedRoute>} />

            <Route path="/admin/notifications" element={<ProtectedRoute><NotificationManagement /></ProtectedRoute>} />

            <Route path="/admin/students/list" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
            <Route path="/admin/students/list/create" element={<ProtectedRoute><AStudentCreated /></ProtectedRoute>} />
            <Route path="/admin/students/assign-class" element={<ProtectedRoute><ClassAssignment /></ProtectedRoute>} />

            <Route path="/admin/lecturers/assign-class" element={<ProtectedRoute><SubjectAssignment /></ProtectedRoute>} />
            <Route path="/admin/lecturers/list" element={<ProtectedRoute><LecturerList /></ProtectedRoute>} />
            
        </Routes>
    );
};

export default AppRoutes;
