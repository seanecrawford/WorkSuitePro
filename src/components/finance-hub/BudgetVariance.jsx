import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const BudgetVariance = () => {
  const [varianceData, setVarianceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVarianceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, budget, actual_cost');
        if (projectsError) throw projectsError;

        const { data: performance, error: performanceError } = await supabase
            .from('financialperformance')
            .select('projectid, expenses');
        if(performanceError) throw performanceError;

        const projectExpenses = performance.reduce((acc, record) => {
            if(record.projectid) {
                acc[record.projectid] = (acc[record.projectid] || 0) + (record.expenses || 0);
            }
            return acc;
        }, {});

        const formattedData = projects.map(proj => {
          const actualCost = proj.actual_cost > 0 ? proj.actual_cost : (projectExpenses[proj.projectid] || 0);
          const budget = proj.budget || 0;
          const variance = budget - actualCost;
          const variancePercentage = budget > 0 ? (variance / budget) * 100 : 0;
          
          return {
            projectName: proj.projectname || `Project ID ${proj.projectid}`,
            budget: budget,
            actualCost: actualCost,
            variance: variance,
            variancePercentage: variancePercentage.toFixed(2),
          };
        }).sort((a,b) => Math.abs(b.variance) - Math.abs(a.variance));

        setVarianceData(formattedData);
      } catch (err) {
        setError(err.message || "Failed to fetch budget variance data.");
        console.error("Error fetching budget variance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVarianceData();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-4 h-60"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent-finance)]" /></div>;
  if (error) return <div className="text-destructive p-4 flex items-center h-60"><AlertCircle className="mr-2"/> Error: {error}</div>;

  return (
    <Card className="bg-card-themed border-card-themed text-card-themed-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-foreground">
          <HelpCircle className="mr-2 h-5 w-5 text-[var(--theme-accent-finance)]" />
          Project Budget Variance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {varianceData.length > 0 ? (
          <div className="overflow-x-auto h-60">
            <table className="min-w-full text-sm">
              <thead className="bg-table-header-themed">
                <tr className="border-b border-table-cell-themed">
                  <th className="p-2 text-left font-semibold text-table-header-themed">Project</th>
                  <th className="p-2 text-right font-semibold text-table-header-themed">Budget</th>
                  <th className="p-2 text-right font-semibold text-table-header-themed">Actual Cost</th>
                  <th className="p-2 text-right font-semibold text-table-header-themed">Variance</th>
                  <th className="p-2 text-right font-semibold text-table-header-themed">Variance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-cell-themed">
                {varianceData.map((item, index) => (
                  <tr key={index} className="hover-row-themed">
                    <td className="p-2 text-foreground truncate max-w-xs">{item.projectName}</td>
                    <td className="p-2 text-right text-[var(--theme-accent-primary)]">${(item.budget || 0).toLocaleString()}</td>
                    <td className="p-2 text-right text-[var(--theme-accent-tertiary)]">${(item.actualCost || 0).toLocaleString()}</td>
                    <td className={`p-2 text-right ${item.variance >= 0 ? 'text-[var(--theme-accent-green)]' : 'text-[var(--theme-accent-red)]'}`}>
                      ${(item.variance || 0).toLocaleString()}
                    </td>
                     <td className={`p-2 text-right ${parseFloat(item.variancePercentage) >= 0 ? 'text-[var(--theme-accent-green)]' : 'text-[var(--theme-accent-red)]'}`}>
                      {item.variancePercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-muted-foreground p-4">
            <HelpCircle className="w-16 h-16 mb-2 opacity-50" />
            <span>No budget variance data available.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetVariance;