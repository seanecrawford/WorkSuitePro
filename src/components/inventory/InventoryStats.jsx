import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Inbox, Package, DollarSign, TrendingDown, Layers, BarChartBig, Tag, Star } from 'lucide-react';

const StatCard = ({ title, value, icon, description, colorClass = "text-sky-400", valuePrefix = "", valueSuffix = "" }) => {
  const IconComponent = icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/70 border border-slate-700/50 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-shadow duration-300"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        {IconComponent && <IconComponent className={`h-5 w-5 ${colorClass}`} />}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorClass}`}>{valuePrefix}{value}{valueSuffix}</div>
        {description && <p className="text-xs text-slate-400 pt-1">{description}</p>}
      </CardContent>
    </motion.div>
  );
};

const CategoryDistributionCard = ({ categories }) => {
  const sortedCategories = Object.entries(categories).sort(([,a],[,b]) => b-a).slice(0, 5); // Top 5 categories

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-slate-800/70 border border-slate-700/50 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 md:col-span-2"
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-300 flex items-center">
          <Layers className="mr-2 h-5 w-5" /> Top Item Categories
        </CardTitle>
        <CardDescription className="text-slate-400">Distribution of items by category.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedCategories.length > 0 ? (
          <ul className="space-y-2">
            {sortedCategories.map(([category, count]) => (
              <li key={category} className="flex justify-between items-center text-sm p-2 bg-slate-700/50 rounded-md">
                <span className="text-slate-300">{category || "Uncategorized"}</span>
                <span className="font-semibold text-purple-300">{count} items</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400">No category data available.</p>
        )}
      </CardContent>
    </motion.div>
  );
};


const InventoryStats = ({ inventoryItems, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-sky-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-red-900/20 rounded-lg">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <p className="text-xl text-red-300 font-semibold">Error Loading Inventory Data</p>
        <p className="text-red-400 text-center mt-1">{error}</p>
      </div>
    );
  }

  if (!inventoryItems || inventoryItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-800/30 rounded-lg">
        <Inbox className="h-16 w-16 text-slate-500 mb-4" />
        <p className="text-xl text-slate-400 font-semibold">No Inventory Data Available</p>
        <p className="text-slate-500 text-center mt-1">Add some items to see statistics.</p>
      </div>
    );
  }

  const totalUniqueItems = inventoryItems.length;
  const totalQuantityInStock = inventoryItems.reduce((sum, item) => sum + (item.quantity_on_hand || 0), 0);
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity_on_hand || 0) * (item.cost_price || 0), 0);
  const itemsBelowReorder = inventoryItems.filter(item => item.quantity_on_hand < item.reorder_level).length;
  
  let mostStockedItem = { name: 'N/A', quantity_on_hand: 0 };
  if (totalUniqueItems > 0) {
    mostStockedItem = inventoryItems.reduce((max, item) => (item.quantity_on_hand > max.quantity_on_hand ? item : max), inventoryItems[0]);
  }

  let highestValueItem = { name: 'N/A', value: 0 };
   if (totalUniqueItems > 0) {
    highestValueItem = inventoryItems.map(item => ({ name: item.name, value: (item.quantity_on_hand || 0) * (item.cost_price || 0) }))
                                   .reduce((max, item) => (item.value > max.value ? item : max), { name: 'N/A', value: 0 });
  }
  
  const categories = inventoryItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-2 md:p-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard 
          title="Total Unique SKUs" 
          value={totalUniqueItems} 
          icon={Package} 
          description="Number of distinct items"
          colorClass="text-sky-400"
        />
        <StatCard 
          title="Total Units in Stock" 
          value={totalQuantityInStock} 
          icon={BarChartBig} 
          description="Sum of all item quantities"
          colorClass="text-emerald-400"
        />
        <StatCard 
          title="Total Inventory Value" 
          value={totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
          valuePrefix="$"
          icon={DollarSign} 
          description="Based on cost price"
          colorClass="text-amber-400"
        />
        <StatCard 
          title="Items Below Reorder Level" 
          value={itemsBelowReorder} 
          icon={TrendingDown} 
          description="Need restocking soon"
          colorClass="text-red-400"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
         <StatCard 
          title="Most Stocked Item" 
          value={mostStockedItem.name} 
          icon={Tag} 
          description={`Quantity: ${mostStockedItem.quantity_on_hand || 0} units`}
          colorClass="text-indigo-400"
        />
        <StatCard 
          title="Highest Value Item (Stock)" 
          value={highestValueItem.name} 
          icon={Star} 
          description={`Total Value: $${highestValueItem.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          colorClass="text-rose-400"
        />
      </div>

      <CategoryDistributionCard categories={categories} />

    </div>
  );
};

export default InventoryStats;