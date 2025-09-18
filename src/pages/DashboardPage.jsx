import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import DraggableWidgetCard from '@/components/dashboard/DraggableWidgetCard';
import CustomizeDashboardDialog from '@/components/dashboard/CustomizeDashboardDialog';

import FinancialMetricsCard from '@/components/dashboard/FinancialMetricsCard';
import ProjectMetricsCard from '@/components/dashboard/ProjectMetricsCard';
import GanttChartPlaceholder from '@/components/dashboard/GanttChartPlaceholder';
import CalendarCard from '@/components/dashboard/CalendarCard';
import UpcomingEventsCard from '@/components/dashboard/UpcomingEventsCard';

const KanbanBoard = lazy(() => import('@/components/dashboard/KanbanBoard'));


const initialWidgetsConfig = [
  { id: 'financialMetrics', name: 'Financial Snapshot', component: FinancialMetricsCard, area: 'main', order: 1, colSpan: 1, rowSpan: 1, minSize: {w:1, h:1}, maxSize: {w:2,h:2}, minHeight: '300px', isVisible: true, isDraggable: true, isResizable: true, configurableMetrics: true },
  { id: 'projectMetrics', name: 'Project Pulse', component: ProjectMetricsCard, area: 'main', order: 2, colSpan: 1, rowSpan: 1, minSize: {w:1, h:1}, maxSize: {w:2,h:2}, minHeight: '300px', isVisible: true, isDraggable: true, isResizable: true, configurableMetrics: true },
  { id: 'ganttChart', name: 'Project Timeline', component: GanttChartPlaceholder, area: 'main', order: 3, colSpan: 2, rowSpan: 1, minSize: {w:2, h:1}, maxSize: {w:3,h:2}, minHeight: '280px', isVisible: true, isDraggable: true, isResizable: true },
  { id: 'calendar', name: 'Team Calendar', component: CalendarCard, area: 'sidebar', order: 1, colSpan: 1, rowSpan: 1, minSize: {w:1, h:1}, maxSize: {w:1,h:2}, minHeight: '300px', isVisible: true, isDraggable: true, isResizable: false },
  { id: 'upcomingEvents', name: 'Upcoming Items', component: UpcomingEventsCard, area: 'sidebar', order: 2, colSpan: 1, rowSpan: 1, minSize: {w:1, h:1}, maxSize: {w:1,h:2}, minHeight: '280px', isVisible: true, isDraggable: true, isResizable: false },
  { id: 'kanbanBoard', name: 'Task Workflow', component: KanbanBoard, area: 'main', order: 4, colSpan: 2, rowSpan: 1, minSize: {w:2, h:1}, maxSize: {w:3,h:2}, minHeight: '360px', isVisible: true, isDraggable: true, isResizable: true },
];

const LOCAL_STORAGE_KEY = 'dashboardLayout_v10_unified_dark_professional_compact'; 

const DashboardPage = () => {
  const [widgets, setWidgets] = useState([]);
  const [isLoadingLayout, setIsLoadingLayout] = useState(true);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(LOCAL_STORAGE_KEY);
      let finalWidgets;
      if (savedLayout) {
        const parsedLayout = JSON.parse(savedLayout);
        finalWidgets = initialWidgetsConfig.map(initialWidget => {
          const savedWidgetSettings = parsedLayout.find(sw => sw.id === initialWidget.id);
          return { 
            ...initialWidget, 
            ...(savedWidgetSettings || {}),
            component: initialWidget.component 
          };
        });
      } else {
        finalWidgets = initialWidgetsConfig;
      }
      setWidgets(finalWidgets);
    } catch (error) {
      console.error("Error loading dashboard layout from localStorage:", error);
      setWidgets(initialWidgetsConfig); 
      toast({ title: "Layout Load Error", description: "Could not load your saved layout. Using default.", variant: "destructive" });
    } finally {
      setIsLoadingLayout(false);
    }
  }, [toast]);

  const handleLayoutSave = useCallback((newLayoutConfig) => {
    const updatedWidgets = widgets.map(currentWidget => {
      const newSettings = newLayoutConfig.find(nl => nl.widget_id === currentWidget.id);
      if (newSettings) {
        return {
          ...currentWidget,
          isVisible: newSettings.is_visible,
          order: newSettings.widget_order,
          colSpan: newSettings.column_span,
          rowSpan: newSettings.row_span,
          area: newSettings.container_area,
        };
      }
      return currentWidget;
    });

    setWidgets(updatedWidgets);
    try {
      const layoutToStore = updatedWidgets.map(w => ({
        id: w.id,
        isVisible: w.isVisible,
        order: w.order,
        colSpan: w.colSpan,
        rowSpan: w.rowSpan,
        area: w.area,
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layoutToStore));
      toast({ title: "Layout Saved", description: "Your dashboard layout has been updated.", className: "bg-green-500/20 border-green-500/30 text-white" });
    } catch (error) {
      console.error("Error saving dashboard layout to localStorage:", error);
      toast({ title: "Layout Save Error", description: "Could not save your dashboard layout changes.", variant: "destructive" });
    }
  }, [widgets, toast]);

  const handleResetLayout = useCallback(() => {
    setWidgets(initialWidgetsConfig);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      toast({ title: "Layout Reset", description: "Dashboard layout has been reset to default.", className: "bg-sky-500/20 border-sky-500/30 text-white" });
    } catch (error) {
       console.error("Error resetting dashboard layout in localStorage:", error);
      toast({ title: "Layout Reset Error", description: "Could not reset layout in storage, but UI is reset.", variant: "destructive" });
    }
    setIsCustomizeDialogOpen(false); 
  }, [toast]);
  
  const handleWidgetConfigChange = (widgetId, newConfig) => {
    setWidgets(prevWidgets => 
      prevWidgets.map(w => w.id === widgetId ? { ...w, ...newConfig } : w)
    );
  };
  
  const handleWidgetRefresh = (widgetId) => {
    const widgetToRefresh = widgets.find(w => w.id === widgetId);
    toast({ title: "Refreshing Widget...", description: `Attempting to refresh ${widgetToRefresh?.name || widgetId}.`, className: "bg-sky-500/20 border-sky-500/30 text-white" });
  };

  const handleWidgetSettings = (widgetId) => {
    const widgetToConfigure = widgets.find(w => w.id === widgetId);
    toast({ title: "Widget Settings", description: `Configure settings for ${widgetToConfigure?.name || widgetId}.`, className: "bg-amber-500/20 border-amber-500/30 text-white" });
  };

  const handleWidgetRemove = (widgetId) => {
    const widgetToHide = widgets.find(w => w.id === widgetId);
    const updatedWidgets = widgets.map(w => w.id === widgetId ? { ...w, isVisible: false } : w);
    setWidgets(updatedWidgets);
    const layoutToStore = updatedWidgets.map(w => ({
        id: w.id, isVisible: w.isVisible, order: w.order, colSpan: w.colSpan, rowSpan: w.rowSpan, area: w.area,
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layoutToStore));
    toast({ title: "Widget Hidden", description: `Widget ${widgetToHide?.name || widgetId} has been hidden. You can re-enable it in Customize Layout.`, className: "bg-red-500/20 border-red-500/30 text-white" });
  };


  const renderWidgets = (area) => {
    return widgets
      .filter(widget => widget.area === area && widget.isVisible)
      .sort((a, b) => a.order - b.order)
      .map((widget) => (
        <DraggableWidgetCard
          key={widget.id}
          widget={{...widget, title: widget.name}} // Pass name as title to DraggableWidgetCard
          onConfigChange={handleWidgetConfigChange}
          onRefresh={handleWidgetRefresh}
          onSettings={handleWidgetSettings}
          onRemove={handleWidgetRemove}
          className={`col-span-1 md:col-span-${widget.colSpan || 1} row-span-${widget.rowSpan || 1}`}
          style={{ minHeight: widget.minHeight }}
        >
          <Suspense fallback={<div className="flex items-center justify-center h-full bg-slate-800/50"><Loader2 className="h-8 w-8 animate-spin text-sky-400" /></div>}>
            {widget.component ? React.createElement(widget.component, { widgetId: widget.id, config: widget, onConfigChange: (newSubConfig) => handleWidgetConfigChange(widget.id, newSubConfig) }) : <div className="p-4 text-slate-400">Component not loaded or specified.</div>}
          </Suspense>
        </DraggableWidgetCard>
      ));
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "circOut" } },
  };

  if (isLoadingLayout) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--theme-accent-primary)]" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col h-full bg-background text-foreground p-3 md:p-4"
    >
      <header className="flex-shrink-0 py-2 px-1 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
             Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Dynamic insights and operational overview.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsCustomizeDialogOpen(true)} 
          className="border-input-themed text-muted-foreground hover:bg-input-themed hover:text-primary hover:border-primary transition-all duration-200 group h-9 px-3 text-xs"
        >
          <Settings className="mr-1.5 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" /> Customize Layout
        </Button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pb-3 pr-1">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 auto-rows-min">
          {renderWidgets('main')}
        </div>
        <div className="lg:col-span-1 grid grid-cols-1 gap-4 md:gap-5 auto-rows-min">
          {renderWidgets('sidebar')}
        </div>
      </div>

      <CustomizeDashboardDialog
        open={isCustomizeDialogOpen}
        onOpenChange={setIsCustomizeDialogOpen}
        currentLayout={widgets.map(w => ({ 
            widget_id: w.id, 
            name: w.name, 
            is_visible: w.isVisible, 
            widget_order: w.order, 
            column_span: w.colSpan, 
            row_span: w.rowSpan, 
            container_area: w.area,
            minSize: w.minSize,
            maxSize: w.maxSize,
        }))}
        onLayoutSave={handleLayoutSave}
        onResetLayout={handleResetLayout}
      />
    </motion.div>
  );
};

export default DashboardPage;