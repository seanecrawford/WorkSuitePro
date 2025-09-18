import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, PlusCircle, XCircle, Loader2, AlertCircle, Inbox } from 'lucide-react';

const SupplierList = ({ 
  suppliers, 
  loading, 
  error, 
  searchTerm,
  onEdit, 
  onDelete, 
  onAddSupplier,
  onClearSearch 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-red-900/20 rounded-lg">
        <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
        <p className="text-red-300 font-semibold">Error Loading Suppliers</p>
        <p className="text-red-400 text-sm text-center">{error}</p>
      </div>
    );
  }
  
  if (suppliers.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-slate-800/30 rounded-lg">
        <Inbox className="h-12 w-12 text-slate-500 mb-3" />
        <p className="text-slate-400 font-semibold">No suppliers found.</p>
        <div className="mt-4">
          <Button onClick={onAddSupplier}><PlusCircle className="mr-2 h-4 w-4" /> Add Supplier</Button>
        </div>
      </div>
    );
  }

  if (suppliers.length === 0 && searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-slate-800/30 rounded-lg">
        <Inbox className="h-12 w-12 text-slate-500 mb-3" />
        <p className="text-slate-400 font-semibold">{`No suppliers match "${searchTerm}".`}</p>
        <div className="mt-4">
           <Button variant="outline" onClick={onClearSearch}><XCircle className="mr-2 h-4 w-4" />Clear Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 rounded-lg border border-slate-700/60">
      <Table>
        <TableHeader className="bg-slate-800 sticky top-0">
          <TableRow>
            <TableHead className="text-sky-300">Name</TableHead>
            <TableHead className="text-sky-300">Contact Name</TableHead>
            <TableHead className="text-sky-300">Email</TableHead>
            <TableHead className="text-sky-300">Phone</TableHead>
            <TableHead className="text-sky-300 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.supplier_id} className="hover:bg-slate-700/40 transition-colors">
              <TableCell className="font-medium text-slate-200">{supplier.name}</TableCell>
              <TableCell className="text-slate-300">{supplier.contact_name || '-'}</TableCell>
              <TableCell className="text-slate-400">{supplier.contact_email || '-'}</TableCell>
              <TableCell className="text-slate-400">{supplier.contact_phone || '-'}</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" onClick={() => onEdit(supplier)} className="hover:text-sky-400 text-slate-400">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(supplier.supplier_id, supplier.name)} className="hover:text-red-400 text-slate-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SupplierList;