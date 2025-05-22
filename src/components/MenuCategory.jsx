import { useState } from 'react';
import { Draggable, Droppable as LibDroppable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import MenuItem from './MenuItem';

// Custom wrapper component with default parameters instead of defaultProps
const DroppableWrapper = (props) => {
  const {
    droppableId,
    type = 'DEFAULT',
    direction = 'vertical',
    ignoreContainerClipping = false,
    isDropDisabled = false,
    isCombineEnabled = false,
    children,
    ...restProps
  } = props;
  
  return (
    <LibDroppable 
      droppableId={droppableId} 
      type={type} direction={direction} ignoreContainerClipping={ignoreContainerClipping} isDropDisabled={isDropDisabled} isCombineEnabled={isCombineEnabled} {...restProps}>
      {children}
    </LibDroppable>
  );
};

const MenuCategory = ({ 
  category, 
  index, 
  onAddItem, 
  onEditCategory, 
  onDeleteCategory, 
  onEditItem, 
  onDeleteItem 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Icons
  const ChevronDownIcon = getIcon('chevron-down');
  const ChevronRightIcon = getIcon('chevron-right');
  const EditIcon = getIcon('edit');
  const TrashIcon = getIcon('trash');
  const PlusIcon = getIcon('plus');
  const GripIcon = getIcon('grip-vertical');

  return (
    <Draggable draggableId={category.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`card overflow-hidden transition-all duration-200 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary ring-opacity-50' : ''
          }`}
        >
          <div 
            className="flex items-center p-4 border-b border-surface-200 dark:border-surface-700"
          >
            <div
              {...provided.dragHandleProps}
              className="mr-3 p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-grab"
            >
              <GripIcon className="w-5 h-5 text-surface-500 dark:text-surface-400" />
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mr-2 p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex-grow">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  {category.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={onAddItem}
                className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-primary dark:text-primary-light"
                title="Add item to this category"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onEditCategory(category.id)}
                className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
                title="Edit category"
              >
                <EditIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={onDeleteCategory}
                className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-red-500 dark:text-red-400"
                title="Delete category"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <motion.div
            animate={{ height: isCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <DroppableWrapper droppableId={category.id} type="item">
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-4 space-y-4"
                >
                  {category.items.map((item, itemIndex) => (
                    <MenuItem key={item.id} item={item} index={itemIndex} onEdit={() => onEditItem(item.id)} onDelete={() => onDeleteItem(item.id)} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </DroppableWrapper>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
};

export default MenuCategory;