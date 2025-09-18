import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BrainCircuit, FileText, BarChartBig, Users, ShoppingBag } from 'lucide-react';

const FeaturePlaceholderCard = ({ title, description, icon: Icon, phase }) => (
  <Card className="bg-slate-800/60 border border-slate-700/50 shadow-lg hover:shadow-sky-500/20 transition-shadow duration-300">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-sky-400" />
        <CardTitle className="text-lg text-slate-100">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-slate-300 mb-3 text-sm">{description}</CardDescription>
      <div className="text-xs text-sky-300/80 font-medium bg-sky-700/30 px-2 py-1 rounded-full inline-block">
        Coming in {phase}
      </div>
    </CardContent>
  </Card>
);

const ProcurementToolsPlaceholder = ({ itemVariants }) => {
  const tools = [
    { 
      title: "Demand Forecasting", 
      description: "AI-driven analytics to predict future demand, optimize stock levels, and reduce holding costs.",
      icon: BrainCircuit,
      phase: "Phase 1"
    },
    { 
      title: "Spend Analysis", 
      description: "Utilize AI models to analyze spending patterns, identify cost-saving opportunities, and improve budget allocation.",
      icon: BarChartBig,
      phase: "Phase 1"
    },
    { 
      title: "RFQ Management", 
      description: "Streamline Request for Quotation processes, manage vendor responses, and compare bids efficiently.",
      icon: FileText,
      phase: "Phase 1"
    },
     { 
      title: "Supplier Relationship Management (SRM)", 
      description: "Tools to manage supplier performance, contracts, and communications for stronger partnerships.",
      icon: Users,
      phase: "Future Enhancement"
    },
    { 
      title: "E-Procurement Platform", 
      description: "A centralized platform for managing the entire procurement lifecycle, from requisition to payment.",
      icon: ShoppingBag,
      phase: "Future Enhancement"
    }
  ];

  return (
    <motion.div 
      variants={itemVariants} 
      className="h-full p-4 md:p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-50 mb-2">Advanced Procurement Tools</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Unlock powerful AI-driven insights and streamline your procurement workflows. These tools are designed to optimize spending, enhance supplier collaboration, and improve overall efficiency.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <FeaturePlaceholderCard 
            key={tool.title}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            phase={tool.phase}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ProcurementToolsPlaceholder;