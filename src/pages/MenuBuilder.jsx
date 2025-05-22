import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable as LibDroppable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

// Custom wrapper component to avoid defaultProps deprecation warning
const DroppableWrapper = ({
  droppableId,
  type = 'DEFAULT',
  direction = 'vertical',
  ignoreContainerClipping = false,
  isDropDisabled = false,
  isCombineEnabled = false,
  children,
  ...restProps
}) => {
  return (
    <LibDroppable 
      droppableId={droppableId}
      type={type} direction={direction}
      ignoreContainerClipping={ignoreContainerClipping} isDropDisabled={isDropDisabled} isCombineEnabled={isCombineEnabled} {...restProps}>
      {children}
    </LibDroppable>
  );
};
import MenuCategory from '../components/MenuCategory';
import MenuItemForm from '../components/MenuItemForm';

// Demo data
const initialMenuData = {
  categories: [
    {
      id: 'appetizers',
      name: 'Appetizers',
      description: 'Start your meal off right',
      order: 0,
      items: [
        {
          id: 'app-1',
          name: 'Loaded Nachos',
          description: 'Crispy tortilla chips loaded with cheese, jalapeños, and sour cream',
          price: 9.99,
          allergens: ['dairy', 'gluten'],
          isVegetarian: true,
          cost: 3.50,
          popularity: 'high',
          image: null,
          order: 0
        },
        {
          id: 'app-2',
          name: 'Chicken Wings',
          description: 'Six crispy wings tossed in your choice of sauce',
          price: 12.99,
          allergens: [],
          isVegetarian: false,
          cost: 4.25,
          popularity: 'high',
          image: null,
          order: 1
        }
      ]
    },
    {
      id: 'entrees',
      name: 'Main Courses',
      description: 'Hearty and delicious mains',
      order: 1,
      items: [
        {
          id: 'ent-1',
          name: 'Grilled Salmon',
          description: 'Fresh salmon fillet grilled to perfection with lemon butter',
          price: 21.99,
          allergens: ['fish'],
          isVegetarian: false,
          cost: 8.75,
          popularity: 'medium',
          image: null,
          order: 0
        },
        {
          id: 'ent-2',
          name: 'Pasta Primavera',
          description: 'Fettuccine with seasonal vegetables in a light cream sauce',
          price: 15.99,
          allergens: ['dairy', 'gluten'],
          isVegetarian: true,
          cost: 4.50,
          popularity: 'medium',
          image: null,
          order: 1
        }
      ]
    }
  ]
};

const MenuBuilder = () => {
  const [menuData, setMenuData] = useState(initialMenuData);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Icons
  const PlusIcon = getIcon('plus');
  const TrashIcon = getIcon('trash');
  const EditIcon = getIcon('edit');
  const CloseIcon = getIcon('x');
  const SaveIcon = getIcon('save');
  const AlertIcon = getIcon('alert-triangle');
  const MenuIcon = getIcon('menu');
  const DollarSignIcon = getIcon('dollar-sign');
  const TagIcon = getIcon('tag');

  // Function to handle drag and drop
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;

    // If no destination or dropped in the same place
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }

    // If dragging a category
    if (type === 'category') {
      const newCategories = Array.from(menuData.categories);
      const [movedCategory] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, movedCategory);
      
      // Update the order property of all categories
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        order: index
      }));
      
      setMenuData({
        ...menuData,
        categories: updatedCategories
      });
      
      toast.success(`Moved "${movedCategory.name}" category`);
      return;
    }

    // If dragging an item
    if (type === 'item') {
      // If moving within the same category
      if (source.droppableId === destination.droppableId) {
        const categoryIndex = menuData.categories.findIndex(
          cat => cat.id === source.droppableId
        );
        
        if (categoryIndex === -1) return;
        
        const newItems = Array.from(menuData.categories[categoryIndex].items);
        const [movedItem] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, movedItem);
        
        // Update order property of all items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index
        }));
        
        const newCategories = Array.from(menuData.categories);
        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          items: updatedItems
        };
        
        setMenuData({
          ...menuData,
          categories: newCategories
        });
        
        toast.success(`Reordered "${movedItem.name}" within ${menuData.categories[categoryIndex].name}`);
      } 
      // If moving between categories
      else {
        const sourceCategoryIndex = menuData.categories.findIndex(
          cat => cat.id === source.droppableId
        );
        const destCategoryIndex = menuData.categories.findIndex(
          cat => cat.id === destination.droppableId
        );
        
        if (sourceCategoryIndex === -1 || destCategoryIndex === -1) return;
        
        const sourceItems = Array.from(menuData.categories[sourceCategoryIndex].items);
        const destItems = Array.from(menuData.categories[destCategoryIndex].items);
        
        const [movedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);
        
        // Update order property of all items in both categories
        const updatedSourceItems = sourceItems.map((item, index) => ({
          ...item,
          order: index
        }));
        
        const updatedDestItems = destItems.map((item, index) => ({
          ...item,
          order: index
        }));
        
        const newCategories = Array.from(menuData.categories);
        newCategories[sourceCategoryIndex] = {
          ...newCategories[sourceCategoryIndex],
          items: updatedSourceItems
        };
        newCategories[destCategoryIndex] = {
          ...newCategories[destCategoryIndex],
          items: updatedDestItems
        };
        
        setMenuData({
          ...menuData,
          categories: newCategories
        });
        
        toast.success(
          `Moved "${movedItem.name}" from ${menuData.categories[sourceCategoryIndex].name} to ${menuData.categories[destCategoryIndex].name}`
        );
      }
    }
  };
  
  // Function to add a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    // Create a new category with a unique ID
    const newCategory = {
      id: `category-${Date.now()}`,
      name: newCategoryName,
      description: newCategoryDescription,
      order: menuData.categories.length,
      items: []
    };
    
    setMenuData({
      ...menuData,
      categories: [...menuData.categories, newCategory]
    });
    
    // Reset form
    setNewCategoryName('');
    setNewCategoryDescription('');
    setIsAddingCategory(false);
    
    toast.success(`Added new category: ${newCategory.name}`);
  };
  
  // Function to update a category
  const handleUpdateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    const updatedCategories = menuData.categories.map(category => {
      if (category.id === isEditingCategory) {
        return {
          ...category,
          name: newCategoryName,
          description: newCategoryDescription
        };
      }
      return category;
    });
    
    setMenuData({
      ...menuData,
      categories: updatedCategories
    });
    
    // Reset form
    setNewCategoryName('');
    setNewCategoryDescription('');
    setIsEditingCategory(null);
    
    toast.success("Category updated successfully");
  };
  
  // Function to delete a category
  const handleDeleteCategory = (categoryId) => {
    const category = menuData.categories.find(cat => cat.id === categoryId);
    
    if (category.items.length > 0) {
      setConfirmDelete({
        type: 'category',
        id: categoryId,
        name: category.name,
        message: `This will delete the "${category.name}" category and all ${category.items.length} items within it. This action cannot be undone.`
      });
      return;
    }
    
    deleteCategory(categoryId);
  };
  
  // Function to actually delete the category after confirmation
  const deleteCategory = (categoryId) => {
    const categoryToDelete = menuData.categories.find(cat => cat.id === categoryId);
    const updatedCategories = menuData.categories.filter(
      category => category.id !== categoryId
    ).map((cat, index) => ({
      ...cat,
      order: index
    }));
    
    setMenuData({
      ...menuData,
      categories: updatedCategories
    });
    
    setConfirmDelete(null);
    toast.success(`Deleted category: ${categoryToDelete.name}`);
  };
  
  // Function to add a new menu item
  const handleAddItem = (categoryId, itemData) => {
    const newItem = {
      id: `item-${Date.now()}`,
      ...itemData,
      order: menuData.categories.find(cat => cat.id === categoryId)?.items.length || 0
    };
    
    const updatedCategories = menuData.categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: [...category.items, newItem]
        };
      }
      return category;
    });
    
    setMenuData({
      ...menuData,
      categories: updatedCategories
    });
    
    setIsAddingItem(false);
    setSelectedCategory(null);
    
    toast.success(`Added new item: ${newItem.name}`);
  };
  
  // Function to update a menu item
  const handleUpdateItem = (categoryId, itemId, itemData) => {
    const updatedCategories = menuData.categories.map(category => {
      if (category.id === categoryId) {
        const updatedItems = category.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              ...itemData
            };
          }
          return item;
        });
        
        return {
          ...category,
          items: updatedItems
        };
      }
      return category;
    });
    
    setMenuData({
      ...menuData,
      categories: updatedCategories
    });
    
    setIsEditingItem(null);
    
    toast.success(`Updated item: ${itemData.name}`);
  };
  
  // Function to delete a menu item
  const handleDeleteItem = (categoryId, itemId) => {
    const category = menuData.categories.find(cat => cat.id === categoryId);
    const item = category.items.find(item => item.id === itemId);
    
    setConfirmDelete({
      type: 'item',
      categoryId,
      id: itemId,
      name: item.name,
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    });
  };
  
  // Function to actually delete the item after confirmation
  const deleteItem = (categoryId, itemId) => {
    const categoryIndex = menuData.categories.findIndex(cat => cat.id === categoryId);
    const itemToDelete = menuData.categories[categoryIndex].items.find(item => item.id === itemId);
    
    const updatedItems = menuData.categories[categoryIndex].items
      .filter(item => item.id !== itemId)
      .map((item, index) => ({
        ...item,
        order: index
      }));
    
    const updatedCategories = [...menuData.categories];
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      items: updatedItems
    };
    
    setMenuData({
      ...menuData,
      categories: updatedCategories
    });
    
    setConfirmDelete(null);
    toast.success(`Deleted item: ${itemToDelete.name}`);
  };

  return (
    <div className="py-6">
      <div className="app-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Menu Builder</h1>
          <button
            onClick={() => {
              setIsAddingCategory(true);
              setIsEditingCategory(null);
              setNewCategoryName('');
              setNewCategoryDescription('');
            }}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          Drag and drop menu categories and items to reorder them. Click on items to edit details.
        </p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <DroppableWrapper droppableId="all-categories" type="category">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-6"
              >
                {menuData.categories.map((category, index) => (
                  <MenuCategory
                    key={category.id}
                    category={category}
                    index={index}
                    onAddItem={() => {
                      setIsAddingItem(true);
                      setSelectedCategory(category.id);
                      setIsEditingItem(null);
                    }}
                    onEditCategory={(id) => {
                      const categoryToEdit = menuData.categories.find(cat => cat.id === id);
                      setIsEditingCategory(id);
                      setNewCategoryName(categoryToEdit.name);
                      setNewCategoryDescription(categoryToEdit.description || '');
                      setIsAddingCategory(false);
                    }}
                    onDeleteCategory={() => handleDeleteCategory(category.id)}
                    onEditItem={(itemId) => {
                      setIsEditingItem({
                        categoryId: category.id,
                        itemId: itemId
                      });
                      setIsAddingItem(false);
                    }}
                    onDeleteItem={(itemId) => handleDeleteItem(category.id, itemId)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </DroppableWrapper>
        </DragDropContext>
        
        {/* No categories message */}
        {menuData.categories.length === 0 && (
          <div className="card p-12 text-center">
            <MenuIcon className="w-12 h-12 mx-auto mb-4 text-surface-400 dark:text-surface-600" />
            <h3 className="text-xl font-medium mb-2">No Menu Categories Yet</h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              Create your first category to start building your menu
            </p>
            <button
              onClick={() => {
                setIsAddingCategory(true);
                setNewCategoryName('');
                setNewCategoryDescription('');
              }}
              className="btn btn-primary inline-flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add First Category
            </button>
          </div>
        )}
        
        {/* Category Form Modal */}
        {isAddingCategory || isEditingCategory ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {isEditingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setIsEditingCategory(null);
                  }}
                  className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="categoryName" className="label">Category Name *</label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="input"
                  placeholder="e.g., Appetizers, Main Courses, Desserts"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="categoryDescription" className="label">Description (optional)</label>
                <textarea
                  id="categoryDescription"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Brief description of this menu category"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setIsEditingCategory(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={isEditingCategory ? handleUpdateCategory : handleAddCategory}
                  className="btn btn-primary flex items-center"
                >
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {isEditingCategory ? "Update Category" : "Add Category"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Item Form Modal */}
        {isAddingItem || isEditingItem ? (
          <MenuItemForm
            onClose={() => {
              setIsAddingItem(false);
              setIsEditingItem(null);
            }}
            onSubmit={(itemData) => {
              if (isEditingItem) {
                handleUpdateItem(
                  isEditingItem.categoryId,
                  isEditingItem.itemId,
                  itemData
                );
              } else if (isAddingItem && selectedCategory) {
                handleAddItem(selectedCategory, itemData);
              }
            }}
            item={isEditingItem ? menuData.categories
              .find(cat => cat.id === isEditingItem.categoryId)
              .items.find(item => item.id === isEditingItem.itemId) : null}
            isEditing={!!isEditingItem}
          />
        ) : null}
        
        {/* Confirmation Dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-start mb-4">
                <div className="mr-3 flex-shrink-0">
                  <AlertIcon className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Confirm Deletion</h3>
                  <p className="text-surface-600 dark:text-surface-400">
                    {confirmDelete.message}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDelete.type === 'category') {
                      deleteCategory(confirmDelete.id);
                    } else if (confirmDelete.type === 'item') {
                      deleteItem(confirmDelete.categoryId, confirmDelete.id);
                    }
                  }}
                  className="btn bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete {confirmDelete.type === 'category' ? 'Category' : 'Item'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBuilder;