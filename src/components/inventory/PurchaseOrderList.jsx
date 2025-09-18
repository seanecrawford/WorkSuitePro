import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, PlusCircle, XCircle, Loader2, AlertCircle, Inbox } from 'lucide-react';

const PurchaseOrderList = ({ 
  purchaseOrders, 
  loading, 
  error, 
  searchTerm,
  onEdit, 
  onDelete, 
  onAddPO,
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
        <p className="text-red-300 font-semibold">Error Loading Purchase Orders</p>
        <p className="text-red-400 text-sm text-center">{error}</p>
      </div>
    );
  }

  if (purchaseOrders.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-slate-800/30 rounded-lg">
        <Inbox className="h-12 w-12 text-slate-500 mb-3" />
        <p className="text-slate-400 font-semibold">No purchase orders found.</p>
        <div className="mt-4">
          <Button onClick={onAddPO}><PlusCircle className="mr-2 h-4 w-4" /> Add PO</Button>
        </div>
      </div>
    );
  }

  if (purchaseOrders.length === 0 && searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-slate-800/30 rounded-lg">
        <Inbox className="h-12 w-12 text-slate-500 mb-3" />
        <p className="text-slate-400 font-semibold">{`No purchase orders match "${searchTerm}".`}</p>
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
            <TableHead className="text-sky-300">PO Number</TableHead>
            <TableHead className="text-sky-300">Supplier</TableHead>
            <TableHead className="text-sky-300">Order Date</TableHead>
            <TableHead className="text-sky-300">Expected Delivery</TableHead>
            <TableHead className="text-sky-300">Status</TableHead>
            <TableHead className="text-sky-300 text-right">Total Amount</TableHead>
            <TableHead className="text-sky-300 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseOrders.map((po) => (
            <TableRow key={po.po_id} className="hover:bg-slate-700/40 transition-colors">
              <TableCell className="font-medium text-slate-200">{po.po_number}</TableCell>
              <TableCell className="text-slate-300">{po.suppliers?.name || 'N/A'}</TableCell>
              <TableCell className="text-slate-400">{new Date(po.order_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-slate-400">{po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : '-'}</TableCell>
              <TableCell className="text-slate-300">{po.status}</TableCell>
              <TableCell className="text-slate-200 text-right">${typeof po.total_amount === 'number' ? po.total_amount.toFixed(2) : '0.00'}</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" onClick={() => onEdit(po)} className="hover:text-sky-400 text-slate-400">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(po.po_id, po.po_number)} className="hover:text-red-400 text-slate-400">
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

export default PurchaseOrderList;