import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

const ForecastActualRevenue = () => {
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: forecasts, error: forecastError } = await supabase
          .from('financial_forecasts')
          .select('forecast_period, projected_revenue, period_description');
        if (forecastError) throw forecastError;

        const { data: actuals, error: actualsError } = await supabase
          .from('financialperformance')
          .select('period_end_date, revenue');
        if (actualsError) throw actualsError;

        const combinedData = forecasts.map(forecast => {
          const forecastDate = new Date(forecast.forecast_period);
          const forecastMonthYear = format(forecastDate, 'yyyy-MM');
          
          const relevantActuals = actuals.filter(actual => {
            const actualDate = new Date(actual.period_end_date);
            return format(actualDate, 'yyyy-MM') === forecastMonthYear;
          });
          
          const totalActualRevenue = relevantActuals.reduce((sum, item) => sum + (item.revenue || 0), 0);
          
          return {
            period: forecast.period_description || format(forecastDate, 'MMM yyyy'),
            projected: forecast.projected_revenue || 0,
            actual: totalActualRevenue,
            variance: totalActualRevenue - (forecast.projected_revenue || 0),
          };
        }).sort((a,b) => new Date(a.period) - new Date(b.period));


        setComparisonData(combinedData);
      } catch (err) {
        setError(err.message || "Failed to fetch forecast vs actual revenue.");
        console.error("Error fetching forecast vs actual revenue:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparisonData();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-4 h-60"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent-finance)]" /></div>;
  if (error) return <div className="text-destructive p-4 flex items-center h-60"><AlertCircle className="mr-2"/> Error: {error}</div>;

  return (
    <Card className="bg-card-themed border-card-themed text-card-themed-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-foreground">
          <Target className="mr-2 h-5 w-5 text-[var(--theme-accent-finance)]" />
          Forecasted vs. Actual Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {comparisonData.length > 0 ? (
           <div className="overflow-x-auto h-60">
            <table className="min-w-full text-sm">
              <thead className="bg-table-header-themed">
                <tr className="border-b border-table-cell-themed">
                  <th className="p-2 text-left font-semibold text-table-header-themed">Period</th>
                  <th className="p-2 text-right font-semibold text-table-header-themed">Projected</th>
                  <th className="p-2 text-right font-semibold text-table-header-themed">Actual</th>
                  <th className="p-2 text-right font-semibold text-table-header-themed">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-cell-themed">
                {comparisonData.map((item, index) => (
                  <tr key={index} className="hover-row-themed">
                    <td className="p-2 text-foreground">{item.period}</td>
                    <td className="p-2 text-right text-[var(--theme-accent-primary)]">${(item.projected || 0).toLocaleString()}</td>
                    <td className="p-2 text-right text-[var(--theme-accent-green)]">${(item.actual || 0).toLocaleString()}</td>
                    <td className={`p-2 text-right ${item.variance >= 0 ? 'text-[var(--theme-accent-green)]' : 'text-[var(--theme-accent-red)]'}`}>
                      ${(item.variance || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-muted-foreground p-4">
            <Target className="w-16 h-16 mb-2 opacity-50" />
            <span>No forecast comparison data available.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastActualRevenue;