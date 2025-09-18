import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, ArrowUpDown, Search, Flag, CheckCircle, Clock, XCircle, Briefcase } from 'lucide-react';
import { format, parseISO, isPast, isFuture, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";

const MilestonesList = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    const fetchMilestones = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('milestones')
          .select(`
            milestone_uid,
            title,
            description,
            duedate,
            completed_date,
            status,
            projects (projectid, projectname)
          `);

        if (projectFilter !== 'all') {
          query = query.eq('projectid', projectFilter);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setMilestones(data || []);
      } catch (err) {
        console.error('Error fetching milestones:', err);
        setError(err.message || 'Failed to fetch milestones.');
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, [projectFilter]); // Re-fetch when projectFilter changes

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getStatusWithTiming = (status, dueDateStr, completedDateStr) => {
    const dueDate = dueDateStr ? parseISO(dueDateStr) : null;
    const completedDate = completedDateStr ? parseISO(completedDateStr) : null;

    if (status === 'Completed') {
      if (completedDate && dueDate && completedDate > dueDate) {
        return { text: 'Completed Late', Icon: CheckCircle, color: 'text-yellow-400', iconColor: 'text-yellow-500' };
      }
      return { text: 'Completed', Icon: CheckCircle, color: 'text-green-400', iconColor: 'text-green-500' };
    }
    if (status === 'Missed' || (dueDate && isPast(dueDate) && status !== 'Completed')) {
      return { text: 'Overdue', Icon: XCircle, color: 'text-red-400', iconColor: 'text-red-500' };
    }
    if (status === 'In Progress' || (dueDate && isFuture(dueDate))) {
       const daysLeft = dueDate ? differenceInDays(dueDate, new Date()) : null;
       let timing = '';
       if (daysLeft !== null) {
           if (daysLeft <= 7 && daysLeft >=0) timing = `(Due in ${daysLeft}d)`;
           else if (daysLeft < 0) timing = `(Overdue by ${Math.abs(daysLeft)}d)`;
       }
      return { text: `Upcoming ${timing}`, Icon: Clock, color: 'text-sky-400', iconColor: 'text-sky-500' };
    }
    return { text: status || 'Pending', Icon: Clock, color: 'text-slate-400', iconColor: 'text-slate-500' };
  };
  
  const uniqueStatusesFromData = useMemo(() => ['all', ...new Set(milestones.map(m => m.status).filter(Boolean))], [milestones]);

  const filteredMilestones = useMemo(() => {
    return milestones
      .filter(milestone => {
        const project = milestone.projects;
        const searchLower = searchTerm.toLowerCase();
        const currentStatus = getStatusWithTiming(milestone.status, milestone.duedate, milestone.completed_date).text.toLowerCase();
        
        return (
          (milestone.title?.toLowerCase().includes(searchLower) ||
           project?.projectname?.toLowerCase().includes(searchLower) ||
           milestone.description?.toLowerCase().includes(searchLower)) &&
          (statusFilter === 'all' || milestone.status === statusFilter || (statusFilter === 'Overdue' && currentStatus.includes('overdue')) || (statusFilter === 'Upcoming' && currentStatus.includes('upcoming')))
        );
      })
      .sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'duedate' || sortConfig.key === 'completed_date') {
            valA = a[sortConfig.key] ? new Date(a[sortConfig.key]) : null;
            valB = b[sortConfig.key] ? new Date(b[sortConfig.key]) : null;
        } else if (sortConfig.key === 'projects.projectname'){
            valA = a.projects?.projectname?.toLowerCase();
            valB = b.projects?.projectname?.toLowerCase();
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
  }, [milestones, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const SortableButton = ({ columnKey, children }) => (
    <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-1 text-slate-300 hover:text-amber-300 w-full justify-start">
      {children}
      {sortConfig.key === columnKey && <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />}
    </Button>
  );
  
  const statusOptionsForFilter = ['all', 'Completed', 'In Progress', 'Pending', 'Missed', 'Upcoming', 'Overdue'];


  if (loading && milestones.length === 0) { // Show main loader only on initial load or when project filter causes full reload
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-12 w-12 animate-spin text-amber-400" /></div>;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <Input
            placeholder="Search milestones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white focus:ring-amber-500 focus:border-amber-500">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            {projectsForSelect.map(proj => (
              <SelectItem key={proj.value} value={proj.value} className="hover:bg-slate-700">{proj.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white focus:ring-amber-500 focus:border-amber-500">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            {statusOptionsForFilter.map(status => (
              <SelectItem key={status} value={status} className="capitalize hover:bg-slate-700">{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {loading && <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin text-amber-400" /></div>}
      <div className="rounded-md">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10">
            <TableRow className="border-slate-700 hover:bg-slate-700/30">
              <TableHead><SortableButton columnKey="title">Milestone</SortableButton></TableHead>
              <TableHead><SortableButton columnKey="projects.projectname">Project</SortableButton></TableHead>
              <TableHead><SortableButton columnKey="duedate">Due Date</SortableButton></TableHead>
              <TableHead><SortableButton columnKey="status">Status</SortableButton></TableHead>
              <TableHead><SortableButton columnKey="completed_date">Completed</SortableButton></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMilestones.map((milestone) => {
              const statusInfo = getStatusWithTiming(milestone.status, milestone.duedate, milestone.completed_date);
              return (
                <TableRow key={milestone.milestone_uid} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell className="font-medium text-slate-100 py-3">
                    <div className="flex items-center">
                      <Flag className={`h-4 w-4 mr-2 flex-shrink-0 ${statusInfo.iconColor || 'text-slate-500'}`} />
                      <div>
                        {milestone.title}
                        {milestone.description && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{milestone.description}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-200 py-3">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0"/>
                      {milestone.projects?.projectname || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-200 py-3">{formatDate(milestone.duedate)}</TableCell>
                  <TableCell className={`py-3 font-medium ${statusInfo.color || 'text-slate-200'}`}>
                    <div className="flex items-center">
                      <statusInfo.Icon className={`h-4 w-4 mr-2 flex-shrink-0 ${statusInfo.iconColor || 'text-slate-500'}`} />
                      {statusInfo.text}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-200 py-3">{formatDate(milestone.completed_date)}</TableCell>
                </TableRow>
              );
            })}
            {!loading && filteredMilestones.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400 py-10">
                  No milestones found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default MilestonesList;