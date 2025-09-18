import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, DatabaseZap, FolderKanban, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Removed useAuth as isAuthenticated is no longer used to conditionally render Login/Signup buttons here
// import { useAuth } from '@/hooks/useAuth';

const HeroSection = () => {
  const navigate = useNavigate();
  // const { isAuthenticated } = useAuth(); // No longer needed here

  const handleStartHere = () => {
    navigate('/dashboard'); 
  };

  const handleGoToAcademy = () => {
    navigate('/academy');
  };

  // New Synthesia video for the Hero section
  const synthesiaEmbedHtml = {
    __html: `<div style="position: relative; overflow: hidden; aspect-ratio: 1920/1080"><iframe src="https://share.synthesia.io/embeds/videos/84450991-ed5e-4fd5-b807-c1b2e2be9614" loading="lazy" title="Synthesia video player - Unlocking Efficiency with Work Suite Pro" allowfullscreen allow="encrypted-media; fullscreen;" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0; margin: 0; overflow:hidden;"></iframe></div>`
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden" 
    >
      <div className="relative container mx-auto px-4 text-center z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div 
            className="mb-8 mx-auto w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden"
            dangerouslySetInnerHTML={synthesiaEmbedHtml}
          />

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-300">
              Welcome to Work Suite Pro
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto drop-shadow-md">
            The future of streamlined workflow and project management. Discover an intuitive, dynamic desktop experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            <Button 
              onClick={handleStartHere} 
              size="lg" 
              className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white text-lg px-10 py-6 shadow-xl transform hover:scale-105 transition-transform duration-300"
            >
              Explore Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={handleGoToAcademy} 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto border-teal-400 text-teal-300 hover:bg-teal-400/20 hover:text-white text-lg px-10 py-6 shadow-xl transform hover:scale-105 transition-transform duration-300"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Visit Academy
            </Button>
            {/* Login and Sign Up buttons removed from here to streamline the display */}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="bg-slate-800/80 p-6 rounded-xl shadow-2xl border border-slate-700/70 backdrop-blur-md hover:bg-slate-700/90 transition-colors">
            <DatabaseZap className="h-10 w-10 text-white mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Effective Scheduling</h3>
            <p className="text-sm text-white">Plan and manage your time with precision.</p>
          </div>
          <div className="bg-slate-800/80 p-6 rounded-xl shadow-2xl border border-slate-700/70 backdrop-blur-md hover:bg-slate-700/90 transition-colors">
            <FolderKanban className="h-10 w-10 text-white mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Resource Management</h3>
            <p className="text-sm text-white">Allocate and track resources efficiently.</p>
          </div>
          <div className="bg-slate-800/80 p-6 rounded-xl shadow-2xl border border-slate-700/70 backdrop-blur-md hover:bg-slate-700/90 transition-colors">
            <BarChart3 className="h-10 w-10 text-white mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Data Analytics</h3>
            <p className="text-sm text-white">Gain insights to optimize your workflows.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;