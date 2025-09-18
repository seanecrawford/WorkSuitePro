import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, PlusCircle, Edit, Trash2, AlertTriangle, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO, isValid } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const WORK_ORDER_STATUSES = ['Open', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Awaiting Parts'];
const WORK_ORDER_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const WorkOrderForm = ({ workOrder, equipmentList, personnelList, usersList, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    equipment_uid: '', title: '', description: '', status: 'Open', priority: 'Medium',
    assigned_to_personnel_id: '', reported_by_user_id: '', date_reported: format(new Date(), 'yyyy-MM-dd'),
    due_date: '', completion_date: '', notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (workOrder) {
      setFormData({
        ...workOrder,
        date_reported: workOrder.date_reported && isValid(parseISO(workOrder.date_reported)) ? format(parseISO(workOrder.date_reported), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        due_date: workOrder.due_date && isValid(parseISO(workOrder.due_date)) ? format(parseISO(workOrder.due_date), 'yyyy-MM-dd') : '',
        completion_date: workOrder.completion_date && isValid(parseISO(workOrder.completion_date)) ? format(parseISO(workOrder.completion_date), 'yyyy-MM-dd') : '',
        assigned_to_personnel_id: workOrder.assigned_to_personnel_id || '',
        reported_by_user_id: workOrder.reported_by_user_id || '',
      });
    } else {
      setFormData({
        equipment_uid: '', title: '', description: '', status: 'Open', priority: 'Medium',
        assigned_to_personnel_id: '', reported_by_user_id: '', date_reported: format(new Date(), 'yyyy-MM-dd'),
        due_date: '', completion_date: '', notes: ''
      });
    }
  }, [workOrder]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.equipment_uid) {
      toast({ title: "Validation Error", description: "Title and Equipment are required.", variant: "destructive" });
      return;
    }
    try {
      const dataToSave = { ...formData };
      
      dataToSave.due_date = dataToSave.due_date === '' ? null : dataToSave.due_date;
      dataToSave.completion_date = dataToSave.completion_date === '' ? null : dataToSave.completion_date;
      dataToSave.assigned_to_personnel_id = dataToSave.assigned_to_personnel_id === '' ? null : dataToSave.assigned_to_personnel_id;
      dataToSave.reported_by_user_id = dataToSave.reported_by_user_id === '' ? null : dataToSave.reported_by_user_id;

      await onSave(dataToSave);
      toast({ title: "Work Order Saved", description: "Work order details saved successfully." });
      onCancel();
    } catch (error) {
      toast({ title: "Error Saving Work Order", description: error.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label htmlFor="title">Title</Label><Input id="title" name="title" value={formData.title} onChange={handleChange} required /></div>
      <div><Label htmlFor="equipment_uid">Equipment</Label>
        <Select name="equipment_uid" value={formData.equipment_uid} onValueChange={(v) => handleSelectChange('equipment_uid', v)} required>
          <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
          <SelectContent>{equipmentList.map(eq => <SelectItem key={eq.equipment_uid} value={eq.equipment_uid}>{eq.equipmentname}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label htmlFor="status">Status</Label>
          <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>{WORK_ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="priority">Priority</Label>
          <Select name="priority" value={formData.priority} onValueChange={(v) => handleSelectChange('priority', v)}>
            <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
            <SelectContent>{WORK_ORDER_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label htmlFor="assigned_to_personnel_id">Assigned To</Label>
          <Select name="assigned_to_personnel_id" value={formData.assigned_to_personnel_id} onValueChange={(v) => handleSelectChange('assigned_to_personnel_id', v)}>
            <SelectTrigger><SelectValue placeholder="Assign personnel (optional)" /></SelectTrigger>
            <SelectContent>{personnelList.map(p => <SelectItem key={p.personnel_uuid} value={p.personnel_uuid}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="reported_by_user_id">Reported By</Label>
          <Select name="reported_by_user_id" value={formData.reported_by_user_id} onValueChange={(v) => handleSelectChange('reported_by_user_id', v)}>
            <SelectTrigger><SelectValue placeholder="Reported by (optional)" /></SelectTrigger>
            <SelectContent>{usersList.map(u => <SelectItem key={u.user_id} value={u.user_id}>{u.email || u.fullname}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div><Label htmlFor="date_reported">Date Reported</Label><Input id="date_reported" name="date_reported" type="date" value={formData.date_reported} onChange={handleChange} required /></div>
        <div><Label htmlFor="due_date">Due Date</Label><Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} /></div>
        <div><Label htmlFor="completion_date">Completion Date</Label><Input id="completion_date" name="completion_date" type="date" value={formData.completion_date} onChange={handleChange} /></div>
      </div>
      <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save Work Order</Button></DialogFooter>
    </form>
  );
};


const WorkOrdersTab = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [woRes, eqRes, pRes, uRes] = await Promise.all([
        supabase.from('work_orders').select(`
          *, 
          equipment:equipment!work_orders_equipment_uid_fkey(equipmentname), 
          personnel:personnel!work_orders_assigned_to_personnel_id_fkey(name), 
          reported_by:profiles!work_orders_reported_by_user_id_fkey(user_id, email, fullname)
        `).order('date_reported', { ascending: false }),
        supabase.from('equipment').select('equipment_uid, equipmentname'),
        supabase.from('personnel').select('personnel_uuid, name'),
        supabase.from('profiles').select('profile_id, user_id, email, fullname') 
      ]);

      if (woRes.error) {
        console.error("Error fetching work orders:", woRes.error);
        throw woRes.error;
      }
      if (eqRes.error) throw eqRes.error;
      if (pRes.error) throw pRes.error;
      if (uRes.error) throw uRes.error;
      
      let filteredWorkOrders = (woRes.data || []);

      if (searchTerm) {
        filteredWorkOrders = filteredWorkOrders.filter(wo => 
          wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (wo.equipment?.equipmentname && wo.equipment.equipmentname.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (wo.personnel?.name && wo.personnel.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      if (filterStatus !== 'all') {
        filteredWorkOrders = filteredWorkOrders.filter(wo => wo.status === filterStatus);
      }

      setWorkOrders(filteredWorkOrders);
      setEquipmentList(eqRes.data || []);
      setPersonnelList(pRes.data || []);
      setUsersList(uRes.data.map(p => ({...p, id: p.user_id })) || []); 

    } catch (err) {
      setError(err.message);
      toast({ title: "Error Fetching Data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveWorkOrder = async (woData) => {
    try {
      let result;
      const dataToSave = { ...woData };
      
      delete dataToSave.equipment;
      delete dataToSave.personnel;
      delete dataToSave.reported_by;


      if (selectedWorkOrder && selectedWorkOrder.work_order_id) {
        const { work_order_id, ...updateData } = dataToSave; 
        result = await supabase.from('work_orders').update(updateData).eq('work_order_id', selectedWorkOrder.work_order_id).select();
      } else {
        const { ...insertData } = dataToSave; 
        result = await supabase.from('work_orders').insert(insertData).select();
      }
      
      if (result.error) throw result.error;
      
      fetchData();
      setIsModalOpen(false);
      setSelectedWorkOrder(null);
    } catch (err) {
      console.error("Error saving work order:", err);
      throw err; 
    }
  };

  const handleDeleteWorkOrder = async (work_order_id) => {
    if (!window.confirm("Are you sure you want to delete this work order?")) return;
    try {
      const { error: deleteError } = await supabase.from('work_orders').delete().eq('work_order_id', work_order_id);
      if (deleteError) throw deleteError;
      toast({ title: "Work Order Deleted", description: "Work order has been successfully deleted." });
      fetchData();
    } catch (err) {
      toast({ title: "Error Deleting Work Order", description: err.message, variant: "destructive" });
    }
  };

  const openModalForNew = () => { setSelectedWorkOrder(null); setIsModalOpen(true); };
  const openModalForEdit = (wo) => { setSelectedWorkOrder(wo); setIsModalOpen(true); };
  
  if (loading && workOrders.length === 0 && !error ) return <div className="flex justify-center items-center h-64"><ClipboardList className="h-12 w-12 animate-spin text-[var(--theme-accent-maintenance)]" /></div>;
  if (error) return <Card className="bg-destructive/10 border-destructive text-destructive-foreground"><CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2"/>Error</CardTitle></CardHeader><CardContent>{error}</CardContent></Card>;

  return (
    <Card className="bg-card-themed border-card-themed shadow-lg text-card-themed-primary">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-foreground flex items-center"><ClipboardList className="mr-2 h-6 w-6 text-[var(--theme-accent-maintenance)]" /> Work Orders</CardTitle>
            <CardDescription className="text-muted-foreground">Track and manage all maintenance work orders.</CardDescription>
          </div>
          <Button onClick={openModalForNew} className="bg-[var(--theme-accent-maintenance)] hover:bg-[var(--theme-accent-maintenance)]/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Work Order
          </Button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search work orders (title, equipment, assignee)..." 
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
              <SelectItem value="all">All Statuses</SelectItem>
              {WORK_ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {workOrders.length === 0 && !loading ? (
          <div className="text-center py-10">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No work orders found. Try adjusting your search or filters, or create a new work order.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map((wo) => (
                <TableRow key={wo.work_order_id}>
                  <TableCell className="font-medium">{wo.title}</TableCell>
                  <TableCell>{wo.equipment?.equipmentname || 'N/A'}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        wo.status === 'Open' ? 'bg-blue-500/20 text-blue-400' :
                        wo.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        wo.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                        wo.status === 'On Hold' ? 'bg-purple-500/20 text-purple-400' :
                        wo.status === 'Cancelled' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400' 
                      }`}>{wo.status}</span>
                  </TableCell>
                  <TableCell>{wo.priority}</TableCell>
                  <TableCell>{wo.due_date && isValid(parseISO(wo.due_date)) ? format(parseISO(wo.due_date), 'PP') : 'N/A'}</TableCell>
                  <TableCell>{wo.personnel?.name || 'Unassigned'}</TableCell>
                  <TableCell>{wo.reported_by?.fullname || wo.reported_by?.email || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openModalForEdit(wo)} className="hover:text-[var(--theme-accent-maintenance)]">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkOrder(wo.work_order_id)} className="hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
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
            <DialogTitle>{selectedWorkOrder ? 'Edit Work Order' : 'Create New Work Order'}</DialogTitle>
            <DialogDescription>
              {selectedWorkOrder ? 'Update the details of the existing work order.' : 'Enter the details for the new work order.'}
            </DialogDescription>
          </DialogHeader>
          <WorkOrderForm 
            workOrder={selectedWorkOrder} 
            equipmentList={equipmentList}
            personnelList={personnelList}
            usersList={usersList}
            onSave={handleSaveWorkOrder} 
            onCancel={() => setIsModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkOrdersTab;