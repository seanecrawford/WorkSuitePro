import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const KanbanColumnModal = ({ isOpen, onOpenChange, column, onSave, userId, currentColumnCount }) => {
  const [title, setTitle] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (column) {
      setTitle(column.title || '');
    } else {
      setTitle('');
    }
  }, [column, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
        toast({ title: 'Title is required', variant: 'destructive' });
        return;
    }
    
    const columnPayload = {
      title: title.trim(),
      user_id: userId,
    };
    
    let result;
    try {
      if (column) {
        result = await supabase.from('kanban_columns').update(columnPayload).eq('columnid', column.columnid).select().single();
      } else {
        columnPayload.position = currentColumnCount;
        result = await supabase.from('kanban_columns').insert(columnPayload).select().single();
      }

      if (result.error) throw result.error;

      toast({ title: column ? 'Column Updated' : 'Column Added', variant: 'success' });
      onSave(); // This will close modal and refetch data in parent
    } catch(err) {
      toast({ title: 'Error saving column', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-850 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-amber-400">{column ? "Edit Column" : "Add New Column"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {column ? `Editing the "${column.title}" column.` : 'Create a new column for your board.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title_col_modal" className="text-slate-300">Column Title</Label>
            <Input 
              id="title_col_modal" 
              name="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
              {column ? 'Save Changes' : 'Create Column'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KanbanColumnModal;