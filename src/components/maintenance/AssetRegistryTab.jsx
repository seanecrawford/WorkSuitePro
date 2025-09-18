import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, PackageSearch, PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO, addDays } from 'date-fns';
import AssetForm from './AssetForm';

const AssetRegistryTab = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('equipment').select('*').order('equipmentname', { ascending: true });
      if (searchTerm) {
        query = query.or(`equipmentname.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%`);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setAssets(data || []);
    } catch (err) {
      setError(err.message);
      toast({ title: "Error Fetching Assets", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, toast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleSaveAsset = async (assetData) => {
    try {
      let result;
      const dataToSave = { ...assetData };
      if (dataToSave.cost === '' || dataToSave.cost === null) delete dataToSave.cost;
      else dataToSave.cost = parseFloat(dataToSave.cost);

      if (dataToSave.purchase_date === '') delete dataToSave.purchase_date;
      
      if (dataToSave.maintenance_schedule && dataToSave.maintenance_schedule.last_maintained_date && dataToSave.maintenance_schedule.interval_days && !dataToSave.maintenance_schedule.next_due_date) {
        const lastMaintained = parseISO(dataToSave.maintenance_schedule.last_maintained_date);
        const interval = parseInt(dataToSave.maintenance_schedule.interval_days, 10);
        const nextDueDate = addDays(lastMaintained, interval);
        dataToSave.maintenance_schedule.next_due_date = format(nextDueDate, 'yyyy-MM-dd');
      }

      if (selectedAsset && selectedAsset.equipment_uid) {
        const { equipment_uid, ...updateData } = dataToSave;
        result = await supabase.from('equipment').update(updateData).eq('equipment_uid', selectedAsset.equipment_uid).select();
      } else {
        result = await supabase.from('equipment').insert(dataToSave).select();
      }
      
      if (result.error) throw result.error;
      
      fetchAssets();
      setIsModalOpen(false);
      setSelectedAsset(null);
    } catch (err) {
      console.error("Error saving asset:", err);
      throw err; 
    }
  };

  const handleDeleteAsset = async (equipment_uid) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      const { error: deleteError } = await supabase.from('equipment').delete().eq('equipment_uid', equipment_uid);
      if (deleteError) throw deleteError;
      toast({ title: "Asset Deleted", description: "Asset has been successfully deleted.", variant: "default" });
      fetchAssets();
    } catch (err) {
      toast({ title: "Error Deleting Asset", description: err.message, variant: "destructive" });
    }
  };

  const openModalForNew = () => {
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };
  
  if (loading) return <div className="flex justify-center items-center h-64"><Wrench className="h-12 w-12 animate-spin text-[var(--theme-accent-maintenance)]" /></div>;
  if (error) return <Card className="bg-destructive/10 border-destructive text-destructive-foreground"><CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2"/>Error</CardTitle></CardHeader><CardContent>{error}</CardContent></Card>;

  return (
    <Card className="bg-card-themed border-card-themed shadow-lg text-card-themed-primary">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-foreground flex items-center"><PackageSearch className="mr-2 h-6 w-6 text-[var(--theme-accent-maintenance)]" /> Asset Registry</CardTitle>
            <CardDescription className="text-muted-foreground">Manage all company equipment and assets.</CardDescription>
          </div>
          <Button onClick={openModalForNew} className="bg-[var(--theme-accent-maintenance)] hover:bg-[var(--theme-accent-maintenance)]/90 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Asset
          </Button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <Input 
            placeholder="Search assets (name, type, serial #)..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Operational">Operational</SelectItem>
              <SelectItem value="Needs Repair">Needs Repair</SelectItem>
              <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
              <SelectItem value="Decommissioned">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <div className="text-center py-10">
            <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No assets found. Try adjusting your search or filters, or add a new asset.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Serial #</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.equipment_uid}>
                  <TableCell className="font-medium">{asset.equipmentname}</TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        asset.status === 'Operational' ? 'bg-green-500/20 text-green-400' :
                        asset.status === 'Needs Repair' ? 'bg-red-500/20 text-red-400' :
                        asset.status === 'Under Maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{asset.status}</span>
                  </TableCell>
                  <TableCell>{asset.location_description}</TableCell>
                  <TableCell>{asset.serial_number}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openModalForEdit(asset)} className="hover:text-[var(--theme-accent-maintenance)]">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAsset(asset.equipment_uid)} className="hover:text-destructive">
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
            <DialogTitle>{selectedAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {selectedAsset ? 'Update the details of the existing asset.' : 'Enter the details for the new asset.'}
            </DialogDescription>
          </DialogHeader>
          <AssetForm asset={selectedAsset} onSave={handleSaveAsset} onCancel={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AssetRegistryTab;