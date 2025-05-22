import { useState, useEffect } from 'react';
import { DragDropContext, Droppable as LibDroppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
// Custom wrapper component with default parameters instead of defaultProps
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
import { getIcon } from '../utils/iconUtils';
import MenuCategory from '../components/MenuCategory';
import MenuItemForm from '../components/MenuItemForm';
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/menuItemService';

const initialMenuData = {
  categories: []
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
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);

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
  const LoaderIcon = getIcon('loader');
  
  // Load menu data from database on component mount
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const data = await fetchMenuItems(setIsLoading);
        setMenuData(data);
      } catch (error) {
        console.error("Failed to load menu data:", error);
      }
    };
    loadMenuData();
  }, []);

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
      
      toast.success(`Reordered "${movedCategory.name}" category`);
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
      name: newCategoryName.trim(),
      description: newCategoryDescription,
      order: menuData.categories.length,
      items: []
    };
    
    try {
      // In a real implementation, we would save the category to the database
      // Since there's no direct category table, we're adding it to the UI
      // Categories are derived from menu items' category field
      setMenuData({
        ...menuData,
        categories: [...menuData.categories, newCategory]
      });
      
      // Reset form
      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsAddingCategory(false);
      
      toast.success(`Added new category: ${newCategory.name}`);
      
      // Note: In a full implementation, we would create this as a record
      // in a categories table, but we're using the menu_item.category field
      // to derive categories
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category. Please try again.");
    }
  };
  
  // Function to update a category
  const handleUpdateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    try {
      // Find the category to update
      const categoryIndex = menuData.categories.findIndex(cat => cat.id === isEditingCategory);
      if (categoryIndex === -1) return;
      
      const oldCategoryName = menuData.categories[categoryIndex].name;
      
      // Update the category in the UI
      const updatedCategories = menuData.categories.map(category => {
        if (category.id === isEditingCategory) {
          return {
            ...category,
            name: newCategoryName.trim(),
            description: newCategoryDescription
          };
        }
        return category;
      });
      
      setMenuData({
        ...menuData,
        categories: updatedCategories
      });
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category. Please try again.");
    }
    
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
  const handleAddItem = async (categoryId, itemData) => {
    try {
      setIsLoading(true);
      
      // Find the category
      const category = menuData.categories.find(cat => cat.id === categoryId);
      if (!category) throw new Error("Category not found");
      
      // Prepare data for API
      const apiData = {
        ...itemData,
        category: category.name,
      };
      
      // Create the item in the database
      const createdItem = await createMenuItem(apiData);
      
      // Update local state with the new item
      const newItem = {
        id: createdItem.Id,
        name: createdItem.Name,
        price: Number(createdItem.price) || 0,
        description: createdItem.description || '',
        cost: Number(createdItem.cost) || 0,
        isVegetarian: Boolean(createdItem.isVegetarian),
        allergens: createdItem.allergens ? createdItem.allergens.split(',') : [],
        popularity: createdItem.popularity || 'medium',
        order: category.items.length
      };
      
      // Update UI
      const updatedCategories = menuData.categories.map(cat => 
        cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat
      );
      
      setMenuData({ ...menuData, categories: updatedCategories });
      setIsAddingItem(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("Failed to add menu item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to update a menu item
  const handleUpdateItem = async (categoryId, itemId, itemData) => {
    try {
      setIsLoading(true);
      
      // Find the category
      const category = menuData.categories.find(cat => cat.id === categoryId);
      if (!category) throw new Error("Category not found");
      
      // Prepare data for API
      const apiData = {
        ...itemData,
        category: category.name,
      };
      
      // Update in database
      await updateMenuItem(itemId, apiData);
      
      // Update local state
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
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Failed to update menu item. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
  const deleteItem = async (categoryId, itemId) => {
    try {
      setIsLoading(true);
      
      // Find the category and item
      const categoryIndex = menuData.categories.findIndex(cat => cat.id === categoryId);
      if (categoryIndex === -1) throw new Error("Category not found");
      
      const itemToDelete = menuData.categories[categoryIndex].items.find(item => item.id === itemId);
      if (!itemToDelete) throw new Error("Item not found");
      
      // Delete from database
      await deleteMenuItem(itemId);
      
      // Update local state
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
      
      toast.success(`Deleted item: ${itemToDelete.name}`);
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item. Please try again.");
    } finally {
      setIsLoading(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="py-6">
      <div className="app-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Menu Builder</h1>
          <button
            disabled={isLoading}
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
        
        {isLoading && (
          <div className="flex justify-center items-center my-8">
            <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-surface-600 dark:text-surface-400">Loading menu data...</span>
          </div>
        )}
        
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
        {!isLoading && menuData.categories.length === 0 && (
          <div className="card p-12 text-center">
            <MenuIcon className="w-12 h-12 mx-auto mb-4 text-surface-400 dark:text-surface-600" />
            <h3 className="text-xl font-medium mb-2">No Menu Categories Yet</h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              Create your first category to start building your menu
            </p>
            <button
              disabled={isLoading}
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
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={isEditingCategory ? handleUpdateCategory : handleAddCategory}
                  className="btn btn-primary flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SaveIcon className="w-4 h-4 mr-2" />
                  )}
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
              ?.items.find(item => item.id === isEditingItem.itemId) : null}
            isEditing={!!isEditingItem}
            isLoading={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <>Delete {confirmDelete.type === 'category' ? 'Category' : 'Item'}</>
                  )}
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