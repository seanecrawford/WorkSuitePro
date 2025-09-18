import React from 'react';
import LandingPageHeader from '@/components/landing/LandingPageHeader';
import HeroSection from '@/components/landing/HeroSection';
import WhoWeAreSection from '@/components/landing/WhoWeAreSection';
import WhatWeDoSection from '@/components/landing/WhatWeDoSection';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen scroll-smooth relative text-white bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-slate-950/70 z-0"></div>
      
      {/* Content needs to be on a higher z-index */}
      <div className="relative z-10">
        <LandingPageHeader />
        <main>
          <HeroSection />
          <WhoWeAreSection />
          <WhatWeDoSection />
        </main>
        <LandingPageFooter />
      </div>
    </motion.div>
  );
};

export default LandingPage;