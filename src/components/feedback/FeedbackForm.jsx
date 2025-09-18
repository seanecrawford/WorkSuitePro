import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const feedbackSchema = z.object({
  category: z.string().min(1, "Category is required"),
  message: z.string().min(10, "Feedback message must be at least 10 characters long"),
  related_component: z.string().optional(),
  user_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  is_anonymous: z.boolean().default(false),
});

const FeedbackForm = ({ onFormSubmit, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: '',
      message: '',
      related_component: '',
      user_email: user?.email || '',
      is_anonymous: false,
    },
  });

  const isAnonymous = watch('is_anonymous');

  useEffect(() => {
    if (user) {
      setValue('user_email', user.email);
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const feedbackData = {
        user_id: data.is_anonymous || !user ? null : user.id,
        user_email: data.is_anonymous ? (data.user_email || null) : (user?.email || null),
        category: data.category,
        message: data.message,
        related_component: data.related_component || null,
        // status is defaulted by DB
      };

      const { error } = await supabase.from('user_feedback').insert([feedbackData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable input.",
        className: "bg-green-600 text-white border-green-700",
      });
      if (onFormSubmit) onFormSubmit();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not submit your feedback. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const feedbackCategories = ["Bug Report", "Feature Request", "Usability Issue", "General Comment"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="category" className="text-slate-300">Category</Label>
        <Select onValueChange={(value) => setValue('category', value)} defaultValue="">
          <SelectTrigger id="category" className="w-full bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500">
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            {feedbackCategories.map(cat => (
              <SelectItem key={cat} value={cat} className="hover:bg-slate-700">{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <Label htmlFor="message" className="text-slate-300">Feedback Message</Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Describe your feedback in detail..."
          className="min-h-[120px] bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
        />
        {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>}
      </div>

      <div>
        <Label htmlFor="related_component" className="text-slate-300">Related Component (Optional)</Label>
        <Input
          id="related_component"
          {...register("related_component")}
          placeholder="e.g., Dashboard Calendar, Project Task List"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="is_anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setValue('is_anonymous', checked)}
        />
        <Label htmlFor="is_anonymous" className="text-slate-300 cursor-pointer">Submit Anonymously</Label>
      </div>

      {isAnonymous && (
        <div>
          <Label htmlFor="user_email" className="text-slate-300">Your Email (Optional, for anonymous follow-up)</Label>
          <Input
            id="user_email"
            type="email"
            {...register("user_email")}
            placeholder="your.email@example.com"
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
          />
          {errors.user_email && <p className="text-red-400 text-sm mt-1">{errors.user_email.message}</p>}
        </div>
      )}
      
      {!isAnonymous && user && (
         <p className="text-sm text-slate-400">You are submitting as: {user.email}</p>
      )}


      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Feedback"}
        </Button>
      </div>
    </form>
  );
};

export default FeedbackForm;