import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar'; // shadcn calendar

const CalendarCard = ({ config }) => {
  const [date, setDate] = useState(new Date());

  return (
    <Card className="h-full flex flex-col card-dark-themed shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold text-foreground">
            {config?.title || 'Team Calendar'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md bg-card text-card-foreground" 
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-foreground",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-foreground",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarCard;