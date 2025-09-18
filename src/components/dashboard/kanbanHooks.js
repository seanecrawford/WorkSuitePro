import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { arrayMove } from '@dnd-kit/sortable';

export const initialDemoColumns = [
  { columnid: 'demo-col-1', title: 'To Do', position: 0, tasks: [{taskid: 'demo-task-1', columnid: 'demo-col-1', title: 'Sample Task 1', description: 'This is a task for public view.', priority: 'medium', isSample: true, comments: []}, {taskid: 'demo-task-2', columnid: 'demo-col-1', title: 'Another Sample', description: 'More details here.', priority: 'high', isSample: true, comments: []}] },
  { columnid: 'demo-col-2', title: 'In Progress', position: 1, tasks: [{taskid: 'demo-task-3', columnid: 'demo-col-2', title: 'Work in Progress', description: 'Almost there!', priority: 'urgent', isSample: true, comments: []}] },
  { columnid: 'demo-col-3', title: 'Review', position: 2, tasks: [] },
  { columnid: 'demo-col-4', title: 'Done', position: 3, tasks: [] },
];

export const useKanbanData = (isAuthenticated, user, toast) => {
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKanbanData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setError({ message: 'User not authenticated. Cannot load Kanban data.' });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('*, tasks:kanban_tasks(*, assignee:assigned_to_personnel_uuid(personnel_uuid, name))')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .order('task_order', { foreignTable: 'kanban_tasks', ascending: true });

      if (columnsError) throw columnsError;
      
      setColumns(data.map(col => ({ ...col, tasks: col.tasks || [] })));

    } catch (err) {
      console.error("Error fetching Kanban data:", err);
      setError(err);
      toast({ title: "Error", description: `Failed to load Kanban board: ${err.message}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, toast]);
  
  useState(() => {
    fetchKanbanData();
  }, [fetchKanbanData]);


  return { columns, setColumns, isLoading, error, fetchKanbanData };
};


export const useKanbanActions = (columns, setColumns, refetchData, toast) => {

  const findTask = useCallback((taskId) => {
    for (const column of columns) {
      const task = column.tasks?.find(t => t.taskid === taskId);
      if (task) return task;
    }
    return null;
  }, [columns]);
  
  const handleDragStart = (event, setActiveId, setActiveType) => {
    setActiveId(event.active.id);
    setActiveType(event.active.data.current?.type);
  };

  const handleDragEnd = async (event, setActiveId, setActiveType) => {
    setActiveId(null);
    setActiveType(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const isColumnDrag = active.data.current?.type === 'COLUMN';

    if (isColumnDrag) {
      const oldIndex = columns.findIndex(col => col.columnid === active.id);
      const newIndex = columns.findIndex(col => col.columnid === over.id);
      const newOrderedColumns = arrayMove(columns, oldIndex, newIndex);
      setColumns(newOrderedColumns);

      const updates = newOrderedColumns.map((col, index) => 
        supabase.from('kanban_columns').update({ position: index }).eq('columnid', col.columnid)
      );
      await Promise.all(updates);
    } else { // Task Drag
      const activeTask = findTask(active.id);
      if (!activeTask) return;

      const overIsColumn = over.data.current?.type === 'COLUMN';
      const overIsTask = over.data.current?.type === 'TASK';

      let newColumnId, newPosition;

      if (overIsColumn) {
        newColumnId = over.id;
        newPosition = columns.find(c => c.columnid === newColumnId)?.tasks.length || 0;
      } else if (overIsTask) {
        const overTask = findTask(over.id);
        if(!overTask) return;
        newColumnId = overTask.columnid;
        newPosition = overTask.task_order;
      } else {
        return;
      }
      
      // Optimistic UI update
      setColumns(prev => {
        const activeColumnIndex = prev.findIndex(c => c.columnid === activeTask.columnid);
        const newColumnIndex = prev.findIndex(c => c.columnid === newColumnId);
        if(activeColumnIndex === -1 || newColumnIndex === -1) return prev;
        
        const newColumns = JSON.parse(JSON.stringify(prev));
        const [movedTask] = newColumns[activeColumnIndex].tasks.splice(activeTask.task_order, 1);
        movedTask.columnid = newColumnId;
        
        if (activeTask.columnid === newColumnId) { // Moved within the same column
            newColumns[activeColumnIndex].tasks.splice(newPosition, 0, movedTask);
            newColumns[activeColumnIndex].tasks.forEach((t, i) => t.task_order = i);
        } else { // Moved to a different column
            newColumns[newColumnIndex].tasks.splice(newPosition, 0, movedTask);
            newColumns[activeColumnIndex].tasks.forEach((t, i) => t.task_order = i);
            newColumns[newColumnIndex].tasks.forEach((t, i) => t.task_order = i);
        }
        return newColumns;
      });

      try {
        await supabase.rpc('update_task_position', {
          task_id: active.id,
          new_column_id: newColumnId,
          new_order: newPosition,
          old_column_id: activeTask.columnid
        });
        toast({ title: "Task Moved", variant: "success" });
      } catch (err) {
        toast({ title: "Error moving task", description: err.message, variant: "destructive" });
        refetchData(); // Revert optimistic update on failure
      }
    }
  };

  const getActiveItem = (activeId, activeType) => {
    if (!activeId) return null;
    if (activeType === 'COLUMN') return columns.find(col => col.columnid === activeId);
    if (activeType === 'TASK') return findTask(activeId);
    return null;
  };

  return { handleDragStart, handleDragEnd, getActiveItem };
};