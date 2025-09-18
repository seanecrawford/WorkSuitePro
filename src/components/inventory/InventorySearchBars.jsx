import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

const InventorySearchBars = ({ activeTab, searchTerms, setSearchTerms, itemVariants }) => (
  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between mb-4 flex-shrink-0 gap-2 px-0">
    {activeTab === 'inventory' && <Input placeholder="Search SKU, name, category..." value={searchTerms.inventory} onChange={(e) => setSearchTerms(prev => ({...prev, inventory: e.target.value}))} className="max-w-xs bg-slate-700 border-slate-600 placeholder:text-slate-400 focus:ring-sky-500 focus:border-sky-500" />}
    {activeTab === 'suppliers' && <Input placeholder="Search supplier name, contact..." value={searchTerms.suppliers} onChange={(e) => setSearchTerms(prev => ({...prev, suppliers: e.target.value}))} className="max-w-xs bg-slate-700 border-slate-600 placeholder:text-slate-400 focus:ring-sky-500 focus:border-sky-500" />}
    {activeTab === 'purchase-orders' && <Input placeholder="Search PO number, supplier, status..." value={searchTerms.purchaseOrders} onChange={(e) => setSearchTerms(prev => ({...prev, purchaseOrders: e.target.value}))} className="max-w-xs bg-slate-700 border-slate-600 placeholder:text-slate-400 focus:ring-sky-500 focus:border-sky-500" />}
  </motion.div>
);

export default InventorySearchBars;