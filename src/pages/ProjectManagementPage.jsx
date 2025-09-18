import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { Briefcase, PlusCircle, ListChecks, DollarSign, Users, AlertTriangle, BookOpen, FileSpreadsheet, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

import ProjectOverviewTab from '@/components/project-management/ProjectOverviewTab';
import ProjectTasksTab from '@/components/project-management/ProjectTasksTab';
import BudgetCostsTab from '@/components/project-management/BudgetCostsTab';
import RiskManagementTab from '@/components/project-management/RiskManagementTab';
import StakeholderManagementTab from '@/components/project-management/StakeholderManagementTab';
import LessonsLearnedTab from '@/components/project-management/LessonsLearnedTab';
import ProjectDataForm from '@/components/project-management/ProjectDataForm';

const FeaturePlaceholderCard = ({ title, description, icon: Icon, phase, className = "" }) => (
  <Card className={`bg-card-alt-themed shadow-lg hover:shadow-[var(--theme-accent-project)]/20 transition-shadow duration-300 ${className}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-[var(--theme-accent-project)]" />
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-muted-foreground mb-3 text-sm">{description}</CardDescription>
      <div className="text-xs text-[var(--theme-accent-project)]/80 font-medium bg-[var(--theme-accent-project)]/20 px-2 py-1 rounded-full inline-block">
        Coming in {phase}
      </div>
    </CardContent>
  </Card>
);

const ProjectManagementPage = () => {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState(null); 
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProjectData, setEditingProjectData] = useState(null);
  const [personnelOptions, setPersonnelOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [forceOverviewRefetch, setForceOverviewRefetch] = useState(0);

  const fetchPersonnelForDropdown = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('personnel').select('personnel_uuid, name').order('name');
      if (error) throw error;
      setPersonnelOptions(data.map(p => ({ value: p.personnel_uuid, label: p.name })));
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not load personnel for selection." });
    }
  }, [toast]);

  useEffect(() => {
    fetchPersonnelForDropdown();
  }, [fetchPersonnelForDropdown]);
  
  const projectFormFields = [
    { name: 'projectname', label: 'Project Name', type: 'text', required: true, placeholder: 'Enter project name' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the project' },
    { name: 'startdate', label: 'Start Date', type: 'date', placeholder: 'Select start date' },
    { name: 'enddate', label: 'End Date', type: 'date', placeholder: 'Select end date' },
    { name: 'budget', label: 'Budget', type: 'number', placeholder: 'e.g., 50000.00', step: "0.01" },
    { name: 'actual_cost', label: 'Actual Cost', type: 'number', placeholder: 'e.g., 25000.00', step: "0.01" },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
        { value: 'Planning', label: 'Planning' }, { value: 'In Progress', label: 'In Progress' }, 
        { value: 'On Hold', label: 'On Hold' }, { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' }
      ], placeholder: 'Select status', defaultValue: 'Planning'
    },
    { name: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, 
        { value: 'High', label: 'High' }, { value: 'Urgent', label: 'Urgent' }
      ], placeholder: 'Select priority', defaultValue: 'Medium'
    },
    { name: 'project_manager_personnel_uuid', label: 'Project Manager', type: 'select', options: personnelOptions, placeholder: 'Select Project Manager (Optional)'},
  ];

  const handleOpenFormModal = (project = null) => {
    setEditingProjectData(project);
    setIsFormModalOpen(true);
  };

  const handleSaveProject = async (formData) => {
    setIsLoading(true);
    if (!formData.projectname || !formData.status) {
      toast({ title: "Validation Error", description: "Project Name and Status are required.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
  
    const upsertData = { ...formData };

    if (upsertData.budget === null || upsertData.budget === '') delete upsertData.budget;
    else upsertData.budget = parseFloat(upsertData.budget);

    if (upsertData.actual_cost === null || upsertData.actual_cost === '') delete upsertData.actual_cost;
    else upsertData.actual_cost = parseFloat(upsertData.actual_cost);

    if (!upsertData.project_manager_personnel_uuid) {
        delete upsertData.project_manager_personnel_uuid;
    }
    
    delete upsertData.project_manager_personnel_uuid_details;
    delete upsertData.personnel;
    delete upsertData.projectid; 
    delete upsertData.id; 

    try {
      let response;
      let successMessage;
      
      if (editingProjectData && editingProjectData.new_projectid) { 
        response = await supabase.from('projects').update(upsertData).eq('new_projectid', editingProjectData.new_projectid).select('*, personnel ( name, personnel_uuid )').single();
        successMessage = `Project "${response.data?.projectname}" updated successfully.`;
      } else {
        response = await supabase.from('projects').insert(upsertData).select('*, personnel ( name, personnel_uuid )').single();
        successMessage = `Project "${response.data?.projectname}" created successfully.`;
      }
  
      const { data: savedData, error: saveError } = response;
      if (saveError) throw saveError;
  
      toast({ title: "Success", description: successMessage });
      setIsFormModalOpen(false);
      setEditingProjectData(null); 
      
      if (selectedProject && savedData && selectedProject.new_projectid === savedData.new_projectid) {
        setSelectedProject({
          ...savedData, 
          id: savedData.new_projectid,
          projectid: savedData.new_projectid, 
          manager: savedData.personnel?.name || 'N/A',
          project_manager_personnel_uuid_details: savedData.personnel
        });
      }
      setForceOverviewRefetch(prev => prev + 1);

    } catch (err) {
      console.error("Error saving project:", err);
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => { 
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`)) return;
    setIsLoading(true);
    try {
      const { error: deleteError } = await supabase.from('projects').delete().eq('new_projectid', projectId);
      if (deleteError) throw deleteError;
      toast({ title: "Project Deleted", description: `Project "${projectName}" has been deleted.` });
      if (selectedProject?.new_projectid === projectId) {
        setSelectedProject(null);
        setActiveTab("overview"); 
      }
      setForceOverviewRefetch(prev => prev + 1);
    } catch (err) {
      console.error("Error deleting project:", err);
      toast({ title: "Delete Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectProjectFromOverview = (project) => {
    setSelectedProject(project); 
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  
  const contractManagementFeatures = [
     { title: "Contract Repository", description: "Centralized storage for all project-related contracts and legal documents.", icon: FileSpreadsheet, phase: "Phase 2" },
     { title: "Obligation Tracking", description: "Monitor key contractual obligations, deadlines, and deliverables.", icon: ListChecks, phase: "Phase 2" },
     { title: "Compliance Management", description: "Ensure projects adhere to contractual terms and regulatory requirements.", icon: Users, phase: "Phase 2" },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="flex flex-col h-[calc(100vh-4rem-2rem)] overflow-hidden">
      <header className="flex-shrink-0 p-4 md:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Briefcase className="mr-3 h-8 w-8 text-[var(--theme-accent-project)]" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Project Management</h1>
            <p className="text-sm text-muted-foreground">Oversee and manage all your projects from a unified dashboard.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-0 md:p-0 overflow-y-auto scrollbar-thin">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <div className="px-4 md:px-6 pt-4">
            <TabsList className="tabs-project grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks" disabled={!selectedProject}><ListChecks className="mr-1 h-3.5 w-3.5 hidden sm:inline"/>Tasks</TabsTrigger>
              <TabsTrigger value="budget" disabled={!selectedProject}><DollarSign className="mr-1 h-3.5 w-3.5 hidden sm:inline"/>Budget</TabsTrigger>
              <TabsTrigger value="risks" disabled={!selectedProject}><AlertTriangle className="mr-1 h-3.5 w-3.5 hidden sm:inline"/>Risks</TabsTrigger>
              <TabsTrigger value="stakeholders" disabled={!selectedProject}><Users className="mr-1 h-3.5 w-3.5 hidden sm:inline"/>Stakeholders</TabsTrigger>
              <TabsTrigger value="lessons" disabled={!selectedProject}><BookOpen className="mr-1 h-3.5 w-3.5 hidden sm:inline"/>Lessons</TabsTrigger>
              <TabsTrigger value="contracts" disabled={!selectedProject}><FileSpreadsheet className="mr-1 h-3.5 w-3.5 hidden sm:inline"/>Contracts</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
            <ProjectOverviewTab 
              onSelectProject={handleSelectProjectFromOverview}
              selectedProject={selectedProject} 
              onEditProject={handleOpenFormModal} 
              onDeleteProject={handleDeleteProject} 
              forceRefetchKey={forceOverviewRefetch}
            />
          </TabsContent>

          {activeTab !== "overview" && !selectedProject && (
            <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 h-full">
                <GripVertical className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">Please select a project from the Overview tab to see details here.</p>
              </div>
            </TabsContent>
          )}

          {selectedProject && (
            <>
              <TabsContent value="tasks" className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
                {activeTab === 'tasks' && <ProjectTasksTab integerProjectId={selectedProject.new_projectid} projectName={selectedProject.projectname} />}
              </TabsContent>
              <TabsContent value="budget" className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
                {activeTab === 'budget' && <BudgetCostsTab project={selectedProject} integerProjectId={selectedProject.new_projectid} />}
              </TabsContent>
              <TabsContent value="risks" className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
                {activeTab === 'risks' && <RiskManagementTab integerProjectId={selectedProject.new_projectid} projectName={selectedProject.projectname} />}
              </TabsContent>
              <TabsContent value="stakeholders" className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
                {activeTab === 'stakeholders' && <StakeholderManagementTab integerProjectId={selectedProject.new_projectid} projectName={selectedProject.projectname} />}
              </TabsContent>
              <TabsContent value="lessons" className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
                {activeTab === 'lessons' && <LessonsLearnedTab integerProjectId={selectedProject.new_projectid} projectName={selectedProject.projectname} />}
              </TabsContent>
              <TabsContent value="contracts" className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Contract Management for: {selectedProject.projectname}</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage all project-related contracts, track obligations, and ensure compliance. These features are part of Phase 2 enhancements.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contractManagementFeatures.map(feature => (
                      <FeaturePlaceholderCard 
                        key={feature.title}
                        title={feature.title}
                        description={feature.description}
                        icon={feature.icon}
                        phase={feature.phase}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[525px] bg-card-themed border-card-themed text-foreground shadow-2xl" preventCloseOnOutsideClick={false}>
          <DialogHeader>
            <DialogTitle className="text-card-themed-primary text-lg">{editingProjectData?.new_projectid ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <ProjectDataForm
                fields={projectFormFields}
                initialData={editingProjectData || { status: 'Planning', priority: 'Medium' }}
                onSubmit={handleSaveProject}
                isLoading={isLoading}
                submitButtonText={editingProjectData?.new_projectid ? 'Save Changes' : 'Create Project'}
                onCancel={() => setIsFormModalOpen(false)}
              />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProjectManagementPage;