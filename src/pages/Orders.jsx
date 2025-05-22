import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format, formatDistance } from 'date-fns';
import { toast } from 'react-toastify'; 
import { getIcon } from '../utils/iconUtils';
import * as orderService from '../services/orderService';
import { ORDER_STATUS, PAYMENT_STATUS } from '../redux/slices/ordersSlice';


// Get all the icons we'll need
const PlusIcon = getIcon('plus');
const EyeIcon = getIcon('eye');
const EditIcon = getIcon('edit2');
const TrashIcon = getIcon('trash2');
const SearchIcon = getIcon('search');
const RefreshIcon = getIcon('refreshCw');
const FilterIcon = getIcon('filter');
const SortIcon = getIcon('arrowUpDown');
const CloseIcon = getIcon('x');
const ArrowRightIcon = getIcon('arrowRight');
const CheckCircleIcon = getIcon('checkCircle');
const ClockIcon = getIcon('clock');
const AlertCircleIcon = getIcon('alertCircle');
const CreditCardIcon = getIcon('creditCard');
const ChefHatIcon = getIcon('chefHat');
const TruckIcon = getIcon('truck');
const XCircleIcon = getIcon('xCircle');
const UserIcon = getIcon('user');
const ClipboardIcon = getIcon('clipboard');
const DollarSignIcon = getIcon('dollarSign');
const CalendarIcon = getIcon('calendar');
const InfoIcon = getIcon('info');

// Status badge component for displaying order status with appropriate colors
const StatusBadge = ({ status }) => {
  let bgColor, textColor, icon;
  
  switch (status) {
    case ORDER_STATUS.NEW:
      bgColor = 'bg-blue-100 dark:bg-blue-900';
      textColor = 'text-blue-800 dark:text-blue-200';
      icon = <ClockIcon className="h-4 w-4 mr-1" />;
      break;
    case ORDER_STATUS.IN_PROGRESS:
      bgColor = 'bg-amber-100 dark:bg-amber-900';
      textColor = 'text-amber-800 dark:text-amber-200';
      icon = <ChefHatIcon className="h-4 w-4 mr-1" />;
      break;
    case ORDER_STATUS.READY:
      bgColor = 'bg-green-100 dark:bg-green-900';
      textColor = 'text-green-800 dark:text-green-200';
      icon = <CheckCircleIcon className="h-4 w-4 mr-1" />;
      break;
    case ORDER_STATUS.DELIVERED:
      bgColor = 'bg-purple-100 dark:bg-purple-900';
      textColor = 'text-purple-800 dark:text-purple-200';
      icon = <TruckIcon className="h-4 w-4 mr-1" />;
      break;
    case ORDER_STATUS.CANCELLED:
      bgColor = 'bg-red-100 dark:bg-red-900';
      textColor = 'text-red-800 dark:text-red-200';
      icon = <XCircleIcon className="h-4 w-4 mr-1" />;
      break;
    default:
      bgColor = 'bg-gray-100 dark:bg-gray-900';
      textColor = 'text-gray-800 dark:text-gray-200';
      icon = <InfoIcon className="h-4 w-4 mr-1" />;
  }
  
  const displayText = {
    [ORDER_STATUS.NEW]: 'New',
    [ORDER_STATUS.IN_PROGRESS]: 'In Progress',
    [ORDER_STATUS.READY]: 'Ready',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
  }[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {displayText}
    </span>
  );
};

// Payment status badge component
const PaymentStatusBadge = ({ status }) => {
  let bgColor, textColor, icon;
  
  switch (status) {
    case PAYMENT_STATUS.PENDING:
      bgColor = 'bg-yellow-100 dark:bg-yellow-900';
      textColor = 'text-yellow-800 dark:text-yellow-200';
      icon = <ClockIcon className="h-4 w-4 mr-1" />;
      break;
    case PAYMENT_STATUS.PAID:
      bgColor = 'bg-green-100 dark:bg-green-900';
      textColor = 'text-green-800 dark:text-green-200';
      icon = <CheckCircleIcon className="h-4 w-4 mr-1" />;
      break;
    case PAYMENT_STATUS.REFUNDED:
      bgColor = 'bg-purple-100 dark:bg-purple-900';
      textColor = 'text-purple-800 dark:text-purple-200';
      icon = <CreditCardIcon className="h-4 w-4 mr-1" />;
      break;
    default:
      bgColor = 'bg-gray-100 dark:bg-gray-900';
      textColor = 'text-gray-800 dark:text-gray-200';
      icon = <InfoIcon className="h-4 w-4 mr-1" />;
  }
  
  const displayText = {
    [PAYMENT_STATUS.PENDING]: 'Pending',
    [PAYMENT_STATUS.PAID]: 'Paid',
    [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  }[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {displayText}
    </span>
  );
};

// Order Card component for kitchen display
const OrderCard = ({ order, onStatusUpdate }) => {
  return (
    <div className="card p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold">{order.tableName}</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            {order.customerName}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      
      <div className="border-t border-surface-200 dark:border-surface-700 my-2 pt-2">
        <h4 className="text-sm font-semibold mb-2">Items:</h4>
        <ul className="space-y-1">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between text-sm">
              <span>
                {item.quantity}× {item.name}
                {item.notes && (
                  <span className="text-xs italic block text-surface-500 dark:text-surface-400">
                    Note: {item.notes}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      {order.specialInstructions && (
        <div className="mt-2 text-sm">
          <p className="font-semibold">Special Instructions:</p>
          <p className="text-surface-600 dark:text-surface-400">{order.specialInstructions}</p>
        </div>
      )}
      
      <div className="mt-3 text-xs text-surface-500 dark:text-surface-400">
        <div className="flex items-center">
          <ClockIcon className="h-3 w-3 mr-1" />
          Ordered {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        {order.status === ORDER_STATUS.NEW && (
          <button 
            className="btn btn-sm btn-outline flex items-center gap-1"
            onClick={() => onStatusUpdate(order.id, ORDER_STATUS.IN_PROGRESS)}
          >
            <ChefHatIcon className="h-4 w-4" />
            Start Preparing
          </button>
        )}
        
        {order.status === ORDER_STATUS.IN_PROGRESS && (
          <button 
            className="btn btn-sm btn-secondary flex items-center gap-1"
            onClick={() => onStatusUpdate(order.id, ORDER_STATUS.READY)}
          >
            <CheckCircleIcon className="h-4 w-4" />
            Mark Ready
          </button>
        )}
        
        {order.status === ORDER_STATUS.READY && (
          <button 
            className="btn btn-sm btn-primary flex items-center gap-1"
            onClick={() => onStatusUpdate(order.id, ORDER_STATUS.DELIVERED)}
          >
            <TruckIcon className="h-4 w-4" />
            Mark Delivered
          </button>
        )}
      </div>
    </div>
  );
};

// OrderItem component for creating/editing orders
const OrderItem = ({ item, onUpdate, onRemove, index }) => {
  return (
    <div className="flex items-center gap-2 p-2 border-b border-surface-200 dark:border-surface-700 last:border-0">
      <div className="flex-grow">
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-surface-500 dark:text-surface-400">${item.price.toFixed(2)}</div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
          onClick={() => onUpdate(index, { ...item, quantity: Math.max(1, item.quantity - 1) })}
        >
          <span className="text-lg font-bold">-</span>
        </button>
        
        <span className="w-8 text-center">{item.quantity}</span>
        
        <button 
          className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
          onClick={() => onUpdate(index, { ...item, quantity: item.quantity + 1 })}
        >
          <span className="text-lg font-bold">+</span>
        </button>
        
        <button 
          className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-red-500"
          onClick={() => onRemove(index)}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Main Orders component
const Orders = () => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState(false);
  const [error, setError] = useState(null);

  // State for active tab
  const [activeTab, setActiveTab] = useState('active');
  
  // State for modals
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // State for currently selected order
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // State for new/edit order form
  const [orderForm, setOrderForm] = useState({
    tableId: '',
    tableName: '',
    customerName: '',
    items: [],
    specialInstructions: '',
    status: ORDER_STATUS.NEW,
    paymentStatus: PAYMENT_STATUS.PENDING,
    totalAmount: 0
  });
  
  // Sample menu items for adding to orders
  const sampleMenuItems = [
    { id: 'item1', name: 'Margherita Pizza', price: 12.99, category: 'Pizza' },
    { id: 'item2', name: 'Caesar Salad', price: 8.99, category: 'Salads' },
    { id: 'item3', name: 'Spaghetti Carbonara', price: 14.99, category: 'Pasta' },
    { id: 'item4', name: 'Garlic Bread', price: 4.99, category: 'Sides' },
    { id: 'item5', name: 'Tiramisu', price: 6.99, category: 'Desserts' },
    { id: 'item6', name: 'Iced Tea', price: 2.99, category: 'Beverages' },
    { id: 'item7', name: 'Chicken Wings', price: 10.99, category: 'Appetizers' },
    { id: 'item8', name: 'Cheeseburger', price: 11.99, category: 'Burgers' },
    { id: 'item9', name: 'French Fries', price: 3.99, category: 'Sides' },
    { id: 'item10', name: 'Chocolate Cake', price: 7.99, category: 'Desserts' },
  ];
  
  // Sample tables for adding to orders
  const sampleTables = [
    { id: 'table-1', name: 'Table 1' },
    { id: 'table-2', name: 'Table 2' },
    { id: 'table-3', name: 'Table 3' },
    { id: 'table-4', name: 'Table 4' },
    { id: 'table-5', name: 'Table 5' },
    { id: 'table-6', name: 'Table 6' },
  ];
  
  // Fetch orders from the database
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedOrders = await orderService.fetchOrders();
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("Failed to load orders. Please try again.");
        toast.error("Error loading orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);


  // Filter and sort orders based on current filters
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        order => 
          order.customerName.toLowerCase().includes(lowerSearchTerm) ||
          order.tableName.toLowerCase().includes(lowerSearchTerm) ||
          order.items.some(item => item.name.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply status filter
    if (activeTab === 'active') {
      result = result.filter(order => 
        [ORDER_STATUS.NEW, ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.READY].includes(order.status)
      );
    } else if (activeTab === 'completed') {
      result = result.filter(order => 
        [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)
      );
    }
    
    // Apply specific status filter if set
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      
      if (sortConfig.key === 'totalAmount') {
        return sortConfig.direction === 'asc'
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      }
      
      return 0;
    });
    
    return result;
  }, [orders, searchTerm, statusFilter, sortConfig, activeTab]);
  
  // Kitchen display filtered orders
  const kitchenOrders = useMemo(() => {
    return orders.filter(order => 
      [ORDER_STATUS.NEW, ORDER_STATUS.IN_PROGRESS].includes(order.status)
    ).sort((a, b) => {
      // Sort by status first (NEW before IN_PROGRESS)
      if (a.status !== b.status) {
        return a.status === ORDER_STATUS.NEW ? -1 : 1;
      }
      // Then sort by creation date (oldest first)
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [orders]);
  
  // Calculate total amount for order form
  useEffect(() => {
    if (orderForm.items.length > 0) {
      const total = orderForm.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      setOrderForm(prev => ({
        ...prev,
        totalAmount: total
      }));
    }
  }, [orderForm.items]);
  
  // Handle sort change
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Reset order form
  const resetOrderForm = () => {
    setOrderForm({
      tableId: '',
      tableName: '',
      customerName: '',
      items: [],
      specialInstructions: '',
      status: ORDER_STATUS.NEW,
      paymentStatus: PAYMENT_STATUS.PENDING,
      totalAmount: 0
    });
  };
  
  // Open new order modal
  const handleNewOrder = () => {
    resetOrderForm();
    setIsNewOrderModalOpen(true);
  };
  
  // Open view order modal
  const handleViewOrder = (order) => {
    setCurrentOrder(order);
    setIsViewOrderModalOpen(true);
  };
  
  // Open edit order modal
  const handleEditOrder = (order) => {
    setCurrentOrder(order);
    setOrderForm({
      tableId: order.tableId,
      tableName: order.tableName,
      customerName: order.customerName,
      items: [...order.items],
      specialInstructions: order.specialInstructions,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount
    });
    setIsEditOrderModalOpen(true);
  };
  
  // Open delete confirmation modal
  const handleConfirmDelete = (order) => {
    setCurrentOrder(order);
    setIsDeleteConfirmOpen(true);
  };
  
  // Submit new order
  const handleSubmitNewOrder = () => {
    setLoadingOperation(true);

    // Validate form
    if (!orderForm.tableId || !orderForm.customerName || orderForm.items.length === 0) {
      toast.error('Please complete all required fields');
      setLoadingOperation(false);
      return;
    }
    
    orderService.createOrder(orderForm)
      .then(newOrder => {
        // Add the new order to the state
        setOrders(prevOrders => [...prevOrders, newOrder]);
        toast.success('Order created successfully');
        setIsNewOrderModalOpen(false);
      })
      .catch(error => {
        console.error('Error creating order:', error);
        toast.error('Failed to create order');
      })
      .finally(() => setLoadingOperation(false));
      
    resetOrderForm();
  };
  
  // Submit edit order
  const handleSubmitEditOrder = () => {
    // Validate form
    if (!orderForm.tableId || !orderForm.customerName || orderForm.items.length === 0) {
      toast.error('Please complete all required fields'); 
      setLoadingOperation(false);
      return;
    }

    setLoadingOperation(true);

    const updatedOrderData = {
        id: currentOrder.id,
        ...orderForm
    };

    orderService.updateOrder(updatedOrderData)
      .then(() => {
        // Update the order in the state
        setOrders(prevOrders => prevOrders.map(order => 
          order.id === currentOrder.id ? updatedOrderData : order
        ));
        toast.success('Order updated successfully');
        setIsEditOrderModalOpen(false);
        setCurrentOrder(null);
      })
      .catch(error => {
        toast.error('Failed to update order');
      })
      .finally(() => setLoadingOperation(false));
  };
  
  // Delete order
  const handleDeleteOrder = () => {
    dispatch(deleteOrder(currentOrder.id));
    toast.success('Order deleted successfully');
    setIsDeleteConfirmOpen(false);
    setCurrentOrder(null);
  };
  
  // Update order status
  const handleStatusUpdate = (orderId, newStatus) => {
    setLoadingOperation(true);

    orderService.updateOrderStatus(orderId, newStatus)
      .then(success => {
        if (success) {
          // Update the order in the state
          setOrders(prevOrders => prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          ));
        }
      })
      .catch(error => {})
      .finally(() => setLoadingOperation(false));
    
    const statusMessages = {
      [ORDER_STATUS.IN_PROGRESS]: 'Order is now being prepared',
      [ORDER_STATUS.READY]: 'Order is ready for pickup',
      [ORDER_STATUS.DELIVERED]: 'Order has been delivered',
      [ORDER_STATUS.CANCELLED]: 'Order has been cancelled',
    };
    
    toast.info(statusMessages[newStatus] || 'Order status updated');
  };
  
  // Update payment status
  const handlePaymentStatusUpdate = (orderId, newStatus) => {
    dispatch(updatePaymentStatus({ id: orderId, paymentStatus: newStatus }));
    
    const statusMessages = {
      [PAYMENT_STATUS.PAID]: 'Payment marked as completed',
      [PAYMENT_STATUS.REFUNDED]: 'Payment has been refunded',
      [PAYMENT_STATUS.PENDING]: 'Payment marked as pending',
    };
    
    toast.info(statusMessages[newStatus] || 'Payment status updated');
  };
  
  // Add item to order
  const handleAddItemToOrder = (item) => {
    // Check if item already exists in the order
    const existingItemIndex = orderForm.items.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...orderForm.items];
      updatedItems[existingItemIndex].quantity += 1;
      
      setOrderForm(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      // Add new item with quantity 1
      setOrderForm(prev => ({
        ...prev,
        items: [...prev.items, { ...item, quantity: 1, notes: '' }]
      }));
    }
  };
  
  // Update item in order
  const handleUpdateOrderItem = (index, updatedItem) => {
    const updatedItems = [...orderForm.items];
    updatedItems[index] = updatedItem;
    
    setOrderForm(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  // Remove item from order
  const handleRemoveOrderItem = (index) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  // Handle table selection
  const handleTableSelect = (table) => {
    setOrderForm(prev => ({
      ...prev,
      tableId: table.id,
      tableName: table.name
    }));
  };
  
  return (
    <>
    {loading && (
      <div className="flex justify-center items-center h-40">
        <div className="spinner border-4 border-surface-300 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
        <span className="ml-3 text-lg">Loading orders...</span>
      </div>
    )}
    
    <div className="app-container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Orders</h1>
          <p className="text-surface-600 dark:text-surface-400">Manage restaurant orders and track their status</p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2 mt-4 md:mt-0"
          onClick={handleNewOrder}
        >
          <PlusIcon className="h-5 w-5" />
          New Order
        </button>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-700 mb-6">
        <nav className="flex space-x-4">
          <button
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-primary text-primary dark:text-primary-light'
                : 'border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
            }`}
            onClick={() => setActiveTab('active')}
          >
            <ClockIcon className="h-5 w-5" />
            Active Orders
          </button>
          <button
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-primary text-primary dark:text-primary-light'
                : 'border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            <CheckCircleIcon className="h-5 w-5" />
            Completed Orders
          </button>
          <button
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm ${
              activeTab === 'kitchen'
                ? 'border-primary text-primary dark:text-primary-light'
                : 'border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
            }`}
            onClick={() => setActiveTab('kitchen')}
          >
            <ChefHatIcon className="h-5 w-5" />
            Kitchen Display
          </button>
        </nav>
      </div>
      
      {/* Kitchen Display View */}
      {activeTab === 'kitchen' ? (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">Kitchen Display System</h2>
            <div className="text-sm text-surface-600 dark:text-surface-400">
              {kitchenOrders.length} orders in queue
            </div>
          </div>
          
          {kitchenOrders.length === 0 ? (
            <div className="card p-8 text-center">
              <ClipboardIcon className="h-12 w-12 mx-auto text-surface-400 dark:text-surface-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Orders</h3>
              <p className="text-surface-600 dark:text-surface-400">
                There are no orders currently being prepared.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kitchenOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Active and Completed Orders Views */
        <div>
          {/* Search and filter bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {activeTab === 'active' ? (
                  <>
                    <option value={ORDER_STATUS.NEW}>New</option>
                    <option value={ORDER_STATUS.IN_PROGRESS}>In Progress</option>
                    <option value={ORDER_STATUS.READY}>Ready</option>
                  </>
                ) : (
                  <>
                    <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                    <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
                  </>
                )}
              </select>
              
              <button
                className="btn btn-outline flex items-center gap-2"
                onClick={() => handleSort('createdAt')}
              >
                <SortIcon className="h-5 w-5" />
                {sortConfig.key === 'createdAt' && (
                  sortConfig.direction === 'asc' ? 'Oldest' : 'Newest'
                )}
                {sortConfig.key !== 'createdAt' && 'Sort'}
              </button>
            </div>
          </div>
          
          {/* Orders table */}
          {filteredOrders.length === 0 ? (
            <div className="card p-8 text-center">
              <ClipboardIcon className="h-12 w-12 mx-auto text-surface-400 dark:text-surface-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
              <p className="text-surface-600 dark:text-surface-400">
                {searchTerm ? 'Try adjusting your search or filters' : 'No orders to display yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-100 dark:bg-surface-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-750">
                      <td className="px-4 py-4">
                        <div className="font-medium">{order.tableName}</div>
                        <div className="text-sm text-surface-500 dark:text-surface-400">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{order.customerName}</div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} />
                        <div className="mt-1">
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <div>{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                        <div className="text-sm text-surface-500 dark:text-surface-400">
                          {format(new Date(order.createdAt), 'h:mm a')}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-1 rounded-full text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700"
                            onClick={() => handleViewOrder(order)}
                            title="View order details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="p-1 rounded-full text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700"
                            onClick={() => handleEditOrder(order)}
                            title="Edit order"
                          >
                            <EditIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="p-1 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                            onClick={() => handleConfirmDelete(order)}
                            title="Delete order"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/70">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-800 rounded-xl max-w-3xl w-full shadow-xl border border-surface-200 dark:border-surface-700">
              <div className="flex justify-between items-center p-4 border-b border-surface-200 dark:border-surface-700">
                <h2 className="text-xl font-bold">Create New Order</h2>
                <button 
                  className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                  onClick={() => setIsNewOrderModalOpen(false)}
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Table *</label>
                    <select 
                      className="select"
                      value={orderForm.tableId}
                      onChange={(e) => {
                        const selectedTable = sampleTables.find(t => t.id === e.target.value);
                        if (selectedTable) {
                          handleTableSelect(selectedTable);
                        }
                      }}
                    >
                      <option value="">Select a table</option>
                      {sampleTables.map(table => (
                        <option key={table.id} value={table.id}>{table.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Customer Name *</label>
                    <input 
                      type="text" 
                      className="input"
                      value={orderForm.customerName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter customer name"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="label">Special Instructions</label>
                  <textarea 
                    className="input min-h-[80px]"
                    value={orderForm.specialInstructions}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    placeholder="Any special instructions or allergies"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="label mb-0">Order Items *</label>
                    <span className="text-sm text-surface-600 dark:text-surface-400">
                      {orderForm.items.length} items
                    </span>
                  </div>
                  
                  <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden mb-2">
                    {orderForm.items.length > 0 ? (
                      orderForm.items.map((item, index) => (
                        <OrderItem 
                          key={index}
                          item={item}
                          index={index}
                          onUpdate={handleUpdateOrderItem}
                          onRemove={handleRemoveOrderItem}
                        />
                      ))
                    ) : (
                      <div className="p-4 text-center text-surface-500 dark:text-surface-400">
                        No items added to order yet
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
                    {sampleMenuItems.map(item => (
                      <button
                        key={item.id}
                        className="p-2 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-left"
                        onClick={() => handleAddItemToOrder(item)}
                      >
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-sm text-surface-500 dark:text-surface-400">${item.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-surface-100 dark:bg-surface-700 rounded-lg mb-4">
                  <div className="font-bold">Total Amount:</div>
                  <div className="text-xl font-bold">${orderForm.totalAmount.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-4 border-t border-surface-200 dark:border-surface-700">
                <button 
                  className="btn btn-outline"
                  onClick={() => setIsNewOrderModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  disabled={loadingOperation}
                  onClick={handleSubmitNewOrder}
                >
                  {loadingOperation ? (
                    <span>Creating...</span>
                  ) : (
                    <span>Create Order</span>
                  )}
                </button>
              </div> 
            </div>
          </div>
        </div>
      )}
      
      {/* View Order Modal */}
      {isViewOrderModalOpen && currentOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/70">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-800 rounded-xl max-w-2xl w-full shadow-xl border border-surface-200 dark:border-surface-700">
              <div className="flex justify-between items-center p-4 border-b border-surface-200 dark:border-surface-700">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button 
                  className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                  onClick={() => {
                    setIsViewOrderModalOpen(false);
                    setCurrentOrder(null);
                  }}
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{currentOrder.tableName}</h3>
                    <p className="text-surface-600 dark:text-surface-400">
                      Customer: {currentOrder.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={currentOrder.status} />
                    <div className="mt-2">
                      <PaymentStatusBadge status={currentOrder.paymentStatus} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-surface-50 dark:bg-surface-900 rounded-lg p-3 mb-4">
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <table className="w-full">
                    <thead className="text-left text-sm text-surface-600 dark:text-surface-400">
                      <tr>
                        <th className="pb-2">Item</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2">Price</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                      {currentOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2">
                            <div>{item.name}</div>
                            {item.notes && (
                              <div className="text-xs text-surface-500 dark:text-surface-400 italic">
                                Note: {item.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-2">{item.quantity}</td>
                          <td className="py-2">${item.price.toFixed(2)}</td>
                          <td className="py-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="pt-2 text-right font-bold">Total:</td>
                        <td className="pt-2 text-right font-bold">${currentOrder.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {currentOrder.specialInstructions && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-1">Special Instructions</h4>
                    <p className="text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-900 p-2 rounded">
                      {currentOrder.specialInstructions}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-surface-500 dark:text-surface-400">Created</div>
                    <div>{format(new Date(currentOrder.createdAt), 'MMM d, yyyy h:mm a')}</div>
                  </div>
                  <div>
                    <div className="text-surface-500 dark:text-surface-400">Last Updated</div>
                    <div>{format(new Date(currentOrder.updatedAt), 'MMM d, yyyy h:mm a')}</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-surface-200 dark:border-surface-700 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {currentOrder.status !== ORDER_STATUS.CANCELLED && currentOrder.status !== ORDER_STATUS.DELIVERED && (
                      <>
                        {currentOrder.status === ORDER_STATUS.NEW && (
                          <button 
                            className="btn btn-outline flex items-center gap-1"
                            onClick={() => {
                              handleStatusUpdate(currentOrder.id, ORDER_STATUS.IN_PROGRESS);
                              setIsViewOrderModalOpen(false);
                              setCurrentOrder(null);
                            }}
                          >
                            <ChefHatIcon className="h-4 w-4" />
                            Start Preparing
                          </button>
                        )}
                        
                        {currentOrder.status === ORDER_STATUS.IN_PROGRESS && (
                          <button 
                            className="btn btn-outline flex items-center gap-1"
                            onClick={() => {
                              handleStatusUpdate(currentOrder.id, ORDER_STATUS.READY);
                              setIsViewOrderModalOpen(false);
                              setCurrentOrder(null);
                            }}
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Mark Ready
                          </button>
                        )}
                        
                        {currentOrder.status === ORDER_STATUS.READY && (
                          <button 
                            className="btn btn-outline flex items-center gap-1"
                            onClick={() => {
                              handleStatusUpdate(currentOrder.id, ORDER_STATUS.DELIVERED);
                              setIsViewOrderModalOpen(false);
                              setCurrentOrder(null);
                            }}
                          >
                            <TruckIcon className="h-4 w-4" />
                            Mark Delivered
                          </button>
                        )}
                        
                        <button 
                          className="btn btn-outline text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
                          onClick={() => {
                            handleStatusUpdate(currentOrder.id, ORDER_STATUS.CANCELLED);
                            setIsViewOrderModalOpen(false);
                            setCurrentOrder(null);
                          }}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setIsViewOrderModalOpen(false);
                      setCurrentOrder(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && currentOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/70">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-800 rounded-xl max-w-md w-full shadow-xl border border-surface-200 dark:border-surface-700">
              <div className="p-6">
                <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-center mb-2">Delete Order</h2>
                <p className="text-center mb-6">
                  Are you sure you want to delete this order for {currentOrder.tableName}? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                  <button 
                    className="btn btn-outline"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteOrder}
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  ); 
};

export default Orders;