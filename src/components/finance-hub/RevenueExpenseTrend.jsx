import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

const RevenueExpenseTrend = () => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('financialperformance')
          .select('period_end_date, revenue, expenses')
          .order('period_end_date', { ascending: true });

        if (dbError) throw dbError;

        const formattedData = data.map(item => ({
          date: format(new Date(item.period_end_date), 'MMM yyyy'),
          revenue: item.revenue || 0,
          expenses: item.expenses || 0,
        }));
        setTrendData(formattedData);
      } catch (err) {
        setError(err.message || "Failed to fetch trend data.");
        console.error("Error fetching revenue/expense trend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendData();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-4 h-60"><Loader2 className="h-8 w-8 animate-spin text-sky-400" /></div>;
  if (error) return <div className="text-red-500 p-4 flex items-center h-60"><AlertCircle className="mr-2"/> Error: {error}</div>;
  
  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <LineChart className="mr-2 h-5 w-5 text-sky-400" />
          Revenue vs. Expenses Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trendData.length > 0 ? (
          <div className="overflow-x-auto h-60">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-left font-semibold text-muted-foreground">Period</th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">Revenue</th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">Expenses</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((item, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="p-2 text-foreground">{item.date}</td>
                    <td className="p-2 text-right text-green-500">${(item.revenue || 0).toLocaleString()}</td>
                    <td className="p-2 text-right text-red-500">${(item.expenses || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-muted-foreground p-4">
            <LineChart className="w-16 h-16 mb-2 opacity-50" />
            <span>No trend data available.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueExpenseTrend;