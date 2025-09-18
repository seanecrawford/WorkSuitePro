import React from 'react';
import { motion } from 'framer-motion';
import { BarChartHorizontal, Users, DollarSign, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsPage = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 space-y-6"
    >
      <motion.header variants={itemVariants} className="flex items-center gap-3">
        <BarChartHorizontal className="h-8 w-8 text-[var(--theme-accent-analytics)]" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">High-level insights into your operations.</p>
        </div>
      </motion.header>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle />
              Under Construction
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h3 className="text-2xl font-semibold mb-2 text-foreground">Analytics Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              We are building a powerful analytics suite to provide you with deep insights into project performance, resource utilization, and financial trends. Please check back later.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPage;