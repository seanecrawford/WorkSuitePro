import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const InventoryModal = ({ 
  isOpen, 
  onOpenChange, 
  modalType, 
  currentItem, 
  handleFormChange, 
  handleSave, 
  suppliers // Assuming suppliers list is needed for dropdowns
}) => {
  if (!modalType || !currentItem) return null;

  let fields = [];
  let title = "";

  if (modalType.includes('Inventory')) {
    title = currentItem.item_id ? "Edit Inventory Item" : "Add Inventory Item";
    fields = [
      { name: 'sku', label: 'SKU', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'quantity_on_hand', label: 'Quantity on Hand', type: 'number', required: true },
      { name: 'reorder_level', label: 'Reorder Level', type: 'number' },
      { name: 'cost_price', label: 'Cost Price', type: 'number', step: '0.01' },
      { name: 'sale_price', label: 'Sale Price', type: 'number', step: '0.01' },
      { name: 'supplier_id', label: 'Supplier', type: 'select', options: (suppliers || []).map(s => ({ value: s.supplier_id, label: s.name })), placeholder: "Select Supplier" },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'unit_of_measure', label: 'Unit of Measure', type: 'text' },
    ];
  } else if (modalType.includes('Supplier')) {
    title = currentItem.supplier_id ? "Edit Supplier" : "Add Supplier";
     fields = [
      { name: 'name', label: 'Supplier Name', type: 'text', required: true },
      { name: 'contact_name', label: 'Contact Name', type: 'text' },
      { name: 'contact_email', label: 'Contact Email', type: 'email' },
      { name: 'contact_phone', label: 'Contact Phone', type: 'tel' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ];
  } else if (modalType.includes('PO')) {
    title = currentItem.po_id ? "Edit Purchase Order" : "Add Purchase Order";
    fields = [
      { name: 'po_number', label: 'PO Number', type: 'text', required: true },
      { name: 'supplier_id', label: 'Supplier', type: 'select', options: (suppliers || []).map(s => ({ value: s.supplier_id, label: s.name })), required: true, placeholder: "Select Supplier" },
      { name: 'order_date', label: 'Order Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'expected_delivery_date', label: 'Expected Delivery Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: [{value: 'Pending', label: 'Pending'}, {value: 'Ordered', label: 'Ordered'}, {value: 'Shipped', label: 'Shipped'}, {value: 'Received', label: 'Received'}, {value: 'Cancelled', label: 'Cancelled'}], required: true, defaultValue: 'Pending'},
      { name: 'total_amount', label: 'Total Amount', type: 'number', step: '0.01' }, // Note: This might be auto-calculated from items in a full implementation
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ];
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-sky-400">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50 pr-2">
          {fields.map(field => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
              <label htmlFor={field.name} className="text-right text-sm text-slate-300 col-span-1">
                {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={currentItem[field.name] || ''}
                  onChange={handleFormChange}
                  className="col-span-3 bg-slate-700 border-slate-600 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500 min-h-[80px]"
                  rows={3}
                />
              ) : field.type === 'select' ? (
                <select 
                  id={field.name}
                  name={field.name}
                  value={currentItem[field.name] || ''}
                  onChange={handleFormChange}
                  className="col-span-3 bg-slate-700 border-slate-600 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500 h-10"
                >
                  <option value="" disabled>{field.placeholder || `Select ${field.label}`}</option>
                  {(field.options || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={currentItem[field.name] || (field.type === 'date' && field.defaultValue ? field.defaultValue : '')}
                  onChange={handleFormChange}
                  className="col-span-3 bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500"
                  step={field.step}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="border-t border-slate-700 pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="bg-sky-500 hover:bg-sky-600 text-white">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;