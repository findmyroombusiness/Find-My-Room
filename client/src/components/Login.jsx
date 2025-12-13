import React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomGoogleButton from "./CustomGoogleButton";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async (id_token) => {
    try {
    

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/google-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: id_token }),
        }
      );

      const data = await res.json();


      if (!res.ok) {
        throw new Error(data.message || "Google login failed on backend");
      }

      if (!data.token) {
        throw new Error("No token received from backend");
      }

      // ✅ Save token & user info
      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

    
      navigate("/home");
    } catch (err) {
      console.error("❌ Login failed:", err);
      alert("Login failed. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center items-start p-8 md:p-16 bg-gray-100">
        <h1 className="myfont text-8xl mx-auto sm:text-7xl md:text-8xl lg:text-[10rem] font-bold">
          FmR
        </h1>

        <div className="myfont1 mx-auto mb-5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-4xl text-center px-4 flex items-center justify-center gap-2">
          <Search className="w-7 h-7" />
          <h1>Find My Room</h1>
        </div>

        <h4 className="text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-bold mx-auto mt-0 md:mt-6 lg:mt-10">
          Renting <span className="text-[rgb(77,95,171)]">Made</span> Simple
        </h4>

        {/* Google Login - Mobile */}
        <div className="block md:hidden w-full">
          <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md mx-auto mt-24 mb-2 flex flex-col items-center">
            <h2 className="text-2xl font-luckiest font-bold text-center text-gray-800 mb-6">
              Welcome
            </h2>
            <CustomGoogleButton onLoginSuccess={handleGoogleLogin} />
            <p className="mt-6 text-center text-gray-500 font-medium text-base">
              Start your journey to find the perfect room!
            </p>
          </div>
        </div>
      </div>

      {/* Google Login - Desktop */}
      <div className="hidden md:flex flex-1 justify-center items-center px-6 mb-6 bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-10 w-full max-w-md flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-luckiest font-bold text-center text-gray-800 mb-6">
            Welcome
          </h2>
          <CustomGoogleButton onLoginSuccess={handleGoogleLogin} />
          <p className="mt-6 text-center text-gray-500 font-medium text-base">
            Start your journey to find the perfect room!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
