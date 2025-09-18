import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const FilterControls = ({
  dateRange,
  setDateRange,
  region,
  setRegion,
  projectStatus,
  setProjectStatus,
  financialThreshold,
  setFinancialThreshold,
  onApplyFilters,
  onResetFilters,
}) => {
  const handleApply = () => {
    onApplyFilters({
      dateRange,
      region,
      projectStatus,
      financialThreshold,
    });
  };

  const handleReset = () => {
    setDateRange({ from: null, to: null });
    setRegion('');
    setProjectStatus('');
    setFinancialThreshold('');
    onResetFilters();
  };

  const getDateRangeDisplay = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    if (dateRange.from) {
      return `From: ${format(dateRange.from, "MMM d, yyyy")}`;
    }
    if (dateRange.to) {
      return `To: ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    return "Pick a start & end date";
  };

  return (
    <div className="border-b border-slate-700 pb-4 mb-4">
      <h3 className="text-md font-semibold text-foreground mb-2">Filter Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <Label htmlFor="date-range" className="text-xs">Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-range"
                variant={"outline"}
                size="sm"
                className={cn(
                  "w-full justify-start text-left font-normal text-xs h-9",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                {getDateRangeDisplay()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                classNames={{
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                  day_today: "bg-accent text-accent-foreground",
                  caption_label: "text-white",
                  nav_button: "text-white",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="region-select" className="text-xs">Region</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger id="region-select" className="text-xs h-9">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="north_america">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="asia_pacific">Asia Pacific</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="project-status" className="text-xs">Project Status</Label>
          <Select value={projectStatus} onValueChange={setProjectStatus}>
            <SelectTrigger id="project-status" className="text-xs h-9">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="financial-threshold" className="text-xs">Min. Revenue ($)</Label>
          <Input
            id="financial-threshold"
            type="number"
            placeholder="e.g., 100000"
            value={financialThreshold}
            onChange={(e) => setFinancialThreshold(e.target.value)}
            className="bg-background text-xs h-9"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-3">
        <Button variant="outline" size="sm" onClick={handleReset} className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white text-xs">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
        </Button>
        <Button size="sm" onClick={handleApply} className="bg-sky-600 hover:bg-sky-700 text-white text-xs">
          <Filter className="mr-1.5 h-3.5 w-3.5" /> Apply
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;