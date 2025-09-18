import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GripVertical, Eye, EyeOff, Save, Loader2, ArrowLeftRight, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area'; // Added ScrollArea
import { motion, AnimatePresence } from 'framer-motion';


const CustomizeDashboardDialog = ({ open, onOpenChange, currentLayout, onLayoutSave }) => {
  const { toast } = useToast();
  const [localLayout, setLocalLayout] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setError(null);
      // Ensure currentLayout is an array and process it
      const dialogLayout = Array.isArray(currentLayout) ? currentLayout.map(item => ({
        id: item.widget_id,
        name: item.name, 
        isVisible: item.is_visible,
        order: item.widget_order,
        currentSpan: { 
          col: Math.max(1, item.column_span || item.minSize?.w || 1), // Ensure at least 1
          row: Math.max(1, item.row_span || item.minSize?.h || 1)    // Ensure at least 1
        }, 
        area: item.container_area,
        minSize: item.minSize || { w:1, h:1 }, // Provide default minSize
        maxSize: item.maxSize || { w:3, h:3 }, // Provide default maxSize
      })) : [];
      setLocalLayout(dialogLayout);
    }
  }, [open, currentLayout]);

  const handleVisibilityChange = (id, checked) => {
    setLocalLayout(prev => prev.map(widget => widget.id === id ? { ...widget, isVisible: checked } : widget));
  };

  const handleSpanChange = (id, type, value) => {
    const numValue = parseInt(value, 10);
    setLocalLayout(prev => prev.map(widget => {
      if (widget.id === id) {
        const newSpan = { ...widget.currentSpan };
        const min = type === 'col' ? widget.minSize.w : widget.minSize.h;
        const max = type === 'col' ? widget.maxSize.w : widget.maxSize.h;
        
        newSpan[type] = Math.max(min, Math.min(max, numValue || min)); // Ensure value is within min/max

        return { ...widget, currentSpan: newSpan };
      }
      return widget;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true); 
    setError(null);
    
    // Validate layout: e.g., check for excessive spans in an area
    const mainAreaTotalColSpan = localLayout
      .filter(w => w.area === 'main' && w.isVisible)
      .reduce((sum, w) => sum + w.currentSpan.col, 0);
    
    // This is a simplified validation. A real one would consider max columns of the grid.
    // Assuming main area has max 3 columns. This isn't perfect as rows complicate it.
    if (mainAreaTotalColSpan > 10) { // Arbitrary large number, adjust based on actual grid constraints
        // setError("Layout configuration might exceed available space in the main area. Please review column spans.");
        // setIsSaving(false);
        // toast({ title: "Layout Warning", description: "Main area widgets might be too wide. Review spans.", variant: "destructive", duration: 7000 });
        // For now, let's allow save but a proper validation would be more complex
    }

    await new Promise(resolve => setTimeout(resolve, 300)); 
    
    const layoutToSave = localLayout.map(w => ({ 
      widget_id: w.id, 
      is_visible: w.isVisible, 
      widget_order: w.order,
      column_span: w.currentSpan.col,
      row_span: w.currentSpan.row,
      container_area: w.area,
      minSize: w.minSize,
      maxSize: w.maxSize,
    }));

    onLayoutSave(layoutToSave);
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleDragStart = (e, widget) => {
    setDraggedItem(widget);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widget.id); 
  };

  const handleDragOver = (e, targetWidget) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetWidget) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetWidget.id || draggedItem.area !== targetWidget.area) {
      setDraggedItem(null);
      return;
    }

    const itemsInArea = localLayout.filter(w => w.area === draggedItem.area).sort((a,b) => a.order - b.order);
    const draggedIndex = itemsInArea.findIndex(w => w.id === draggedItem.id);
    let targetIndex = itemsInArea.findIndex(w => w.id === targetWidget.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }
    
    const newItemsInArea = [...itemsInArea];
    const [movedItem] = newItemsInArea.splice(draggedIndex, 1);
    newItemsInArea.splice(targetIndex, 0, movedItem);
    
    const reorderedItemsInArea = newItemsInArea.map((item, index) => ({ ...item, order: index }));

    const updatedLocalLayout = localLayout.map(w => {
        if (w.area !== draggedItem.area) return w;
        const reorderedItem = reorderedItemsInArea.find(ri => ri.id === w.id);
        return reorderedItem || w;
    }).sort((a,b) => a.area.localeCompare(b.area) || a.order - b.order);

    setLocalLayout(updatedLocalLayout);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };
  
  const renderAreaWidgets = (areaTitle, areaKey) => {
    const areaWidgets = localLayout
        .filter(widget => widget.area === areaKey)
        .sort((a, b) => a.order - b.order);

    return (
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-2 border-b border-border pb-1 pt-2">{areaTitle}</h4>
        <AnimatePresence>
          {areaWidgets.map((widget) => (
            <motion.div
              key={widget.id}
              layout // Enables animation when reordering
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              draggable
              onDragStart={(e) => handleDragStart(e, widget)}
              onDragOver={(e) => handleDragOver(e, widget)}
              onDrop={(e) => handleDrop(e, widget)}
              onDragEnd={handleDragEnd}
              className={`p-3 mb-2 rounded-md bg-card border border-border cursor-grab active:cursor-grabbing transition-shadow active:shadow-xl active:ring-2 active:ring-primary ${draggedItem?.id === widget.id ? 'opacity-60 shadow-lg ring-2 ring-primary scale-105' : 'shadow-sm'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <GripVertical className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                  <Label htmlFor={`widget-visible-${widget.id}`} className="text-sm font-medium text-foreground">
                    {widget.name}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  {widget.isVisible ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <Switch
                    id={`widget-visible-${widget.id}`}
                    checked={widget.isVisible}
                    onCheckedChange={(checked) => handleVisibilityChange(widget.id, checked)}
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 items-center pl-8">
                <div className="flex items-center space-x-1">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label htmlFor={`widget-col-span-${widget.id}`} className="text-xs text-muted-foreground">Cols</Label>
                  <Input 
                    type="number" 
                    id={`widget-col-span-${widget.id}`} 
                    value={widget.currentSpan.col} 
                    onChange={(e) => handleSpanChange(widget.id, 'col', e.target.value)}
                    min={widget.minSize.w} max={widget.maxSize.w}
                    className="h-7 w-16 text-xs bg-input border-border focus:ring-primary"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label htmlFor={`widget-row-span-${widget.id}`} className="text-xs text-muted-foreground">Rows</Label>
                  <Input 
                    type="number" 
                    id={`widget-row-span-${widget.id}`} 
                    value={widget.currentSpan.row} 
                    onChange={(e) => handleSpanChange(widget.id, 'row', e.target.value)}
                    min={widget.minSize.h} max={widget.maxSize.h}
                    className="h-7 w-16 text-xs bg-input border-border focus:ring-primary"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">Customize Dashboard Widgets</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Toggle visibility, reorder, and resize widgets. Drag to change order within areas.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="p-3 mb-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" /> {error}
          </div>
        )}

        <ScrollArea className="max-h-[60vh] h-[50vh] pr-3">
            {renderAreaWidgets('Main Content Area Widgets', 'main')}
            {renderAreaWidgets('Sidebar Area Widgets', 'sidebar')}
        </ScrollArea>

        <DialogFooter className="mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border hover:bg-accent text-accent-foreground">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeDashboardDialog;