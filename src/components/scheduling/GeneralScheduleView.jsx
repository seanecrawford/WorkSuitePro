import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, PlusCircle, Edit2, Trash2, CalendarDays, MapPin, Tag, Filter, Users as UsersIcon } from 'lucide-react';
import ScheduleInputForm from './ScheduleInputForm';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


const GeneralScheduleView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  const [personnel, setPersonnel] = useState([]);
  const [selectedPersonnelFilter, setSelectedPersonnelFilter] = useState('all');


  const { toast } = useToast();

  const fetchPersonnel = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase.from('personnel').select('personnel_uuid, name, avatar_url');
      if (fetchError) throw fetchError;
      setPersonnel(data || []);
    } catch (err) {
      console.error("Error fetching personnel:", err);
      toast({ variant: "destructive", title: "Error Loading Personnel", description: err.message });
    }
  }, [toast]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      if (dateFilter) {
        const selectedDate = format(dateFilter, 'yyyy-MM-dd');
        query = query.gte('start_time', `${selectedDate}T00:00:00Z`).lte('start_time', `${selectedDate}T23:59:59Z`);
      }
      

      const { data, error: dbError } = await query;
      if (dbError) throw dbError;
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to fetch events.");
      toast({ variant: "destructive", title: "Error Loading Events", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm, categoryFilter, dateFilter]);

  useEffect(() => {
    fetchEvents();
    fetchPersonnel();
  }, [fetchEvents, fetchPersonnel]);

  const handleEventSubmit = async (formData) => {
    setFormIsLoading(true);
    try {
      let result;
      const submissionData = {
        ...formData,
        
      };

      if (editingEvent) {
        result = await supabase
          .from('calendar_events')
          .update(submissionData)
          .eq('event_id', editingEvent.event_id)
          .select();
      } else {
        result = await supabase
          .from('calendar_events')
          .insert([submissionData])
          .select();
      }

      const { error: opError } = result;
      if (opError) throw opError;

      toast({ title: editingEvent ? "Event Updated" : "Event Created", description: `Event "${formData.title}" has been successfully ${editingEvent ? 'updated' : 'created'}.` });
      setShowEventDialog(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error(`Error ${editingEvent ? 'updating' : 'creating'} event:`, err);
      toast({ variant: "destructive", title: `Error ${editingEvent ? 'Updating' : 'Creating'} Event`, description: err.message });
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleOpenEditDialog = (event) => {
    setEditingEvent(event);
    setShowEventDialog(true);
  };

  const handleOpenNewDialog = () => {
    setEditingEvent(null);
    setShowEventDialog(true);
  };

  const executeDeleteEvent = async () => {
    if (!eventToDelete) return;
    setFormIsLoading(true);
    try {
      const { error: deleteError } = await supabase.from('calendar_events').delete().eq('event_id', eventToDelete.event_id);
      if (deleteError) throw deleteError;
      toast({ title: "Event Deleted", description: `Event "${eventToDelete.title}" successfully deleted.` });
      fetchEvents();
    } catch (err) {
      toast({ variant: "destructive", title: "Error Deleting Event", description: err.message });
    } finally {
      setEventToDelete(null);
      setFormIsLoading(false);
    }
  };

  const formatDateRange = (startStr, endStr) => {
    if (!startStr || !endStr) return 'N/A';
    try {
      const start = parseISO(startStr);
      const end = parseISO(endStr);
      const startDateFormatted = format(start, 'MMM dd, yyyy');
      const startTimeFormatted = format(start, 'p');
      const endDateFormatted = format(end, 'MMM dd, yyyy');
      const endTimeFormatted = format(end, 'p');

      if (startDateFormatted === endDateFormatted) {
        return `${startDateFormatted}, ${startTimeFormatted} - ${endTimeFormatted}`;
      }
      return `${startDateFormatted}, ${startTimeFormatted} - ${endDateFormatted}, ${endTimeFormatted}`;
    } catch (e) {
      return 'Invalid Date Range';
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
      },
    }),
  };
  
  const uniqueCategories = useMemo(() => ['all', ...new Set(events.map(e => e.category).filter(Boolean))], [events]);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-1">
        <h2 className="text-xl font-semibold text-foreground">Calendar Events</h2>
        <Dialog open={showEventDialog} onOpenChange={(isOpen) => {
          if (!isOpen) setEditingEvent(null);
          setShowEventDialog(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--theme-accent-fuchsia)] hover:bg-[var(--theme-accent-fuchsia)]/90 text-primary-foreground w-full sm:w-auto" onClick={handleOpenNewDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingEvent ? "Update the details for this event." : "Fill in the details for the new event."}
              </DialogDescription>
            </DialogHeader>
            <ScheduleInputForm
              initialData={editingEvent}
              onSubmit={handleEventSubmit}
              onCancel={() => { setShowEventDialog(false); setEditingEvent(null); }}
              isLoading={formIsLoading}
              eventIdToEdit={editingEvent?.event_id}
              personnelList={personnel}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-1">
        <Input 
          placeholder="Search events..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-input border-border placeholder:text-muted-foreground focus:ring-[var(--theme-accent-fuchsia)] focus:border-[var(--theme-accent-fuchsia)]"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-input border-border text-foreground focus:ring-[var(--theme-accent-fuchsia)] focus:border-[var(--theme-accent-fuchsia)]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            {uniqueCategories.map(cat => <SelectItem key={cat} value={cat} className="capitalize hover:bg-accent">{cat}</SelectItem>)}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal bg-input border-border hover:bg-accent text-foreground",
                !dateFilter && "text-muted-foreground"
              )}
            >
              <Filter className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border-border text-popover-foreground" align="start">
            <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      {loading && <div className="flex-grow flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent-fuchsia)]" /></div>}
      {!loading && error && <div className="flex-grow text-destructive p-4 bg-destructive/20 border border-destructive/50 rounded-md flex items-center justify-center"><AlertTriangle className="mr-2 h-5 w-5"/>{error}</div>}
      {!loading && !error && events.length === 0 && (
        <p className="flex-grow text-muted-foreground text-center py-8">No events scheduled matching your criteria. Click "Add New Event" to create one.</p>
      )}
      
      {!loading && !error && events.length > 0 && (
        <ScrollArea className="flex-grow">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1 pb-4">
            {events.map((event, index) => (
              <motion.div key={event.event_id} custom={index} variants={itemVariants} initial="hidden" animate="visible">
                <div className="bg-card-alt border border-border rounded-lg p-4 shadow-lg hover:shadow-[var(--theme-accent-fuchsia)]/20 transition-shadow duration-300 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: event.color || '#808080' }}></span>
                      <h3 className="text-lg font-semibold truncate text-foreground" title={event.title}>{event.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center"><CalendarDays className="h-3 w-3 mr-1.5 text-[var(--theme-accent-fuchsia)]"/> {formatDateRange(event.start_time, event.end_time)}</p>
                    {event.category && <p className="text-xs text-muted-foreground mb-1 flex items-center"><Tag className="h-3 w-3 mr-1.5 text-[var(--theme-accent-fuchsia)]"/> {event.category}</p>}
                    {event.location && <p className="text-xs text-muted-foreground mb-1 flex items-center"><MapPin className="h-3 w-3 mr-1.5 text-[var(--theme-accent-fuchsia)]"/> {event.location}</p>}
                    {event.description && <p className="text-sm text-secondary mt-2 line-clamp-3">{event.description}</p>}
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" className="text-[var(--theme-accent-amber)] hover:text-[var(--theme-accent-amber)]/80 hover:bg-accent p-1 h-7 w-7" onClick={() => handleOpenEditDialog(event)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 hover:bg-destructive/20 p-1 h-7 w-7">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border text-foreground">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-destructive">Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete the event "{event.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-muted-foreground border-border hover:bg-accent hover:text-foreground">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => { setEventToDelete(event); executeDeleteEvent(); }}
                            disabled={formIsLoading}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                              {formIsLoading && eventToDelete?.event_id === event.event_id ? <Loader2 className="h-4 w-4 animate-spin"/> : "Delete Event"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      )}
    </div>
  );
};

export default GeneralScheduleView;