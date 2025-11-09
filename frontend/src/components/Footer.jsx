import React from "react";
import { FaFacebook, FaInstagram, FaTelegram, FaYoutube } from "react-icons/fa";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

function Footer() {
  return (
    <footer className="bg-[#121212] text-[#EAEAEA] px-8   py-16 flex justify-around">
      <div className="max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo + About */}
        <div>
          <h2 className="text-4xl font-bold mb-2">Mech<span className="text-red-600">2</span>Door</h2>
          <p className="mb-4 text-[#A0A0A0]">
            We continues to grow by staying dedicated to customer-first technology, mechanic empowerment, and genuine transparency for both drivers and service providers.
          </p>
          <div className="flex gap-4 text-2xl mt-3">
            <FaFacebook />
            <FaInstagram />
            <FaTelegram />
            <FaYoutube />
          </div>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">QuickLink</h3>
          <ul className="space-y-2 text-[#EAEAEA]">
            <li>Hero</li>
            <li>About</li>
            <li>Service</li>
            <li>Work</li>
            <li>Team</li>
          </ul>
        </div>
        {/* Company */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-[#EAEAEA]">
            <li>Privacy</li>
            <li>Conditions</li>
            <li>FAQs</li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <FiPhone /> +91 9824530881
            </li>
            <li className="flex items-center gap-2">
              <FiMail /> mech2door123@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <FiMapPin /> Indore<br />Madhya Pradesh
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
