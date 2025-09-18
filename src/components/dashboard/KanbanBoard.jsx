import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableContext } from '@dnd-kit/sortable';
import { PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import KanbanColumn from './KanbanColumn';
import KanbanTask from './KanbanTask';
import KanbanTaskModal from './KanbanTaskModal';
import KanbanColumnModal from './KanbanColumnModal';
import { initialDemoColumns, useKanbanData, useKanbanActions } from './kanbanHooks';

const KanbanBoard = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { columns, setColumns, isLoading, error, fetchKanbanData } = useKanbanData(isAuthenticated, user, toast);

  const {
    openTaskModal,
    openColumnModal,
    handleDragStart,
    handleDragEnd,
    getActiveItem,
  } = useKanbanActions(columns, setColumns, fetchKanbanData, toast);

  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onTaskModalOpen = (task = null, columnId = null) => {
    if (!user && !task?.isSample) { 
        toast({ title: "Login Required", description: "Please log in to manage tasks.", variant: "destructive"});
        return;
    }
    setEditingTask(task ? { ...task, columnid: columnId || task.columnid } : { columnid: columnId });
    setIsTaskModalOpen(true); 
  };
  
  const onColumnModalOpen = (column = null) => {
    if (!user) {
        toast({ title: "Login Required", description: "Please log in to manage columns.", variant: "destructive"});
        return;
    }
    setEditingColumn(column);
    setIsColumnModalOpen(true);
  };

  const activeItem = getActiveItem(activeId, activeType);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full p-4 bg-slate-850/30 backdrop-blur-sm rounded-lg"><Loader2 className="h-12 w-12 animate-spin text-sky-400" /></div>;
  }

  if (error && error.message.includes('User not authenticated')) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-850/50 backdrop-blur-md rounded-lg border border-yellow-500/50">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mb-4" />
        <h3 className="text-xl font-semibold text-yellow-300 mb-2">Login to View Kanban</h3>
        <p className="text-sm text-slate-400 text-center">Displaying a sample board for demonstration.</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-red-900/20 backdrop-blur-sm rounded-lg border border-red-700/50">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-red-300 mb-2">Error Loading Kanban Board</h3>
        <p className="text-sm text-slate-400 text-center mb-4">{error.message || "An unexpected error occurred."}</p>
        <Button onClick={() => fetchKanbanData()} variant="destructive">Try Again</Button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => handleDragStart(event, setActiveId, setActiveType)}
      onDragEnd={(event) => handleDragEnd(event, setActiveId, setActiveType)}
    >
      <div className="p-1 h-full flex flex-col bg-slate-850/30">
        <div className="flex justify-between items-center mb-3 px-2 pt-1">
          <h2 className="text-lg font-semibold text-slate-200">My Workflow</h2>
          <div className="space-x-2">
            <Button onClick={() => onTaskModalOpen(null, columns[0]?.columnid)} size="sm" variant="outline" className="border-sky-500 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Task
            </Button>
            <Button onClick={() => onColumnModalOpen(null)} size="sm" variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Column
            </Button>
          </div>
        </div>

        <div className="flex-1 flex space-x-3 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          <SortableContext items={columns.map(col => col.columnid)} strategy={horizontalListSortingStrategy}>
            {columns.map((column, index) => (
              <KanbanColumn
                key={column.columnid}
                column={column}
                onAddTask={() => onTaskModalOpen(null, column.columnid)}
                onEditTask={onTaskModalOpen}
                onEditColumn={onColumnModalOpen}
              />
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeId && activeType === 'COLUMN' && activeItem ? (
            <KanbanColumn column={activeItem} isOverlay />
          ) : activeId && activeType === 'TASK' && activeItem ? (
            <KanbanTask task={activeItem} isOverlay />
          ) : null}
        </DragOverlay>
      </div>

      <KanbanTaskModal
        isOpen={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        task={editingTask}
        columns={columns}
        onSave={() => { setIsTaskModalOpen(false); fetchKanbanData(); }}
        userId={user?.id}
      />
      <KanbanColumnModal
        isOpen={isColumnModalOpen}
        onOpenChange={setIsColumnModalOpen}
        column={editingColumn}
        onSave={() => { setIsColumnModalOpen(false); fetchKanbanData(); }}
        userId={user?.id}
        currentColumnCount={columns.length}
      />
    </DndContext>
  );
};

export default KanbanBoard;