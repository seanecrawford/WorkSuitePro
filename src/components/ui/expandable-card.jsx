import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Maximize2, Minimize2, MoveRight, MoveDown } from 'lucide-react';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 150;

const ExpandableCard = ({
  id,
  title,
  counter,
  description,
  overlayContent,
  icon, 
  initialWidth = 320,
  initialHeight = 200,
  isExpanded,
  onToggleExpand, 
  onResize, 
  cardClassName,
  headerClassName,
  titleClassName,
  counterClassName,
  descriptionClassName,
  overlayClassName,
  dragControls, 
  style,
  children, // Added children prop to render content
}) => {
  const cardRef = useRef(null);
  const [internalSize, setInternalSize] = useState({ width: initialWidth, height: initialHeight });

  React.useEffect(() => {
    setInternalSize({ width: initialWidth, height: initialHeight });
  }, [initialWidth, initialHeight]);

  const handleDragResize = (axis, event, info) => {
    if (!cardRef.current) return;
    
    let newWidth = internalSize.width;
    let newHeight = internalSize.height;

    if (axis === 'x' || axis === 'xy') {
      newWidth = Math.max(MIN_WIDTH, internalSize.width + info.delta.x);
    }
    if (axis === 'y' || axis === 'xy') {
      newHeight = Math.max(MIN_HEIGHT, internalSize.height + info.delta.y);
    }
    
    const newSize = { width: newWidth, height: newHeight };
    setInternalSize(newSize); 
    if (onResize) {
      onResize(id, newSize); 
    }
  };
  
  const handleStyle = "absolute bg-sky-500/50 hover:bg-sky-500 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity";
  const handleSize = "w-4 h-4"; 
  const handleIconSize = "w-3 h-3 text-white";

  return (
    <motion.div
      ref={cardRef}
      layoutId={`card-container-${id}`} 
      drag={dragControls ? true : false} 
      dragControls={dragControls} 
      dragListener={dragControls ? false : true} 
      className={cn(
        'relative rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden group',
        'flex flex-col', 
        cardClassName
      )}
      style={{ 
        ...style, 
        width: internalSize.width, 
        height: internalSize.height,
        cursor: dragControls ? 'grab' : 'default',
      }}
      initial={{ opacity: 0.8, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
      whileTap={dragControls ? { cursor: 'grabbing', scale: 1.02, zIndex: 50 } : {}}
    >
      <div 
        className="flex flex-col h-full overflow-hidden" 
        style={{ cursor: !dragControls ? 'pointer' : 'inherit' }}
      >
        <CardHeader 
            className={cn('flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4 md:px-6 select-none flex-shrink-0', headerClassName)}
            onPointerDown={dragControls ? (e) => dragControls.start(e) : undefined}
            style={dragControls ? { cursor: 'grab' } : {}}
        >
          <div className="flex items-center">
            <CardTitle className={cn('text-base md:text-lg font-semibold text-sky-200', titleClassName)}>
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        
        {/* Main content area for the widget itself */}
        <div className="flex-grow overflow-auto px-4 md:px-6 pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          {children}
        </div>

        {/* Optional: Counter and Description if not part of children */}
        {(counter || description) && !children && (
          <CardContent className="px-4 md:px-6 pb-4 select-none flex-shrink-0">
            {counter && <div className={cn('text-3xl md:text-4xl font-bold text-white', counterClassName)}>{counter}</div>}
            {description && <p className={cn('text-xs md:text-sm text-slate-300', descriptionClassName)}>{description}</p>}
          </CardContent>
        )}

        <AnimatePresence>
          {isExpanded && overlayContent && ( 
            <motion.div
              key="overlay"
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={cn('px-4 md:px-6 py-3 bg-slate-800/70 border-t border-slate-700 select-none overflow-auto flex-shrink-0', overlayClassName)}
            >
              {overlayContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        drag="x"
        onDrag={(event, info) => handleDragResize('x', event, info)}
        dragConstraints={cardRef}
        dragElastic={0.1}
        className={cn(handleStyle, handleSize, 'right-[-8px] top-1/2 -translate-y-1/2 cursor-ew-resize flex items-center justify-center')}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9, cursor: 'ew-resize' }}
      >
        <MoveRight className={handleIconSize} />
      </motion.div>

      <motion.div
        drag="y"
        onDrag={(event, info) => handleDragResize('y', event, info)}
        dragConstraints={cardRef}
        dragElastic={0.1}
        className={cn(handleStyle, handleSize, 'bottom-[-8px] left-1/2 -translate-x-1/2 cursor-ns-resize flex items-center justify-center')}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9, cursor: 'ns-resize' }}
      >
        <MoveDown className={handleIconSize} />
      </motion.div>
      
      <motion.div
        drag
        onDrag={(event, info) => handleDragResize('xy', event, info)}
        dragConstraints={cardRef}
        dragElastic={0.1}
        className={cn(handleStyle, handleSize, 'bottom-[-8px] right-[-8px] cursor-nwse-resize flex items-center justify-center')}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9, cursor: 'nwse-resize' }}
      >
        <Maximize2 className={cn(handleIconSize, "transform rotate-45")} />
      </motion.div>
    </motion.div>
  );
};

export default ExpandableCard;