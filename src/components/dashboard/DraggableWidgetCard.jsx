import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GripVertical, RefreshCw, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const DraggableWidgetCard = ({ widget, onConfigChange, onRefresh, onSettings, onRemove, children, className, style }) => {

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const cardClasses = `bg-slate-850/50 backdrop-blur-md border-slate-700/80 shadow-xl rounded-xl flex flex-col ${className}`;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout 
      className={cardClasses}
      style={style}
    >
      <CardHeader className={`flex flex-row items-center justify-between py-2.5 px-3.5 border-b border-slate-700/70 ${widget.isDraggable !== false ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        <div className="flex items-center gap-1.5">
          {widget.isDraggable !== false && <GripVertical className="h-4 w-4 text-slate-500" />}
          <CardTitle className="text-sm font-medium text-slate-200 tracking-wide">{widget.name || widget.title}</CardTitle>
        </div>
        <div className="flex items-center gap-0.5">
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={() => onRefresh(widget.id)} className="h-6 w-6 text-slate-400 hover:text-sky-400 hover:bg-slate-700/50">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          {onSettings && (
            <Button variant="ghost" size="icon" onClick={() => onSettings(widget.id)} className="h-6 w-6 text-slate-400 hover:text-amber-400 hover:bg-slate-700/50">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          )}
          {onRemove && (
            <Button variant="ghost" size="icon" onClick={() => onRemove(widget.id)} className="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-slate-700/50">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={`p-0 flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50`}>
        {children}
      </CardContent>
    </motion.div>
  );
};

export default DraggableWidgetCard;