import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from 'date-fns';

const AssetForm = ({ asset, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    equipmentname: '',
    type: '',
    status: 'Operational',
    purchase_date: '',
    cost: '',
    location_description: '',
    serial_number: '',
    maintenance_schedule: { interval_days: 30, last_maintained_date: '', next_due_date: '' },
  });
  const { toast } = useToast();

  useEffect(() => {
    if (asset) {
      setFormData(prev => ({
        ...prev,
        ...asset,
        purchase_date: asset.purchase_date ? format(parseISO(asset.purchase_date), 'yyyy-MM-dd') : '',
        maintenance_schedule: asset.maintenance_schedule || { interval_days: 30, last_maintained_date: '', next_due_date: '' },
      }));
    } else {
      setFormData({
        equipmentname: '',
        type: '',
        status: 'Operational',
        purchase_date: '',
        cost: '',
        location_description: '',
        serial_number: '',
        maintenance_schedule: { interval_days: 30, last_maintained_date: '', next_due_date: '' },
      });
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      maintenance_schedule: {
        ...prev.maintenance_schedule,
        [name]: name === 'interval_days' ? (value ? parseInt(value, 10) : '') : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      toast({ title: "Asset Saved", description: "Asset details have been successfully saved.", variant: "default" });
    } catch (error) {
      toast({ title: "Error Saving Asset", description: error.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="equipmentname">Asset Name</Label>
        <Input id="equipmentname" name="equipmentname" value={formData.equipmentname} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Input id="type" name="type" value={formData.type} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Operational">Operational</SelectItem>
              <SelectItem value="Needs Repair">Needs Repair</SelectItem>
              <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
              <SelectItem value="Decommissioned">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input id="purchase_date" name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="cost">Cost</Label>
          <Input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} />
        </div>
      </div>
      <div>
        <Label htmlFor="location_description">Location</Label>
        <Input id="location_description" name="location_description" value={formData.location_description} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="serial_number">Serial Number</Label>
        <Input id="serial_number" name="serial_number" value={formData.serial_number} onChange={handleChange} />
      </div>
      <fieldset className="border p-4 rounded-md">
        <legend className="text-sm font-medium px-1">Maintenance Schedule</legend>
        <div className="space-y-3">
          <div>
            <Label htmlFor="interval_days">Interval (days)</Label>
            <Input id="interval_days" name="interval_days" type="number" value={formData.maintenance_schedule.interval_days || ''} onChange={handleScheduleChange} />
          </div>
          <div>
            <Label htmlFor="last_maintained_date">Last Maintained Date</Label>
            <Input id="last_maintained_date" name="last_maintained_date" type="date" value={formData.maintenance_schedule.last_maintained_date || ''} onChange={handleScheduleChange} />
          </div>
           <div>
            <Label htmlFor="next_due_date">Next Due Date (auto-calculated if empty)</Label>
            <Input id="next_due_date" name="next_due_date" type="date" value={formData.maintenance_schedule.next_due_date || ''} onChange={handleScheduleChange} />
          </div>
        </div>
      </fieldset>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Asset</Button>
      </DialogFooter>
    </form>
  );
};

export default AssetForm;