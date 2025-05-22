// src/services/waitlistService.js

/**
 * Service for handling waitlist data operations with the Apper backend
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
  'Name', 'Tags', 'Owner', 'customerName', 'phoneNumber', 
  'partySize', 'notes', 'timeAdded', 'estimatedWaitTime',
  'status', 'notified', 'notifiedAt', 'seatedAt', 'cancelledAt'
];

/**
 * Fetch waitlist entries
 */
export const fetchWaitlist = async () => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        'Id', 'Name', 'customerName', 'phoneNumber', 'partySize',
        'notes', 'timeAdded', 'estimatedWaitTime', 'status',
        'notified', 'notifiedAt', 'seatedAt', 'cancelledAt'
      ]
    };
    
    const response = await apperClient.fetchRecords('waitlist_entry', params);
    
    if (!response || !response.data) {
      return [];
    }
    
    return response.data.map(entry => ({
      id: entry.Id,
      customerName: entry.customerName,
      phoneNumber: entry.phoneNumber,
      partySize: entry.partySize,
      notes: entry.notes,
      timeAdded: entry.timeAdded,
      estimatedWaitTime: entry.estimatedWaitTime,
      status: entry.status,
      notified: entry.notified,
      notifiedAt: entry.notifiedAt,
      seatedAt: entry.seatedAt,
      cancelledAt: entry.cancelledAt
    }));
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    toast.error("Failed to load waitlist. Please try again.");
    throw error;
    
  }
};

/**
 * Add a customer to the waitlist
 */
export const addToWaitlist = async (entryData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields
    const filteredData = Object.keys(entryData)
      .filter(key => updateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = entryData[key];
        return obj;
      }, {});
      
    // Add timeAdded if not provided
    if (!filteredData.timeAdded) {
      filteredData.timeAdded = new Date().toISOString();
    }
    
    // Set default status
    if (!filteredData.status) {
      filteredData.status = 'waiting';
    }
    
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.createRecord('waitlist_entry', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to add to waitlist");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    toast.error("Failed to add to waitlist. Please try again.");
    throw error;
  }
};

/**
 * Update a waitlist entry
 */
export const updateWaitlistEntry = async (entryData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields plus Id
    const filteredData = Object.keys(entryData)
      .filter(key => key === 'Id' || updateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = entryData[key];
        return obj;
      }, {});
      
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.updateRecord('waitlist_entry', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update waitlist entry");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating waitlist entry:", error);
    toast.error("Failed to update waitlist entry. Please try again.");
    throw error;
  }
};

/**
 * Mark a customer as notified
 */
export const notifyCustomer = async (entryId) => {
  try {
    const apperClient = getApperClient();
    
    const updateData = {
      Id: entryId,
      notified: true,
      notifiedAt: new Date().toISOString()
    };
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord('waitlist_entry', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to mark customer as notified");
    }
    
    toast.success("Customer has been notified");
    return response.results[0].data;
  } catch (error) {
    console.error("Error notifying customer:", error);
    toast.error("Failed to notify customer. Please try again.");
    throw error;
  }
};

/**
 * Mark a customer as seated and remove from active waitlist
 */
export const seatCustomer = async (entryId) => {
  try {
    const apperClient = getApperClient();
    
    const updateData = {
      Id: entryId,
      status: 'seated',
      seatedAt: new Date().toISOString()
    };
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord('waitlist_entry', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to seat customer");
    }
    
    toast.success("Customer has been seated");
    return response.results[0].data;
  } catch (error) {
    console.error("Error seating customer:", error);
    toast.error("Failed to seat customer. Please try again.");
    throw error;
  }
};

/**
 * Remove customer from waitlist (mark as cancelled)
 */
export const removeFromWaitlist = async (entryId, reason = '') => {
  try {
    const apperClient = getApperClient();
    
    const updateData = {
      Id: entryId,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      notes: reason ? `${reason} (Cancelled)` : '(Cancelled)'
    };
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord('waitlist_entry', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to remove customer from waitlist");
    }
    
    toast.success("Customer removed from waitlist");
    return response.results[0].data;
  } catch (error) {
    console.error("Error removing from waitlist:", error);
    toast.error("Failed to remove from waitlist. Please try again.");
    throw error;
  }
};