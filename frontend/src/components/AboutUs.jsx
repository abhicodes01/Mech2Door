import React from "react";
import heroImage from "../assets/HeroImage.jpeg"// replace with your correct path

function AboutSection() {
  return (
    <section className="bg-[#121212] px-8 py-16 flex flex-col md:flex-row items-center justify-around gap-10">
      {/* Text content */}
      <div className="max-w-xl">
        <p className="text-[#A0A0A0] mb-2">About us</p>
        <h2 className="text-4xl font-bold text-[#EAEAEA] mb-5">
          Our Mech<span className="text-red-600">2</span>Door Journey
        </h2>
        <p className="text-[#A0A0A0] mb-8">
          Founded on the belief that reliable vehicle service should be accessible and trustworthy, Mech 2 Door began as a small team with a big vision: to make vehicle maintenance simple and seamless for everyone.
        </p>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          <div>
            <div className="text-2xl font-bold text-[#EAEAEA] mb-2">5K+ Happy Customers</div>
            <p className="text-[#A0A0A0]">dedicated to bringing convenience and confidence to vehicle care in every city we serve</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#EAEAEA] mb-2">500+ Registered Garage Partners</div>
            <p className="text-[#A0A0A0]">offering top-rated service verified by our team and trusted by our growing customer base</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#EAEAEA] mb-2">98% Satisfaction Rate</div>
            <p className="text-[#A0A0A0]">reflects our commitment to transparent pricing and fast, friendly support</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#EAEAEA] mb-2">24/7 Assistance</div>
            <p className="text-[#A0A0A0]">guarantees drivers get timely help—whether at home, work, or on the road</p>
          </div>
        </div>
      </div>
      {/* Image */}
      <div className="flex-shrink-0">
        <img
          src={heroImage}
          alt="Team presentation"
          className="rounded-2xl w-[400px] h-[300px] object-cover shadow-lg"
        />
      </div>
    </section>
  );
}

export default AboutSection;
