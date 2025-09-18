import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const RevenueByStream = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('revenue_streams')
          .select('stream_name, actual_revenue_ytd')
          .order('actual_revenue_ytd', { ascending: false });

        if (dbError) throw dbError;
        
        setRevenueData(data.map(item => ({
          name: item.stream_name,
          revenue: item.actual_revenue_ytd || 0,
        })));
      } catch (err) {
        setError(err.message || "Failed to fetch revenue by stream.");
        console.error("Error fetching revenue by stream:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueData();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-4 h-60"><Loader2 className="h-8 w-8 animate-spin text-sky-400" /></div>;
  if (error) return <div className="text-red-500 p-4 flex items-center h-60"><AlertCircle className="mr-2"/> Error: {error}</div>;

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BarChart className="mr-2 h-5 w-5 text-sky-400" />
          Revenue by Stream/Project (YTD)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {revenueData.length > 0 ? (
          <div className="overflow-y-auto h-60">
            <ul className="space-y-2">
              {revenueData.map((item, index) => (
                <li key={index} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/20">
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-sm font-semibold text-green-500">${(item.revenue || 0).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-muted-foreground p-4">
            <BarChart className="w-16 h-16 mb-2 opacity-50" />
            <span>No revenue stream data available.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueByStream;