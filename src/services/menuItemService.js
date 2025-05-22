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
  'Name', 'Tags', 'Owner', 'price', 'category'
];

/**
 * Fetch all menu items
 */
export const fetchMenuItems = async () => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: ['Id', 'Name', 'price', 'category']
    };
    
    const response = await apperClient.fetchRecords('menu_item', params);
    
    if (!response || !response.data) {
      return [];
    }
    
    return response.data.map(item => ({
      id: item.Id,
      name: item.Name,
      price: item.price,
      category: item.category
    }));
  } catch (error) {
    console.error("Error fetching menu items:", error);
    toast.error("Failed to load menu items. Please try again.");
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
    const filteredData = Object.keys(itemData)
      .filter(key => updateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = itemData[key];
        return obj;
      }, {});
      
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.createRecord('menu_item', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to create menu item");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating menu item:", error);
    toast.error("Failed to create menu item. Please try again.");
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