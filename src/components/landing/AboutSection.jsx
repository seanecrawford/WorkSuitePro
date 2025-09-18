import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Brain, Award } from 'lucide-react';

const AboutSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const stats = [
    { icon: <Users className="h-8 w-8 text-sky-400" />, value: "1000+", label: "Happy Users" },
    { icon: <Zap className="h-8 w-8 text-emerald-400" />, value: "99.9%", label: "Uptime Guarantee" },
    { icon: <Brain className="h-8 w-8 text-fuchsia-400" />, value: "AI Powered", label: "Insights" },
    { icon: <Award className="h-8 w-8 text-amber-400" />, value: "Top Rated", label: "Support" },
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400">Work Suite Pro</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
            We're passionate about building tools that empower teams to achieve more. Work Suite Pro is the culmination of years of research and development, designed to be powerful yet intuitive.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={itemVariants}>
            <h3 className="text-3xl font-semibold text-sky-300 mb-6">Our Mission & Vision</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              At Work Suite Pro, our mission is to streamline complex workflows and provide actionable insights that drive productivity and success. We envision a future where data-driven decision-making is accessible to everyone, fostering innovation and efficiency across all industries.
            </p>
            <p className="text-slate-300 leading-relaxed mb-6">
              "Optimize, Track, Succeed—Smarter Workflows for Seamless Productivity." This isn't just our tagline; it's the core principle guiding every feature we develop. We believe in the power of smart tools to transform how teams collaborate and achieve their goals.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Award className="h-6 w-6 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-slate-300">Commitment to user-centric design and continuous improvement.</span>
              </li>
              <li className="flex items-start">
                <Brain className="h-6 w-6 text-fuchsia-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-slate-300">Leveraging cutting-edge technology for robust and scalable solutions.</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-6 w-6 text-sky-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-slate-300">Focus on security and reliability to protect your valuable data.</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={imageVariants}>
            <img   
              className="rounded-xl shadow-2xl border-4 border-slate-700/50 object-cover w-full h-auto max-h-[500px]" 
              alt="Team collaborating in a modern office using Work Suite Pro"
             src="https://images.unsplash.com/photo-1686061592689-312bbfb5c055" src="https://images.unsplash.com/photo-1651009188116-bb5f80eaf6aa" />
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700/50"
            >
              <div className="mb-3 inline-block p-3 bg-slate-700/50 rounded-full">
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
              <p className="text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;