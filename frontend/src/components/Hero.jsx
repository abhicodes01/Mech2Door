import React from "react";
import heroImage from "../assets/HeroImage.jpeg";

function HeroSection() {
  return (
    <section
      className="relative min-h-[400px] h-[600px] md:h-[730px] bg-cover bg-center flex items-center"
      style={{
        backgroundImage: `url(${heroImage})`
      }}
      aria-label="Mechanic shop hero section"
    >
      <div
        className="
          max-w-xl
          px-4
          pt-24
          pb-16
          md:pl-16
          md:pt-0
          md:pb-0
        "
      >
        <h1 className="text-white font-lex text-3xl sm:text-4xl not-only: md:text-5xl font-semibold leading-tight">
          Expert <span className="text-red-600">Service</span>
          <br /> Seamless <span className="text-red-600">Experience</span>
        </h1>
        <h2 className="text-white font-lex text-base sm:text-lg md:text-xl font-normal mt-4 md:mt-6">
          Connect with certified mechanics in your area. <br />
          Fast bookings and transparent pricing at your fingertips.
        </h2>
      </div>
      {/* Search bar or other elements can go here */}
    </section>
  );
}

export default HeroSection;
