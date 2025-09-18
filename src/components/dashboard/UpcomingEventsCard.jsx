import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ListChecks, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';

const events = [
  { id: 1, title: "Project Alpha Deadline", time: "Tomorrow, 5:00 PM", type: "Deadline", color: "border-l-red-500" },
  { id: 2, title: "Client Meeting - Beta Corp", time: "Oct 28, 10:00 AM", type: "Meeting", color: "border-l-sky-500" },
  { id: 3, title: "Team Sync - Sprint Review", time: "Oct 29, 2:00 PM", type: "Meeting", color: "border-l-sky-500" },
  { id: 4, title: "Submit Q3 Financial Report", time: "Oct 30, EOD", type: "Task", color: "border-l-amber-500" },
];

const UpcomingEventsCard = ({ config }) => {
  return (
    <Card className="h-full flex flex-col card-dark-themed shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold text-foreground">
            {config?.title || 'Upcoming Items'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-2.5 rounded-md bg-card-alt border-l-4 ${event.color} shadow-sm hover:bg-accent/50 transition-colors`}
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-medium text-foreground truncate pr-2">{event.title}</p>
              <span className={`text-2xs px-1.5 py-0.5 rounded-full font-semibold ${
                event.type === 'Deadline' ? 'bg-red-500/20 text-red-300' :
                event.type === 'Meeting' ? 'bg-sky-500/20 text-sky-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {event.type}
              </span>
            </div>
            <p className="text-2xs text-muted-foreground mt-0.5">{event.time}</p>
          </motion.div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">No upcoming items.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsCard;