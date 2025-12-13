import Footer from "../components/Footer";
import React from "react";
import { Home, Building2, School, Bed } from "lucide-react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const ListProperty = () => {
  const properties = [
    { name: "Room", icon: <Bed className="w-8 h-8" />, link: "/room" },
    { name: "Flat", icon: <Building2 className="w-8 h-8" />, link: "/flat" },
    { name: "Hostel", icon: <School className="w-8 h-8" />, link: "/hostel" },
    { name: "PG", icon: <Home className="w-8 h-8" />, link: "/pg" },
  ];

  return (
    <div>
      <Navbar />
      <div className="min-h-[81vh] bg-gradient-to-br from-gray-50 to-gray-200 px-6 py-24 flex flex-col justify-start">
        {/* Tagline */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            List Your Property with{" "}
            <span className="text-[rgb(77,95,171)]">Ease</span>
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto mt-10 mb-10 md:mb-0 text-lg sm:text-xl">
            Choose the type of property you want to list and get started quickly.
          </p>
        </div>

        {/* PC Layout */}
        <div className="hidden lg:grid grid-cols-4 gap-10 mt-10 max-w-6xl mx-auto">
          {properties.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="flex flex-col items-center justify-center bg-white rounded-3xl shadow-2xl p-14 hover:scale-105 active:scale-95 transition-all duration-300 border border-gray-200"
            >
              <div className="mb-5 text-[rgb(77,95,171)]">{item.icon}</div>
              <span className="text-3xl font-bold text-gray-800">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 max-w-md mx-auto lg:hidden">
          {properties.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl p-8 hover:scale-105 active:scale-95 transition-all duration-300 border border-gray-200"
            >
              <div className="mb-3 text-[rgb(77,95,171)]">{item.icon}</div>
              <span className="text-lg sm:text-xl font-semibold text-gray-800">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const ListPropertyWithFooter = () => (
  <>
    <ListProperty />
    <Footer />
  </>
);
export default ListPropertyWithFooter;
