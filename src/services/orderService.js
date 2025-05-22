// src/services/orderService.js

/**
 * Service for handling order data operations with the Apper backend
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
  'Name', 'Tags', 'Owner', 'table', 'tableName', 'customerName',
  'status', 'paymentStatus', 'specialInstructions', 'totalAmount'
];

/**
 * Fetch all orders
 */
export const fetchOrders = async () => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        'Id', 'Name', 'table', 'tableName', 'customerName',
        'status', 'paymentStatus', 'specialInstructions', 'totalAmount',
        'CreatedOn', 'ModifiedOn'
      ]
    };
    
    const response = await apperClient.fetchRecords('order1', params);
    
    if (!response || !response.data) {
      return [];
    }
    
    // We need to fetch order items for each order
    const orders = response.data;
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await fetchOrderItems(order.Id);
        return {
          id: order.Id,
          tableId: order.table,
          tableName: order.tableName,
          customerName: order.customerName,
          status: order.status,
          paymentStatus: order.paymentStatus,
          specialInstructions: order.specialInstructions,
          totalAmount: order.totalAmount,
          createdAt: order.CreatedOn,
          updatedAt: order.ModifiedOn,
          items: items
        };
      })
    );
    
    return ordersWithItems;
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("Failed to load orders. Please try again.");
    throw error;
  }
};

/**
 * Fetch order items for a specific order
 */
export const fetchOrderItems = async (orderId) => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: ['Id', 'order', 'menuItem', 'Name', 'price', 'quantity', 'notes'],
      where: [
        {
          fieldName: 'order',
          operator: 'ExactMatch',
          values: [orderId]
        }
      ]
    };
    
    const response = await apperClient.fetchRecords('order_item1', params);
    
    if (!response || !response.data) {
      return [];
    }
    
    return response.data.map(item => ({
      id: item.Id,
      name: item.Name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes
    }));
  } catch (error) {
    console.error(`Error fetching order items for order ${orderId}:`, error);
    return [];
  }
};

/**
 * Create a new order with items
 */
export const createOrder = async (orderData) => {
  try {
    const apperClient = getApperClient();
    
    // First, create the order
    const orderParams = {
      records: [
        {
          Name: orderData.tableName,
          table: orderData.tableId,
          tableName: orderData.tableName,
          customerName: orderData.customerName,
          status: orderData.status,
          paymentStatus: orderData.paymentStatus,
          specialInstructions: orderData.specialInstructions,
          totalAmount: orderData.totalAmount
        }
      ]
    };
    
    const orderResponse = await apperClient.createRecord('order1', orderParams);
    
    if (!orderResponse || !orderResponse.success) {
      throw new Error("Failed to create order");
    }
    
    const newOrderId = orderResponse.results[0].data.Id;
    
    // Now create the order items
    const itemsPromises = orderData.items.map(item => {
      const itemParams = {
        records: [
          {
            order: newOrderId,
            Name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || ''
          }
        ]
      };
      
      return apperClient.createRecord('order_item1', itemParams);
    });
    
    await Promise.all(itemsPromises);
    
    // Return the newly created order with items
    return {
      id: newOrderId,
      ...orderData
    };
  } catch (error) {
    console.error("Error creating order:", error);
    toast.error("Failed to create order. Please try again.");
    throw error;
  }
};