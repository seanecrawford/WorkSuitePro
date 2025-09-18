import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, PlusCircle, Edit2, Trash2, CalendarDays, MapPin, Tag, Users as UsersIcon, Clock } from 'lucide-react';
import ScheduleInputForm from './ScheduleInputForm';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const CalendarViewTab = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [monthEvents, setMonthEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [personnel, setPersonnel] = useState([]);

  const { toast } = useToast();
  const { user } = useAuth();

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

  const fetchEventsForMonth = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const firstDay = startOfMonth(date);
      const lastDay = endOfMonth(date);

      const { data, error: dbError } = await supabase
        .from('calendar_events')
        .select('*, assigned_personnel_ids:calendar_event_attendees(personnel_id)')
        .gte('start_time', firstDay.toISOString())
        .lte('end_time', lastDay.toISOString())
        .order('start_time', { ascending: true });

      if (dbError) throw dbError;
      
      const eventsByDay = {};
      (data || []).forEach(event => {
        const eventStart = parseISO(event.start_time);
        const eventEnd = parseISO(event.end_time);
        const daysInEvent = eachDayOfInterval({ start: eventStart, end: eventEnd });
        
        daysInEvent.forEach(dayInEvent => {
          const dayKey = format(dayInEvent, 'yyyy-MM-dd');
          if (!eventsByDay[dayKey]) {
            eventsByDay[dayKey] = [];
          }
          eventsByDay[dayKey].push({
            ...event,
            assigned_personnel_ids: event.assigned_personnel_ids?.map(apa => apa.personnel_id) || []
          });
        });
      });
      setMonthEvents(eventsByDay);
      setEvents(data || []); 
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to fetch events.");
      toast({ variant: "destructive", title: "Error Loading Events", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEventsForMonth(currentMonth);
    fetchPersonnel();
  }, [currentMonth, fetchEventsForMonth, fetchPersonnel]);

  const handleEventSubmit = async (formData) => {
    setFormIsLoading(true);
    try {
      const { assigned_personnel_ids, ...eventData } = formData;
      let result;

      if (editingEvent) {
        result = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('event_id', editingEvent.event_id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('calendar_events')
          .insert([eventData])
          .select()
          .single();
      }

      const { data: savedEvent, error: opError } = result;
      if (opError) throw opError;

      // Handle attendees
      if (savedEvent) {
        // Delete existing attendees for this event if editing
        if (editingEvent) {
          await supabase.from('calendar_event_attendees').delete().eq('event_id', savedEvent.event_id);
        }
        // Insert new attendees
        if (assigned_personnel_ids && assigned_personnel_ids.length > 0) {
          const attendeesToInsert = assigned_personnel_ids.map(personnel_id => ({
            event_id: savedEvent.event_id,
            personnel_id: personnel_id,
            user_id: user?.id 
          }));
          await supabase.from('calendar_event_attendees').insert(attendeesToInsert);
        }
      }

      toast({ title: editingEvent ? "Event Updated" : "Event Created", description: `Event "${savedEvent.title}" has been successfully ${editingEvent ? 'updated' : 'created'}.` });
      setShowEventDialog(false);
      setEditingEvent(null);
      fetchEventsForMonth(currentMonth);
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

  const handleOpenNewDialog = (date) => {
    setEditingEvent(null);
    setSelectedDate(date || new Date()); // Pre-fill date if provided
    setShowEventDialog(true);
  };

  const executeDeleteEvent = async () => {
    if (!eventToDelete) return;
    setFormIsLoading(true);
    try {
      await supabase.from('calendar_event_attendees').delete().eq('event_id', eventToDelete.event_id);
      const { error: deleteError } = await supabase.from('calendar_events').delete().eq('event_id', eventToDelete.event_id);
      if (deleteError) throw deleteError;
      toast({ title: "Event Deleted", description: `Event "${eventToDelete.title}" successfully deleted.` });
      fetchEventsForMonth(currentMonth);
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

  const DayWithEvents = ({ date, displayMonth }) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dailyEvents = monthEvents[dayKey] || [];
    const isCurrentDisplayMonth = date.getMonth() === displayMonth.getMonth();

    return (
      <div className={`h-full p-1.5 flex flex-col relative border border-transparent hover:border-primary/30 transition-colors duration-150 ${!isCurrentDisplayMonth ? 'bg-card/50' : 'bg-card'}`}>
        <time dateTime={dayKey} className={`text-xs ${isSameDay(date, new Date()) ? 'text-primary font-bold' : isCurrentDisplayMonth ? 'text-foreground' : 'text-muted-foreground/70'}`}>
          {format(date, 'd')}
        </time>
        <div className="mt-1 space-y-1 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 max-h-[70px]">
          {dailyEvents.slice(0, 2).map(event => (
            <button
              key={event.event_id}
              onClick={() => handleOpenEditDialog(event)}
              className="block w-full text-left text-[10px] p-1 rounded truncate hover:bg-primary/20 transition-colors"
              style={{ backgroundColor: `${event.color}33`, borderLeft: `3px solid ${event.color}`}}
              title={event.title}
            >
              <span className="font-medium text-foreground/90">{event.title}</span>
            </button>
          ))}
          {dailyEvents.length > 2 && (
            <p className="text-[9px] text-muted-foreground text-center mt-0.5">+{dailyEvents.length - 2} more</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => handleOpenNewDialog(date)}>
          <PlusCircle className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const selectedDayEvents = useMemo(() => {
    const dayKey = format(selectedDate, 'yyyy-MM-dd');
    return monthEvents[dayKey] || [];
  }, [selectedDate, monthEvents]);

  return (
    <motion.div 
      className="h-full flex flex-col md:flex-row gap-4 p-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="flex-grow md:w-2/3 bg-card-alt border-border shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between p-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="space-x-1">
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>Next</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-2">
          {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {error && <div className="text-destructive p-4"><AlertTriangle className="mr-2 h-5 w-5 inline"/>{error}</div>}
          {!loading && !error && (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full"
              components={{ Day: DayWithEvents }}
              classNames={{
                months: "p-0",
                month: "border-collapse w-full",
                caption_label: "text-lg font-medium text-foreground",
                head_row: "flex mt-2 mb-1",
                head_cell: "text-muted-foreground rounded-md w-[14.28%] text-xs font-normal text-center",
                row: "flex w-full mt-0",
                cell: "w-[14.28%] h-24 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-full w-full p-0 font-normal",
                day_selected: "bg-primary/20 text-primary-foreground",
                day_today: "ring-2 ring-primary ring-offset-1 ring-offset-background",
                day_outside: "text-muted-foreground/50",
              }}
            />
          )}
        </CardContent>
      </Card>

      <Card className="md:w-1/3 bg-card-alt border-border shadow-lg flex flex-col max-h-[calc(100vh-12rem)]">
        <CardHeader className="p-3">
          <CardTitle className="text-base font-semibold text-foreground">Events for {format(selectedDate, 'MMMM dd, yyyy')}</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow">
          <CardContent className="p-3 space-y-3">
            {selectedDayEvents.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No events for this day.</p>}
            {selectedDayEvents.map(event => (
              <motion.div 
                key={event.event_id} 
                className="p-3 rounded-lg shadow" 
                style={{ backgroundColor: `${event.color}20`, borderLeft: `4px solid ${event.color}`}}
                initial={{ opacity: 0, y:10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-semibold text-sm text-foreground mb-1">{event.title}</h4>
                <p className="text-xs text-muted-foreground flex items-center mb-0.5"><Clock className="h-3 w-3 mr-1.5 text-primary/80"/> {format(parseISO(event.start_time), 'p')} - {format(parseISO(event.end_time), 'p')}</p>
                {event.location && <p className="text-xs text-muted-foreground flex items-center mb-0.5"><MapPin className="h-3 w-3 mr-1.5 text-primary/80"/> {event.location}</p>}
                {event.category && <p className="text-xs text-muted-foreground flex items-center mb-0.5"><Tag className="h-3 w-3 mr-1.5 text-primary/80"/> {event.category}</p>}
                {event.description && <p className="text-xs text-secondary mt-1 line-clamp-2">{event.description}</p>}
                {(event.assigned_personnel_ids && event.assigned_personnel_ids.length > 0) && (
                  <div className="mt-1.5">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center"><UsersIcon className="h-3 w-3 mr-1.5 text-primary/80"/> Attendees:</p>
                    <div className="flex flex-wrap gap-1">
                      {event.assigned_personnel_ids.map(pid => {
                        const p = personnel.find(p => p.personnel_uuid === pid);
                        return p ? <span key={pid} className="text-[10px] bg-primary/10 text-primary-foreground/80 px-1.5 py-0.5 rounded-full">{p.name}</span> : null;
                      })}
                    </div>
                  </div>
                )}
                <div className="mt-2 flex justify-end space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-primary/80 hover:text-primary" onClick={() => handleOpenEditDialog(event)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/80 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border text-foreground">
                      <AlertDialogHeader><AlertDialogTitle className="text-destructive">Confirm Deletion</AlertDialogTitle><AlertDialogDescription className="text-muted-foreground">Delete "{event.title}"?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-muted-foreground border-border hover:bg-accent hover:text-foreground">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { setEventToDelete(event); executeDeleteEvent(); }} disabled={formIsLoading} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                          {formIsLoading && eventToDelete?.event_id === event.event_id ? <Loader2 className="h-4 w-4 animate-spin"/> : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </ScrollArea>
        <div className="p-3 border-t border-border">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleOpenNewDialog(selectedDate)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Event to {format(selectedDate, 'MMM dd')}
          </Button>
        </div>
      </Card>

      <Dialog open={showEventDialog} onOpenChange={(isOpen) => {
        if (!isOpen) setEditingEvent(null);
        setShowEventDialog(isOpen);
      }}>
        <DialogContent className="sm:max-w-lg bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingEvent ? "Update details for this event." : `Fill in details for the new event on ${format(selectedDate, 'PPP')}.`}
            </DialogDescription>
          </DialogHeader>
          <ScheduleInputForm
            initialData={editingEvent || (selectedDate ? { start_time_date: selectedDate, end_time_date: selectedDate } : null)}
            onSubmit={handleEventSubmit}
            onCancel={() => { setShowEventDialog(false); setEditingEvent(null); }}
            isLoading={formIsLoading}
            eventIdToEdit={editingEvent?.event_id}
            personnelList={personnel}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CalendarViewTab;