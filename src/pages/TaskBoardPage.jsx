import React from 'react';
import { motion } from 'framer-motion';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import { ListChecks } from 'lucide-react';

const TaskBoardPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6 h-[calc(100vh-4rem-2rem)] flex flex-col" // Full height minus header
    >
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <ListChecks className="mr-3 h-8 w-8 text-primary" /> Task Board
        </h1>
        <p className="text-muted-foreground">
          Manage your project workflows with this interactive Kanban board.
        </p>
      </div>
      <div className="flex-grow min-h-0">
         <KanbanBoard />
      </div>
    </motion.div>
  );
};

export default TaskBoardPage;