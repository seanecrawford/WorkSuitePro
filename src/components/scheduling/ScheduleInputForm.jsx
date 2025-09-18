import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarPlus as CalendarIcon, Loader2, UserPlus, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from '@/components/ui/scroll-area';

const ScheduleInputForm = ({ initialData, onSubmit, onCancel, isLoading, eventIdToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time_date: null,
    start_time_time: '09:00',
    end_time_date: null,
    end_time_time: '10:00',
    category: 'Meeting',
    location: '',
    color: '#ec4899', // Default to fuchsia/pink to match tab
    assigned_personnel_ids: [], 
  });
  const [personnelList, setPersonnelList] = useState([]);
  const [availablePersonnel, setAvailablePersonnel] = useState([]);
  const [showPersonnelPicker, setShowPersonnelPicker] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const { data, error } = await supabase.from('personnel').select('personnel_uuid, name, avatar_url');
        if (error) throw error;
        setPersonnelList(data || []);
        setAvailablePersonnel(data || []);
      } catch (err) {
        console.error("Error fetching personnel:", err);
        toast({ variant: "destructive", title: "Error Loading Personnel", description: err.message });
      }
    };
    fetchPersonnel();
  }, [toast]);

  useEffect(() => {
    if (initialData) {
      const startDateTime = initialData.start_time ? parseISO(initialData.start_time) : null;
      const endDateTime = initialData.end_time ? parseISO(initialData.end_time) : null;
      
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        start_time_date: startDateTime,
        start_time_time: startDateTime ? format(startDateTime, 'HH:mm') : '09:00',
        end_time_date: endDateTime,
        end_time_time: endDateTime ? format(endDateTime, 'HH:mm') : '10:00',
        category: initialData.category || 'Meeting',
        location: initialData.location || '',
        color: initialData.color || '#ec4899',
        assigned_personnel_ids: initialData.assigned_personnel_ids || [],
      });
      // Update available personnel based on initially assigned ones
      setAvailablePersonnel(personnelList.filter(p => !(initialData.assigned_personnel_ids || []).includes(p.personnel_uuid)));
    } else {
      // Reset form for new event
      setFormData({
        title: '', description: '', start_time_date: null, start_time_time: '09:00',
        end_time_date: null, end_time_time: '10:00', category: 'Meeting', location: '',
        color: '#ec4899', assigned_personnel_ids: [],
      });
      setAvailablePersonnel(personnelList);
    }
  }, [initialData, personnelList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPersonnel = (personnel) => {
    setFormData(prev => ({
      ...prev,
      assigned_personnel_ids: [...prev.assigned_personnel_ids, personnel.personnel_uuid]
    }));
    setAvailablePersonnel(prev => prev.filter(p => p.personnel_uuid !== personnel.personnel_uuid));
    setShowPersonnelPicker(false);
  };

  const handleRemovePersonnel = (personnelUuid) => {
    setFormData(prev => ({
      ...prev,
      assigned_personnel_ids: prev.assigned_personnel_ids.filter(id => id !== personnelUuid)
    }));
    const removedPerson = personnelList.find(p => p.personnel_uuid === personnelUuid);
    if (removedPerson) {
      setAvailablePersonnel(prev => [...prev, removedPerson].sort((a,b) => a.name.localeCompare(b.name)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.start_time_date || !formData.end_time_date) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in title, start date, and end date.",
      });
      return;
    }

    const start_time = `${format(formData.start_time_date, 'yyyy-MM-dd')}T${formData.start_time_time}:00`;
    const end_time = `${format(formData.end_time_date, 'yyyy-MM-dd')}T${formData.end_time_time}:00`;

    if (new Date(start_time) >= new Date(end_time)) {
        toast({
            variant: "destructive",
            title: "Invalid Dates",
            description: "End time must be after start time.",
        });
        return;
    }
    
    const submissionData = {
      title: formData.title,
      description: formData.description,
      start_time,
      end_time,
      category: formData.category,
      location: formData.location,
      color: formData.color,
      all_day: false, 
      assigned_personnel_ids: formData.assigned_personnel_ids,
    };
    
    onSubmit(submissionData);
  };

  const colorOptions = [
    { label: 'Fuchsia', value: '#ec4899' }, { label: 'Sky Blue', value: '#38bdf8' },
    { label: 'Green', value: '#22c55e' }, { label: 'Red', value: '#ef4444' },
    { label: 'Amber', value: '#f59e0b' }, { label: 'Purple', value: '#8b5cf6' },
    { label: 'Indigo', value: '#6366f1' }, { label: 'Teal', value: '#14b8a6' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <ScrollArea className="max-h-[70vh] pr-3">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-muted-foreground">Event Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required className="bg-input border-border placeholder:text-muted-foreground focus:ring-[var(--theme-accent-fuchsia)] focus:border-[var(--theme-accent-fuchsia)] mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time_date" className="text-muted-foreground">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1 bg-input border-border hover:bg-accent text-foreground",
                      !formData.start_time_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_time_date ? format(formData.start_time_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border text-popover-foreground" align="start">
                  <Calendar mode="single" selected={formData.start_time_date} onSelect={(date) => handleDateChange('start_time_date', date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="start_time_time" className="text-muted-foreground">Start Time</Label>
              <Input type="time" id="start_time_time" name="start_time_time" value={formData.start_time_time} onChange={handleChange} className="bg-input border-border text-foreground mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="end_time_date" className="text-muted-foreground">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1 bg-input border-border hover:bg-accent text-foreground",
                      !formData.end_time_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_time_date ? format(formData.end_time_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border text-popover-foreground" align="start">
                  <Calendar mode="single" selected={formData.end_time_date} onSelect={(date) => handleDateChange('end_time_date', date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="end_time_time" className="text-muted-foreground">End Time</Label>
              <Input type="time" id="end_time_time" name="end_time_time" value={formData.end_time_time} onChange={handleChange} className="bg-input border-border text-foreground mt-1" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-muted-foreground">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="bg-input border-border placeholder:text-muted-foreground focus:ring-[var(--theme-accent-fuchsia)] focus:border-[var(--theme-accent-fuchsia)] mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-muted-foreground">Category</Label>
              <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger className="w-full bg-input border-border text-foreground mt-1 focus:ring-[var(--theme-accent-fuchsia)] focus:border-[var(--theme-accent-fuchsia)]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  {['Meeting', 'Appointment', 'Reminder', 'Task Deadline', 'Personal', 'Workshop', 'Training', 'Travel', 'Other'].map(cat => (
                    <SelectItem key={cat} value={cat} className="hover:bg-accent">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location" className="text-muted-foreground">Location (Optional)</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} className="bg-input border-border placeholder:text-muted-foreground focus:ring-[var(--theme-accent-fuchsia)] focus:border-[var(--theme-accent-fuchsia)] mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="color" className="text-muted-foreground">Event Color</Label>
            <Select name="color" value={formData.color} onValueChange={(value) => handleSelectChange('color', value)}>
              <SelectTrigger className="w-full bg-input border-border text-foreground mt-1 focus:ring-[var(--theme-accent-fuchsia)] focus:border-[var(--theme-accent-fuchsia)]">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {colorOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="hover:bg-accent">
                    <div className="flex items-center">
                      <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: opt.value }}></span>
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-muted-foreground">Attendees</Label>
            <div className="mt-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.assigned_personnel_ids.map(id => {
                  const person = personnelList.find(p => p.personnel_uuid === id);
                  return person ? (
                    <div key={id} className="flex items-center gap-1.5 bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">
                      <span>{person.name}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-4 w-4 text-primary/70 hover:text-primary" onClick={() => handleRemovePersonnel(id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
              <Popover open={showPersonnelPicker} onOpenChange={setShowPersonnelPicker}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start text-left font-normal bg-input border-border hover:bg-accent text-muted-foreground">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Attendee
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-popover border-border" align="start">
                  <Command>
                    <CommandInput placeholder="Search personnel..." className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground" />
                    <CommandList>
                      <CommandEmpty>No personnel found.</CommandEmpty>
                      <CommandGroup>
                        {availablePersonnel.map((person) => (
                          <CommandItem
                            key={person.personnel_uuid}
                            value={person.name}
                            onSelect={() => handleAddPersonnel(person)}
                            className="text-popover-foreground hover:bg-accent"
                          >
                            {person.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="flex justify-end space-x-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} className="text-muted-foreground border-border hover:bg-accent hover:text-foreground">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-[var(--theme-accent-fuchsia)] hover:bg-[var(--theme-accent-fuchsia)]/90 text-primary-foreground">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (eventIdToEdit ? 'Update Event' : 'Create Event')}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleInputForm;