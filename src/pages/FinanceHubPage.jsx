import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Percent, Layers, Loader2, AlertCircle, FileSpreadsheet, ShieldCheck, Activity, Banknote, Brain, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

import RevenueExpenseTrend from '@/components/finance-hub/RevenueExpenseTrend';
import ProfitabilityRatios from '@/components/finance-hub/ProfitabilityRatios';
import RevenueByStream from '@/components/finance-hub/RevenueByStream';
import MonthlyRecurringRevenue from '@/components/finance-hub/MonthlyRecurringRevenue';
import ExpenseByCategory from '@/components/finance-hub/ExpenseByCategory';
import TopVendorSpend from '@/components/finance-hub/TopVendorSpend';
import ForecastActualRevenue from '@/components/finance-hub/ForecastActualRevenue';
import BudgetVariance from '@/components/finance-hub/BudgetVariance';

const FeaturePlaceholderCard = ({ title, description, icon: Icon, phase, className = "" }) => (
  <Card className={`bg-card-alt-themed shadow-lg hover:shadow-[var(--theme-accent-finance)]/20 transition-shadow duration-300 ${className}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-[var(--theme-accent-finance)]" />
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-muted-foreground mb-3 text-sm">{description}</CardDescription>
      <div className="text-xs text-[var(--theme-accent-finance)]/80 font-medium bg-[var(--theme-accent-finance)]/20 px-2 py-1 rounded-full inline-block">
        Coming in {phase}
      </div>
    </CardContent>
  </Card>
);


const FinancialSummary = ({ data, loading, error }) => {
  if (loading) return <div className="flex justify-center items-center p-4"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent-finance)]" /></div>;
  if (error) return <div className="text-destructive p-4 flex items-center"><AlertCircle className="mr-2"/> Error: {error}</div>;
  if (!data) return <div className="p-4 text-center text-muted-foreground">No summary data available.</div>;

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0);

  const metrics = [
    { label: "Total Revenue", value: formatCurrency(data.totalRevenue), icon: <TrendingUp className="text-[var(--theme-accent-green)]" />, description: "Sum of all revenue recorded." },
    { label: "Total Expenses", value: formatCurrency(data.totalExpenses), icon: <TrendingDown className="text-[var(--theme-accent-red)]" />, description: "Sum of all expenses." },
    { label: "Net Profit", value: formatCurrency(data.netProfit), icon: <DollarSign className={data.netProfit >= 0 ? "text-[var(--theme-accent-green)]" : "text-[var(--theme-accent-red)]"} />, description: "Revenue minus expenses." },
    { label: "Profit Margin", value: `${data.profitMargin ? data.profitMargin.toFixed(2) : '0.00'}%`, icon: <Percent className="text-[var(--theme-accent-primary)]" />, description: "(Net Profit / Revenue) * 100." },
    { label: "Avg. Project Budget", value: formatCurrency(data.avgBudget), icon: <Layers className="text-[var(--theme-accent-purple)]" />, description: "Average budget across all projects." },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, staggerChildren: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
    >
      {metrics.map(metric => (
        <motion.div key={metric.label} variants={{hidden: {opacity:0, y:20}, visible: {opacity:1, y:0}}}>
        <Card className="bg-card-themed hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
            {React.cloneElement(metric.icon, { className: `h-5 w-5 ${metric.icon.props.className}`})}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            <p className="text-xs text-muted-foreground pt-1">{metric.description}</p>
          </CardContent>
        </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

const FinanceHubPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFinancialSummary = async () => {
      setLoadingSummary(true);
      setSummaryError(null);
      try {
        const { data: performanceData, error: performanceError } = await supabase
          .from('financialperformance')
          .select('revenue, expenses, net_income');

        if (performanceError) throw performanceError;

        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('budget');
        
        if (projectsError) throw projectsError;

        let totalRevenue = 0;
        let totalExpenses = 0;
        let netProfit = 0;

        (performanceData || []).forEach(item => {
          totalRevenue += item.revenue || 0;
          totalExpenses += item.expenses || 0; 
          netProfit += item.net_income || 0;
        });

        let totalBudget = 0;
        (projectsData || []).forEach(proj => {
          totalBudget += proj.budget || 0;
        });
        const avgBudget = (projectsData || []).length > 0 ? totalBudget / projectsData.length : 0;
        
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        setSummaryData({
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          avgBudget
        });

      } catch (error) {
        console.error("Error fetching financial summary:", error);
        setSummaryError(error.message || "Failed to fetch summary data.");
        toast({
          title: "Error",
          description: `Failed to load financial summary: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchFinancialSummary();
  }, [toast]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const phase2Features = [
    { title: "Contract Management", description: "Tools for managing contracts, lifecycles, and obligations using structured templates.", icon: FileSpreadsheet, phase: "Phase 2" },
    { title: "Compliance Tracking", description: "Track regulatory compliance and internal policies with automated checks and reporting.", icon: ShieldCheck, phase: "Phase 2" },
    { title: "Advanced Budget Forecasting", description: "Detailed budget forecasting models with scenario analysis and variance tracking.", icon: Activity, phase: "Phase 2" },
    { title: "Granular Expense Tracking", description: "In-depth expense tracking, categorization, and approval workflows.", icon: Banknote, phase: "Phase 2" },
    { title: "Financial Risk Modeling", description: "AI-powered financial risk modeling with automated reports and mitigation suggestions.", icon: Brain, phase: "Phase 2" },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6"
    >
      <header className="mb-6 flex items-center gap-3">
        <Briefcase className="h-8 w-8 text-[var(--theme-accent-finance)]" />
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance Hub</h1>
            <p className="text-muted-foreground">Centralized dashboard for financial insights and analysis.</p>
        </div>
      </header>

      <FinancialSummary data={summaryData} loading={loadingSummary} error={summaryError} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="tabs-finance grid w-full grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Deep Dive</TabsTrigger>
          <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts & Actuals</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div variants={pageVariants} className="grid md:grid-cols-2 gap-6">
            <RevenueExpenseTrend />
            <ProfitabilityRatios />
          </motion.div>
        </TabsContent>

        <TabsContent value="revenue">
           <motion.div variants={pageVariants} className="grid md:grid-cols-2 gap-6">
            <RevenueByStream />
            <MonthlyRecurringRevenue />
          </motion.div>
        </TabsContent>

        <TabsContent value="expenses">
          <motion.div variants={pageVariants} className="grid md:grid-cols-2 gap-6">
            <ExpenseByCategory />
            <TopVendorSpend />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="forecasts">
          <motion.div variants={pageVariants} className="grid md:grid-cols-2 gap-6">
            <ForecastActualRevenue />
            <BudgetVariance />
          </motion.div>
        </TabsContent>

        <TabsContent value="advanced">
          <motion.div variants={pageVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-1">Upcoming Financial Tools</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                Enhance your financial operations with these powerful features, scheduled for Phase 2.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {phase2Features.map(feature => (
                <FeaturePlaceholderCard 
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  phase={feature.phase}
                />
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
      
      <footer className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Financial data is sourced from relevant Supabase tables.
        </p>
      </footer>
    </motion.div>
  );
};

export default FinanceHubPage;