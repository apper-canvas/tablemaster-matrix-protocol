// src/services/tableService.js

/**
 * Service for handling table data operations with the Apper backend
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
  'section', 'Name', 'Tags', 'Owner', 'number', 'capacity', 
  'shape', 'status', 'customer', 'timeSeated', 'estimatedEndTime', 
  'server', 'x', 'y', 'width', 'height'
];

/**
 * Fetch all tables
 */
export const fetchTables = async () => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        'Id', 'section', 'Name', 'Tags', 'Owner', 'number', 'capacity', 
        'shape', 'status', 'customer', 'timeSeated', 'estimatedEndTime', 
        'server', 'x', 'y', 'width', 'height'
      ]
    };
    
    const response = await apperClient.fetchRecords('table', params);
    
    if (!response || !response.data) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    toast.error("Failed to load tables. Please try again.");
    throw error;
  }
};

/**
 * Fetch table sections
 */
export const fetchTableSections = async () => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: ['Id', 'Name', 'color']
    };
    
    const response = await apperClient.fetchRecords('table_section', params);
    
    if (!response || !response.data) {
      return [];
    }
    
    return response.data.map(section => ({
      id: section.Id,
      name: section.Name,
      color: section.color
    }));
  } catch (error) {
    console.error("Error fetching table sections:", error);
    toast.error("Failed to load table sections. Please try again.");
    throw error;
  }
};

/**
 * Create a new table
 */
export const createTable = async (tableData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields
    const filteredData = Object.keys(tableData)
      .filter(key => updateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = tableData[key];
        return obj;
      }, {});
      
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.createRecord('table', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to create table");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating table:", error);
    toast.error("Failed to create table. Please try again.");
    throw error;
  }
};

/**
 * Update an existing table
 */
export const updateTable = async (tableData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields plus Id
    const filteredData = Object.keys(tableData)
      .filter(key => key === 'Id' || updateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = tableData[key];
        return obj;
      }, {});
      
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.updateRecord('table', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update table");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating table:", error);
    toast.error("Failed to update table. Please try again.");
    throw error;
  }
};

/**
 * Delete a table
 */
export const deleteTable = async (tableId) => {
  try {
    const apperClient = getApperClient();
    const params = { RecordIds: [tableId] };
    
    const response = await apperClient.deleteRecord('table', params);
    
    return response && response.success;
  } catch (error) {
    console.error("Error deleting table:", error);
    toast.error("Failed to delete table. Please try again.");
    throw error;
  }
};