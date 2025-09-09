import React from "react";
import Footer from "../Layout/Footer";
import Header from "../../components/Layout/Header";

export default function LayoutWrapper({ children }) {

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <Header />
            <div className="w-full mx-auto px-6 flex-grow">
                {children}
            </div>
            <Footer />
        </div>
    );
}