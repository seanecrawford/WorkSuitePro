import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FileText, ChevronDown } from 'lucide-react';

const PremadeReportsDropdown = ({ onSelectReport }) => {
  // These reports would typically be fetched or defined elsewhere
  const reports = [
    { id: 'financial_summary', name: 'Financial Summary', description: 'Overview of financial performance.' },
    { id: 'project_status', name: 'Project Status Overview', description: 'Current status of all projects.' },
    { id: 'resource_allocation', name: 'Resource Allocation', description: 'Team member workload and availability.' },
    { id: 'risk_assessment', name: 'Risk Assessment Matrix', description: 'Key risks and their impact.' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-sm text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white">
          <FileText className="mr-2 h-4 w-4" />
          Premade Reports
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-slate-800 border-slate-700 text-white">
        <DropdownMenuLabel>Select a Report</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-600" />
        {reports.map((report) => (
          <DropdownMenuItem key={report.id} onSelect={() => onSelectReport(report)} className="hover:bg-slate-700 focus:bg-slate-700">
            {report.name}
          </DropdownMenuItem>
        ))}
        {reports.length === 0 && <DropdownMenuItem disabled>No reports available</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PremadeReportsDropdown;