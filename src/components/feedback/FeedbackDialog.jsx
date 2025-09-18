import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import FeedbackForm from './FeedbackForm';

const FeedbackDialog = ({ open, onOpenChange, onFeedbackSubmitted }) => {
  
  const handleFormSubmit = () => {
    if (onFeedbackSubmitted) onFeedbackSubmitted();
    onOpenChange(false); // Close dialog after submission
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-800 border-slate-700 text-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-sky-400 text-2xl">Submit Your Feedback</DialogTitle>
          <DialogDescription className="text-slate-400 pt-1">
            We value your input! Help us improve Work Suite Pro by sharing your thoughts, bug reports, or feature requests.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FeedbackForm 
            onFormSubmit={handleFormSubmit} 
            onCancel={() => onOpenChange(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;