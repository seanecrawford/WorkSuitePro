import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';

const LibraryCourseCard = ({ course, onViewDetails }) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700/60 hover:border-sky-500/50 transition-all duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg text-slate-200 line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="flex items-center text-xs text-slate-400 pt-1">
          <Calendar className="h-3 w-3 mr-1.5" />
          Created on {format(new Date(course.created_at), 'MMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        <Button onClick={() => onViewDetails(course)} className="w-full mt-4 bg-sky-600/80 hover:bg-sky-600">
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default LibraryCourseCard;