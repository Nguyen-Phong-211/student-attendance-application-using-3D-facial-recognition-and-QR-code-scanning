// import React, { useEffect, useState } from "react";
// import { BrowserRouter } from "react-router-dom";
// import AppRoutes from "./routes/AppRoutes";
// import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
// import api from "./api/axiosInstance";
// import { Spin } from 'antd';

// const SITE_KEY = "6LcfimYrAAAAADA4cOKVbRBjWsmd4Z1LAfPwyEBm";

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await api.get("accounts//me/", { withCredentials: true });
//         setUser(res.data);
//       } catch (err) {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   if (loading) return <Spin size="large" style={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50%"}}/>;

//   return (
//     <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
//       <BrowserRouter>
//         <AppRoutes user={user} setUser={setUser} />
//       </BrowserRouter>
//     </GoogleReCaptchaProvider>
//   );
// };

import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { AuthProvider } from "./auth/AuthContext";

const SITE_KEY = "6LcfimYrAAAAADA4cOKVbRBjWsmd4Z1LAfPwyEBm";

const App = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </GoogleReCaptchaProvider>
  );
};

export default App;