import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wrench, PackageSearch, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { parseISO } from 'date-fns';

const MaintenanceDashboardTab = () => {
  const [stats, setStats] = useState({ totalAssets: 0, needsRepair: 0, underMaintenance: 0, upcomingPM: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: assets, error } = await supabase.from('equipment').select('status, maintenance_schedule');
        if (error) throw error;

        const totalAssets = assets.length;
        const needsRepair = assets.filter(a => a.status === 'Needs Repair').length;
        const underMaintenance = assets.filter(a => a.status === 'Under Maintenance').length;
        
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const upcomingPM = assets.filter(a => {
          if (a.maintenance_schedule && a.maintenance_schedule.next_due_date) {
            try {
              const dueDate = parseISO(a.maintenance_schedule.next_due_date);
              return dueDate >= today && dueDate <= nextWeek;
            } catch (e) {
              console.warn("Invalid date format for next_due_date:", a.maintenance_schedule.next_due_date, "for asset:", a.equipmentname);
              return false;
            }
          }
          return false;
        }).length;

        setStats({ totalAssets, needsRepair, underMaintenance, upcomingPM });
      } catch (err) {
        toast({ title: "Error Fetching Dashboard Stats", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <Card className={`bg-card-themed border-card-themed shadow-md text-card-themed-primary ${colorClass}/20 border-l-4 ${colorClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${colorClass ? `text-${colorClass.split('-')[1]}-500` : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        {loading ? <div className="h-8 w-1/2 bg-muted-foreground/20 animate-pulse rounded-md"></div> : <div className="text-2xl font-bold text-foreground">{value}</div>}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Assets" value={stats.totalAssets} icon={PackageSearch} colorClass="border-blue-500" />
      <StatCard title="Needs Repair" value={stats.needsRepair} icon={AlertTriangle} colorClass="border-red-500" />
      <StatCard title="Under Maintenance" value={stats.underMaintenance} icon={Wrench} colorClass="border-yellow-500" />
      <StatCard title="Upcoming PM (7 days)" value={stats.upcomingPM} icon={CheckCircle} colorClass="border-green-500" />
    </div>
  );
};

export default MaintenanceDashboardTab;