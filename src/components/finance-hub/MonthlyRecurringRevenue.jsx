import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { format, startOfMonth } from 'date-fns';


const MonthlyRecurringRevenue = () => {
  const [mrrData, setMrrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMrrData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('financialperformance')
          .select('period_end_date, revenue')
          .order('period_end_date', { ascending: true });

        if (dbError) throw dbError;

        const monthlyRevenue = data.reduce((acc, item) => {
          const monthKey = format(startOfMonth(new Date(item.period_end_date)), 'yyyy-MM');
          acc[monthKey] = (acc[monthKey] || 0) + (item.revenue || 0);
          return acc;
        }, {});
        
        const formattedData = Object.entries(monthlyRevenue)
          .map(([monthKey, revenue]) => ({
            month: format(new Date(monthKey + '-01'), 'MMM yyyy'), 
            revenue: revenue,
          }))
          .sort((a,b) => new Date(a.month.split(" ")[1], ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(a.month.split(" ")[0])) - new Date(b.month.split(" ")[1], ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(b.month.split(" ")[0])));


        setMrrData(formattedData);
      } catch (err) {
        setError(err.message || "Failed to fetch MRR data.");
        console.error("Error fetching MRR data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMrrData();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-4 h-60"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent-finance)]" /></div>;
  if (error) return <div className="text-destructive p-4 flex items-center h-60"><AlertCircle className="mr-2"/> Error: {error}</div>;

  return (
    <Card className="bg-card-themed border-card-themed text-card-themed-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-foreground">
          <TrendingUp className="mr-2 h-5 w-5 text-[var(--theme-accent-finance)]" />
          Monthly Revenue Trend (MRR Proxy)
        </CardTitle>
      </CardHeader>
      <CardContent>
      {mrrData.length > 0 ? (
          <div className="overflow-x-auto h-60">
            <table className="min-w-full text-sm">
              <thead className="bg-table-header-themed">
                <tr className="border-b border-table-cell-themed">
                  <th className="p-2 text-left font-semibold text-table-header-themed">Month</th>
                  <th className="p-2 text-right font-semibold text-table-header-themed">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-cell-themed">
                {mrrData.map((item, index) => (
                  <tr key={index} className="hover-row-themed">
                    <td className="p-2 text-foreground">{item.month}</td>
                    <td className="p-2 text-right text-[var(--theme-accent-green)]">${(item.revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-muted-foreground p-4">
            <TrendingUp className="w-16 h-16 mb-2 opacity-50" />
            <span>No monthly revenue data available.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyRecurringRevenue;