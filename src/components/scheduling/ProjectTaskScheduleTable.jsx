import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowUpDown, Search, CalendarDays, UserCircle, Tag, Hourglass, CheckCircle, XCircle, Signal as RadioButton, Briefcase } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";

const ProjectTaskScheduleTable = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [projectsForSelect, setProjectsForSelect] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'duedate', direction: 'ascending' });
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname')
          .order('projectname', { ascending: true });
        if (projectsError) throw projectsError;
        setProjectsForSelect([{ value: 'all', label: 'All Projects' }, ...data.map(p => ({ value: p.projectid.toString(), label: p.projectname }))]);
      } catch (err) {
        console.error("Error fetching projects for filter:", err);
        toast({ variant: "destructive", title: "Filter Error", description: "Could not load projects for filtering." });
      }
    };
    fetchProjects();
  }, [toast]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('projecttasks')
          .select(`
            task_uid,
            title,
            startdate,
            duedate,
            status,
            priority,
            estimated_hours,
            actual_hours,
            projects (projectid, projectname),
            assignee:personnel (personnel_uuid, name)
          `);

        if (projectFilter !== 'all') {
          query = query.eq('projectid', projectFilter);
        }
        
        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setTasks(data || []);
      } catch (err) {
        console.error('Error fetching project tasks:', err);
        setError(err.message || 'Failed to fetch tasks.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectFilter]); // Re-fetch when projectFilter changes

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getProgress = (estimated, actual, status) => {
    if (status === 'Completed') return 100;
    if (!estimated || estimated === 0) return 0;
    return Math.min(100, Math.max(0, ((actual || 0) / estimated) * 100));
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'Done': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'In Progress': return <Hourglass className="h-5 w-5 text-sky-400 animate-spin-slow" />;
      case 'Pending': return <RadioButton className="h-5 w-5 text-slate-500" />;
      case 'To Do': return <RadioButton className="h-5 w-5 text-slate-500" />;
      case 'Blocked': return <XCircle className="h-5 w-5 text-red-400" />;
      default: return <RadioButton className="h-5 w-5 text-slate-600" />;
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const project = task.projects;
        const assignee = task.assignee;
        const searchLower = searchTerm.toLowerCase();
        return (
          (task.title?.toLowerCase().includes(searchLower) ||
           project?.projectname?.toLowerCase().includes(searchLower) ||
           assignee?.name?.toLowerCase().includes(searchLower)) &&
          (statusFilter === 'all' || task.status === statusFilter) &&
          (priorityFilter === 'all' || task.priority === priorityFilter)
        );
      })
      .sort((a, b) => {
        if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1;
        if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1;
        
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'duedate' || sortConfig.key === 'startdate') {
            valA = new Date(a[sortConfig.key]);
            valB = new Date(b[sortConfig.key]);
        } else if (sortConfig.key === 'projects.projectname') {
            valA = a.projects?.projectname?.toLowerCase();
            valB = b.projects?.projectname?.toLowerCase();
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }


        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const SortableButton = ({ columnKey, children }) => (
    <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-1 text-slate-300 hover:text-sky-300 w-full justify-start text-xs md:text-sm">
      {children}
      {sortConfig.key === columnKey && (sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 opacity-50" /> : <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 opacity-50" />)}
    </Button>
  );
  
  const uniqueStatuses = useMemo(() => ['all', ...new Set(tasks.map(task => task.status).filter(Boolean))], [tasks]);
  const uniquePriorities = useMemo(() => ['all', ...new Set(tasks.map(task => task.priority).filter(Boolean))], [tasks]);


  if (loading && tasks.length === 0) { // Show main loader only on initial load or when project filter causes full reload with no tasks yet
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-12 w-12 animate-spin text-sky-400" /></div>;
  }
  if (error) {
    return <div className="flex flex-col items-center justify-center py-10 text-red-400"><AlertCircle className="h-12 w-12 mb-2" /><p>{error}</p></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }} 
      className="space-y-4 flex flex-col"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 p-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-500" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 md:pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-xs md:text-sm"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500 text-xs md:text-sm">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            {projectsForSelect.map(proj => <SelectItem key={proj.value} value={proj.value} className="hover:bg-slate-700 text-xs md:text-sm">{proj.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500 text-xs md:text-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            {uniqueStatuses.map(status => <SelectItem key={status} value={status} className="capitalize hover:bg-slate-700 text-xs md:text-sm">{status}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500 text-xs md:text-sm">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
             {uniquePriorities.map(priority => <SelectItem key={priority} value={priority} className="capitalize hover:bg-slate-700 text-xs md:text-sm">{priority}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
       {loading && <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin text-sky-400" /></div>}
      <div className="rounded-md"> 
        <Table className="min-w-full text-xs md:text-sm">
          <TableHeader className="sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10">
            <TableRow className="border-slate-700 hover:bg-slate-700/30">
              <TableHead className="py-2 px-2 md:px-3"><SortableButton columnKey="projects.projectname">Project</SortableButton></TableHead>
              <TableHead className="py-2 px-2 md:px-3"><SortableButton columnKey="title">Task</SortableButton></TableHead>
              <TableHead className="py-2 px-2 md:px-3"><SortableButton columnKey="assignee.name">Assignee</SortableButton></TableHead>
              <TableHead className="py-2 px-2 md:px-3"><SortableButton columnKey="startdate">Start</SortableButton></TableHead>
              <TableHead className="py-2 px-2 md:px-3"><SortableButton columnKey="duedate">Due</SortableButton></TableHead>
              <TableHead className="py-2 px-2 md:px-3"><SortableButton columnKey="status">Status</SortableButton></TableHead>
              <TableHead className="py-2 px-2 md:px-3"><SortableButton columnKey="priority">Priority</SortableButton></TableHead>
              <TableHead className="text-right py-2 px-2 md:px-3"><SortableButton columnKey="estimated_hours">Est. Hrs</SortableButton></TableHead>
              <TableHead className="text-right py-2 px-2 md:px-3"><SortableButton columnKey="actual_hours">Actual Hrs</SortableButton></TableHead>
              <TableHead className="py-2 px-2 md:px-3">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.task_uid} className="border-slate-700 hover:bg-slate-700/50">
                <TableCell className="font-medium text-slate-100 py-2 px-2 md:px-3">{task.projects?.projectname || 'N/A'}</TableCell>
                <TableCell className="text-slate-200 py-2 px-2 md:px-3">{task.title}</TableCell>
                <TableCell className="text-slate-200 py-2 px-2 md:px-3">{task.assignee?.name || 'Unassigned'}</TableCell>
                <TableCell className="text-slate-200 py-2 px-2 md:px-3">{formatDate(task.startdate)}</TableCell>
                <TableCell className="text-slate-200 py-2 px-2 md:px-3">{formatDate(task.duedate)}</TableCell>
                <TableCell className="text-slate-200 py-2 px-2 md:px-3 flex items-center space-x-1 md:space-x-2">
                  {getStatusIcon(task.status)}
                  <span>{task.status || 'N/A'}</span>
                </TableCell>
                <TableCell className="text-slate-200 py-2 px-2 md:px-3">{task.priority || 'N/A'}</TableCell>
                <TableCell className="text-right text-slate-200 py-2 px-2 md:px-3">{task.estimated_hours || '0'}</TableCell>
                <TableCell className="text-right text-slate-200 py-2 px-2 md:px-3">{task.actual_hours || '0'}</TableCell>
                <TableCell className="py-2 px-2 md:px-3 min-w-[100px] md:min-w-[120px]">
                  <Progress 
                    value={getProgress(task.estimated_hours, task.actual_hours, task.status)} 
                    className="h-2 bg-slate-600"
                    indicatorClassName={
                        task.status === 'Completed' || task.status === 'Done' ? 'bg-green-500' : 
                        getProgress(task.estimated_hours, task.actual_hours, task.status) > 75 ? 'bg-sky-500' :
                        getProgress(task.estimated_hours, task.actual_hours, task.status) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
            {!loading && filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-slate-400 py-10">
                  No tasks found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default ProjectTaskScheduleTable;