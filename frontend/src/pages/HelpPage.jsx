import React from "react";
import { FiTwitter, FiLinkedin, FiInstagram, FiDribbble } from "react-icons/fi";

function HelpPage() {
  return (
    <section className="bg-[#121212] min-h-screen flex items-center justify-center text-white px-4">
      {/* Centered inner flex container */}
      <div className="flex flex-col md:flex-row gap-12 items-start w-full max-w-5xl">
        {/* Left: Heading and Form */}
        <div className="flex-1 max-w-xl">
          <h1 className="text-5xl font-light mb-4">Help</h1>
          <p className="text-[#A0A0A0] mb-8">
            Need assistance? Please fill out the form below and our support team will get back to you.
          </p>
          <form className="space-y-7">
            <div>
              <label className="block text-white text-sm mb-2">Name</label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-[#343841] text-white py-2 focus:outline-none"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Email</label>
              <input
                type="email"
                className="w-full bg-transparent border-b border-[#343841] text-white py-2 focus:outline-none"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Message</label>
              <textarea
                rows="3"
                className="w-full bg-transparent border-b border-[#343841] text-white py-2 focus:outline-none resize-none"
                placeholder=""
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#343841] text-white py-3 mt-2 rounded-none font-semibold hover:bg-[#444950] transition"
            >
              Send
            </button>
          </form>
        </div>
        {/* Right: Contact Info */}
        <div className="flex-1 flex flex-col gap-10 mt-10 md:mt-0">
          <div>
            <h3 className="text-white font-semibold mb-3">Visit us</h3>
            <p className="text-[#A0A0A0]">263 Homebush Road<br />Strathfield South 2136</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Talk to us</h3>
            <p className="text-[#A0A0A0] mb-1">+61 421 307 908</p>
            <p className="text-[#A0A0A0]">helen@helenarvan.com</p>
          </div>
          <div className="flex gap-4 text-white text-2xl">
            <FiTwitter className="cursor-pointer" />
            <FiLinkedin className="cursor-pointer" />
            <FiInstagram className="cursor-pointer" />
            <FiDribbble className="cursor-pointer" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HelpPage;
