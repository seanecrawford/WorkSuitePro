import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogBody } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, PlusCircle } from 'lucide-react';
import ProjectDataForm from './ProjectDataForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from 'date-fns';

const BudgetCostsTab = ({ project, integerProjectId }) => {
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [expensesError, setExpensesError] = useState(null);
  const { toast } = useToast();
  
  const currentProjectId = integerProjectId; 
  const projectName = project?.projectname;

  const fetchExpenses = useCallback(async () => {
    if (!currentProjectId) {
      setExpenses([]);
      setLoadingExpenses(false);
      return;
    }
    setLoadingExpenses(true);
    setExpensesError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('expenses')
        .select('*')
        .eq('projectid', currentProjectId) 
        .order('expensedate', { ascending: false });
      if (dbError) throw dbError;
      setExpenses(data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpensesError(err.message || "Failed to fetch expenses.");
      toast({ variant: "destructive", title: "Error Loading Expenses", description: err.message });
    } finally {
      setLoadingExpenses(false);
    }
  }, [toast, currentProjectId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, currentProjectId]);

  const budgetItemFormFields = [
    { name: 'description', label: 'Item Name/Description', type: 'text', required: true, placeholder: 'e.g., Software License, Travel Expense' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Software, Hardware, Personnel, Travel' },
    { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: 'Enter expense amount' },
    { name: 'expensedate', label: 'Expense Date', type: 'date', required: true, placeholder: 'Select date of expense' },
    { name: 'vendor', label: 'Vendor', type: 'text', placeholder: 'Enter vendor name (optional)' },
  ];

  const handleNewItemSubmit = async (formData) => {
    if (!currentProjectId) {
      toast({ variant: "destructive", title: "Error", description: "No project selected." });
      return;
    }
    setFormIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        projectid: currentProjectId, 
        amount: parseFloat(formData.amount),
      };

      const { data, error: insertError } = await supabase
        .from('expenses') 
        .insert([submissionData])
        .select();

      if (insertError) throw insertError;

      toast({ title: "Expense Item Added", description: `Item "${formData.description}" has been successfully added.` });
      setShowNewItemDialog(false);
      fetchExpenses();
    } catch (err) {
      console.error("Error adding budget item:", err);
      const errorMessage = err.message || "Failed to add budget item.";
      toast({ variant: "destructive", title: "Error Adding Item", description: errorMessage });
    } finally {
      setFormIsLoading(false);
    }
  };
  
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString; 
    }
  };

  return (
    <Card className="bg-card border-border text-foreground">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-accent-foreground">Budget & Costs for: <span className="text-primary">{projectName || "Selected Project"}</span></CardTitle>
          <CardDescription className="text-muted-foreground">Track expenses and manage financial performance for this project.</CardDescription>
        </div>
        <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-accent-foreground">Add New Expense for {projectName}</DialogTitle>
              <DialogDescription className="text-muted-foreground">Fill in the details for the new expense.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <ProjectDataForm
                fields={budgetItemFormFields}
                initialData={{ projectid: currentProjectId }} 
                onSubmit={handleNewItemSubmit}
                isLoading={formIsLoading}
                submitButtonText="Add Expense"
                onCancel={() => setShowNewItemDialog(false)}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loadingExpenses && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        {!loadingExpenses && expensesError && <div className="text-destructive p-4 bg-destructive/10 border border-destructive/30 rounded-md flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/>{expensesError}</div>}
        {!loadingExpenses && !expensesError && expenses.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No expenses found for this project. Click "Add Expense Item" to log one.</p>
        )}
        {!loadingExpenses && !expensesError && expenses.length > 0 && (
          <>
            <div className="mb-4 p-4 bg-card-alt rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-accent-foreground mb-2">Project Budget Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Budget Amount:</p>
                  <p className="text-xl font-bold text-[var(--theme-success)]">${project?.budget ? project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Actual Cost:</p>
                   <p className="text-xl font-bold text-[var(--theme-destructive)]">${project?.actual_cost ? project.actual_cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining Budget:</p>
                  <p className="text-xl font-bold text-[var(--theme-warning)]">
                    {project?.budget && project?.actual_cost !== null && project?.actual_cost !== undefined ? 
                      `${(project.budget - project.actual_cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <h4 className="text-md font-semibold text-accent-foreground mb-3 mt-6">Expense Log</h4>
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <TableHeader className="bg-table-header-themed">
                  <TableRow className="border-table-cell-themed">
                    <TableHead className="text-table-header-themed">Description</TableHead>
                    <TableHead className="text-table-header-themed">Category</TableHead>
                    <TableHead className="text-table-header-themed">Amount</TableHead>
                    <TableHead className="text-table-header-themed">Date</TableHead>
                    <TableHead className="text-table-header-themed">Vendor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.expense_uid} className="border-table-cell-themed hover-row-themed">
                      <TableCell className="font-medium text-foreground">{expense.description}</TableCell>
                      <TableCell className="text-muted-foreground">{expense.category}</TableCell>
                      <TableCell className="text-muted-foreground">${expense.amount ? expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDateDisplay(expense.expensedate)}</TableCell>
                      <TableCell className="text-muted-foreground">{expense.vendor || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetCostsTab;