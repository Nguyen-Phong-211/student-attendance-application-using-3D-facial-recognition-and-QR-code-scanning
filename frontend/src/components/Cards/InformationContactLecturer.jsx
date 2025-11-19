import { Card, Typography } from "antd";
import FormAddContactDynamic from "../Form/AddContactDynamic";

const { Title } = Typography;

const CardInformationContact = ({
  t,
  form,
  onFinish,
  contactType,
  handleContactTypeChange,
  classes,
  subjects,
  students,
  selectedClass,
  selectedSubject,
  selectedStudent,
  setSelectedClass,
  setSelectedSubject,
  setSelectedStudent,
  loading,
}) => {
  return (
    <Card
      title={
        <Title level={3} className="text-start">
          {t("send contact information")}
        </Title>
      }
      className="p-6"
    >
      <FormAddContactDynamic
        t={t}
        form={form}
        onFinish={onFinish}
        contactType={contactType}
        handleContactTypeChange={handleContactTypeChange}
        classes={classes}
        subjects={subjects}
        students={students}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        selectedStudent={selectedStudent}
        setSelectedClass={setSelectedClass}
        setSelectedSubject={setSelectedSubject}
        setSelectedStudent={setSelectedStudent}
        loading={loading}
      />
    </Card>
  );
};

export default CardInformationContact;
