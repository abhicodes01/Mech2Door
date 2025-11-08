import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/Hero";
import ServicesSection from "../components/Services";
import AboutSection from "../components/AboutUs";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div className="h-screen">
      <Navbar/>
      <HeroSection/>
      <ServicesSection/>
      <AboutSection/>
      <Footer/>
    </div>
  );
}
export default HomePage;
