import React, { useEffect } from "react";
import { GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";

const CustomGoogleButton = ({ onLoginSuccess }) => {
  // Prevent duplicate one-tap initialization
  useEffect(() => {
    const existingFrame = document.querySelector('iframe[src*="accounts.google.com"]');
    if (existingFrame) {
      existingFrame.remove();
    }
  }, []);

  return (
    <div>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const id_token = credentialResponse?.credential;
            if (!id_token) throw new Error("No ID token received");
            await onLoginSuccess(id_token);
          } catch (err) {
            console.error("Google login error:", err);
            alert("Login failed. Please try again.");
          }
        }}
        onError={() => {
          console.error("Google Sign-In failed");
          alert("Google Sign-In failed.");
        }}
        // Remove "useOneTap" to stop FedCM double calls
        // useOneTap
      />
    </div>
  );
};

export default CustomGoogleButton;
