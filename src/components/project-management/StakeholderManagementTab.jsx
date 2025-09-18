import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogBody } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, PlusCircle, Eye } from 'lucide-react';
import ProjectDataForm from './ProjectDataForm';

const StakeholderManagementTab = ({ integerProjectId, projectName }) => {
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewStakeholderDialog, setShowNewStakeholderDialog] = useState(false);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const { toast } = useToast();

  const currentProjectId = integerProjectId; 

  const fetchStakeholders = useCallback(async () => {
    if (!currentProjectId) {
      setStakeholders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('stakeholders') 
        .select('stakeholder_uid, projectid, name, role_in_project, contact_email, influence_level, interest_level, engagement_strategy')
        .eq('projectid', currentProjectId) 
        .order('name');
      if (dbError) throw dbError;
      setStakeholders(data || []);
    } catch (err) {
      console.error("Error fetching stakeholders:", err);
      const errorMessage = err.message || "Failed to fetch stakeholders.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Error Loading Stakeholders", description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [toast, currentProjectId]);


  useEffect(() => {
    fetchStakeholders();
  }, [fetchStakeholders, currentProjectId]);

  const stakeholderFormFields = [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter stakeholder name' },
    { name: 'role_in_project', label: 'Role in Project', type: 'text', placeholder: 'e.g., Sponsor, Team Lead' },
    { name: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'Enter email address' },
    { name: 'influence_level', label: 'Influence Level', type: 'select', options: [
        { value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }
      ], placeholder: 'Select influence level'
    },
    { name: 'interest_level', label: 'Interest Level', type: 'select', options: [
        { value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }
      ], placeholder: 'Select interest level'
    },
    { name: 'engagement_strategy', label: 'Engagement Strategy', type: 'textarea', placeholder: 'Describe engagement strategy' },
  ];

  const handleNewStakeholderSubmit = async (formData) => {
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
        .from('stakeholders')
        .insert([submissionData])
        .select();

      if (insertError) throw insertError;

      toast({ title: "Stakeholder Added", description: `Stakeholder "${formData.name}" has been successfully added.` });
      setShowNewStakeholderDialog(false);
      fetchStakeholders(); 
    } catch (err) {    
      console.error("Error adding stakeholder:", err);
      const errorMessage = err.message || "Failed to add stakeholder.";
      toast({ variant: "destructive", title: "Error Adding Stakeholder", description: errorMessage });
    } finally {
      setFormIsLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error && !stakeholders.length) return <div className="text-destructive p-4 bg-destructive/10 border border-destructive/30 rounded-md flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/>{error}</div>;
  
  return (
    <Card className="bg-card border-border text-foreground">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-accent-foreground">Stakeholders for: <span className="text-primary">{projectName || "Selected Project"}</span></CardTitle>
          <CardDescription className="text-muted-foreground">List of stakeholders and their details for this project.</CardDescription>
        </div>
        <Dialog open={showNewStakeholderDialog} onOpenChange={setShowNewStakeholderDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Stakeholder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-accent-foreground">Add New Stakeholder for {projectName}</DialogTitle>
              <DialogDescription className="text-muted-foreground">Fill in the details for the new stakeholder.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <ProjectDataForm
                fields={stakeholderFormFields}
                initialData={{ projectid: currentProjectId }}
                onSubmit={handleNewStakeholderSubmit}
                isLoading={formIsLoading}
                submitButtonText="Add Stakeholder"
                onCancel={() => setShowNewStakeholderDialog(false)}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 text-destructive p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/>{error}</div>}
        {stakeholders.length === 0 && !loading ? (
           <p className="text-muted-foreground text-center py-8">No stakeholders found for this project. Click "Add Stakeholder" to create one.</p>
        ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader className="bg-table-header-themed">
              <TableRow className="border-table-cell-themed">
                <TableHead className="text-table-header-themed">Name</TableHead>
                <TableHead className="text-table-header-themed">Role</TableHead>
                <TableHead className="text-table-header-themed">Email</TableHead>
                <TableHead className="text-table-header-themed">Influence</TableHead>
                <TableHead className="text-table-header-themed">Interest</TableHead>
                <TableHead className="text-center text-table-header-themed">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakeholders.map((stakeholder) => (
                <TableRow key={stakeholder.stakeholder_uid} className="border-table-cell-themed hover-row-themed">
                  <TableCell className="text-foreground">{stakeholder.name}</TableCell>
                  <TableCell className="text-muted-foreground">{stakeholder.role_in_project}</TableCell>
                  <TableCell className="text-muted-foreground">{stakeholder.contact_email}</TableCell>
                  <TableCell className="text-muted-foreground">{stakeholder.influence_level}</TableCell>
                  <TableCell className="text-muted-foreground">{stakeholder.interest_level}</TableCell>
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

export default StakeholderManagementTab;