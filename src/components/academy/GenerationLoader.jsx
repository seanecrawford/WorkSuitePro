import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const GenerationLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="col-span-1 lg:col-span-2"
    >
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </motion.div>
  );
};

export default GenerationLoader;