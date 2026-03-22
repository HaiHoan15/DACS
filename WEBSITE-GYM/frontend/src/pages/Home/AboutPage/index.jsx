import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Banner from "./about-pages/Banner";
import AboutIntro from "./about-pages/AboutIntro";
import History from "./about-pages/History";
import MissionVision from "./about-pages/MissionVision";
import TeamSection from "./about-pages/TeamSection";
import FacilitiesSection from "./about-pages/FacilitiesSection";
import AchievementsSection from "./about-pages/AchievementsSection";
import CustomerReviewsSection from "./about-pages/CustomerReviewsSection";
import CTASection from "./about-pages/CTASection";
import ContactSection from "./about-pages/ContactSection";

export default function HomePage() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* banner */}
      <Banner />
      
      {/* Giới thiệu về phòng Gym */}
      <AboutIntro />

      {/* Lịch sử phát triển */}
      <History />

      {/* Sứ mệnh – Tầm nhìn – Giá trị */}
      <MissionVision />

      {/* Đội ngũ THREEGYM */}
      <TeamSection />

      {/* cơ sở vật chất */}
      <FacilitiesSection /> 

      {/* thành tựu */}
      <AchievementsSection />
      
      {/* đánh giá khách hàng */}
      <CustomerReviewsSection />

      {/* kêu gọi hành động */}
      <CTASection />

      {/* Thông tin liên hệ */}
      <ContactSection />
    </div>
  );
}