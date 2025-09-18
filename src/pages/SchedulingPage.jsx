import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, BarChartHorizontalBig, ListChecks, Users, Flag, CalendarPlus, Zap, Clock, BellDot, Filter, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectKPIs from '@/components/scheduling/ProjectKPIs';
import ProjectTaskScheduleTable from '@/components/scheduling/ProjectTaskScheduleTable';
import ResourceOverviewTable from '@/components/scheduling/ResourceOverviewTable';
import MilestonesList from '@/components/scheduling/MilestonesList';
import GeneralScheduleView from '@/components/scheduling/GeneralScheduleView';
import CalendarViewTab from '@/components/scheduling/CalendarViewTab'; // Import the new CalendarViewTab
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const FeaturePlaceholderCard = ({ title, description, icon: Icon, category, phase, className = "" }) => (
  <Card className={`bg-card-alt-themed shadow-lg hover:shadow-[var(--theme-accent-scheduling)]/20 transition-shadow duration-300 flex flex-col ${className}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-[var(--theme-accent-scheduling)]" />
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </div>
      {category && <p className="text-xs text-[var(--theme-accent-scheduling)] mt-1">{category}</p>}
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between">
      <CardDescription className="text-muted-foreground mb-3 text-sm">{description}</CardDescription>
      {phase && (
        <div className="text-xs text-[var(--theme-accent-scheduling)]/80 font-medium bg-[var(--theme-accent-scheduling)]/20 px-2 py-1 rounded-full inline-block self-start mt-auto">
          Coming in {phase}
        </div>
      )}
    </CardContent>
  </Card>
);


const SchedulingPage = () => {
  const [activeTab, setActiveTab] = useState("kpis");
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    out: { opacity: 0 }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    in: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const tableContainerClasses = "flex-grow p-0 md:p-2 lg:p-4 flex flex-col max-h-[calc(100vh-22rem)] sm:max-h-[calc(100vh-20rem)] md:max-h-[calc(100vh-18rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50";

  const aiWorkflowFeatures = [
    { title: "Intelligent Task Prioritization", description: "AI ranks tasks based on urgency, deadlines, and dependencies to optimize workflows.", icon: Zap, category: "AI Workflow", phase: "Future Enhancement" },
    { title: "Automated Scheduling Suggestions", description: "AI suggests optimal meeting times and schedules based on team availability and workload.", icon: Clock, category: "AI Workflow", phase: "Future Enhancement" },
    { title: "Smart Notifications & Reminders", description: "AI predicts when users need reminders for tasks or events based on past interactions and upcoming deadlines.", icon: BellDot, category: "AI Workflow", phase: "Future Enhancement" },
  ];

  const tabConfig = [
    { value: "kpis", label: "KPIs", icon: BarChartHorizontalBig, color: "sky" },
    { value: "task-schedule", label: "Task Schedule", icon: ListChecks, color: "emerald" },
    { value: "resource-overview", label: "Resource Overview", icon: Users, color: "purple" },
    { value: "milestones", label: "Milestones", icon: Flag, color: "amber" },
    { value: "general-schedule", label: "General Schedule", icon: CalendarPlus, color: "fuchsia" },
    { value: "calendar-view", label: "Calendar View", icon: CalendarDays, color: "rose" }, // New Calendar View Tab
    { value: "ai-workflow", label: "AI Workflow Tools", icon: Zap, color: "blue" },
  ];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="h-full flex flex-col p-4 md:p-6 space-y-6 bg-background text-foreground"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center space-x-3">
          <CalendarCheck className="h-8 w-8 md:h-10 md:w-10 text-[var(--theme-accent-scheduling)]" />
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
              Scheduling &amp; Resource Management
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Organize schedules, manage resources, and leverage AI for smarter workflow automation.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex-grow flex flex-col">
        <Tabs defaultValue="kpis" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <TabsList className="tabs-scheduling bg-card border border-border rounded-lg p-1 flex flex-wrap">
              {tabConfig.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`text-muted-foreground hover:bg-accent/10 hover:text-accent-foreground px-3 py-1.5 md:px-4 rounded-md transition-colors duration-150 text-xs md:text-sm flex items-center`}
                >
                  <tab.icon className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />{tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value="kpis" className="flex-grow outline-none ring-0 focus:ring-0 focus-visible:ring-0"><ProjectKPIs /></TabsContent>
          <TabsContent value="task-schedule" className="flex-grow outline-none ring-0 focus:ring-0 focus-visible:ring-0 h-full flex flex-col">
            <Card className="bg-card border-border text-foreground shadow-xl h-full flex flex-col flex-grow">
              <CardHeader><div className="flex items-center mb-1"><ListChecks className={`h-6 w-6 mr-2 text-[var(--theme-accent-emerald)]`} /><CardTitle className="text-lg font-semibold">Project Task Schedule</CardTitle></div><CardDescription className="text-muted-foreground text-sm">Detailed overview of all project tasks, their status, and deadlines.</CardDescription></CardHeader>
              <CardContent className={tableContainerClasses}><ProjectTaskScheduleTable /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="resource-overview" className="flex-grow outline-none ring-0 focus:ring-0 focus-visible:ring-0 h-full flex flex-col">
            <Card className="bg-card border-border text-foreground shadow-xl h-full flex flex-col flex-grow">
              <CardHeader><div className="flex items-center mb-1"><Users className={`h-6 w-6 mr-2 text-[var(--theme-accent-purple)]`} /><CardTitle className="text-lg font-semibold">Resource Overview</CardTitle></div><CardDescription className="text-muted-foreground text-sm">Team workload and task assignments.</CardDescription></CardHeader>
              <CardContent className={tableContainerClasses}><ResourceOverviewTable /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="milestones" className="flex-grow outline-none ring-0 focus:ring-0 focus-visible:ring-0 h-full flex flex-col">
            <Card className="bg-card border-border text-foreground shadow-xl h-full flex flex-col flex-grow">
              <CardHeader><div className="flex items-center mb-1"><Flag className={`h-6 w-6 mr-2 text-[var(--theme-accent-amber)]`} /><CardTitle className="text-lg font-semibold">Project Milestones</CardTitle></div><CardDescription className="text-muted-foreground text-sm">Key project milestones, their status, and due dates.</CardDescription></CardHeader>
              <CardContent className={tableContainerClasses}><MilestonesList /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="general-schedule" className="flex-grow outline-none ring-0 focus:ring-0 focus-visible:ring-0 h-full flex flex-col">
            <Card className="bg-card border-border text-foreground shadow-xl h-full flex flex-col flex-grow">
              <CardHeader><div className="flex items-center mb-1"><CalendarPlus className={`h-6 w-6 mr-2 text-[var(--theme-accent-fuchsia)]`} /><CardTitle className="text-lg font-semibold">General Schedule & Calendar Events</CardTitle></div><CardDescription className="text-muted-foreground text-sm">Manage general calendar events, meetings, and reminders.</CardDescription></CardHeader>
              <CardContent className={`${tableContainerClasses} p-2 md:p-4`}><GeneralScheduleView /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calendar-view" className="flex-grow outline-none ring-0 focus:ring-0 focus-visible:ring-0 h-full flex flex-col">
            <Card className="bg-card border-border text-foreground shadow-xl h-full flex flex-col flex-grow">
              <CardHeader><div className="flex items-center mb-1"><CalendarDays className={`h-6 w-6 mr-2 text-[var(--theme-accent-rose)]`} /><CardTitle className="text-lg font-semibold">Interactive Calendar View</CardTitle></div><CardDescription className="text-muted-foreground text-sm">Visualize and manage all events in a full calendar interface.</CardDescription></CardHeader>
              <CardContent className={`${tableContainerClasses} p-2 md:p-4`}><CalendarViewTab /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ai-workflow" className="flex-grow outline-none ring-0 focus:ring-0 focus-visible:ring-0 h-full flex flex-col">
            <Card className="bg-card border-border text-foreground shadow-xl h-full flex flex-col flex-grow">
              <CardHeader>
                <div className="flex items-center mb-1">
                  <Zap className={`h-6 w-6 mr-2 text-[var(--theme-accent-blue)]`} />
                  <CardTitle className="text-lg font-semibold">AI-Driven Workflow Enhancements</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground text-sm">
                  Leverage artificial intelligence to optimize your scheduling and task management.
                </CardDescription>
              </CardHeader>
              <CardContent className={`${tableContainerClasses} p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiWorkflowFeatures.map(feature => (
                    <FeaturePlaceholderCard
                      key={feature.title}
                      title={feature.title}
                      description={feature.description}
                      icon={feature.icon}
                      category={feature.category}
                      phase={feature.phase}
                      className="bg-card-alt-themed" 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

    </motion.div>
  );
};

export default SchedulingPage;