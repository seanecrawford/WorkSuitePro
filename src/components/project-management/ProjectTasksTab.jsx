import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogBody } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, PlusCircle, Edit2, Trash2, Eye } from 'lucide-react';
import ProjectDataForm from './ProjectDataForm';
import { format, parseISO } from 'date-fns';

const ProjectTasksTab = ({ integerProjectId, projectName }) => {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formIsLoading, setFormIsLoading] = useState(false);
  
  const [personnelForSelect, setPersonnelForSelect] = useState([]);
  const { toast } = useToast();

  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [taskToDeleteUid, setTaskToDeleteUid] = useState(null);

  const currentProjectId = integerProjectId; 

  const fetchPersonnelForDropdown = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('personnel').select('personnel_uuid, name');
      if (error) throw error;
      setPersonnelForSelect(data.map(p => ({ value: p.personnel_uuid, label: p.name })) || []);
    } catch (err) {
      console.error("Error fetching personnel for select:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not load personnel for selection." });
    }
  }, [toast]);
  
  const fetchTasks = useCallback(async () => {
    if (!currentProjectId) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }
    setLoadingTasks(true);
    setTasksError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('projecttasks')
        .select(`
          task_uid, 
          title, 
          description, 
          status, 
          priority, 
          startdate, 
          duedate, 
          estimated_hours,
          actual_hours,
          dependencies,
          project:projects!inner(new_projectid, projectname), 
          assignee:personnel (personnel_uuid, name)
        `)
        .eq('projectid', currentProjectId) 
        .order('created_at', { ascending: false });
      if (dbError) throw dbError;
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      const errorMessage = err.message || "Failed to fetch tasks.";
      setTasksError(errorMessage);
      toast({ variant: "destructive", title: "Error Loading Tasks", description: errorMessage });
    } finally {
      setLoadingTasks(false);
    }
  }, [toast, currentProjectId]);


  useEffect(() => {
    fetchPersonnelForDropdown();
  }, [fetchPersonnelForDropdown]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, currentProjectId]);

  const taskFormFields = [
    { name: 'title', label: 'Task Title', type: 'text', required: true, placeholder: 'Enter task title' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the task' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
        { value: 'To Do', label: 'To Do' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Done', label: 'Done' }, { value: 'Blocked', label: 'Blocked' }, { value: 'Pending', label: 'Pending' }
      ], placeholder: 'Select status', defaultValue: 'To Do'
    },
    { name: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }, { value: 'Urgent', label: 'Urgent'}
      ], placeholder: 'Select priority', defaultValue: 'Medium'
    },
    { name: 'assignee_personnel_uuid', label: 'Assignee', type: 'select', options: personnelForSelect, placeholder: 'Select Assignee (Optional)'},
    { name: 'startdate', label: 'Start Date', type: 'date', placeholder: 'Select start date' },
    { name: 'duedate', label: 'Due Date', type: 'date', placeholder: 'Select due date' },
    { name: 'estimated_hours', label: 'Estimated Hours', type: 'number', placeholder: 'e.g., 8' },
    { name: 'actual_hours', label: 'Actual Hours', type: 'number', placeholder: 'e.g., 5.5' },
    { name: 'dependencies', label: 'Dependencies (Task UIDs, comma-separated)', type: 'text', placeholder: 'e.g., task_uid1,task_uid2' },
  ];

  const handleTaskSubmit = async (formData) => {
    if (!currentProjectId) {
      toast({ variant: "destructive", title: "Error", description: "No project selected."});
      return;
    }
    setFormIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        projectid: currentProjectId, 
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
        dependencies: formData.dependencies ? formData.dependencies.split(',').map(d => d.trim()).filter(d => d) : null,
      };
      if (!submissionData.assignee_personnel_uuid) {
         delete submissionData.assignee_personnel_uuid; 
      }
      
      let result;
      if (editingTask) {
        delete submissionData.task_uid; 
        result = await supabase
          .from('projecttasks')
          .update(submissionData)
          .eq('task_uid', editingTask.task_uid)
          .select();
      } else {
        result = await supabase
          .from('projecttasks') 
          .insert([submissionData])
          .select();
      }

      const { error: opError } = result;
      if (opError) throw opError;

      toast({ title: editingTask ? "Task Updated" : "Task Added", description: `Task "${formData.title}" has been successfully ${editingTask ? 'updated' : 'added'}.` });
      setShowTaskDialog(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error(`Error ${editingTask ? 'updating' : 'adding'} task:`, err);
      const errorMessage = err.message || `Failed to ${editingTask ? 'update' : 'add'} task.`;
      toast({ variant: "destructive", title: `Error ${editingTask ? 'Updating' : 'Adding'} Task`, description: errorMessage });
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleEditTask = (task) => {
    const taskDataForForm = {
      ...task,
      projectid: task.project?.new_projectid?.toString() || currentProjectId.toString(), 
      assignee_personnel_uuid: task.assignee?.personnel_uuid || '',
      dependencies: task.dependencies ? task.dependencies.join(', ') : '' 
    };
    setEditingTask(taskDataForForm);
    setShowTaskDialog(true);
  };

  const handleAddNewTask = () => {
    setEditingTask(null); 
    setShowTaskDialog(true);
  };
  
  const confirmDeleteTask = (taskUid) => {
    setTaskToDeleteUid(taskUid);
    setShowDeleteConfirmDialog(true);
  };

  const executeDeleteTask = async () => {
    if (!taskToDeleteUid) return;
    try {
      const { error } = await supabase.from('projecttasks').delete().eq('task_uid', taskToDeleteUid);
      if (error) throw error;
      toast({ title: "Task Deleted", description: "Task successfully deleted." });
      fetchTasks();
    } catch (err) {
      toast({ variant: "destructive", title: "Error Deleting Task", description: err.message });
    } finally {
      setShowDeleteConfirmDialog(false);
      setTaskToDeleteUid(null);
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
          <CardTitle className="text-accent-foreground">Tasks for: <span className="text-primary">{projectName || "Selected Project"}</span></CardTitle>
          <CardDescription className="text-muted-foreground">Create, assign, and track tasks for this project.</CardDescription>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleAddNewTask}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
        </Button>
      </CardHeader>
      <CardContent>
        {loadingTasks && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        {!loadingTasks && tasksError && <div className="text-destructive p-4 bg-destructive/10 border border-destructive/30 rounded-md flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/>{tasksError}</div>}
        {!loadingTasks && !tasksError && tasks.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No tasks found for this project. Click "Add New Task" to create one.</p>
        )}
        {!loadingTasks && !tasksError && tasks.length > 0 && (
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader className="bg-table-header-themed">
                <TableRow className="border-table-cell-themed">
                  <TableHead className="text-table-header-themed">Title</TableHead>
                  <TableHead className="text-table-header-themed">Assignee</TableHead>
                  <TableHead className="text-table-header-themed">Status</TableHead>
                  <TableHead className="text-table-header-themed">Priority</TableHead>
                  <TableHead className="text-table-header-themed">Due Date</TableHead>
                  <TableHead className="text-center text-table-header-themed">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.task_uid} className="border-table-cell-themed hover-row-themed">
                    <TableCell className="font-medium text-foreground max-w-xs truncate">{task.title}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{task.assignee?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        task.status === 'Done' ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 
                        task.status === 'In Progress' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                        task.status === 'Blocked' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        task.status === 'To Do' ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                      }`}>
                        {task.status || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{task.priority || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateDisplay(task.duedate)}</TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-700/20 p-1 h-7 w-7" onClick={() => handleEditTask(task)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                       <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent p-1 h-7 w-7">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
                          <DialogHeader>
                            <DialogTitle className="text-accent-foreground">Task Details: {task.title}</DialogTitle>
                          </DialogHeader>
                          <DialogBody>
                            <div className="space-y-2 text-sm py-2">
                              <p><strong className="text-muted-foreground">Project:</strong> {task.project?.projectname || projectName || 'N/A'}</p>
                              <p><strong className="text-muted-foreground">Assignee:</strong> {task.assignee?.name || 'Unassigned'}</p>
                              <p><strong className="text-muted-foreground">Status:</strong> {task.status || 'N/A'}</p>
                              <p><strong className="text-muted-foreground">Priority:</strong> {task.priority || 'N/A'}</p>
                              <p><strong className="text-muted-foreground">Start Date:</strong> {formatDateDisplay(task.startdate)}</p>
                              <p><strong className="text-muted-foreground">Due Date:</strong> {formatDateDisplay(task.duedate)}</p>
                              <p><strong className="text-muted-foreground">Est. Hours:</strong> {task.estimated_hours || 'N/A'}</p>
                              <p><strong className="text-muted-foreground">Actual Hours:</strong> {task.actual_hours || 'N/A'}</p>
                              <p><strong className="text-muted-foreground">Dependencies:</strong> {task.dependencies?.join(', ') || 'None'}</p>
                              <p><strong className="text-muted-foreground">Description:</strong> {task.description || 'N/A'}</p>
                            </div>
                          </DialogBody>
                           <DialogClose asChild>
                              <Button type="button" variant="outline" className="mt-2">
                                Close
                              </Button>
                            </DialogClose>
                        </DialogContent>
                      </Dialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 hover:bg-destructive/20 p-1 h-7 w-7" onClick={() => confirmDeleteTask(task.task_uid)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {showTaskDialog && (
        <Dialog open={showTaskDialog} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingTask(null);
          }
          setShowTaskDialog(isOpen);
        }}>
          <DialogContent className="sm:max-w-[525px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-accent-foreground">{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingTask ? `Update the details for this task in project: ${projectName}.` : `Fill in the details for the new task for project: ${projectName}.`}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <ProjectDataForm
                fields={taskFormFields}
                initialData={editingTask || { projectid: currentProjectId?.toString() }} 
                onSubmit={handleTaskSubmit}
                isLoading={formIsLoading}
                submitButtonText={editingTask ? "Update Task" : "Add Task"}
                onCancel={() => {
                  setShowTaskDialog(false);
                  setEditingTask(null);
                }}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDeleteTask} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ProjectTasksTab;