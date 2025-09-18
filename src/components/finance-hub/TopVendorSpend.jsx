import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const TopVendorSpend = () => {
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('expenses')
          .select('vendor, amount');

        if (dbError) throw dbError;

        const groupedVendors = data.reduce((acc, expense) => {
          const vendor = expense.vendor || 'Unknown Vendor';
          acc[vendor] = (acc[vendor] || 0) + (expense.amount || 0);
          return acc;
        }, {});
        
        const formattedData = Object.entries(groupedVendors)
          .map(([vendor, amount]) => ({ vendor, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10); // Top 10 vendors

        setVendorData(formattedData);
      } catch (err) {
        setError(err.message || "Failed to fetch top vendor spend.");
        console.error("Error fetching top vendor spend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-4 h-60"><Loader2 className="h-8 w-8 animate-spin text-sky-400" /></div>;
  if (error) return <div className="text-red-500 p-4 flex items-center h-60"><AlertCircle className="mr-2"/> Error: {error}</div>;

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <TrendingDown className="mr-2 h-5 w-5 text-sky-400" />
          Top Vendor Spend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vendorData.length > 0 ? (
          <div className="overflow-y-auto h-60">
            <ul className="space-y-2">
              {vendorData.map((item, index) => (
                <li key={index} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/20">
                  <span className="text-sm text-foreground">{item.vendor}</span>
                  <span className="text-sm font-semibold text-red-500">${(item.amount || 0).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-muted-foreground p-4">
            <TrendingDown className="w-16 h-16 mb-2 opacity-50" />
            <span>No vendor spend data available.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopVendorSpend;