import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const ExpenseByCategory = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('expenses')
          .select('category, amount');

        if (dbError) throw dbError;

        const groupedExpenses = data.reduce((acc, expense) => {
          const category = expense.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + (expense.amount || 0);
          return acc;
        }, {});
        
        const formattedData = Object.entries(groupedExpenses)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount);

        setExpenseData(formattedData);
      } catch (err) {
        setError(err.message || "Failed to fetch expense by category.");
        console.error("Error fetching expense by category:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenseData();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-4 h-60"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent-finance)]" /></div>;
  if (error) return <div className="text-destructive p-4 flex items-center h-60"><AlertCircle className="mr-2"/> Error: {error}</div>;

  return (
    <Card className="bg-card-themed border-card-themed text-card-themed-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-foreground">
          <PieChart className="mr-2 h-5 w-5 text-[var(--theme-accent-finance)]" />
          Expense by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenseData.length > 0 ? (
          <div className="overflow-y-auto h-60">
            <ul className="space-y-2">
              {expenseData.map((item, index) => (
                <li key={index} className="flex justify-between items-center p-2 rounded-md hover-row-themed">
                  <span className="text-sm text-foreground">{item.category}</span>
                  <span className="text-sm font-semibold text-[var(--theme-accent-red)]">${(item.amount || 0).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center text-muted-foreground p-4">
            <PieChart className="w-16 h-16 mb-2 opacity-50" />
            <span>No expense category data available.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseByCategory;