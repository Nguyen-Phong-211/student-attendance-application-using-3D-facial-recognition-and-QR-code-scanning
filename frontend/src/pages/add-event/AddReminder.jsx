import React, { useEffect } from "react";
import LayoutWrapper from "../../components/AddEventReminder/LayoutWrapper";
import PageHeader from "../../components/AddEventReminder/PageHeader";
import EventForm from "../../components/AddEventReminder/EventForm/EventForm";

export default function ContactPage() {
    useEffect(() => {
        document.title = "ATTEND 3D - Tạo nhắc nhở điểm danh";
    }, []);

    return (
        <LayoutWrapper>
            <main className="mt-10 flex flex-col items-center">
                <PageHeader />
                <EventForm />
            </main>
        </LayoutWrapper>
    );
}
