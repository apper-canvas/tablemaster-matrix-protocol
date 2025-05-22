// src/services/ingredientService.js

/**
 * Service for handling ingredient data operations with the Apper backend
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
  'Name', 'Tags', 'Owner', 'category', 'unitType', 'currentStock',
  'parLevel', 'cost', 'vendor', 'vendorContact', 'lastRestocked',
  'expirationDate', 'location', 'notes'
];

// Fields we can update for waste logs
const wasteLogUpdateableFields = [
  'Name', 'Tags', 'Owner', 'ingredient', 'ingredientName', 'quantity',
  'date', 'unitType', 'reason', 'costImpact', 'loggedBy', 'notes'
];

/**
 * Fetch all ingredients
 */
export const fetchIngredients = async () => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        'Id', 'Name', 'category', 'unitType', 'currentStock',
        'parLevel', 'cost', 'vendor', 'vendorContact', 'lastRestocked',
        'expirationDate', 'location', 'notes'
      ]
    };
    
    const response = await apperClient.fetchRecords('ingredient', params);
    
    if (!response || !response.data) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    toast.error("Failed to load ingredients. Please try again.");
    throw error;
  }
};

/**
 * Create a new ingredient
 */
export const createIngredient = async (ingredientData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields
    const filteredData = Object.keys(ingredientData)
      .filter(key => updateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = ingredientData[key];
        return obj;
      }, {});
      
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.createRecord('ingredient', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to create ingredient");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating ingredient:", error);
    toast.error("Failed to create ingredient. Please try again.");
    throw error;
  }
};

/**
 * Update an existing ingredient
 */
export const updateIngredient = async (ingredientData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields plus Id
    const filteredData = Object.keys(ingredientData)
      .filter(key => key === 'Id' || updateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = ingredientData[key];
        return obj;
      }, {});
      
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.updateRecord('ingredient', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update ingredient");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating ingredient:", error);
    toast.error("Failed to update ingredient. Please try again.");
    throw error;
  }
};

/**
 * Delete an ingredient
 */
export const deleteIngredient = async (ingredientId) => {
  try {
    const apperClient = getApperClient();
    const params = { RecordIds: [ingredientId] };
    
    const response = await apperClient.deleteRecord('ingredient', params);
    
    return response && response.success;
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    toast.error("Failed to delete ingredient. Please try again.");
    throw error;
  }
};

/**
 * Log waste for an ingredient
 */
export const logWaste = async (wasteData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields
    const filteredData = Object.keys(wasteData)
      .filter(key => wasteLogUpdateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = wasteData[key];
        return obj;
      }, {});
      
    // Set current date if not provided
    if (!filteredData.date) {
      filteredData.date = new Date().toISOString().split('T')[0];
    }
    
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.createRecord('waste_log', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to log waste");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error logging waste:", error);
    toast.error("Failed to log waste. Please try again.");
    throw error;
  }
};