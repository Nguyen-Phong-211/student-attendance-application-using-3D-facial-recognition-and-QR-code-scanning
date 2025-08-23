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