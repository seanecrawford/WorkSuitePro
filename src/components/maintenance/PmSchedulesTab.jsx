import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarClock, AlertTriangle, Edit, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO, isPast, differenceInDays, isValid, addDays } from 'date-fns';
import AssetForm from './AssetForm.jsx'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const PmSchedulesTab = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState(null);
  const { toast } = useToast();

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('equipment').select('*').not('maintenance_schedule', 'is', null).order('equipmentname', { ascending: true });
      
      if (searchTerm) {
        query = query.or(`equipmentname.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,maintenance_schedule->>assigned_technician.ilike.%${searchTerm}%`);
      }
      
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      let processedSchedules = (data || []).map(asset => {
        const schedule = asset.maintenance_schedule;
        if (!schedule || !schedule.next_due_date || !isValid(parseISO(schedule.next_due_date))) {
          return { ...asset, scheduleStatus: 'unknown', daysDifference: null, next_due_date_iso: null };
        }
        const dueDate = parseISO(schedule.next_due_date);
        const today = new Date();
        today.setHours(0,0,0,0); 

        let scheduleStatus = 'on-time';
        if (isPast(dueDate) && !isSameDay(dueDate, today)) {
          scheduleStatus = 'overdue';
        } else if (differenceInDays(dueDate, today) <= 7 && differenceInDays(dueDate, today) >= 0) {
          scheduleStatus = 'upcoming';
        }
        
        return { ...asset, scheduleStatus, daysDifference: differenceInDays(dueDate, today), next_due_date_iso: schedule.next_due_date };
      });

      if (filterStatus !== 'all') {
        processedSchedules = processedSchedules.filter(s => s.scheduleStatus === filterStatus);
      }
      
      setSchedules(processedSchedules);
    } catch (err) {
      setError(err.message);
      toast({ title: "Error Fetching PM Schedules", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, toast]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);


  const handleEditSchedule = (asset) => {
    setSelectedAssetForEdit(asset);
    setIsModalOpen(true);
  };

  const handleSaveAsset = async (assetData) => {
    try {
      let result;
      const dataToSave = { ...assetData };
      if (dataToSave.cost === '' || dataToSave.cost === null || dataToSave.cost === undefined) {
         delete dataToSave.cost;
      } else {
         dataToSave.cost = parseFloat(dataToSave.cost);
      }

      if (dataToSave.purchase_date === '' || dataToSave.purchase_date === null) {
          delete dataToSave.purchase_date;
      }
      
      // Ensure maintenance_schedule exists before trying to modify it
      dataToSave.maintenance_schedule = dataToSave.maintenance_schedule || {};

      if (dataToSave.maintenance_schedule.last_maintained_date && dataToSave.maintenance_schedule.interval_days && !dataToSave.maintenance_schedule.next_due_date) {
        const lastMaintained = parseISO(dataToSave.maintenance_schedule.last_maintained_date);
        const interval = parseInt(dataToSave.maintenance_schedule.interval_days, 10);
        if (isValid(lastMaintained) && !isNaN(interval)) {
            const nextDueDate = addDays(lastMaintained, interval);
            dataToSave.maintenance_schedule.next_due_date = format(nextDueDate, 'yyyy-MM-dd');
        }
      }
      
      if (selectedAssetForEdit && selectedAssetForEdit.equipment_uid) {
        const { equipment_uid, ...updateData } = dataToSave;
        // Remove transient fields before saving
        delete updateData.scheduleStatus;
        delete updateData.daysDifference;
        delete updateData.next_due_date_iso;
        
        result = await supabase.from('equipment').update(updateData).eq('equipment_uid', selectedAssetForEdit.equipment_uid).select();
      } else {
        toast({ title: "Cannot Create New Asset Here", description: "Please use Asset Registry to add new assets.", variant: "warning" });
        return;
      }
      
      if (result.error) throw result.error;
      
      fetchSchedules();
      setIsModalOpen(false);
      setSelectedAssetForEdit(null);
      toast({ title: "Schedule Updated", description: "Maintenance schedule has been successfully updated.", variant: "default" });
    } catch (err) {
      console.error("Error saving asset schedule:", err);
      toast({ title: "Error Saving Schedule", description: err.message, variant: "destructive" });
    }
  };

  if (loading && schedules.length === 0 && !error) return <div className="flex justify-center items-center h-64"><CalendarClock className="h-12 w-12 animate-spin text-[var(--theme-accent-maintenance)]" /></div>;
  if (error) return <Card className="bg-destructive/10 border-destructive text-destructive-foreground"><CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2"/>Error</CardTitle></CardHeader><CardContent>{error}</CardContent></Card>;

  return (
    <Card className="bg-card-themed border-card-themed shadow-lg text-card-themed-primary">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center"><CalendarClock className="mr-2 h-6 w-6 text-[var(--theme-accent-maintenance)]" /> Preventive Maintenance Schedules</CardTitle>
        <CardDescription className="text-muted-foreground">View and manage upcoming and overdue PM tasks.</CardDescription>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by asset name, type, technician..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schedules</SelectItem>
              <SelectItem value="upcoming">Upcoming (7 days)</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="on-time">On Time (Not Due Soon)</SelectItem>
              <SelectItem value="unknown">Unknown/No Schedule</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 && !loading ? (
          <div className="text-center py-10">
            <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No PM schedules found matching your criteria.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Next Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interval (Days)</TableHead>
                <TableHead>Last Maintained</TableHead>
                <TableHead>Assigned Technician</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((asset) => (
                <TableRow key={asset.equipment_uid}>
                  <TableCell className="font-medium">{asset.equipmentname}</TableCell>
                  <TableCell>{asset.next_due_date_iso && isValid(parseISO(asset.next_due_date_iso)) ? format(parseISO(asset.next_due_date_iso), 'PP') : 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      asset.scheduleStatus === 'overdue' ? 'bg-red-500/20 text-red-400' :
                      asset.scheduleStatus === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400' :
                      asset.scheduleStatus === 'on-time' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {asset.scheduleStatus === 'overdue' ? `Overdue by ${Math.abs(asset.daysDifference)} days` : 
                       asset.scheduleStatus === 'upcoming' ? `Due in ${asset.daysDifference} days` : 
                       asset.scheduleStatus === 'on-time' ? 'On Time' : 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell>{asset.maintenance_schedule?.interval_days || 'N/A'}</TableCell>
                  <TableCell>{asset.maintenance_schedule?.last_maintained_date && isValid(parseISO(asset.maintenance_schedule.last_maintained_date)) ? format(parseISO(asset.maintenance_schedule.last_maintained_date), 'PP') : 'N/A'}</TableCell>
                  <TableCell>{asset.maintenance_schedule?.assigned_technician || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditSchedule(asset)} className="hover:text-[var(--theme-accent-maintenance)]">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Schedule for {selectedAssetForEdit?.equipmentname}</DialogTitle>
            <DialogDescription>
              Update the maintenance schedule details for this asset.
            </DialogDescription>
          </DialogHeader>
          <AssetForm asset={selectedAssetForEdit} onSave={handleSaveAsset} onCancel={() => setIsModalOpen(false)} isScheduleEditMode={true}/>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PmSchedulesTab;