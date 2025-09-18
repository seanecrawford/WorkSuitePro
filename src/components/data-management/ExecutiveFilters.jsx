import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarPlus as CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ExecutiveFilters = ({ onApplyFilters }) => {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [region, setRegion] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [financialThreshold, setFinancialThreshold] = useState('');

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
    onApplyFilters({}); // Notify parent of reset
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-sky-400" /> Executive Filters</CardTitle>
        <CardDescription>Refine your data view with powerful filters. (Currently UI only)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="date-range" className="text-sm">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-range"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
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
            <Label htmlFor="region-select" className="text-sm">Region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger id="region-select">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {/* Placeholder options - these would ideally come from your data */}
                <SelectItem value="north_america">North America</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="asia_pacific">Asia Pacific</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="project-status" className="text-sm">Project Status</Label>
            <Select value={projectStatus} onValueChange={setProjectStatus}>
              <SelectTrigger id="project-status">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {/* Placeholder options */}
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="financial-threshold" className="text-sm">Min. Revenue ($)</Label>
            <Input
              id="financial-threshold"
              type="number"
              placeholder="e.g., 100000"
              value={financialThreshold}
              onChange={(e) => setFinancialThreshold(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={handleReset} className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
          <Button onClick={handleApply} className="bg-sky-600 hover:bg-sky-700 text-white">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutiveFilters;