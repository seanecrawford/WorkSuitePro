import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, PlusCircle, XCircle, Loader2, AlertCircle, Inbox } from 'lucide-react';

const InventoryList = ({ 
  items, 
  loading, 
  error, 
  searchTerm, 
  onEdit, 
  onDelete, 
  onAddItem,
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
        <p className="text-red-300 font-semibold">Error Loading Inventory</p>
        <p className="text-red-400 text-sm text-center">{error}</p>
      </div>
    );
  }

  if (items.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-slate-800/30 rounded-lg">
        <Inbox className="h-12 w-12 text-slate-500 mb-3" />
        <p className="text-slate-400 font-semibold">No inventory items found.</p>
        <div className="mt-4">
          <Button onClick={onAddItem}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
        </div>
      </div>
    );
  }
  
  if (items.length === 0 && searchTerm) {
     return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-slate-800/30 rounded-lg">
        <Inbox className="h-12 w-12 text-slate-500 mb-3" />
        <p className="text-slate-400 font-semibold">{`No inventory items match "${searchTerm}".`}</p>
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
            <TableHead className="text-sky-300">SKU</TableHead>
            <TableHead className="text-sky-300">Name</TableHead>
            <TableHead className="text-sky-300">Category</TableHead>
            <TableHead className="text-sky-300 text-right">Qty on Hand</TableHead>
            <TableHead className="text-sky-300 text-right">Reorder Lvl</TableHead>
            <TableHead className="text-sky-300 text-right">Cost Price</TableHead>
            <TableHead className="text-sky-300">Location</TableHead>
            <TableHead className="text-sky-300">Supplier</TableHead>
            <TableHead className="text-sky-300 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.item_id} className="hover:bg-slate-700/40 transition-colors">
              <TableCell className="font-medium text-slate-200">{item.sku}</TableCell>
              <TableCell className="text-slate-300">{item.name}</TableCell>
              <TableCell className="text-slate-400">{item.category || '-'}</TableCell>
              <TableCell className="text-slate-200 text-right">{item.quantity_on_hand}</TableCell>
              <TableCell className="text-slate-300 text-right">{item.reorder_level}</TableCell>
              <TableCell className="text-slate-300 text-right">${typeof item.cost_price === 'number' ? item.cost_price.toFixed(2) : '0.00'}</TableCell>
              <TableCell className="text-slate-400">{item.location || '-'}</TableCell>
              <TableCell className="text-slate-400">{item.suppliers?.name || 'N/A'}</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="hover:text-sky-400 text-slate-400">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(item.item_id, item.name)} className="hover:text-red-400 text-slate-400">
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

export default InventoryList;