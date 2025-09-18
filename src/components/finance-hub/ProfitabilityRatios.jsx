import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const ProfitabilityRatios = () => {
  const [ratios, setRatios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatios = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('financialperformance')
          .select('revenue, expenses, net_income, cost_of_goods_sold');

        if (dbError) throw dbError;

        if (!data || data.length === 0) {
          setRatios({
            grossProfitMargin: 0,
            netProfitMargin: 0,
            operatingMargin: 0,
          });
          return;
        }

        const totals = data.reduce((acc, item) => {
          acc.revenue += item.revenue || 0;
          acc.expenses += item.expenses || 0; 
          acc.net_income += item.net_income || 0;
          acc.cost_of_goods_sold += item.cost_of_goods_sold || 0;
          return acc;
        }, { revenue: 0, expenses: 0, net_income: 0, cost_of_goods_sold: 0 });

        const grossProfit = totals.revenue - totals.cost_of_goods_sold;
        const operatingIncome = grossProfit - (totals.expenses - totals.cost_of_goods_sold); 

        const grossProfitMargin = totals.revenue > 0 ? (grossProfit / totals.revenue) * 100 : 0;
        const netProfitMargin = totals.revenue > 0 ? (totals.net_income / totals.revenue) * 100 : 0;
        const operatingMargin = totals.revenue > 0 ? (operatingIncome / totals.revenue) * 100 : 0;
        
        setRatios({
          grossProfitMargin: grossProfitMargin.toFixed(2),
          netProfitMargin: netProfitMargin.toFixed(2),
          operatingMargin: operatingMargin.toFixed(2),
        });

      } catch (err) {
        setError(err.message || "Failed to fetch profitability ratios.");
        console.error("Error fetching profitability ratios:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRatios();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-4 h-60"><Loader2 className="h-8 w-8 animate-spin text-sky-400" /></div>;
  if (error) return <div className="text-red-500 p-4 flex items-center h-60"><AlertCircle className="mr-2"/> Error: {error}</div>;
  
  const ratioItems = [
    { label: "Net Profit Margin", value: `${ratios?.netProfitMargin || 0}%`, description: "Net Income / Revenue" },
    { label: "Gross Profit Margin", value: `${ratios?.grossProfitMargin || 0}%`, description: "Gross Profit / Revenue" },
    { label: "Operating Margin", value: `${ratios?.operatingMargin || 0}%`, description: "Operating Income / Revenue" },
  ];

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Percent className="mr-2 h-5 w-5 text-sky-400" />
          Profitability Ratios
        </CardTitle>
      </CardHeader>
      <CardContent className="h-60 space-y-4 pt-2">
        {ratios ? ratioItems.map(item => (
          <div key={item.label} className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <p className="text-lg font-semibold text-sky-400">{item.value}</p>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
             <Percent className="w-16 h-16 mb-2 opacity-50" />
            <span>No ratio data available.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfitabilityRatios;