import { Draggable } from 'react-beautiful-dnd';
import { getIcon } from '../utils/iconUtils';

const MenuItem = ({ item, index, onEdit, onDelete }) => {
  // Icons
  const EditIcon = getIcon('edit');
  const TrashIcon = getIcon('trash');
  const GripIcon = getIcon('grip-vertical');
  const DollarSignIcon = getIcon('dollar-sign');
  const TagIcon = getIcon('tag');
  const AlertCircleIcon = getIcon('alert-circle');
  const LeafIcon = getIcon('leaf');
  const TrendingUpIcon = getIcon('trending-up');
  const ShoppingBasketIcon = getIcon('shopping-basket');

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-800 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-light ring-opacity-50' : ''
          }`}
        >
          <div className="flex items-center p-4">
            <div
              {...provided.dragHandleProps}
              className="mr-3 p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-grab"
            >
              <GripIcon className="w-5 h-5 text-surface-500 dark:text-surface-400" />
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center mb-1">
                <h4 className="font-medium">{item.name}</h4>
                <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                  {formatPrice(item.price)}
                </span>
              </div>
              
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                {item.description || "No description provided"}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {item.allergens && item.allergens.length > 0 && (
                  <div className="inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded">
                    <AlertCircleIcon className="w-3 h-3 mr-1" />
                    <span>Allergens: {item.allergens.join(', ')}</span>
                  </div>
                )}
                {item.isVegetarian && (
                  <div className="inline-flex items-center text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                    <LeafIcon className="w-3 h-3 mr-1" />
                    <span>Vegetarian</span>
                  </div>
                )}
                {item.popularity && (
                  <div className="inline-flex items-center text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                    <TrendingUpIcon className="w-3 h-3 mr-1" />
                    <span>Popularity: {item.popularity}</span>
                  </div>
                )}
                <div className="inline-flex items-center text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded">
                  <ShoppingBasketIcon className="w-3 h-3 mr-1" />
                  <span>Cost: {formatPrice(item.cost)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center ml-4 space-x-2">
              <button 
                onClick={onEdit}
                className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
                title="Edit item"
              >
                <EditIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={onDelete}
                className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-red-500 dark:text-red-400"
                title="Delete item"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default MenuItem;