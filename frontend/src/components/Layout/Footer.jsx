import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-20 py-2 px-5">
      <div className="text-center text-sm text-gray-500 mt-0">
        © {new Date().getFullYear()} ATTEND 3D. All rights reserved.
      </div>
    </footer>
  );
}