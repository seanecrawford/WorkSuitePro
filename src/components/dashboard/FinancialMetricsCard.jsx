import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, Briefcase, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const ALL_METRICS_CONFIG = [
  { id: 'revenue', label: 'Total Revenue', icon: TrendingUp, value: 537370.80, currency: true, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', trend: 7.2 },
  { id: 'cogs', label: 'Cost of Goods Sold', icon: TrendingDown, value: 71390.90, currency: true, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', trend: -2.1 },
  { id: 'opExpenses', label: 'Operating Expenses', icon: TrendingDown, value: 144767.80, currency: true, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', trend: 1.5 },
  { id: 'netProfit', label: 'Net Profit', icon: DollarSign, value: 321212.03, currency: true, color: 'text-sky-400', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/30', isKeyMetric: true, trend: 12.5 },
  { id: 'avgRevPerProj', label: 'Avg. Revenue/Project', icon: Briefcase, value: 1791.23, currency: true, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', trend: 0.8 },
  { id: 'opExRatio', label: 'Operational Expense Ratio', icon: Percent, value: 26.9, currency: false, unit: '%', color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30', trend: -0.5 },
];

const TrendIndicator = ({ trend }) => {
  if (trend === 0 || trend === undefined || trend === null) return null;
  const isPositive = trend > 0;
  return (
    <span className={`ml-1.5 text-2xs font-medium flex items-center ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
      {Math.abs(trend)}%
    </span>
  );
};

const FinancialMetricsCard = ({ widgetId, config, onConfigChange }) => {
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
        value: metric.value * (1 + (Math.random() - 0.5) * 0.02), 
        trend: parseFloat(((Math.random() - 0.45) * 5).toFixed(1)) 
      })));
    }, 7000);
    return () => clearInterval(interval);
  }, []);
  
  const displayedMetrics = metricsData.filter(metric => visibleMetrics[metric.id]);

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl border border-slate-700 rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-3.5 px-5 border-b border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <Activity className="h-6 w-6 text-sky-400" />
          <CardTitle className="text-lg font-semibold text-slate-100 tracking-tight">
            {config?.title || 'Financial Snapshot'}
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
              className={`p-4 flex items-center justify-between hover:bg-slate-800/70 transition-colors duration-200 ${metric.isKeyMetric ? 'bg-sky-500/5' : ''}`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3.5 ${metric.bgColor} border ${metric.borderColor} shadow-md`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{metric.label}</p>
                  {metric.label === 'Operational Expense Ratio' && (
                     <Progress value={metric.value} className="h-1.5 w-28 mt-1.5 bg-pink-500/20" indicatorClassName="bg-pink-400" />
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-semibold ${metric.color}`}>
                  {metric.currency ? '$' : ''}
                  {metric.value.toLocaleString(undefined, { minimumFractionDigits: metric.currency ? 2 : 1, maximumFractionDigits: metric.currency ? 2 : 1 })}
                  {metric.unit || ''}
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

export default FinancialMetricsCard;