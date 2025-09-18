import React from 'react';
import { motion } from 'framer-motion';
import { Map, Users, HardHat, Car, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ResourceOverviewPage = () => {
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
        <Map className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Resource Overview</h1>
          <p className="text-muted-foreground">Monitor and manage all available resources.</p>
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
            <h3 className="text-2xl font-semibold mb-2 text-foreground">Resource Management Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              This page will provide a comprehensive view of all your resources, including personnel availability, equipment status, and vehicle assignments.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ResourceOverviewPage;