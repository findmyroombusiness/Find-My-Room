import React, { useState, useRef, useEffect } from "react";
import { User, Plus, Home, MapPin, Heart, Menu, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dropdownRef = useRef(null);
  const wrapperRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/Home") setActiveTab("home");
    else if (location.pathname === "/MyListing") setActiveTab("mylistings");
    else if (location.pathname === "/Favourite") setActiveTab("favourites");
    else setActiveTab("");
  }, [location.pathname]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loginPopupShown");
    localStorage.removeItem("lastPopupUser");
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6 text-center">Are you sure you want to logout?</p>
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={cancelLogout}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition w-1/2 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition w-1/2 active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="fixed w-full top-0 left-0 z-50 bg-white md:bg-transparent md:static">
        <div className=" mx-auto px-6 flex items-center justify-between py-3">
          {/* Logo */}
          <div>
            <Link
              to="/Home"
              className="hidden md:block myfont text-4xl sm:text-6xl cursor-pointer active:scale-95 transition duration-300"
            >
              FmR
            </Link>
            <h1 className="block md:hidden myfont text-4xl sm:text-6xl">FmR</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="flex items-center px-4 py-2 bg-white border rounded-2xl shadow text-gray-800 font-medium">
              <MapPin className="w-5 h-5 text-[rgb(77,95,171)] mr-2" />
              Bhopal
            </button>

            <Link
              to="/ListProperty"
              className="px-6 py-2 bg-[rgb(77,171,119)] text-white font-semibold rounded-xl active:scale-95 transition duration-300 shadow"
            >
              List Your Property
            </Link>

            <Link
              to="/NeedRoommate"
              className="px-6 py-2 bg-[rgb(77,171,119)] text-white font-semibold rounded-xl active:scale-95 transition duration-300 shadow"
            >
              Find Roommates
            </Link>

            <Link
              to="/MyListing"
              className="px-6 py-2 bg-black/10 text-black font-semibold rounded-xl active:scale-95 transition duration-300 shadow hover:bg-black/20"
            >
              My Listings
            </Link>

            <Link
              to="/Favourite"
              className="w-11 h-11 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-black active:scale-95 transition"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* 🔹 Logout Button (styled same as other icons) */}
            <button
              onClick={handleLogout}
              className="w-11 h-11 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-black active:scale-95 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Top Navbar */}
          <div className="md:hidden flex items-center space-x-3">
            <button className="px-4 py-2 border-2 rounded-2xl flex items-center">
              <MapPin className="w-6 h-6 text-[rgb(77,95,171)]" />
              <span className="text-base font-medium">Bhopal</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Fixed Bottom Navigation Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-lg z-50">
        <div className="flex justify-between items-center py-2">
          <Link
            to="/Home"
            className="flex flex-col items-center justify-center flex-1 text-gray-700 py-2 rounded-full hover:bg-gray-200 active:bg-gray-300"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
            {activeTab === "home" && (
              <span className="block w-6 h-[2px] bg-[rgb(77,95,171)] mt-1 rounded-full"></span>
            )}
          </Link>

          <Link
            to="/MyListing"
            className="flex flex-col items-center justify-center flex-1 text-gray-700 py-2 rounded-full hover:bg-gray-200 active:bg-gray-300"
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs">My Listings</span>
            {activeTab === "mylistings" && (
              <span className="block w-6 h-[2px] bg-[rgb(77,95,171)] mt-1 rounded-full"></span>
            )}
          </Link>

          <div ref={wrapperRef} className="relative flex flex-col items-center flex-1">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex flex-col items-center justify-center text-gray-700 py-2 rounded-full hover:bg-gray-200 active:bg-gray-300 w-full"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">Add</span>
            </button>

            {showOptions && (
              <div
                className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                onClick={() => setShowOptions(false)}
              >
                <div
                  className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 w-[80%] max-w-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    to="/listproperty"
                    className="flex items-center active:scale-95 gap-3 w-full py-3 px-4 bg-[rgb(77,171,119)] text-white font-semibold rounded-xl hover:bg-[rgb(57,151,99)] transition"
                  >
                    <Plus className="w-5 h-5" />
                    List Your Property
                  </Link>

                  <Link
                    to="/NeedRoommate"
                    className="flex items-center active:scale-95 gap-3 w-full py-3 px-4 bg-[rgb(77,171,119)] text-white font-semibold rounded-xl hover:bg-[rgb(57,151,99)] transition"
                  >
                    <User className="w-5 h-5" />
                    Find Roommates
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/Favourite"
            className="flex flex-col items-center justify-center flex-1 text-gray-700 py-2 rounded-full hover:bg-gray-200 active:bg-gray-300"
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs">Favourites</span>
            {activeTab === "favourites" && (
              <span className="block w-6 h-[2px] bg-[rgb(77,95,171)] mt-1 rounded-full"></span>
            )}
          </Link>

          {/* 🔹 Logout Button for Mobile (same styling as other icons) */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 text-gray-700 py-2 rounded-full hover:bg-gray-200 active:bg-gray-300"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
