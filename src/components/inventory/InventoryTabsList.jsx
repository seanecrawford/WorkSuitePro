import React from 'react';
import { motion } from 'framer-motion';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, Truck, Users, BarChart3 } from 'lucide-react';

const InventoryTabsList = ({ activeTab, setActiveTab, itemVariants }) => (
  <motion.div variants={itemVariants} className="px-0">
    <TabsList className="mb-4 bg-slate-800 border border-slate-700/80 shadow-md w-full sm:w-auto">
      <TabsTrigger value="inventory" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white hover:bg-slate-700/60 text-slate-300 px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-md">
        <Package className="mr-1.5 h-4 w-4" /> Current Inventory
      </TabsTrigger>
      <TabsTrigger value="statistics" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white hover:bg-slate-700/60 text-slate-300 px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-md">
        <BarChart3 className="mr-1.5 h-4 w-4" /> Statistics
      </TabsTrigger>
      <TabsTrigger value="suppliers" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white hover:bg-slate-700/60 text-slate-300 px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-md">
        <Users className="mr-1.5 h-4 w-4" /> Suppliers
      </TabsTrigger>
      <TabsTrigger value="purchase-orders" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white hover:bg-slate-700/60 text-slate-300 px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-md">
        <ShoppingCart className="mr-1.5 h-4 w-4" /> Purchase Orders
      </TabsTrigger>
      <TabsTrigger value="tools" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white hover:bg-slate-700/60 text-slate-300 px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-md">
        <Truck className="mr-1.5 h-4 w-4" /> Procurement Tools
      </TabsTrigger>
    </TabsList>
  </motion.div>
);

export default InventoryTabsList;