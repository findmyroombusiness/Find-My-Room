import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-gray-200 py-6 text-center text-sm text-gray-700 w-full pb-24 md:pb-6">
    <div className="space-x-4">
      <Link to="/policy" className="hover:underline">Privacy Policy</Link>
      <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
      <Link to="/disclaimer" className="hover:underline">Disclaimer</Link>
    </div>
    <p className="mt-2">&copy; {new Date().getFullYear()} Find My Room. All rights reserved.</p>
  </footer>
);

export default Footer;
