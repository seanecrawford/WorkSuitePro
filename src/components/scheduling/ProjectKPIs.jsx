import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, DollarSign, Loader2, BarChartHorizontalBig } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectKPIs = () => {
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKpiData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: performanceData, error: performanceError } = await supabase
          .from('project_performance')
          .select(`
            projectid, 
            reporting_period, 
            earned_value, 
            planned_value, 
            actual_cost_perf, 
            schedule_variance, 
            cost_variance, 
            spi, 
            cpi,
            projects ( projectname, startdate, enddate, status, budget )
          `)
          .order('reporting_period', { ascending: false });

        if (performanceError) throw performanceError;
        
        const latestPerformanceByProject = performanceData.reduce((acc, record) => {
          if (!acc[record.projectid] || new Date(record.reporting_period) > new Date(acc[record.projectid].reporting_period)) {
            acc[record.projectid] = record;
          }
          return acc;
        }, {});

        setKpiData(Object.values(latestPerformanceByProject));

      } catch (err) {
        console.error('Error fetching project KPI data:', err);
        setError(err.message || 'Failed to fetch KPI data.');
      } finally {
        setLoading(false);
      }
    };

    fetchKpiData();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatNumber = (num, digits = 2) => {
    if (num === null || num === undefined) return 'N/A';
    return parseFloat(num).toFixed(digits);
  };
  
  const getStatusColor = (value, thresholdGood = 1, thresholdBad = 0.9) => {
    if (value === null || value === undefined) return 'text-slate-400';
    if (value >= thresholdGood) return 'text-green-400';
    if (value < thresholdBad) return 'text-red-400';
    return 'text-yellow-400';
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/70 border-slate-700/60 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <BarChartHorizontalBig className="h-6 w-6 mr-2 text-sky-400" />
            Project Schedule & Cost KPIs
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">Loading Key Performance Indicators...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-800/30 border-red-700/50 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <AlertCircle className="h-6 w-6 mr-2 text-red-400" />
            Error Loading KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-200">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (kpiData.length === 0) {
    return (
       <Card className="bg-slate-800/70 border-slate-700/60 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <BarChartHorizontalBig className="h-6 w-6 mr-2 text-sky-400" />
            Project Schedule & Cost KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">No project performance data available to display KPIs.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-slate-800/70 border-slate-700/60 text-white shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <BarChartHorizontalBig className="h-6 w-6 mr-2 text-sky-400" />
            Project Schedule & Cost KPIs
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Latest performance indicators for active projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/30">
                  <TableHead className="text-slate-300">Project</TableHead>
                  <TableHead className="text-slate-300 text-right">PV</TableHead>
                  <TableHead className="text-slate-300 text-right">EV</TableHead>
                  <TableHead className="text-slate-300 text-right">AC</TableHead>
                  <TableHead className="text-slate-300 text-right">SV</TableHead>
                  <TableHead className="text-slate-300 text-right">CV</TableHead>
                  <TableHead className="text-slate-300 text-center">SPI</TableHead>
                  <TableHead className="text-slate-300 text-center">CPI</TableHead>
                  <TableHead className="text-slate-300 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpiData.map((item) => (
                  <TableRow key={item.projectid} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="font-medium text-slate-100 py-3">
                      {item.projects?.projectname || `Project ID: ${item.projectid}`}
                      <p className="text-xs text-slate-400">Budget: {formatCurrency(item.projects?.budget)}</p>
                    </TableCell>
                    <TableCell className="text-right text-slate-200 py-3">{formatCurrency(item.planned_value)}</TableCell>
                    <TableCell className="text-right text-slate-200 py-3">{formatCurrency(item.earned_value)}</TableCell>
                    <TableCell className="text-right text-slate-200 py-3">{formatCurrency(item.actual_cost_perf)}</TableCell>
                    <TableCell className={`text-right font-semibold py-3 ${getStatusColor(item.schedule_variance, 0, -0.01)}`}>
                      {formatCurrency(item.schedule_variance)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold py-3 ${getStatusColor(item.cost_variance, 0, -0.01)}`}>
                      {formatCurrency(item.cost_variance)}
                    </TableCell>
                    <TableCell className={`text-center font-semibold py-3 ${getStatusColor(item.spi)}`}>
                      {formatNumber(item.spi)}
                      {item.spi >= 1 ? <TrendingUp className="inline ml-1 h-4 w-4 text-green-400" /> : item.spi < 0.9 ? <TrendingDown className="inline ml-1 h-4 w-4 text-red-400" /> : <Clock className="inline ml-1 h-4 w-4 text-yellow-400" />}
                    </TableCell>
                    <TableCell className={`text-center font-semibold py-3 ${getStatusColor(item.cpi)}`}>
                      {formatNumber(item.cpi)}
                      {item.cpi >= 1 ? <TrendingUp className="inline ml-1 h-4 w-4 text-green-400" /> : item.cpi < 0.9 ? <TrendingDown className="inline ml-1 h-4 w-4 text-red-400" /> : <DollarSign className="inline ml-1 h-4 w-4 text-yellow-400" />}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.projects?.status === 'Completed' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                        item.projects?.status === 'In Progress' || item.projects?.status === 'Active' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50' :
                        item.projects?.status === 'On Hold' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                        'bg-slate-600/30 text-slate-300 border border-slate-500/50'
                      }`}>
                        {item.projects?.status || 'Unknown'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectKPIs;