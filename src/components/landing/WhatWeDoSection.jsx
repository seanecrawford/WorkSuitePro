import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarCheck, BarChartHorizontalBig, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: <LayoutDashboard className="h-10 w-10 text-white" />,
    title: "Intuitive Desktop Interface",
    description: "Experience a beautifully designed, dynamic interface that makes managing complex projects feel effortless and engaging.",
    color: "text-white" 
  },
  {
    icon: <CalendarCheck className="h-10 w-10 text-white" />,
    title: "Effective Scheduling",
    description: "Plan, track, and manage your team's time with powerful scheduling tools, ensuring deadlines are met and resources are optimized.",
    color: "text-white" 
  },
  {
    icon: <Users className="h-10 w-10 text-white" />,
    title: "Resource Management",
    description: "Gain clear visibility into resource allocation, workloads, and availability to make informed decisions and prevent bottlenecks.",
    color: "text-white" 
  },
  {
    icon: <BarChartHorizontalBig className="h-10 w-10 text-white" />,
    title: "Insightful Data Analytics",
    description: "Leverage comprehensive data analytics to monitor performance, identify trends, and optimize your workflows for maximum efficiency.",
    color: "text-white" 
  },
];

const WhatWeDoSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section id="what-we-do" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <motion.div 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <Zap className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
            What We Do
          </h2>
          <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
            We are building Work Suite Pro to be your central hub for optimizing workflows, enabling effective scheduling, resource management, and insightful data analytics.
          </p>
        </motion.div>

        <motion.div 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-8 shadow-xl hover:shadow-sky-500/20 transition-shadow duration-300 ease-in-out flex flex-col items-center text-center"
            >
              <div className={`p-4 rounded-full bg-slate-700/50 mb-6 inline-block ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className={`text-2xl font-semibold mb-3 ${feature.color}`}>{feature.title}</h3>
              <p className="text-white leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16 text-center"
        >
          <img  
            className="rounded-xl shadow-2xl border-2 border-slate-700/50 object-contain w-full max-w-4xl mx-auto" 
            alt="Screenshot of Work Suite Pro dashboard showing scheduling and analytics"
           src="https://images.unsplash.com/photo-1686061592689-312bbfb5c055" />
        </motion.div>

      </div>
    </section>
  );
};

export default WhatWeDoSection;