import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Package, PlusCircle } from 'lucide-react';

const InventoryPageHeader = ({ activeTab, onOpenModal, itemVariants }) => (
  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between mb-6 flex-shrink-0 px-0">
    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-50 flex items-center mb-4 sm:mb-0">
      <Package className="mr-3 h-7 w-7 md:h-8 md:w-8 text-sky-400" /> Inventory & Procurement
    </h1>
    {activeTab === "inventory" && <Button onClick={() => onOpenModal('addInventory')} className="bg-sky-500 hover:bg-sky-600"><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>}
    {activeTab === "suppliers" && <Button onClick={() => onOpenModal('addSupplier')} className="bg-sky-500 hover:bg-sky-600"><PlusCircle className="mr-2 h-4 w-4" /> Add Supplier</Button>}
    {activeTab === "purchase-orders" && <Button onClick={() => onOpenModal('addPO')} className="bg-sky-500 hover:bg-sky-600"><PlusCircle className="mr-2 h-4 w-4" /> Create PO</Button>}
  </motion.div>
);

export default InventoryPageHeader;