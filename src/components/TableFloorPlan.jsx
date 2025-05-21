import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useDrag, useDrop } from 'react-dnd';
import { getIcon } from '../utils/iconUtils';
import { moveTable } from '../redux/slices/tablesSlice';

// Table component - represents a single table in the floor plan
const Table = ({ table, isSelected, onClick, onMove, isEditMode }) => {
  const dispatch = useDispatch();
  const ref = useRef(null);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'table',
    item: { id: table.id, x: table.x, y: table.y },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: isEditMode,
  }));

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-blue-500';
      case 'cleaning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Setup drag functionality if in edit mode
  if (isEditMode) {
    drag(ref);
  }

  // Calculate remaining time for occupied tables
  const getRemainingTime = () => {
    if (!table.estimatedEndTime) return null;
    
    const endTime = new Date(table.estimatedEndTime);
    const now = new Date();
    const diffMs = endTime - now;
    
    if (diffMs <= 0) return "Time up";
    
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} min`;
  };

  return (
    <motion.div
      ref={ref}
      style={{
        position: 'absolute',
        left: `${table.x}px`,
        top: `${table.y}px`,
        width: `${table.width}px`,
        height: `${table.height}px`,
        zIndex: isSelected ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(table)}
      className={`cursor-pointer ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      {/* Table Shape */}
      <div 
        className={`w-full h-full ${
          table.shape === 'circle' ? 'rounded-full' : 'rounded-md'
        } border-2 border-surface-400 dark:border-surface-600 
          flex items-center justify-center
          ${table.status === 'available' ? 'bg-white dark:bg-surface-800' : 'bg-surface-100 dark:bg-surface-700'}`}
      >
        {/* Status Indicator */}
        <div className="absolute -top-1 -right-1">
          <div className={`w-4 h-4 rounded-full ${getStatusColor(table.status)} border border-white dark:border-surface-800`}></div>
        </div>
        
        {/* Table Number */}
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{table.number}</span>
          <span className="text-xs">{table.capacity} seats</span>
          
          {/* Additional Info */}
          {table.status === 'occupied' && (
            <div className="text-xs mt-1 text-red-600">
              {getRemainingTime()}
            </div>
          )}
          
          {table.status === 'reserved' && table.reservationTime && (
            <div className="text-xs mt-1 text-blue-600">
              {new Date(table.reservationTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main Floor Plan Component
const TableFloorPlan = ({ tables, sections, selectedTable, onSelectTable, isEditMode = false }) => {
  const dispatch = useDispatch();
  const floorPlanRef = useRef(null);
  const [scale, setScale] = useState(1);
  
  // Handle drop functionality
  const [, drop] = useDrop(() => ({
    accept: 'table',
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      const x = Math.round(item.x + delta.x);
      const y = Math.round(item.y + delta.y);
      dispatch(moveTable({ id: item.id, x, y }));
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  // Icons
  const ZoomInIcon = getIcon('zoom-in');
  const ZoomOutIcon = getIcon('zoom-out');
  const MoveIcon = getIcon('move');

  return (
    <div className="relative flex flex-col h-full">
      {/* Controls */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Floor Plan</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleZoomOut}
            className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700"
            title="Zoom Out"
          >
            <ZoomOutIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={handleZoomIn}
            className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700"
            title="Zoom In"
          >
            <ZoomInIcon className="w-5 h-5" />
          </button>
          {isEditMode && (
            <div className="flex items-center text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-md">
              <MoveIcon className="w-3 h-3 mr-1" />
              <span>Edit Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Floor Plan */}
      <div 
        ref={(node) => { drop(node); floorPlanRef.current = node; }}
        className="flex-grow relative border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-800 overflow-hidden"
        style={{ minHeight: '600px', height: 'calc(100vh - 250px)' }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '100%', height: '100%' }}>
          {tables.map(table => (
            <Table key={table.id} table={table} isSelected={selectedTable?.id === table.id} onClick={onSelectTable} isEditMode={isEditMode} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableFloorPlan;