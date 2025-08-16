import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer';

export default function LayoutWrapper({ children }) {
    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <Header />
                {children}
            </div>
            <Footer />
        </div>
    );
}