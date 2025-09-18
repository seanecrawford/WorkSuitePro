import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Briefcase, CheckCircle, AlertTriangle, Clock, ListChecks, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const ALL_METRICS_CONFIG = [
  { id: 'totalProjects', label: 'Total Projects', icon: Briefcase, value: 300, unit: '', color: 'text-sky-400', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/30', trend: 5 },
  { id: 'activeProjects', label: 'Active Projects', icon: Zap, value: 45, unit: '', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', trend: 2 },
  { id: 'completionRate', label: 'Project Completion Rate', icon: CheckCircle, value: 12, unit: '%', color: 'text-teal-400', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30', progress: true, trend: 1.5 },
  { id: 'taskCompletion', label: 'Overall Task Completion', icon: ListChecks, value: 48, unit: '%', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30', progress: true, trend: 3.2 },
  { id: 'overBudget', label: 'Projects Over Budget', icon: AlertTriangle, value: 0, unit: '', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', trend: -1 },
  { id: 'overdueTasks', label: 'Critical Overdue Tasks', icon: Clock, value: 5, unit: '', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', trend: 0 },
];

const TrendIndicator = ({ trend }) => {
  if (trend === 0 || trend === undefined || trend === null) return <span className="ml-1.5 text-2xs font-medium text-slate-500">-</span>;
  const isPositive = trend > 0;
  return (
    <span className={`ml-1.5 text-2xs font-medium flex items-center ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
      {isPositive ? '+' : ''}{trend}
    </span>
  );
};

const ProjectMetricsCard = ({ widgetId, config, onConfigChange }) => {
  const [metricsData, setMetricsData] = useState(ALL_METRICS_CONFIG);
  const [visibleMetrics, setVisibleMetrics] = useState(() => {
    const saved = config?.visibleMetrics;
    if (saved) return saved;
    const initialVisible = {};
    ALL_METRICS_CONFIG.forEach(m => initialVisible[m.id] = true);
    return initialVisible;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetricsData(prevData => prevData.map(metric => ({
        ...metric,
        value: Math.max(0, Math.round(metric.value + (Math.random() - 0.5) * (metric.unit === '%' ? 5 : 2))),
        trend: parseFloat(((Math.random() - 0.4) * 3).toFixed(1))
      })));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const displayedMetrics = metricsData.filter(metric => visibleMetrics[metric.id]);

  return (
    <Card className="h-full flex flex-col bg-gradient-to-tr from-slate-900 to-slate-800 shadow-2xl border border-slate-700 rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-3.5 px-5 border-b border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <Briefcase className="h-6 w-6 text-purple-400" />
          <CardTitle className="text-lg font-semibold text-slate-100 tracking-tight">
            {config?.title || 'Project Pulse'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        <ul className="divide-y divide-slate-700/60">
          {displayedMetrics.map((metric, index) => (
            <motion.li
              key={metric.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
              className="p-4 flex items-center justify-between hover:bg-slate-800/70 transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3.5 ${metric.bgColor} border ${metric.borderColor} shadow-md`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <p className="text-sm font-medium text-slate-300">{metric.label}</p>
              </div>
              <div className="flex items-center">
                {metric.progress && (
                  <Progress value={metric.value} className={`h-2 w-20 mr-2.5 ${metric.bgColor?.replace('bg-','bg-opacity-40')} rounded-full`} indicatorClassName={`${metric.bgColor?.replace('/10','')} rounded-full`} />
                )}
                <p className={`text-base font-semibold ${metric.color}`}>
                  {metric.value.toLocaleString()}
                  {metric.unit}
                </p>
                <TrendIndicator trend={metric.trend} />
              </div>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ProjectMetricsCard;