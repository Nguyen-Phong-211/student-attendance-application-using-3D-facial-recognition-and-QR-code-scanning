import React, { useState, useEffect } from "react";
import { Form, Row, Col, message } from "antd";
import api from "../../api/axiosInstance";

import InputObjectContact from "../Input/InputObjectContact";
import InputChooseClass from "../Input/ChooseClass";
import InputChooseSubject from "../Input/ChooseSubject";
import InputChooseStudent from "../Input/ChooseStudent";
import InputContentContact from "../Input/ContentEvent";
import ButtonSubmit from "../Button/ButtonSubmit";
import SubCardInformationContact from "../Cards/SubInformationContact";

const FormAddContactDynamic = ({
  form,
  handleContactTypeChange,
  t,
  contactType,
  loading,
  currentUser,
}) => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);

  const [classesLoading, setClassesLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // ================= Student workflow
  useEffect(() => {
    if (contactType !== "student" || !currentUser?.id) return;

    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const res = await api.get(`/lecturers/classes/${currentUser.id}/`);
        setClasses(res.data || []);
      } catch (err) {
        console.error(err);
        message.error("Không thể lấy danh sách lớp");
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
    setSelectedClassId(null);
    setSelectedSubjectId(null);
    setSelectedStudentId(null);
    setSubjects([]);
    setStudents([]);
    setSelectedStudentInfo(null);
  }, [contactType, currentUser?.id]);

  // ================= Lấy môn học khi chọn lớp
  useEffect(() => {
    if (contactType !== "student" || !selectedClassId) {
      setSubjects([]);
      setSelectedSubjectId(null);
      return;
    }

    const fetchSubjects = async () => {
      setSubjectsLoading(true);
      try {
        const res = await api.get(
          `/lecturers/classes/${selectedClassId}/subjects/${currentUser.id}/`
        );
        setSubjects(res.data || []);
      } catch (err) {
        console.error(err);
        message.error("Không thể lấy danh sách môn học");
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
    setSelectedSubjectId(null);
    setStudents([]);
    setSelectedStudentId(null);
    setSelectedStudentInfo(null);
  }, [selectedClassId, currentUser?.id, contactType]);

  // ================= Lấy sinh viên khi chọn môn học
  useEffect(() => {
    if (contactType !== "student" || !selectedClassId || !selectedSubjectId) {
      setStudents([]);
      setSelectedStudentId(null);
      setSelectedStudentInfo(null);
      return;
    }

    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const res = await api.get(
          `/classes/${selectedClassId}/subjects/${selectedSubjectId}/students/${currentUser.id}/`
        );
        setStudents(res.data || []);
      } catch (err) {
        console.error(err);
        message.error("Không thể lấy danh sách sinh viên");
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
    setSelectedStudentId(null);
    setSelectedStudentInfo(null);
  }, [selectedClassId, selectedSubjectId, currentUser?.id, contactType]);

  // ================= Lecturer workflow
  useEffect(() => {
    if (contactType !== "lecturer") return;

    const fetchAllStudents = async () => {
      setStudentsLoading(true);
      try {
        const res = await api.get(`/lecturers/students/${currentUser.id}/`);
        setStudents(res.data || []);
      } catch (err) {
        console.error(err);
        message.error("Không thể lấy danh sách sinh viên");
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchAllStudents();
    setSelectedStudentId(null);
    setSelectedStudentInfo(null);
  }, [contactType, currentUser?.id]);

  // ================= Submit form
const handleFinish = async (values) => {
  if (!values.object_contact) {
    return message.warning("Vui lòng chọn người nhận.");
  }

  if (!selectedStudentId && contactType !== "admin") {
    return message.warning("Vui lòng chọn sinh viên.");
  }

  if (!values.content || values.content.trim() === "") {
    return message.warning("Nội dung không được để trống.");
  }

  // === Chuẩn payload backend ===


let payload = {
  message: values.content.trim(),
  type_person_contact: "STUDENT",   // hoặc "LECTURER", "ADMIN"
  from_person_id: currentUser.id,   // ID user hiện tại
  to_person_id: Number(selectedStudentId), // ID người nhận
  from_person_type: 3,  // PK của ContentType (Student hoặc Lecturer)
  to_person_type: 3,    // PK của ContentType người nhận (ví dụ Student = 3)
  subject_id: selectedSubjectId ? Number(selectedSubjectId) : null
};

  console.log("Payload sending:", payload);

  try {
    await api.post("/contacts/lecturer-send/", payload);
    message.success("Gửi liên hệ thành công");
    form.resetFields();
    setSelectedClassId(null);
    setSelectedSubjectId(null);
    setSelectedStudentId(null);
    setSelectedStudentInfo(null);
  } catch (err) {
    console.error("Error sending contact:", err.response?.data || err);
    message.error(
      err.response?.data?.detail ||
        (err.response?.data ? JSON.stringify(err.response.data) : "Gửi liên hệ thất bại")
    );
  }
};


  return (
    <Form
      form={form}
      name="contact_form"
      layout="vertical"
      autoComplete="off"
      onFinish={handleFinish}
    >
      <Row gutter={24}>
        <Col xs={24}>
          <InputObjectContact handleContactTypeChange={handleContactTypeChange} t={t} />
        </Col>
      </Row>

      {/* Student workflow */}
      {contactType === "student" && (
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <InputChooseClass
              classes={classes}
              onChange={(value) => setSelectedClassId(Number(value))}
              disabled={classesLoading}
            />
            <InputChooseSubject
              studentSubjects={subjects}
              onChange={(value) => setSelectedSubjectId(Number(value))}
              disabled={subjectsLoading || !selectedClassId}
            />
            <InputChooseStudent
              students={students}
              onChange={(value) => {
                setSelectedStudentId(Number(value));
                const info = students.find((s) => s.student_id === Number(value));
                setSelectedStudentInfo(info);
              }}
              disabled={studentsLoading || !selectedSubjectId}
            />
            <InputContentContact t={t} />
          </Col>
          <Col xs={24} md={12}>
            <SubCardInformationContact selectedLecturerInfo={selectedStudentInfo} t={t} />
          </Col>
        </Row>
      )}

      {/* Lecturer workflow */}
      {contactType === "lecturer" && (
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <InputChooseStudent
              students={students}
              onChange={(value) => {
                setSelectedStudentId(Number(value));
                const info = students.find((s) => s.student_id === Number(value));
                setSelectedStudentInfo(info);
              }}
              disabled={studentsLoading || students.length === 0}
            />
            <InputChooseSubject
              studentSubjects={subjects}
              onChange={(value) => setSelectedSubjectId(Number(value))}
              disabled={subjectsLoading || !selectedStudentId}
            />
            <InputContentContact t={t} />
          </Col>
          <Col xs={24} md={12}>
            <SubCardInformationContact selectedLecturerInfo={selectedStudentInfo} t={t} />
          </Col>
        </Row>
      )}

      {/* Admin workflow */}
      {/* {contactType === "admin" && (
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <InputContentContact t={t} />
          </Col>
        </Row>
      )} */}

      <Row gutter={24} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <ButtonSubmit loading={loading} />
        </Col>
      </Row>
    </Form>
  );
};

export default FormAddContactDynamic;
