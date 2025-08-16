import React, { useEffect } from "react";
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

  const SITE_KEY = "6LcfimYrAAAAADA4cOKVbRBjWsmd4Z1LAfPwyEBm";

  const App = () => {
    useEffect(() => {
      const handleStorageChange = (event) => {
          if (event.key === "access_token" && event.newValue === null) {
              window.location.href = "/account/login";
          }
          if (event.key === 'logout') {
            window.location.href = "/account/login";
          }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  return (
    <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </GoogleReCaptchaProvider>
  );
};

export default App;