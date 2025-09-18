import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, Users, Target, DollarSign } from 'lucide-react';

const CRMDashboardTab = ({ data }) => {
  const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-1/2 bg-muted-foreground/20 animate-pulse rounded-md"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  const isLoading = !data || Object.keys(data).length === 0;

  const activeDeals = data.deals?.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost') || [];
  const activeDealsValue = activeDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Companies" value={data.companies?.length || 0} icon={Building2} color="border-blue-500" loading={isLoading} />
      <StatCard title="Total Contacts" value={data.contacts?.length || 0} icon={Users} color="border-green-500" loading={isLoading} />
      <StatCard title="Active Deals" value={activeDeals.length} icon={Target} color="border-yellow-500" loading={isLoading} />
      <StatCard title="Total Deal Value (Active)" value={`$${activeDealsValue.toLocaleString()}`} icon={DollarSign} color="border-purple-500" loading={isLoading} />
    </div>
  );
};

export default CRMDashboardTab;