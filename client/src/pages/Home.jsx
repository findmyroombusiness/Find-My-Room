import React, { useEffect, useState } from "react";
import { Home, Building2, School, Users, BedDouble } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Check for user in localStorage
    const userStr = localStorage.getItem("user");
    let lastUser = localStorage.getItem("lastPopupUser");
    let popupShown = localStorage.getItem("loginPopupShown");
    let userEmail = "";
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userEmail = user && user.email ? user.email : "";
      } catch {}
    }
    // If user changed or not shown yet, show popup
    if (userEmail && (!popupShown || lastUser !== userEmail)) {
      setUserEmail(userEmail);
      setShowPopup(true);
      localStorage.setItem("loginPopupShown", "true");
      localStorage.setItem("lastPopupUser", userEmail);
      // Auto-dismiss after 3.5s
      const timer = setTimeout(() => setShowPopup(false), 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePopup = () => setShowPopup(false);

  const categories = [
    { name: "Rooms", icon: <BedDouble size={32} />, desc: "Find single rooms with ease.", link: "/roomlist" },
    { name: "Flats", icon: <Building2 size={32} />, desc: "Explore affordable and premium flats.", link: "/flatlist" },
    { name: "Hostels", icon: <School size={32} />, desc: "Search hostels near colleges & offices.", link: "/hostellist" },
    { name: "PG", icon: <Home size={32} />, desc: "Paying Guest options at best prices.", link: "/pglist" },
    { name: "Live with Roommate", icon: <Users size={32} />, desc: "Shared Living available.", link: "/roommatelist" },
  ];

  return (
    <div>
      <Navbar />

      {/* Login Success Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30"
          onClick={handleClosePopup}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-sm flex flex-col items-center"
            style={{ minWidth: 260 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-xl font-bold mb-2 text-center" style={{ color: '#22c55e' }}>
              You are logged in with
            </div>
            <div className="font-bold text-base break-all text-center" style={{ color: 'rgb(77,95,171)' }}>{userEmail}</div>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-100 px-6 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-12 mt-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Find Your Perfect Space
          </h1>
          <h2 className="text-6xl">🏠</h2>
          <p className="text-lg md:text-xl text-gray-600 mt-10">
            Discover <span className="font-bold text-[rgb(77,95,171)]">Rooms, Flats, Hostels, PGs </span> 
            & Roommates that fit your lifestyle. <br /> Easy, quick, and reliable.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          {categories.map((cat, index) => (
            <Link key={index} to={cat.link} className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition duration-300">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 text-[rgb(77,95,171)] mb-4">
                {cat.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{cat.name}</h2>
              <p className="text-gray-600 mt-2 text-center">{cat.desc}</p>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xl  font-bold">
            Find it. Share it. Live it. 
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};




export default HomePage;
