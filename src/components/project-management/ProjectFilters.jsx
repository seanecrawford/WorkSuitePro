import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Filter, Search, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const columnDefinitions = [
  { key: 'projectname', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'startdate', label: 'Start Date' },
  { key: 'enddate', label: 'End Date' },
  { key: 'budget', label: 'Budget' },
  { key: 'project_manager_name', label: 'Manager' },
];

const DateRangePicker = ({ dateRange, onDateChange, placeholder }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-input border-border hover:bg-accent text-foreground",
            (!dateRange?.from && !dateRange?.to) && "text-muted-foreground"
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={onDateChange}
          numberOfMonths={2}
          className="text-popover-foreground"
        />
      </PopoverContent>
    </Popover>
  );
};

const ProjectFilters = ({ filters, setFilters, visibleColumns, setVisibleColumns }) => {
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const handleDateRangeChange = (filterName, dateRange) => {
    setFilters(prev => ({ ...prev, [filterName]: dateRange }));
  };

  return (
    <div className="mb-6 p-4 bg-card-alt rounded-lg border border-border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search projects..." 
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Filter by status..." /></SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">All Statuses</SelectItem>
            {['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'].map(s => <SelectItem key={s} value={s} className="hover:bg-accent focus:bg-accent">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
          <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Filter by priority..." /></SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">All Priorities</SelectItem>
            {['Low', 'Medium', 'High', 'Urgent'].map(p => <SelectItem key={p} value={p} className="hover:bg-accent focus:bg-accent">{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateRangePicker dateRange={filters.startDateRange} onDateChange={(range) => handleDateRangeChange('startDateRange', range)} placeholder="Filter by Start Date" />
        <DateRangePicker dateRange={filters.endDateRange} onDateChange={(range) => handleDateRangeChange('endDateRange', range)} placeholder="Filter by End Date" />
      </div>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            {columnDefinitions.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.key}
                className="capitalize hover:bg-accent focus:bg-accent"
                checked={visibleColumns[col.key]}
                onCheckedChange={(value) =>
                  setVisibleColumns((prev) => ({ ...prev, [col.key]: !!value }))
                }
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectFilters;