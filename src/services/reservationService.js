// src/services/reservationService.js

/**
 * Service for handling reservation data operations with the Apper backend
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
  'table', 'Name', 'Tags', 'Owner', 'customerName', 'phoneNumber', 
  'partySize', 'reservationTime', 'duration', 'status',
  'notes', 'cancelledAt', 'cancellationReason'
];

/**
 * Fetch all reservations
 */
export const fetchReservations = async () => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        'Id', 'table', 'Name', 'customerName', 'phoneNumber', 'partySize',
        'reservationTime', 'duration', 'status', 'notes',
        'cancelledAt', 'cancellationReason'
      ]
    };
    
    const response = await apperClient.fetchRecords('reservation', params);
    
    if (!response || !response.data) {
      return [];
    }
    
    return response.data.map(reservation => ({
      id: reservation.Id,
      tableId: reservation.table,
      customerName: reservation.customerName,
      phoneNumber: reservation.phoneNumber,
      partySize: reservation.partySize,
      reservationTime: reservation.reservationTime,
      duration: reservation.duration,
      status: reservation.status,
      notes: reservation.notes,
      cancelledAt: reservation.cancelledAt,
      cancellationReason: reservation.cancellationReason
    }));
  } catch (error) {
    console.error("Error fetching reservations:", error);
    toast.error("Failed to load reservations. Please try again.");
    throw error;
  }
};

/**
 * Create a new reservation
 */
export const createReservation = async (reservationData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields
    const filteredData = Object.keys(reservationData)
      .filter(key => updateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = reservationData[key];
        return obj;
      }, {});
      
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.createRecord('reservation', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to create reservation");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating reservation:", error);
    toast.error("Failed to create reservation. Please try again.");
    throw error;
  }
};

/**
 * Update an existing reservation
 */
export const updateReservation = async (reservationData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter to only include updateable fields plus Id
    const filteredData = Object.keys(reservationData)
      .filter(key => key === 'Id' || updateableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = reservationData[key];
        return obj;
      }, {});
      
    const params = {
      records: [filteredData]
    };
    
    const response = await apperClient.updateRecord('reservation', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update reservation");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating reservation:", error);
    toast.error("Failed to update reservation. Please try again.");
    throw error;
  }
};

/**
 * Cancel a reservation
 */
export const cancelReservation = async (reservationId, reason) => {
  try {
    const apperClient = getApperClient();
    const now = new Date().toISOString();
    
    return await updateReservation({
      Id: reservationId,
      status: 'cancelled',
      cancelledAt: now,
      cancellationReason: reason || 'No reason provided'
    });
  } catch (error) {
    throw error;
  }
};