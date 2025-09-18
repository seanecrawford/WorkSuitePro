import React from 'react';
    import { Card, CardContent, CardHeader } from '@/components/ui/card';
    
    const SkeletonCard = () => (
      <Card className="bg-slate-800/50 border-slate-700/60 backdrop-blur-sm shadow-lg text-slate-100 overflow-hidden">
        <CardHeader className="bg-slate-900/30">
          <div className="h-7 bg-slate-700 rounded w-3/4 animate-pulse"></div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-slate-700 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-slate-700 rounded w-1/3 animate-pulse"></div>
            <div className="h-20 bg-slate-700 rounded w-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
    
    export default SkeletonCard;