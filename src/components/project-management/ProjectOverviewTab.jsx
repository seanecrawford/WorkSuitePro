import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Filter, ArrowUpDown, Info, Loader2, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectOverviewTab = ({ onSelectProject, selectedProject, onEditProject, onDeleteProject, forceRefetchKey }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'projectname', direction: 'ascending' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { toast } = useToast();

  const projectStatuses = ['All', 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
  const projectPriorities = ['All', 'Low', 'Medium', 'High', 'Critical'];

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('projects')
        .select(`
          new_projectid, 
          projectname, 
          description, 
          startdate, 
          enddate, 
          budget, 
          actual_cost,
          status, 
          priority,
          project_manager_personnel_uuid,
          personnel (
            name,
            personnel_uuid
          )
        `)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      
      const formattedData = data.map(p => ({
        ...p,
        id: p.new_projectid, 
        projectid: p.new_projectid, 
        manager: p.personnel?.name || 'N/A',
        project_manager_personnel_uuid_details: p.personnel 
      }));
      setProjects(formattedData);
      setFilteredProjects(formattedData);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects.');
      toast({ title: 'Error', description: `Failed to load projects: ${err.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, forceRefetchKey]);

  useEffect(() => {
    let tempProjects = [...projects];

    if (searchTerm) {
      tempProjects = tempProjects.filter(project =>
        project.projectname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.manager && project.manager.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'All') {
      tempProjects = tempProjects.filter(project => project.status === statusFilter);
    }
    if (priorityFilter !== 'All') {
      tempProjects = tempProjects.filter(project => project.priority === priorityFilter);
    }
    if (startDateFilter) {
      tempProjects = tempProjects.filter(project => project.startdate && new Date(project.startdate) >= new Date(startDateFilter));
    }
    if (endDateFilter) {
      tempProjects = tempProjects.filter(project => project.enddate && new Date(project.enddate) <= new Date(endDateFilter));
    }

    if (sortConfig.key) {
      tempProjects.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    setFilteredProjects(tempProjects);
  }, [searchTerm, statusFilter, priorityFilter, startDateFilter, endDateFilter, projects, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleRowClick = (project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };
  
  const handleAddNewProject = () => {
    if (onEditProject) {
      onEditProject(null); 
    }
  };

  const handleEditClicked = (project, e) => {
    e.stopPropagation();
    if (onEditProject) {
      onEditProject(project);
    }
  };
  
  const handleDeleteClicked = (project, e) => {
    e.stopPropagation();
    if (onDeleteProject) {
      onDeleteProject(project.new_projectid, project.projectname);
    }
  };


  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/70 group-hover:text-muted-foreground" />;
    }
    return sortConfig.direction === 'ascending' ? 
      <ArrowUpDown className="h-3 w-3 text-[var(--theme-accent-project)] transform rotate-180" /> : 
      <ArrowUpDown className="h-3 w-3 text-[var(--theme-accent-project)]" />;
  };

  const tableHeaderClass = "px-3 py-2.5 text-xs font-semibold tracking-wider uppercase text-table-header-themed cursor-pointer hover:bg-accent/10 group";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 md:space-y-5"
    >
      <Card className="bg-card-themed border-card-themed shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 md:px-5">
          <CardTitle className="text-lg md:text-xl font-semibold text-card-themed-primary">Projects Overview</CardTitle>
          <Button onClick={handleAddNewProject} size="sm" className="btn-primary-themed text-xs">
            <PlusCircle className="h-4 w-4 mr-1.5" /> New Project
          </Button>
        </CardHeader>
        <CardContent className="px-4 md:px-5 pb-4">
          <div className="p-3 rounded-md bg-card-alt-themed border border-border mb-4 text-xs">
            <div className="flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 text-[var(--theme-accent-project)] flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">How to Use This Page:</h4>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>View all projects in the table below. Use filters to narrow down your search.</li>
                  <li>Click anywhere on a project row to select it. This will enable other tabs (Tasks, Budget, etc.) to show details for that project.</li>
                  <li>Use the <Edit2 className="inline h-3 w-3 mx-0.5" /> icon in the 'Actions' column to edit project details, or <Trash2 className="inline h-3 w-3 mx-0.5" /> to delete a project.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 ui-input text-xs h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="ui-select-trigger text-xs h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="ui-select-content">
                {projectStatuses.map(status => (
                  <SelectItem key={status} value={status} className="ui-select-item text-xs">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="ui-select-trigger text-xs h-9">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="ui-select-content">
                {projectPriorities.map(priority => (
                  <SelectItem key={priority} value={priority} className="ui-select-item text-xs">{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <DatePicker date={startDateFilter} setDate={setStartDateFilter} placeholder="Filter by Start Date" className="text-xs h-9" />
              <DatePicker date={endDateFilter} setDate={setEndDateFilter} placeholder="Filter by End Date" className="text-xs h-9" />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent-project)]" />
          <p className="ml-2 text-muted-foreground">Loading projects...</p>
        </div>
      )}
      {error && !isLoading && (
         <div className="flex flex-col items-center justify-center py-10 bg-card-themed border border-destructive/30 rounded-lg p-4">
          <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
          <p className="text-destructive font-semibold text-lg">Failed to Load Projects</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button onClick={fetchProjects} variant="outline" className="btn-outline-themed">
            <Filter className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </div>
      )}
      {!isLoading && !error && (
        <div className="overflow-x-auto bg-card-themed rounded-lg border border-card-themed shadow-md">
          <Table>
            <TableHeader className="bg-table-header-themed">
              <TableRow>
                <TableHead className={tableHeaderClass} onClick={() => handleSort('projectname')}>
                  <div className="flex items-center gap-1">Name {renderSortIcon('projectname')}</div>
                </TableHead>
                <TableHead className={tableHeaderClass} onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
                </TableHead>
                <TableHead className={tableHeaderClass} onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1">Priority {renderSortIcon('priority')}</div>
                </TableHead>
                <TableHead className={tableHeaderClass} onClick={() => handleSort('startdate')}>
                  <div className="flex items-center gap-1">Start Date {renderSortIcon('startdate')}</div>
                </TableHead>
                <TableHead className={tableHeaderClass} onClick={() => handleSort('enddate')}>
                  <div className="flex items-center gap-1">End Date {renderSortIcon('enddate')}</div>
                </TableHead>
                <TableHead className={`${tableHeaderClass} text-right`} onClick={() => handleSort('budget')}>
                  <div className="flex items-center justify-end gap-1">Budget {renderSortIcon('budget')}</div>
                </TableHead>
                <TableHead className={tableHeaderClass} onClick={() => handleSort('manager')}>
                  <div className="flex items-center gap-1">Manager {renderSortIcon('manager')}</div>
                </TableHead>
                <TableHead className={`${tableHeaderClass} text-center`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <motion.tr
                      key={project.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover-row-themed border-b border-table-cell-themed last:border-b-0 cursor-pointer ${selectedProject?.id === project.id ? 'bg-accent/15' : ''}`}
                      onClick={() => handleRowClick(project)}
                    >
                      <TableCell className="px-3 py-2.5 text-xs font-medium text-foreground whitespace-nowrap">{project.projectname}</TableCell>
                      <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-2xs rounded-full font-semibold ${
                          project.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                          project.status === 'In Progress' ? 'bg-sky-500/20 text-sky-300' :
                          project.status === 'On Hold' ? 'bg-amber-500/20 text-amber-300' :
                          project.status === 'Cancelled' ? 'bg-red-500/20 text-red-300' :
                          'bg-slate-500/20 text-slate-300' 
                        }`}>
                          {project.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{project.priority}</TableCell>
                      <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{project.startdate ? new Date(project.startdate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{project.enddate ? new Date(project.enddate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="px-3 py-2.5 text-xs text-muted-foreground text-right whitespace-nowrap">
                        {project.budget ? `${Number(project.budget).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'N/A'}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{project.manager}</TableCell>
                      <TableCell className="px-3 py-2.5 text-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-[var(--theme-accent-project)] hover:bg-accent/20" onClick={(e) => handleEditClicked(project, e)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/80 hover:text-destructive hover:bg-destructive/20" onClick={(e) => handleDeleteClicked(project, e)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No projects found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectOverviewTab;