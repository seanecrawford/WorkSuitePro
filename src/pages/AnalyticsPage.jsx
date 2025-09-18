import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Users, DollarSign, Activity, FileText, CheckCircle, TrendingUp, AlertCircle, ShoppingCart, Truck } from 'lucide-react';

const MetricCard = ({ title, value, change, icon, description, status }) => {
  const Icon = icon;
  const changeColor = change && change.startsWith('+') ? 'text-green-400' : 'text-red-400';
  const statusColor = {
    'On Track': 'text-green-400',
    'At Risk': 'text-amber-400',
    'Off Track': 'text-red-400',
  }[status];

  return (
    <Card className="bg-card-alt-themed shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && <p className={`text-xs ${changeColor}`}>{change} from last period</p>}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {status && <p className={`text-xs font-semibold ${statusColor} mt-1`}>Status: {status}</p>}
      </CardContent>
    </Card>
  );
};

const AnalyticsPlaceholder = ({ title, children }) => (
  <Card className="col-span-1 md:col-span-2 shadow-xl">
    <CardHeader>
      <CardTitle className="text-xl text-primary">{title}</CardTitle>
      <CardDescription>Placeholder for detailed {title.toLowerCase()} visualization.</CardDescription>
    </CardHeader>
    <CardContent className="h-64 flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <BarChart className="h-12 w-12 mx-auto mb-2" />
        <p>Detailed chart will be implemented here.</p>
        {children}
      </div>
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Reporting</h1>
        <p className="text-muted-foreground">
          This is a placeholder for the future Analytics page. All data is for demonstration.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Overall Project Health" value="8.2/10" change="+0.5" icon={CheckCircle} description="Based on budget, schedule, and tasks." status="On Track" />
        <MetricCard title="Resource Utilization" value="78%" change="-2%" icon={Users} description="Overall team capacity usage." status="At Risk" />
        <MetricCard title="Budget Variance" value="$-2,450" change="+1,200" icon={DollarSign} description="Cumulative deviation from budget." status="Off Track" />
        <MetricCard title="On-Time Completion Rate" value="89%" change="+4%" icon={Activity} description="Percentage of tasks completed by due date." />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsPlaceholder title="Financial Performance" />
        <AnalyticsPlaceholder title="Task Completion Trends" />
        <AnalyticsPlaceholder title="Team Performance" />
        <AnalyticsPlaceholder title="Risk Analysis" />
        <AnalyticsPlaceholder title="Inventory Turnover" />
        <AnalyticsPlaceholder title="Maintenance Schedule Adherence" />
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mt-8 mb-4">Activity Logs (Placeholder)</h2>
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activities</CardTitle>
            <CardDescription>A log of important events and user actions across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground p-8">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>Activity log functionality will be implemented here.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPage;