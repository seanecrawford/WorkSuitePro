import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, HardHat, ClipboardList, PackageSearch, CalendarClock } from 'lucide-react';

import MaintenanceDashboardTab from '@/components/maintenance/MaintenanceDashboardTab.jsx';
import AssetRegistryTab from '@/components/maintenance/AssetRegistryTab.jsx';
import WorkOrdersTab from '@/components/maintenance/WorkOrdersTab.jsx';
import PmSchedulesTab from '@/components/maintenance/PmSchedulesTab.jsx';


const MaintenancePage = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  const tabConfig = [
    { value: "dashboard", label: "Dashboard", icon: HardHat, component: <MaintenanceDashboardTab /> },
    { value: "assets", label: "Asset Registry", icon: PackageSearch, component: <AssetRegistryTab /> },
    { value: "work-orders", label: "Work Orders", icon: ClipboardList, component: <WorkOrdersTab /> },
    { value: "schedules", label: "PM Schedules", icon: CalendarClock, component: <PmSchedulesTab /> },
  ];


  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-6 p-4 md:p-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Wrench className="mr-3 h-8 w-8 text-[var(--theme-accent-maintenance)]" /> Maintenance & Asset Management
        </h1>
      </motion.div>

      <Tabs defaultValue="dashboard" className="w-full">
        <motion.div variants={itemVariants}>
          <TabsList className="tabs-maintenance grid w-full grid-cols-2 md:grid-cols-4">
            {tabConfig.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} >
                <tab.icon className="mr-2 h-4 w-4" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          {tabConfig.map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </motion.div>
      </Tabs>
    </motion.div>
  );
};

export default MaintenancePage;