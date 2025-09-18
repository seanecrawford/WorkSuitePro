import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabaseClient'; // For fetching personnel
import { DatePicker } from '@/components/ui/date-picker'; // Assuming you have this

const KanbanTaskModal = ({ isOpen, onOpenChange, task, columns, onSave, userId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    columnid: '',
    status: 'todo', // Default status
    due_date: null,
    assigned_to_personnel_uuid: null,
  });
  const [personnelOptions, setPersonnelOptions] = useState([]);

  useEffect(() => {
    const fetchPersonnel = async () => {
      if (!userId) return; // Only fetch if user is available
      const { data, error } = await supabase
        .from('personnel') // Assuming your personnel table is named 'personnel'
        .select('personnel_uuid, name')
        .order('name');
      
      if (error) {
        console.error("Error fetching personnel:", error);
      } else {
        setPersonnelOptions(data || []);
      }
    };
    fetchPersonnel();
  }, [userId]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        columnid: task.columnid || (columns.length > 0 ? columns[0].columnid : ''),
        status: task.status || 'todo',
        due_date: task.due_date ? new Date(task.due_date) : null,
        assigned_to_personnel_uuid: task.assigned_to_personnel_uuid || null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        columnid: columns.length > 0 ? columns[0].columnid : '',
        status: 'todo',
        due_date: null,
        assigned_to_personnel_uuid: null,
      });
    }
  }, [task, columns, isOpen]); // Re-init form when task, columns, or isOpen changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, due_date: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (dataToSave.due_date) {
      dataToSave.due_date = dataToSave.due_date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    if (!dataToSave.assigned_to_personnel_uuid) { // Handle unsetting assignee
        dataToSave.assigned_to_personnel_uuid = null;
    }
    onSave(dataToSave, !!task); // Pass true if editing, false if new
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-850 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-sky-400">{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription className="text-slate-400">Fill in the details for your task.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title_modal" className="text-slate-300">Title</Label>
            <Input id="title_modal" name="title" value={formData.title} onChange={handleChange} required className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400" />
          </div>
          <div>
            <Label htmlFor="description_modal" className="text-slate-300">Description</Label>
            <Textarea id="description_modal" name="description" value={formData.description} onChange={handleChange} className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400" />
          </div>
          <div>
            <Label htmlFor="priority_modal" className="text-slate-300">Priority</Label>
            <Select name="priority" value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
              <SelectTrigger id="priority_modal" className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectItem value="low" className="hover:bg-slate-700 focus:bg-slate-700">Low</SelectItem>
                <SelectItem value="medium" className="hover:bg-slate-700 focus:bg-slate-700">Medium</SelectItem>
                <SelectItem value="high" className="hover:bg-slate-700 focus:bg-slate-700">High</SelectItem>
                <SelectItem value="urgent" className="hover:bg-slate-700 focus:bg-slate-700">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {columns && columns.length > 0 && (
            <div>
              <Label htmlFor="columnid_modal_form" className="text-slate-300">Column</Label>
              <Select name="columnid" value={formData.columnid} onValueChange={(value) => handleSelectChange('columnid', value)}>
                <SelectTrigger id="columnid_modal_form" className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  {columns.map(col => (
                    <SelectItem key={col.columnid} value={col.columnid} className="hover:bg-slate-700 focus:bg-slate-700">{col.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
           <div>
            <Label htmlFor="due_date_modal" className="text-slate-300">Due Date</Label>
            <DatePicker date={formData.due_date} setDate={handleDateChange} triggerClassName="bg-slate-700 border-slate-600 text-slate-100 w-full" />
          </div>
          <div>
            <Label htmlFor="assignee_modal" className="text-slate-300">Assignee</Label>
            <Select name="assigned_to_personnel_uuid" value={formData.assigned_to_personnel_uuid || ''} onValueChange={(value) => handleSelectChange('assigned_to_personnel_uuid', value || null)}>
              <SelectTrigger id="assignee_modal" className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Select assignee (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectItem value="" className="hover:bg-slate-700 focus:bg-slate-700">Unassigned</SelectItem>
                {personnelOptions.map(p => (
                  <SelectItem key={p.personnel_uuid} value={p.personnel_uuid} className="hover:bg-slate-700 focus:bg-slate-700">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white">{task ? "Save Changes" : "Add Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KanbanTaskModal;