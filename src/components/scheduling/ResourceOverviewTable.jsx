import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowUpDown, Search, User, Briefcase, BarChart, Hourglass, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ResourceOverviewTable = () => {
  const [personnelWithTasks, setPersonnelWithTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    const fetchResourceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: personnelData, error: personnelError } = await supabase
          .from('personnel')
          .select('personnel_uuid, name, role, avatar_url');

        if (personnelError) throw personnelError;

        const { data: tasksData, error: tasksError } = await supabase
          .from('projecttasks')
          .select('assignee_personnel_uuid, status, estimated_hours, actual_hours');
        
        if (tasksError) throw tasksError;

        const aggregatedData = personnelData.map(person => {
          const assignedTasks = tasksData.filter(task => task.assignee_personnel_uuid === person.personnel_uuid);
          const activeTasks = assignedTasks.filter(task => task.status === 'In Progress' || task.status === 'Pending');
          const completedTasks = assignedTasks.filter(task => task.status === 'Completed');
          
          const totalEstimatedHours = activeTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
          const totalActualHours = activeTasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);

          let workload = 0;
          if (totalEstimatedHours > 0) {
             workload = Math.min(100, (totalActualHours / totalEstimatedHours) * 100);
          } else if (activeTasks.length > 0) {
             workload = 0; 
          } else if (assignedTasks.length > 0 && completedTasks.length === assignedTasks.length) {
            workload = 100; 
          }


          return {
            ...person,
            activeTasksCount: activeTasks.length,
            completedTasksCount: completedTasks.length,
            totalAssignedTasks: assignedTasks.length,
            totalEstimatedHours,
            totalActualHours,
            workload
          };
        });

        setPersonnelWithTasks(aggregatedData);

      } catch (err) {
        console.error('Error fetching resource overview data:', err);
        setError(err.message || 'Failed to fetch resource data.');
      } finally {
        setLoading(false);
      }
    };
    fetchResourceData();
  }, []);

  const filteredData = useMemo(() => {
    return personnelWithTasks
      .filter(person => person.name?.toLowerCase().includes(searchTerm.toLowerCase()) || person.role?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
  }, [personnelWithTasks, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const SortableButton = ({ columnKey, children }) => (
    <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-1 text-slate-300 hover:text-purple-300 w-full justify-start">
      {children}
      {sortConfig.key === columnKey && <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />}
    </Button>
  );

  if (loading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-12 w-12 animate-spin text-purple-400" /></div>;
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
      <div className="relative self-start w-full md:w-1/3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <Input
          placeholder="Search by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      <div className="rounded-md">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10">
            <TableRow className="border-slate-700 hover:bg-slate-700/30">
              <TableHead><SortableButton columnKey="name">Personnel</SortableButton></TableHead>
              <TableHead><SortableButton columnKey="role">Role</SortableButton></TableHead>
              <TableHead className="text-center"><SortableButton columnKey="activeTasksCount">Active Tasks</SortableButton></TableHead>
              <TableHead className="text-center"><SortableButton columnKey="completedTasksCount">Completed</SortableButton></TableHead>
              <TableHead className="text-right"><SortableButton columnKey="totalEstimatedHours">Est. Hrs (Active)</SortableButton></TableHead>
              <TableHead>Workload (Active Tasks)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((person) => (
              <TableRow key={person.personnel_uuid} className="border-slate-700 hover:bg-slate-700/50">
                <TableCell className="font-medium text-slate-100 py-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={person.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name || 'N A')}&backgroundColor=1e293b,0f172a,334155&textColor=94a3b8,e2e8f0`} alt={person.name} />
                      <AvatarFallback>{person.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}</AvatarFallback>
                    </Avatar>
                    <span>{person.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-200 py-3">{person.role || 'N/A'}</TableCell>
                <TableCell className="text-center text-slate-200 py-3">{person.activeTasksCount}</TableCell>
                <TableCell className="text-center text-slate-200 py-3">{person.completedTasksCount}</TableCell>
                <TableCell className="text-right text-slate-200 py-3">{person.totalEstimatedHours.toFixed(1)}</TableCell>
                <TableCell className="py-3 min-w-[150px]">
                  <Progress 
                    value={person.workload} 
                    className="h-2.5 bg-slate-600"
                    indicatorClassName={
                        person.workload >= 100 && person.activeTasksCount === 0 && person.totalAssignedTasks > 0 ? 'bg-green-500' : 
                        person.workload > 80 ? 'bg-red-500' :
                        person.workload > 50 ? 'bg-yellow-500' : 'bg-sky-500'
                    }
                  />
                   <span className="text-xs text-slate-400 mt-1 block">{person.workload.toFixed(0)}% capacity</span>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-10">
                  No personnel found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default ResourceOverviewTable;