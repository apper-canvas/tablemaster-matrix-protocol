// src/services/menuItemService.js

/**
 * Service for handling menu item data operations with the Apper backend
 */

import { toast } from 'react-toastify';

// Get ApperClient instance
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Fields we can update based on visibility
const updateableFields = [
  'Name', 'Tags', 'Owner', 'price', 'category', 'description', 'cost', 'isVegetarian', 'allergens', 'popularity'
];

/**
 * Fetch all menu items with categories
 */
export const fetchMenuItems = async (isLoading = () => {}) => {
  try {
    isLoading(true);
    const apperClient = getApperClient();
    const params = {
      fields: ['Id', 'Name', 'price', 'category', 'description', 'cost', 'isVegetarian', 'allergens', 'popularity', 'Tags', 'Owner'],
      orderBy: [
        {
          fieldName: "category",
          SortType: "ASC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords('menu_item', params);
    
    if (!response || !response.data) {
      isLoading(false);
      return [];
    }
    
    // Group items by category
    const groupedItems = response.data.reduce((acc, item) => {
      const categoryName = item.category || 'Uncategorized';
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          id: `category-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
          name: categoryName,
          items: []
        };
      }
      
      acc[categoryName].items.push({
        id: item.Id,
        name: item.Name,
        price: Number(item.price) || 0,
        description: item.description || '',
        cost: Number(item.cost) || 0,
        isVegetarian: Boolean(item.isVegetarian),
        allergens: item.allergens ? item.allergens.split(',') : [],
        popularity: item.popularity || 'medium',
        order: acc[categoryName].items.length
      });
      
      return acc;
    }, {});
    
    // Convert to array and sort categories
    const categories = Object.values(groupedItems).map((category, index) => ({
      ...category,
      order: index
    }));
    
    isLoading(false);
    return { categories };
  } catch (error) {
    console.error("Error fetching menu items:", error);
    toast.error("Failed to load menu items. Please try again.");
    isLoading(false);
    throw error;
  }
};

/**
 * Get a menu item by ID
 */
export const getMenuItemById = async (itemId) => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: ['Id', 'Name', 'price', 'category', 'description', 'cost', 'isVegetarian', 'allergens', 'popularity', 'Tags', 'Owner']
    };
    
    const response = await apperClient.getRecordById('menu_item', itemId, params);
    
    if (!response || !response.data) {
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu item with ID ${itemId}:`, error);
    throw error;
  }
};

/**
 * Create a new menu item
 */
export const createMenuItem = async (itemData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields
    const filteredData = {
      Name: itemData.name,
      price: itemData.price,
      category: itemData.category || '',
      description: itemData.description || '',
      cost: itemData.cost || 0,
      isVegetarian: itemData.isVegetarian || false,
      allergens: Array.isArray(itemData.allergens) ? itemData.allergens.join(',') : '',
      popularity: itemData.popularity || 'medium'
    };
      
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.createRecord('menu_item', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to create menu item");
    }
    
    toast.success("Menu item created successfully!");
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating menu item:", error);
    toast.error("Failed to create menu item. Please try again.");
    throw error;
  }
};

/**
 * Update an existing menu item
 */
export const updateMenuItem = async (itemId, itemData) => {
  try {
    const apperClient = getApperClient();
    
    // Format data for update
    const filteredData = {
      Id: itemId,
      Name: itemData.name,
      price: itemData.price,
      category: itemData.category || '',
      description: itemData.description || '',
      cost: itemData.cost || 0,
      isVegetarian: itemData.isVegetarian || false,
      allergens: Array.isArray(itemData.allergens) ? itemData.allergens.join(',') : '',
      popularity: itemData.popularity || 'medium'
    };
    
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.createRecord('menu_item', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to create menu item");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating menu item:", error);
    toast.error("Failed to update menu item. Please try again.");
    throw error;

  }
};

/**
 * Delete a menu item
 */
export const deleteMenuItem = async (itemId) => {
  try {
    const apperClient = getApperClient();
    const params = { RecordIds: [itemId] };
    
    const response = await apperClient.deleteRecord('menu_item', params);
    
    return response && response.success;
  } catch (error) {
    console.error("Error deleting menu item:", error);
    toast.error("Failed to delete menu item. Please try again.");
    throw error;
  }
};
