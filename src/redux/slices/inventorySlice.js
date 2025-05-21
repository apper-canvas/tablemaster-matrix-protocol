import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Example initial state with some ingredients
const initialState = {
  ingredients: {
    byId: {
      'ing-1': {
        id: 'ing-1',
        name: 'Flour',
        category: 'Dry Goods',
        unitType: 'kg',
        currentStock: 25,
        parLevel: 10,
        cost: 1.2,
        vendor: 'Food Supply Co.',
        vendorContact: '555-123-4567',
        lastRestocked: '2023-06-15',
        expirationDate: '2023-12-15',
        location: 'Dry Storage A3',
        menuItems: ['item-1', 'item-3'],
        notes: 'All-purpose flour'
      },
      'ing-2': {
        id: 'ing-2',
        name: 'Chicken Breast',
        category: 'Meat',
        unitType: 'kg',
        currentStock: 8,
        parLevel: 15,
        cost: 5.5,
        vendor: 'Meat Supply Inc.',
        vendorContact: '555-987-6543',
        lastRestocked: '2023-06-18',
        expirationDate: '2023-06-25',
        location: 'Refrigerator B2',
        menuItems: ['item-2'],
        notes: 'Boneless, skinless'
      },
      'ing-3': {
        id: 'ing-3',
        name: 'Tomatoes',
        category: 'Produce',
        unitType: 'kg',
        currentStock: 12,
        parLevel: 10,
        cost: 2.8,
        vendor: 'Fresh Farm Produce',
        vendorContact: '555-456-7890',
        lastRestocked: '2023-06-19',
        expirationDate: '2023-06-26',
        location: 'Refrigerator A1',
        menuItems: ['item-2', 'item-4'],
        notes: 'Roma variety'
      },
      'ing-4': {
        id: 'ing-4',
        name: 'Olive Oil',
        category: 'Oils & Condiments',
        unitType: 'L',
        currentStock: 4,
        parLevel: 5,
        cost: 8.95,
        vendor: 'Gourmet Imports',
        vendorContact: '555-789-0123',
        lastRestocked: '2023-06-10',
        expirationDate: '2023-12-10',
        location: 'Dry Storage B1',
        menuItems: ['item-1', 'item-2', 'item-4'],
        notes: 'Extra virgin'
      },
      'ing-5': {
        id: 'ing-5',
        name: 'Milk',
        category: 'Dairy',
        unitType: 'L',
        currentStock: 6,
        parLevel: 8,
        cost: 2.1,
        vendor: 'Dairy Delights',
        vendorContact: '555-321-7654',
        lastRestocked: '2023-06-19',
        expirationDate: '2023-06-26',
        location: 'Refrigerator C3',
        menuItems: ['item-3'],
        notes: 'Whole milk'
      }
    },
    allIds: ['ing-1', 'ing-2', 'ing-3', 'ing-4', 'ing-5']
  },
  waste: [
    {
      id: 'waste-1',
      ingredientId: 'ing-2',
      ingredientName: 'Chicken Breast',
      quantity: 1.5,
      date: '2023-06-17',
      unitType: 'kg',
      reason: 'Spoilage',
      costImpact: 8.25,
      loggedBy: 'John Smith',
      notes: 'Found during morning inventory check'
    },
    {
      id: 'waste-2',
      ingredientId: 'ing-3',
      ingredientName: 'Tomatoes',
      quantity: 2,
      date: '2023-06-18',
      unitType: 'kg',
      reason: 'Quality issues',
      costImpact: 5.6,
      notes: '',
      loggedBy: 'Emma Davis'
    }
  ],
  purchaseOrders: [
    {
      id: 'po-1',
      date: '2023-06-18',
      status: 'pending',
      vendor: 'Meat Supply Inc.',
      items: [
        {
          ingredientId: 'ing-2',
          name: 'Chicken Breast',
          quantity: 10,
          unitPrice: 5.5,
          totalPrice: 55
        }
      ],
      totalAmount: 55,
      notes: 'Urgent order for weekend service'
    }
  ]
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Add a new ingredient
    addIngredient: (state, action) => {
      const newIngredient = {
        id: uuidv4(),
        ...action.payload,
        menuItems: action.payload.menuItems || [],
      };
      state.ingredients.byId[newIngredient.id] = newIngredient;
      state.ingredients.allIds.push(newIngredient.id);
    },
    
    // Update an existing ingredient
    updateIngredient: (state, action) => {
      const { id, ...updates } = action.payload;
      if (state.ingredients.byId[id]) {
        state.ingredients.byId[id] = {
          ...state.ingredients.byId[id],
          ...updates
        };
      }
    },
    
    // Delete an ingredient
    deleteIngredient: (state, action) => {
      const id = action.payload;
      delete state.ingredients.byId[id];
      state.ingredients.allIds = state.ingredients.allIds.filter(
        (ingredientId) => ingredientId !== id
      );
    },
    
    // Decrease stock when order is placed
    decreaseStock: (state, action) => {
      const { ingredientId, quantity } = action.payload;
      if (state.ingredients.byId[ingredientId]) {
        const currentStock = state.ingredients.byId[ingredientId].currentStock;
        state.ingredients.byId[ingredientId].currentStock = Math.max(0, currentStock - quantity);
      }
    },
    
    // Add stock when inventory is restocked
    addStock: (state, action) => {
      const { ingredientId, quantity, date } = action.payload;
      if (state.ingredients.byId[ingredientId]) {
        state.ingredients.byId[ingredientId].currentStock += quantity;
        state.ingredients.byId[ingredientId].lastRestocked = date || new Date().toISOString().split('T')[0];
      }
    },
    
    // Log waste
    logWaste: (state, action) => {
      const wasteEntry = {
        id: uuidv4(),
        ...action.payload,
        date: action.payload.date || new Date().toISOString().split('T')[0]
      };
      wasteEntry.unitType = wasteEntry.unitType || (state.ingredients.byId[wasteEntry.ingredientId]?.unitType || 'units');
      
      // Add to waste log
      state.waste.push(wasteEntry);
      
      // Decrease stock
      if (state.ingredients.byId[wasteEntry.ingredientId]) {
        const currentStock = state.ingredients.byId[wasteEntry.ingredientId].currentStock;
        state.ingredients.byId[wasteEntry.ingredientId].currentStock = Math.max(
          0, 
          currentStock - wasteEntry.quantity
        );
      }
    },
    
    // Generate purchase order
    generatePurchaseOrder: (state, action) => {
      const { vendor, items, notes } = action.payload;
      
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      const newPO = {
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        vendor,
        items,
        totalAmount,
        notes: notes || ''
      };
      
      state.purchaseOrders.push(newPO);
    },
    
    // Update purchase order status
    updatePurchaseOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const poIndex = state.purchaseOrders.findIndex(po => po.id === id);
      if (poIndex !== -1) {
        state.purchaseOrders[poIndex].status = status;
      }
    },
    
    // Receive purchase order
    receivePurchaseOrder: (state, action) => {
      const { id } = action.payload;
      const poIndex = state.purchaseOrders.findIndex(po => po.id === id);
      
      if (poIndex !== -1) {
        // Mark PO as received
        state.purchaseOrders[poIndex].status = 'received';
        state.purchaseOrders[poIndex].receivedDate = new Date().toISOString().split('T')[0];
        
        // Update inventory for each item
        state.purchaseOrders[poIndex].items.forEach(item => {
          if (state.ingredients.byId[item.ingredientId]) {
            state.ingredients.byId[item.ingredientId].currentStock += item.quantity;
            state.ingredients.byId[item.ingredientId].lastRestocked = 
              state.purchaseOrders[poIndex].receivedDate;
          }
        });
      }
    }
  }
});

export const { addIngredient, updateIngredient, deleteIngredient, decreaseStock, addStock, logWaste, generatePurchaseOrder, updatePurchaseOrderStatus, receivePurchaseOrder } = inventorySlice.actions;

export default inventorySlice.reducer;