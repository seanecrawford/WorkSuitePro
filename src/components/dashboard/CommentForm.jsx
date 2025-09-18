import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';

const CommentForm = ({ taskId, currentUser, onCommentAdded, isPublicSite }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast({ title: 'Empty Comment', description: 'Please enter some text to comment.', variant: 'destructive' });
      return;
    }

    if (isPublicSite) {
      toast({
        title: "Action Unavailable",
        description: "Adding comments is not available in this public view.",
        className: "bg-slate-700 border-slate-600 text-white",
      });
      setCommentText(''); // Clear text area even in public/demo
      return;
    }
    
    // This part would only be reached if isPublicSite is false and currentUser exists
    if (!currentUser) { 
      toast({ title: 'Not Logged In', description: 'You must be logged in to comment.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('kanban_task_comments')
        .insert([
          { 
            task_id: taskId, 
            user_id: currentUser.id, // Assumes currentUser has an id
            user_name: currentUser.user_metadata?.full_name || currentUser.email, 
            comment_text: commentText.trim() 
          }
        ])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        onCommentAdded(data[0]);
        setCommentText('');
        toast({ title: 'Comment Added', description: 'Your comment has been posted.', className: "bg-green-600/30 border-green-500/50 text-white" });
      } else {
        throw new Error("Comment was not added successfully.");
      }

    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error Adding Comment',
        description: error.message || 'Could not post your comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-slate-700/70">
      <Textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder={isPublicSite ? "Viewing comments only..." : "Add a comment..."}
        className="w-full bg-slate-800/60 border-slate-600/80 text-slate-200 focus:border-sky-500"
        rows={3}
        disabled={isSubmitting || isPublicSite}
      />
      <Button 
        type="submit" 
        className="mt-2 w-full bg-sky-600 hover:bg-sky-700 text-white" 
        disabled={isSubmitting || isPublicSite || (!commentText.trim() && !isPublicSite)}
      >
        {isSubmitting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        {isPublicSite ? "Comments Disabled" : "Post Comment"}
      </Button>
    </form>
  );
};

export default CommentForm;