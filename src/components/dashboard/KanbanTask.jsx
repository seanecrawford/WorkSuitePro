import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { GripVertical, UserCircle, CalendarDays, MessageSquare, Loader2, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

const KanbanTask = ({ task, index, columnId, onEditTask, onDeleteTask }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const { toast } = useToast();
  const { theme } = useTheme();
  const { user: currentUser } = useAuth(); // Get currentUser from AuthContext

  const priorityStylesDark = {
    urgent: { bg: 'bg-red-700/40', border: 'border-red-500/70', text: 'text-red-300', hoverRing: 'hover:ring-red-500/80' },
    high: { bg: 'bg-orange-700/40', border: 'border-orange-500/70', text: 'text-orange-300', hoverRing: 'hover:ring-orange-500/80' },
    medium: { bg: 'bg-yellow-700/40', border: 'border-yellow-500/70', text: 'text-yellow-300', hoverRing: 'hover:ring-yellow-500/80' },
    low: { bg: 'bg-green-700/40', border: 'border-green-500/70', text: 'text-green-300', hoverRing: 'hover:ring-green-500/80' },
    none: { bg: 'bg-slate-700/50', border: 'border-slate-500/70', text: 'text-slate-300', hoverRing: 'hover:ring-slate-500/80' }
  };

  const priorityStylesLight = { 
    urgent: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', hoverRing: 'hover:ring-red-400' },
    high: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', hoverRing: 'hover:ring-orange-400' },
    medium: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', hoverRing: 'hover:ring-yellow-400' },
    low: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', hoverRing: 'hover:ring-green-400' },
    none: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600', hoverRing: 'hover:ring-slate-400' }
  };
  
  const taskPriority = (task.priority || 'none').toLowerCase();
  const currentPriorityStyle = theme === 'dark' 
    ? (priorityStylesDark[taskPriority] || priorityStylesDark['none'])
    : (priorityStylesLight[taskPriority] || priorityStylesLight['none']);


  const fetchComments = async () => {
    if (!task.taskid || !currentUser) { 
        setComments([]);
        setLoadingComments(false);
        return;
    }
    setLoadingComments(true);
    setCommentError(null);
    try {
      const { data, error } = await supabase
        .from('kanban_task_comments')
        .select('*, user:user_id (id, user_metadata->>full_name, email)') 
        .eq('task_id', task.taskid)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setComments(data.map(c => ({
        ...c, 
        user_name: c.user?.full_name || c.user?.email || "Anonymous"
      })) || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      const errorMessage = error.message || "Could not load comments.";
      setCommentError(errorMessage);
      toast({
        title: 'Error Fetching Comments',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (isCommentsOpen) {
      fetchComments();
    }
  }, [isCommentsOpen, task.taskid, currentUser]);

  const handleCommentAdded = (newComment) => {
    fetchComments();
  };
  
  const handleOpenChange = (open) => {
    setIsCommentsOpen(open);
  };

  const dueDate = task.due_date ? new Date(task.due_date) : null;
  let dueDateDisplay = 'N/A';
  let dueDateColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  if (dueDate) {
    const now = new Date();
    if (dueDate < now && task.status !== 'Delivered' && task.status !== 'Completed' && task.status !== 'Done') { // Added 'Done'
      dueDateColor = theme === 'dark' ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold';
    } else if (dueDate.toDateString() === now.toDateString()) {
      dueDateColor = theme === 'dark' ? 'text-orange-400 font-semibold' : 'text-orange-600 font-semibold';
    }
    try {
      dueDateDisplay = formatDistanceToNowStrict(dueDate, { addSuffix: true });
    } catch (e) {
      // Fallback for invalid date format
      dueDateDisplay = task.due_date;
    }
  }
  
  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent dialog from opening if card is also a trigger
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to edit tasks.", variant: "destructive" });
      return;
    }
    onEditTask(task, columnId);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to delete tasks.", variant: "destructive" });
      return;
    }
    onDeleteTask(task.taskid);
  };


  return (
    <motion.div
      layoutId={`task-${task.taskid}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "circOut" }}
      className="mb-2.5"
    >
      <Card className={`bg-card border ${currentPriorityStyle.border} text-card-foreground shadow-md hover:shadow-lg hover:ring-1 ${currentPriorityStyle.hoverRing} transition-all duration-150 group`}>
        <CardHeader className={`p-2.5 flex flex-row items-start justify-between border-b ${currentPriorityStyle.border} cursor-grab active:cursor-grabbing`}>
            <div className="flex-grow min-w-0">
                <CardTitle className="text-xs sm:text-sm font-semibold leading-tight text-foreground truncate pr-1">{task.title}</CardTitle>
            </div>
          <GripVertical className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-colors flex-shrink-0 ml-1`} />
        </CardHeader>
        <CardContent className="p-2.5 pt-2">
          {task.description && (
            <CardDescription className={`text-2xs sm:text-xs ${theme === 'dark' ? 'text-slate-300/90' : 'text-slate-600'} mb-2 truncate`}>
              {task.description}
            </CardDescription>
          )}
          <div className="flex items-center justify-between text-2xs sm:text-xs">
            {dueDate && (
              <div className={`flex items-center ${dueDateColor}`}>
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                <span className="font-medium">{dueDateDisplay}</span>
              </div>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-3xs sm:text-2xs font-semibold ${currentPriorityStyle.bg} ${currentPriorityStyle.text} border ${currentPriorityStyle.border}`}
            >
              {taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}
            </span>
          </div>
          {task.assigned_to_personnel_uuid && ( // Check for assigned_to_personnel_uuid
            <div className={`mt-2 flex items-center text-2xs sm:text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <UserCircle className={`h-3.5 w-3.5 mr-1 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
              <span className="truncate">
                {task.assignee?.name || `User ${task.assigned_to_personnel_uuid.substring(0,6)}...`}
              </span>
            </div>
          )}
          <div className="mt-2.5 flex justify-between items-center">
            <Dialog open={isCommentsOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="xs" className={`${theme === 'dark' ? 'text-slate-400 hover:text-sky-300 hover:bg-sky-700/20' : 'text-slate-500 hover:text-sky-600 hover:bg-sky-100/70'} transition-colors text-xs px-1.5 py-1 group`}>
                  <MessageSquare className="h-3.5 w-3.5 mr-1 group-hover:scale-110 transition-transform" /> ({comments.length})
                </Button>
              </DialogTrigger>
              <DialogContent className={`sm:max-w-[550px] ${theme === 'dark' ? 'bg-slate-900/95 border-slate-700/80 text-white backdrop-blur-lg' : 'bg-white border-slate-200 text-slate-900'}`}>
                <DialogHeader>
                  <DialogTitle className={`${theme === 'dark' ? 'text-sky-300' : 'text-sky-600'} text-lg`}>Comments: <span className={`font-normal ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{task.title}</span></DialogTitle>
                   <DialogDescription className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      View and add comments for this task.
                  </DialogDescription>
                </DialogHeader>
                {loadingComments ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className={`h-10 w-10 animate-spin ${theme === 'dark' ? 'text-sky-400' : 'text-sky-600'}`} />
                  </div>
                ) : commentError ? (
                   <div className={`flex flex-col items-center justify-center h-40 p-4 ${theme === 'dark' ? 'bg-red-900/30 border-red-700/50' : 'bg-red-50 border-red-200'} rounded-md`}>
                      <AlertTriangle className={`h-8 w-8 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'} mb-2`} />
                      <p className={`${theme === 'dark' ? 'text-red-300' : 'text-red-700'} text-sm`}>Error loading comments.</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>{commentError}</p>
                   </div>
                ) : (
                  <div className={`max-h-[300px] overflow-y-auto pr-2 scrollbar-thin ${theme === 'dark' ? 'scrollbar-thumb-slate-700 scrollbar-track-slate-800/50' : 'scrollbar-thumb-slate-400 scrollbar-track-slate-200/50'}`}>
                    <CommentList comments={comments} isDemoMode={!currentUser} />
                  </div>
                )}
                <CommentForm taskId={task.taskid} currentUser={currentUser} onCommentAdded={handleCommentAdded} isPublicSite={!currentUser} />
                <DialogClose asChild>
                  <Button variant="outline" className={`mt-4 w-full ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white' : 'border-slate-300 hover:bg-slate-100 hover:border-slate-400 text-slate-700 hover:text-slate-900'}`}>Close Comments</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            <div className="flex space-x-1">
                <Button variant="ghost" size="xs" onClick={handleEditClick} className={`p-1 h-auto ${theme === 'dark' ? 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-700/20' : 'text-slate-500 hover:text-yellow-600 hover:bg-yellow-100/70'}`}>
                    <Edit2 className="h-3.5 w-3.5"/>
                </Button>
                <Button variant="ghost" size="xs" onClick={handleDeleteClick} className={`p-1 h-auto ${theme === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-red-700/20' : 'text-slate-500 hover:text-red-600 hover:bg-red-100/70'}`}>
                    <Trash2 className="h-3.5 w-3.5"/>
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KanbanTask;