import React from 'react';
import { motion } from 'framer-motion';
import { Users, Lightbulb, Rocket } from 'lucide-react';

const WhoWeAreSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Video moved from HeroSection
  const movedVideoEmbedHtml = {
    __html: `<div style="position: relative; overflow: hidden; aspect-ratio: 1920/1080; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); border: 2px solid rgba(var(--slate-700), 0.5);"><iframe src="https://share.synthesia.io/embeds/videos/6e0e9fab-d844-4431-bfa7-4c3cba7944b1" loading="lazy" title="Synthesia video player - Landing Page Intro" allowfullscreen allow="encrypted-media; fullscreen;" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0; margin: 0; overflow:hidden; border-radius: 0.75rem;"></iframe></div>`
  };


  return (
    <section id="who-we-are" className="py-20 bg-slate-950 text-white">
      <div className="container mx-auto px-4">
        <motion.div 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <Users className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
            Who We Are
          </h2>
          <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
            We are an innovative team driven by a passion for creating tools that redefine productivity and streamline complex processes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="w-full max-h-[450px] rounded-xl shadow-2xl"
            dangerouslySetInnerHTML={movedVideoEmbedHtml}
          >
            {/* Replaced img-replace with the video embed */}
          </motion.div>
          
          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="flex items-start space-x-4 p-6 bg-slate-800/50 rounded-lg border border-slate-700/60 shadow-lg">
              <Lightbulb className="h-10 w-10 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">Our Vision</h3>
                <p className="text-white leading-relaxed">
                  To empower businesses and individuals with an intelligent workflow and project management tool that is both powerful and a joy to use. We believe in simplifying complexity.
                </p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-start space-x-4 p-6 bg-slate-800/50 rounded-lg border border-slate-700/60 shadow-lg">
              <Rocket className="h-10 w-10 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">Our Passion</h3>
                <p className="text-white leading-relaxed">
                  We are deeply passionate about crafting solutions that make a real difference. Work Suite Pro is born from a desire to see teams achieve their full potential through seamless collaboration and optimized processes.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;