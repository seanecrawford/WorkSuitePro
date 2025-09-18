import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, LayoutDashboard, BarChart2, Users, ShieldCheck, Zap } from 'lucide-react';

const features = [
  {
    icon: <DatabaseZap className="h-10 w-10 text-sky-400" />,
    title: "Unified Data Management",
    description: "Connect, query, and visualize data from multiple sources including Supabase, Firebase, and traditional SQL databases. Centralize your data workflow.",
    color: "from-sky-500 to-cyan-500"
  },
  {
    icon: <LayoutDashboard className="h-10 w-10 text-emerald-400" />,
    title: "Customizable Dashboards",
    description: "Build personalized dashboards with drag-and-drop widgets. Track KPIs, project progress, and financial metrics in real-time.",
    color: "from-emerald-500 to-green-500"
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-fuchsia-400" />,
    title: "Advanced Reporting & Analytics",
    description: "Generate insightful reports with dynamic charts and data visualizations. Make data-driven decisions with ease.",
    color: "from-fuchsia-500 to-pink-500"
  },
  {
    icon: <Users className="h-10 w-10 text-amber-400" />,
    title: "Team Collaboration",
    description: "Streamline teamwork with shared project spaces, task assignments, and real-time updates. Keep everyone on the same page.",
    color: "from-amber-500 to-yellow-500"
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-rose-400" />,
    title: "Robust Security",
    description: "Enterprise-grade security features, including role-based access control and data encryption, powered by Supabase and modern cloud practices.",
    color: "from-rose-500 to-red-500"
  },
  {
    icon: <Zap className="h-10 w-10 text-indigo-400" />,
    title: "Seamless Integrations",
    description: "Connect Work Suite Pro with your favorite tools and services. Enhance your workflow with powerful integrations.",
    color: "from-indigo-500 to-purple-500"
  }
];

const FeaturesSection = () => {
  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 mb-4">
            Powerful Features of <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400">Work Suite Pro</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to optimize workflows, track progress, and achieve success, all in one intelligent platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="h-full bg-slate-900/70 border-slate-700/50 shadow-2xl hover:shadow-sky-500/30 transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                <CardHeader className="items-center text-center">
                  <div className={`p-3 rounded-full bg-gradient-to-br ${feature.color} mb-4 inline-block`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-semibold text-slate-100">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;