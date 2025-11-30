import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./context/Context";

const SITE_KEY = "6Lfc8RwsAAAAACX9o7Lk192bZvg3O_2Kl4T3onvZ";

const App = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleReCaptchaProvider>
  );
};

export default App;