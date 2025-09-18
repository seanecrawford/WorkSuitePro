import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const GenericProjectTab = ({ title, description }) => (
  <Card className="bg-slate-800/50 border-slate-700 text-slate-100">
    <CardHeader>
      <CardTitle className="text-sky-400">{title}</CardTitle>
      <CardDescription className="text-slate-400">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-700 rounded-md p-6 text-center">
        <Construction className="h-12 w-12 text-yellow-400 mb-4" />
        <p className="text-slate-300 text-lg">Content Under Development</p>
        <p className="text-slate-400 text-sm mt-1">This section is currently being built. Please check back later!</p>
      </div>
    </CardContent>
  </Card>
);

export default GenericProjectTab;