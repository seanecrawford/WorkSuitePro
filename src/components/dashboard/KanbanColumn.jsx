import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanTask from './KanbanTask';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlusCircle, GripVertical as GripVerticalIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const KanbanColumn = ({ column, onAddTask, onEditTask, onEditColumn, isOverlay }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.columnid,
    data: {
      type: 'COLUMN',
      column,
    },
    disabled: !user,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleDeleteColumn = async () => {
    if (!user) {
        toast({ title: "Login Required", description: "Please log in to delete columns.", variant: "destructive" });
        return;
    }
    if (!window.confirm(`Are you sure you want to delete column "${column.title}" and ALL its tasks? This action CANNOT be undone.`)) return;

    try {
      const taskIds = column.tasks.map(t => t.taskid);
      if (taskIds.length > 0) {
        await supabase.from('kanban_task_comments').delete().in('task_id', taskIds);
        await supabase.from('kanban_tasks').delete().in('taskid', taskIds);
      }
      await supabase.from('kanban_columns').delete().eq('columnid', column.columnid);
      toast({ title: "Column Deleted", description: `Column "${column.title}" has been successfully deleted.` });
      // Parent component will refetch data
    } catch (error) {
      toast({ title: "Error deleting column", description: error.message, variant: "destructive" });
    }
  };


  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex-shrink-0 w-72 bg-slate-700/50 p-3 rounded-lg shadow-lg border-2 border-dashed border-sky-500 h-full"
      />
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layoutId={isOverlay ? undefined : `column-${column.columnid}`}
      className="flex-shrink-0 w-72 bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-700 flex flex-col h-full max-h-full overflow-hidden"
    >
      <div {...attributes} {...listeners} className="flex justify-between items-center mb-3 p-1 rounded hover:bg-slate-700/30 transition-colors cursor-grab active:cursor-grabbing">
        <h3 className="font-semibold text-base text-sky-300 truncate">{column.title}</h3>
        <div className="flex items-center">
          <span className="text-xs font-medium text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full shadow-sm border border-sky-500/30 mr-2">
            {column.tasks?.length || 0}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-slate-200">
              <DropdownMenuItem onClick={() => onEditColumn(column)} className="hover:!bg-slate-700 focus:!bg-slate-700">Edit Column</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteColumn} className="text-red-400 hover:!bg-red-700/30 hover:!text-red-300 focus:!bg-red-700/30">Delete Column</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-grow space-y-2.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600/70 scrollbar-track-slate-700/40 min-h-[100px]">
        <SortableContext items={column.tasks?.map(task => task.taskid) || []} strategy={verticalListSortingStrategy}>
          {column.tasks?.map((task) => (
            <KanbanTask 
              key={task.taskid} 
              task={task} 
              onEditTask={onEditTask}
            />
          ))}
        </SortableContext>
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-3 pt-3 border-t border-slate-700/50 text-slate-300 border-slate-600 hover:text-sky-200 hover:border-sky-500 hover:bg-sky-700/40 transition-all duration-150 ease-in-out group text-xs"
        onClick={onAddTask}
      >
        <PlusCircle className="h-4 w-4 mr-1.5 group-hover:rotate-90 transition-transform duration-200" /> Add Task
      </Button>
    </motion.div>
  );
};

export default KanbanColumn;