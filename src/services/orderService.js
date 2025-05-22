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
  console.log("Creating order with data:", orderData);

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

/**
 * Update an existing order
 */
export const updateOrder = async (orderData) => {
  try {
    const apperClient = getApperClient();
    
    // First, update the order
    const orderParams = {
      records: [
        {
          Id: orderData.id,
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
    
    const orderResponse = await apperClient.updateRecord('order1', orderParams);
    
    if (!orderResponse || !orderResponse.success) {
      throw new Error("Failed to update order");
    }
    
    // We need to handle the order items:
    // First, fetch existing items to determine what to delete/update
    const existingItems = await fetchOrderItems(orderData.id);
    const existingItemIds = existingItems.map(item => item.id);
    const newItemIds = orderData.items.filter(item => item.id).map(item => item.id);
    
    // Items to delete (exist in DB but not in updated order)
    const itemsToDelete = existingItemIds.filter(id => !newItemIds.includes(id));
    
    // Delete items that were removed
    if (itemsToDelete.length > 0) {
      const deleteParams = {
        RecordIds: itemsToDelete
      };
      await apperClient.deleteRecord('order_item1', deleteParams);
    }
    
    // Update or create items
    const itemPromises = orderData.items.map(item => {
      if (item.id && existingItemIds.includes(item.id)) {
        // Update existing item
        const updateParams = {
          records: [
            {
              Id: item.id,
              Name: item.name,
              price: item.price,
              quantity: item.quantity,
              notes: item.notes || ''
            }
          ]
        };
        return apperClient.updateRecord('order_item1', updateParams);
      } else {
        // Create new item
        const createParams = {
          records: [
            {
              order: orderData.id,
              Name: item.name,
              price: item.price,
              quantity: item.quantity,
              notes: item.notes || ''
            }
          ]
        };
        return apperClient.createRecord('order_item1', createParams);
      }
    });
    
    await Promise.all(itemPromises);
    
    return {
      ...orderData
    };
  } catch (error) {
    console.error("Error updating order:", error);
    toast.error("Failed to update order. Please try again.");
    throw error;
  }
};

/**
 * Update the status of an order
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [
        {
          Id: orderId,
          status: status
        }
      ]
    };
    
    const response = await apperClient.updateRecord('order1', params);
    return response.success;
  } catch (error) {
    console.error("Error updating order status:", error);
    toast.error("Failed to update order status. Please try again.");
    throw error;
  }
};

/**
 * Delete an order and its items
 */
export const deleteOrder = async (orderId) => {
  try {
    const apperClient = getApperClient();
    
    // Delete the order (cascade deletion should handle the items)
    const params = { RecordIds: [orderId] };
    const response = await apperClient.deleteRecord('order1', params);
    return response.success;
  } catch (error) {
    console.error("Error deleting order:", error);
    toast.error("Failed to delete order. Please try again.");
    throw error;
  }
};