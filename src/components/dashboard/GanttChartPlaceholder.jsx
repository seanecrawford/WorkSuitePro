import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlignLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const GanttChartPlaceholder = ({ config }) => {
  const tasks = [
    { name: "Project Planning", progress: 100, color: "bg-[var(--theme-accent-green)]" },
    { name: "Design Phase", progress: 75, color: "bg-[var(--theme-accent-sky)]" },
    { name: "Development Sprint 1", progress: 50, color: "bg-[var(--theme-accent-amber)]" },
    { name: "Testing & QA", progress: 20, color: "bg-[var(--theme-accent-purple)]" },
    { name: "Deployment", progress: 0, color: "bg-muted-foreground/30" },
  ];

  return (
    <Card className="h-full flex flex-col card-dark-themed shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <AlignLeft className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold text-foreground">
            {config?.title || 'Project Timeline'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center p-4 space-y-3">
        {tasks.map((task, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-muted-foreground">{task.name}</span>
              <span className={`text-xs font-semibold ${task.color.replace('bg-','text-')}`}>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className={`h-2 ${task.color.replace('bg-','bg-opacity-30')}`} indicatorClassName={task.color} />
          </div>
        ))}
        <p className="text-xs text-center text-muted-foreground mt-auto pt-2">
          This is a simplified placeholder. Full Gantt chart functionality coming soon.
        </p>
      </CardContent>
    </Card>
  );
};

export default GanttChartPlaceholder;