import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Eye, ArrowUpDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const columnDefinitions = [
  { key: 'projectname', label: 'Name', isNumeric: false },
  { key: 'status', label: 'Status', isNumeric: false },
  { key: 'priority', label: 'Priority', isNumeric: false },
  { key: 'startdate', label: 'Start Date', isNumeric: false },
  { key: 'enddate', label: 'End Date', isNumeric: false },
  { key: 'budget', label: 'Budget', isNumeric: true },
  { key: 'project_manager_name', label: 'Manager', isNumeric: false },
];

const ProjectTable = ({ projects, filters, sortConfig, setSortConfig, visibleColumns, onSelectProject, loading }) => {

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedProjects = useMemo(() => {
    let sortableItems = [...projects];
    if (filters.searchTerm) {
      sortableItems = sortableItems.filter(project =>
        project.projectname.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }
    if (filters.status !== 'all') {
      sortableItems = sortableItems.filter(project => project.status === filters.status);
    }
    if (filters.priority !== 'all') {
      sortableItems = sortableItems.filter(project => project.priority === filters.priority);
    }
    if (filters.startDateRange.from) {
      sortableItems = sortableItems.filter(project => project.startdate && new Date(project.startdate) >= filters.startDateRange.from);
    }
    if (filters.startDateRange.to) {
      sortableItems = sortableItems.filter(project => project.startdate && new Date(project.startdate) <= filters.startDateRange.to);
    }
    if (filters.endDateRange.from) {
      sortableItems = sortableItems.filter(project => project.enddate && new Date(project.enddate) >= filters.endDateRange.from);
    }
    if (filters.endDateRange.to) {
      sortableItems = sortableItems.filter(project => project.enddate && new Date(project.enddate) <= filters.endDateRange.to);
    }

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'project_manager_name') {
          valA = a.project_manager_personnel_uuid?.name || '';
          valB = b.project_manager_personnel_uuid?.name || '';
        }
        
        if (sortConfig.key === 'startdate' || sortConfig.key === 'enddate') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          // Keep as numbers
        } else { 
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [projects, filters, sortConfig]);

  if (filteredAndSortedProjects.length === 0 && !loading) {
    return <p className="text-muted-foreground text-center py-8">No projects match your filters. Try adjusting them or click "New Project" to add one.</p>;
  }

  return (
    <div className="overflow-x-auto scrollbar-thin rounded-md border border-border">
      <Table>
        <TableHeader className="bg-table-header-themed">
          <TableRow className="border-table-cell-themed">
            {columnDefinitions.filter(col => visibleColumns[col.key]).map(col => (
              <TableHead 
                key={col.key} 
                className={`text-table-header-themed cursor-pointer hover:text-accent-foreground ${col.isNumeric ? 'text-right' : 'text-left'}`}
                onClick={() => requestSort(col.key)}
              >
                {col.label}
                <ArrowUpDown className={`inline ml-1 h-3 w-3 ${sortConfig.key === col.key ? 'text-accent-foreground' : 'text-muted-foreground/70'}`} />
              </TableHead>
            ))}
            <TableHead className="text-center text-table-header-themed">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedProjects.map((project) => (
            <TableRow key={project.new_projectid} className="border-table-cell-themed hover-row-themed transition-colors">
              {visibleColumns.projectname && <TableCell className="font-medium text-foreground">{project.projectname}</TableCell>}
              {visibleColumns.status && <TableCell>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  project.status === 'Completed' ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 
                  project.status === 'In Progress' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                  project.status === 'On Hold' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  project.status === 'Planning' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                  'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                }`}>
                  {project.status || 'N/A'}
                </span>
              </TableCell>}
              {visibleColumns.priority && <TableCell>
                <span className={`font-medium ${
                  project.priority === 'Urgent' ? 'text-red-400' :
                  project.priority === 'High' ? 'text-orange-400' :
                  project.priority === 'Medium' ? 'text-yellow-400' :
                  project.priority === 'Low' ? 'text-sky-400' :
                  'text-muted-foreground'
                }`}>
                  {project.priority || 'N/A'}
                </span>
              </TableCell>}
              {visibleColumns.startdate && <TableCell className="text-muted-foreground">{project.startdate ? format(parseISO(project.startdate), 'PP') : 'N/A'}</TableCell>}
              {visibleColumns.enddate && <TableCell className="text-muted-foreground">{project.enddate ? format(parseISO(project.enddate), 'PP') : 'N/A'}</TableCell>}
              {visibleColumns.budget && <TableCell className="text-right text-muted-foreground">${project.budget ? project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</TableCell>}
              {visibleColumns.project_manager_name && <TableCell className="text-muted-foreground">{project.project_manager_personnel_uuid?.name || 'N/A'}</TableCell>}
              <TableCell className="text-center">
                 <Button variant="ghost" size="sm" className="text-accent-foreground hover:text-primary hover:bg-accent" onClick={() => onSelectProject && onSelectProject(project)}>
                    <Eye className="h-4 w-4" />
                 </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectTable;