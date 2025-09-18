import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogBody } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, PlusCircle, Eye } from 'lucide-react';
import ProjectDataForm from './ProjectDataForm';
import { format, parseISO } from 'date-fns';


const RiskManagementTab = ({ integerProjectId, projectName }) => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewRiskDialog, setShowNewRiskDialog] = useState(false);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const { toast } = useToast();

  const currentProjectId = integerProjectId; 

  const fetchRisks = useCallback(async () => {
    if (!currentProjectId) {
      setRisks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('riskmanagementplans')
        .select('risk_uid, projectid, description, category, probability, impact, status, identified_date, resolution_date, mitigation_plan, contingency_plan')
        .eq('projectid', currentProjectId) 
        .order('identified_date', { ascending: false });
      if (dbError) throw dbError;
      setRisks(data || []);
    } catch (err) {
      console.error("Error fetching risks:", err);
      const errorMessage = err.message || "Failed to fetch risks.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Error Loading Risks", description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [toast, currentProjectId]);
  

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks, currentProjectId]);

  const riskFormFields = [
    { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the risk' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Technical, Financial, Operational' },
    { name: 'probability', label: 'Probability', type: 'select', options: [
        { value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }
      ], placeholder: 'Select probability'
    },
    { name: 'impact', label: 'Impact', type: 'select', options: [
        { value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }
      ], placeholder: 'Select impact'
    },
    { name: 'status', label: 'Status', type: 'select', options: [
        { value: 'Open', label: 'Open' }, { value: 'Mitigated', label: 'Mitigated' }, { value: 'Closed', label: 'Closed' }, { value: 'Accepted', label: 'Accepted' }
      ], placeholder: 'Select status', defaultValue: 'Open'
    },
    { name: 'mitigation_plan', label: 'Mitigation Plan', type: 'textarea', placeholder: 'Describe the mitigation plan' },
    { name: 'contingency_plan', label: 'Contingency Plan', type: 'textarea', placeholder: 'Describe the contingency plan' },
    { name: 'identified_date', label: 'Identified Date', type: 'date', required: true, placeholder: 'Select date' },
    { name: 'resolution_date', label: 'Resolution Date', type: 'date', placeholder: 'Select date (if resolved)' },
  ];

  const handleNewRiskSubmit = async (formData) => {
    if (!currentProjectId) {
      toast({ variant: "destructive", title: "Error", description: "No project selected." });
      return;
    }
    setFormIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        projectid: currentProjectId 
      };

      const { data, error: insertError } = await supabase
        .from('riskmanagementplans')
        .insert([submissionData])
        .select();

      if (insertError) throw insertError;

      toast({ title: "Risk Added", description: `Risk "${formData.description.substring(0,30)}..." has been successfully added.` });
      setShowNewRiskDialog(false);
      fetchRisks(); 
    } catch (err) {
      console.error("Error adding risk:", err);
      const errorMessage = err.message || "Failed to add risk.";
      toast({ variant: "destructive", title: "Error Adding Risk", description: errorMessage });
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

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error && !risks.length) return <div className="text-destructive p-4 bg-destructive/10 border border-destructive/30 rounded-md flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/>{error}</div>;

  return (
    <Card className="bg-card border-border text-foreground">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-accent-foreground">Risk Register for: <span className="text-primary">{projectName || "Selected Project"}</span></CardTitle>
          <CardDescription className="text-muted-foreground">Identified risks for this project.</CardDescription>
        </div>
        <Dialog open={showNewRiskDialog} onOpenChange={setShowNewRiskDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Risk
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-accent-foreground">Add New Risk for {projectName}</DialogTitle>
              <DialogDescription className="text-muted-foreground">Fill in the details for the new risk.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <ProjectDataForm
                fields={riskFormFields}
                initialData={{ projectid: currentProjectId }}
                onSubmit={handleNewRiskSubmit}
                isLoading={formIsLoading}
                submitButtonText="Add Risk"
                onCancel={() => setShowNewRiskDialog(false)}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 text-destructive p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/>{error}</div>}
        {risks.length === 0 && !loading ? (
          <p className="text-muted-foreground text-center py-8">No risks identified for this project. Click "Add Risk" to log one.</p>
        ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader className="bg-table-header-themed">
              <TableRow className="border-table-cell-themed">
                <TableHead className="text-table-header-themed">Description</TableHead>
                <TableHead className="text-table-header-themed">Category</TableHead>
                <TableHead className="text-table-header-themed">Probability</TableHead>
                <TableHead className="text-table-header-themed">Impact</TableHead>
                <TableHead className="text-table-header-themed">Status</TableHead>
                <TableHead className="text-table-header-themed">Identified</TableHead>
                <TableHead className="text-center text-table-header-themed">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk) => (
                <TableRow key={risk.risk_uid} className="border-table-cell-themed hover-row-themed">
                  <TableCell className="max-w-xs truncate text-foreground">{risk.description}</TableCell>
                  <TableCell className="text-muted-foreground">{risk.category}</TableCell>
                  <TableCell className="text-muted-foreground">{risk.probability}</TableCell>
                  <TableCell className="text-muted-foreground">{risk.impact}</TableCell>
                  <TableCell className="text-muted-foreground">{risk.status}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateDisplay(risk.identified_date)}</TableCell>
                  <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="text-accent-foreground hover:text-primary hover:bg-accent">
                        <Eye className="h-4 w-4" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskManagementTab;