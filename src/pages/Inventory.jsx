import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import {
  fetchIngredients, createIngredient, updateIngredient, deleteIngredient, logWaste
} from '../services/ingredientService';
import { addStock, generatePurchaseOrder } from '../redux/slices/inventorySlice';

// Ingredient Form Component
const IngredientForm = ({ ingredient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unitType: 'kg',
    currentStock: 0,
    parLevel: 0,
    cost: 0,
    vendor: '',
    vendorContact: '',
    expirationDate: '',
    location: '',
    notes: ''
  });

  const unitOptions = ['kg', 'g', 'L', 'ml', 'units', 'bunches', 'boxes', 'cans', 'bottles'];
  const categoryOptions = [
    'Meat', 'Seafood', 'Produce', 'Dairy', 'Dry Goods', 
    'Spices', 'Oils & Condiments', 'Beverages', 'Frozen', 'Other'
  ];

  // Load existing data if editing
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || '',
        category: ingredient.category || '',
        unitType: ingredient.unitType || 'kg',
        currentStock: ingredient.currentStock || 0,
        parLevel: ingredient.parLevel || 0,
        cost: ingredient.cost || 0,
        vendor: ingredient.vendor || '',
        vendorContact: ingredient.vendorContact || '',
        expirationDate: ingredient.expirationDate || '',
        location: ingredient.location || '',
        notes: ingredient.notes || ''
      });
    }
  }, [ingredient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Convert numeric fields to numbers
    if (['currentStock', 'parLevel', 'cost'].includes(name)) {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Ingredient name is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (formData.currentStock < 0) {
      toast.error('Current stock cannot be negative');
      return;
    }
    
    if (formData.parLevel < 0) {
      toast.error('Par level cannot be negative');
      return;
    }
    
    if (formData.cost < 0) {
      toast.error('Cost cannot be negative');
      return;
    }
    
    // Submit the form
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="label">Ingredient Name *</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            className="input"
            placeholder="Enter ingredient name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="label">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="select"
            required
          >
            <option value="">Select Category</option>
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="currentStock" className="label">Current Stock *</label>
          <div className="flex">
            <input
              id="currentStock"
              name="currentStock"
              value={formData.currentStock}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              className="input rounded-r-none"
              required
            />
            <select
              name="unitType"
              value={formData.unitType}
              onChange={handleChange}
              className="select !w-auto border-l-0 rounded-l-none"
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="parLevel" className="label">Par Level *</label>
          <input
            id="parLevel"
            name="parLevel"
            value={formData.parLevel}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            className="input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="cost" className="label">Cost per {formData.unitType} *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
            <input
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              className="input pl-7"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vendor" className="label">Vendor</label>
          <input
            id="vendor"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            type="text"
            className="input"
            placeholder="Supplier name"
          />
        </div>
        
        <div>
          <label htmlFor="vendorContact" className="label">Vendor Contact</label>
          <input
            id="vendorContact"
            name="vendorContact"
            value={formData.vendorContact}
            onChange={handleChange}
            type="text"
            className="input"
            placeholder="Phone or email"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expirationDate" className="label">Expiration Date</label>
          <input
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            type="date"
            className="input"
          />
        </div>
        
        <div>
          <label htmlFor="location" className="label">Storage Location</label>
          <input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            type="text"
            className="input"
            placeholder="e.g., Shelf A3, Refrigerator 2"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="label">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="input"
          placeholder="Additional information about this ingredient"
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {ingredient ? 'Update Ingredient' : 'Add Ingredient'}
        </button>
      </div>
    </form>
  );
};

// Waste Logging Form
const WasteLogForm = ({ ingredient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    ingredientId: ingredient?.id || '',
    ingredientName: ingredient?.name || '',
    quantity: 0,
    unitType: ingredient?.unitType || 'units',
    reason: '',
    loggedBy: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const reasons = [
    'Spoilage', 'Expired', 'Preparation Error', 'Quality Issues',
    'Customer Return', 'Damaged Packaging', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'quantity') {
      processedValue = parseFloat(value) || '';
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.quantity <= 0) {
      toast.error('Please enter a valid quantity greater than zero');
    }
    
    if (!formData.reason) {
      toast.error('Please select a reason');
      return;
    }
    
    if (!formData.loggedBy.trim()) {
      toast.error('Please enter who is logging this waste');
      return;
    }
    
    // Calculate cost impact
    const costImpact = ingredient ? formData.quantity * ingredient.cost : 0;
    
    // Submit form
    onSubmit({
      ...formData,
      costImpact
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="label">Ingredient</span>
        <p className="font-medium">{ingredient?.name}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className="label">Quantity *</label>
          <div className="flex">
            <input
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              type="number"
              min="0.01"
              step="0.01"
              className="input rounded-r-none"
              required
            />
            <span className="select !w-auto border-l-0 rounded-l-none bg-surface-100 dark:bg-surface-700 flex items-center px-3">
              {ingredient?.unitType || 'units'}
            </span>
          </div>
        </div>
        
        <div>
          <label htmlFor="date" className="label">Date *</label>
          <input
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            type="date"
            className="input"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="reason" className="label">Reason for Waste *</label>
        <select
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          className="select"
          required
        >
          <option value="">Select Reason</option>
          {reasons.map(reason => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="loggedBy" className="label">Logged By *</label>
        <input
          id="loggedBy"
          name="loggedBy"
          value={formData.loggedBy}
          onChange={handleChange}
          type="text"
          className="input"
          placeholder="Your name"
          required
        />
      </div>
      
      <div>
        <label htmlFor="notes" className="label">Additional Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="2"
          className="input"
          placeholder="Optional details about this waste entry"
        ></textarea>
      </div>
      
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          This will record a waste of {formData.quantity} {ingredient?.unitType || 'units'} of {ingredient?.name || 'this ingredient'} and reduce the inventory accordingly.
        </p>
        {ingredient && formData.quantity > 0 && (
          <p className="text-sm font-medium mt-1 text-red-600 dark:text-red-400">
            Cost Impact: ${(formData.quantity * ingredient.cost).toFixed(2)}
          </p>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Log Waste
        </button>
      </div>
    </form>
  );
};

// Main Inventory Component
const Inventory = () => {
  const [ingredients, setIngredients] = useState({ byId: {}, allIds: [] });
  const [allIngredients, setAllIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const waste = useSelector(state => state.inventory.waste); 
  const purchaseOrders = useSelector(state => state.inventory.purchaseOrders);
  
  // New state for waste log tab
  const [wasteSearchTerm, setWasteSearchTerm] = useState('');
  const [wasteFilter, setWasteFilter] = useState({ dateRange: 'all', reason: 'all' });
  const [activeTab, setActiveTab] = useState('ingredients');
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [poSearchTerm, setPoSearchTerm] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState('all');
  const [poVendorFilter, setPoVendorFilter] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [actionMode, setActionMode] = useState(null); // 'add-stock', 'log-waste', etc.
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [newPOItems, setNewPOItems] = useState([]);
  
  // Icons
  const PlusIcon = getIcon('plus');
  const CalendarIcon = getIcon('calendar');
  const SearchIcon = getIcon('search');
  const FilterIcon = getIcon('filter');
  const SortIcon = getIcon('arrow-up-down');
  const WarningIcon = getIcon('alert-triangle');
  const ArchiveIcon = getIcon('archive');
  const ClipboardIcon = getIcon('clipboard');
  const ReceiptIcon = getIcon('receipt');
  const TrashIcon = getIcon('trash');
  const EditIcon = getIcon('edit');
  const ShoppingCartIcon = getIcon('shopping-cart');
  const InfoIcon = getIcon('info');
  const XIcon = getIcon('x');
  const EyeIcon = getIcon('eye');
  const DollarSignIcon = getIcon('dollar-sign');
  const CheckIcon = getIcon('check');
  const TruckIcon = getIcon('truck');
  const FileBarChartIcon = getIcon('file-bar-chart');

  // Fetch ingredients from API on component mount
  useEffect(() => {
    const loadIngredients = async () => {
      setIsLoading(true);
      try {
        const data = await fetchIngredients();
        
        // Transform data to match the expected format
        const byId = data.reduce((acc, ingredient) => {
          acc[ingredient.Id] = { ...ingredient, id: ingredient.Id };
          return acc;
        }, {});
        
        setIngredients({ byId, allIds: data.map(i => i.Id) });
        setAllIngredients(data.map(i => ({ ...i, id: i.Id })));
        setError(null);
      } catch (err) {
        setError('Failed to load ingredients. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIngredients();
  }, []);
  
    .filter(ingredient => {
      // Apply search filter
      const matchesSearch = 
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply category filter
      const matchesCategory = 
        filterCategory === 'all' || 
        ingredient.category === filterCategory;
      
      // Apply stock filter
      const matchesStock = 
        filterStock === 'all' || 
        (filterStock === 'low' && ingredient.currentStock < ingredient.parLevel) ||
        (filterStock === 'out' && ingredient.currentStock === 0);
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return a.currentStock - b.currentStock;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  
  // Get unique categories for filter
  const categories = Object.values(ingredients.byId)
    .map(ing => ing.category)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();
  
  // Get unique vendors for PO filter
  const vendors = [...new Set(
    [...Object.values(ingredients.byId).map(ing => ing.vendor), 
     ...purchaseOrders.map(po => po.vendor)]
  )].filter(Boolean).sort();
  
  // Filter purchase orders
  const filteredPOs = purchaseOrders
    .filter(po => po.vendor.toLowerCase().includes(poSearchTerm.toLowerCase()) || po.id.includes(poSearchTerm))
    .filter(po => poStatusFilter === 'all' || po.status === poStatusFilter)
    .filter(po => poVendorFilter === 'all' || po.vendor === poVendorFilter);
  
  // Filter and prepare waste logs for display
  const filteredWaste = waste
    .filter(entry => {
      // Apply search filter
      const matchesSearch = wasteSearchTerm === '' || 
        entry.ingredientName.toLowerCase().includes(wasteSearchTerm.toLowerCase()) ||
        entry.loggedBy.toLowerCase().includes(wasteSearchTerm.toLowerCase()) ||
        (entry.notes && entry.notes.toLowerCase().includes(wasteSearchTerm.toLowerCase()));
        
      // Apply date range filter
      let matchesDateRange = true;
      if (wasteFilter.dateRange !== 'all') {
        const today = new Date();
        const entryDate = new Date(entry.date);
        
        if (wasteFilter.dateRange === 'today') {
          matchesDateRange = entryDate.toDateString() === today.toDateString();
        } else if (wasteFilter.dateRange === 'week') {
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          matchesDateRange = entryDate >= lastWeek;
        } else if (wasteFilter.dateRange === 'month') {
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          matchesDateRange = entryDate >= lastMonth;
        }
      }
      
      // Apply reason filter
      const matchesReason = wasteFilter.reason === 'all' || entry.reason === wasteFilter.reason;
      
      return matchesSearch && matchesDateRange && matchesReason;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
  
  // Calculate waste analytics
  const wasteAnalytics = {
    totalItems: filteredWaste.length,
    totalCost: filteredWaste.reduce((sum, entry) => sum + entry.costImpact, 0),
    byReason: filteredWaste.reduce((acc, entry) => {
      acc[entry.reason] = (acc[entry.reason] || 0) + 1;
      return acc;
    }, {}),
    topIngredient: filteredWaste.length > 0 ? 
      Object.entries(filteredWaste.reduce((acc, entry) => {
        acc[entry.ingredientName] = (acc[entry.ingredientName] || 0) + entry.costImpact;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0] : null
  };

  // Handle creating a new purchase order
  const handleCreatePO = () => {
    setIsCreatingPO(true);
    setNewPOItems([]);
  };

  // Add item to new purchase order
  const handleAddItemToPO = (event) => {
    const ingredientId = event.target.value;
    if (!ingredientId) return;

    const ingredient = ingredients.byId[ingredientId];
    if (!ingredient) return;

    // Check if already in list
    if (newPOItems.some(item => item.ingredientId === ingredientId)) {
      toast.info(`${ingredient.name} is already in your order`);
      return;
    }

    const orderQuantity = Math.max(1, Math.ceil(ingredient.parLevel - ingredient.currentStock));
    
    setNewPOItems(prev => [...prev, {
      ingredientId: ingredient.id,
      name: ingredient.name,
      quantity: orderQuantity,
      unitType: ingredient.unitType,
      unitPrice: ingredient.cost,
      totalPrice: orderQuantity * ingredient.cost
    }]);
  };

  // Update item quantity in new PO
  const handleUpdatePOItemQuantity = (index, quantity) => {
    setNewPOItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: quantity,
        totalPrice: quantity * updated[index].unitPrice
      };
      return updated;
    });
  };

  // Remove item from new PO
  const handleRemovePOItem = (index) => setNewPOItems(prev => prev.filter((_, i) => i !== index));
  
  // Handle adding a new ingredient
  const handleAddIngredient = (formData) => {
    createIngredient(formData);
    setIsAddingIngredient(false);
    toast.success(`${formData.name} added to inventory`);
  };
  
  // Handle updating an ingredient
  const handleUpdateIngredient = (formData) => {
    updateIngredient({
      id: editingIngredient.id,
      ...formData
    }));
    setEditingIngredient(null);
    toast.success(`${formData.name} updated successfully`);
  };
  
  // Handle deleting an ingredient
  const handleDeleteIngredient = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteIngredient(id);
      setSelectedIngredient(null);
      toast.success(`${name} removed from inventory`);
    }
  };
  
  // Handle adding stock
  const handleAddStock = () => {
    if (!selectedIngredient) return;
    
    const quantity = parseFloat(prompt(`Enter quantity to add (${selectedIngredient.unitType}):`, "0"));
    
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    dispatch(addStock({
      ingredientId: selectedIngredient.id,
      quantity,
      date: new Date().toISOString().split('T')[0]
    }));
    
    toast.success(`Added ${quantity} ${selectedIngredient.unitType} of ${selectedIngredient.name} to inventory`);
  };
  
  // Handle logging waste
  const handleLogWaste = (wasteData) => {
    logWaste(wasteData);
    setActionMode(null);
    toast.success(`Waste logged successfully`);
  };
  
  // Handle opening waste form from waste tab
  const handleAddWasteFromTab = () => {
    // Open a dialog to select an ingredient first
    const options = ingredients.allIds.map(id => ({
      value: id,
      label: ingredients.byId[id].name
    }));
    
    if (options.length === 0) {
      toast.error('You need to add ingredients before logging waste');
      return;
    }
  };
  
  // Handle generating purchase orders
  const handleSubmitPurchaseOrder = (vendor, items, notes) => {
    dispatch(generatePurchaseOrder({ vendor, items, notes }));
    setIsCreatingPO(false);
    toast.success(`Purchase order created successfully`);
  };
  
  const handleGeneratePurchaseOrder = () => {
    // Find ingredients below par level
    const lowItems = Object.values(ingredients.byId)
      .filter(ing => ing.currentStock < ing.parLevel);
    
    if (lowItems.length === 0) {
      toast.info('All inventory levels are above par levels');
      return;
    }
    
    // Group by vendor
    const vendorGroups = {};
    lowItems.forEach(ing => {
      const vendor = ing.vendor || 'Unspecified Vendor';
      if (!vendorGroups[vendor]) {
        vendorGroups[vendor] = [];
      }
      
      const orderQuantity = Math.ceil(ing.parLevel - ing.currentStock);
      vendorGroups[vendor].push({
        ingredientId: ing.id,
        name: ing.name,
        quantity: orderQuantity,
        unitPrice: ing.cost,
        totalPrice: orderQuantity * ing.cost
      });
    });
    
    // Generate PO for each vendor
    Object.entries(vendorGroups).forEach(([vendor, items]) => {
      dispatch(generatePurchaseOrder({
        vendor,
        items,
        notes: 'Automatically generated to restore par levels'
      }));
    });
    
    toast.success(`Generated ${Object.keys(vendorGroups).length} purchase orders`);
  };

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lg">Loading inventory data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      ) : (
  // Handle receiving a purchase order
  const handleReceivePO = (po) => {
    if (po.status === 'received') {
      toast.info('This order has already been received');
      return;
    }

    if (!window.confirm(`Mark this purchase order as received? This will add the items to your inventory.`)) {
      return;
    }

    // Update each item's stock
    po.items.forEach(item => {
      dispatch(addStock({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        date: new Date().toISOString().split('T')[0]
      }));
    });
  };
  
  return (
    <div className="app-container py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Inventory Management</h1>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-surface-200 dark:border-surface-700">
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {[
            { id: 'ingredients', label: 'Ingredients' },
            { id: 'waste', label: 'Waste Log' },
            { id: 'purchase-orders', label: 'Purchase Orders' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content based on active tab */}
      <div className="min-h-[50vh]">
        <AnimatePresence mode="wait">
          {/* Ingredients Tab */}
          {activeTab === 'ingredients' && (
            <motion.div
              key="ingredients-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Action Bar */}
                    {isLoading ? (
                      <tr><td colSpan="7" className="px-4 py-6 text-center">Loading ingredients...</td></tr>
                    ) : allIngredients.length === 0 ? (
                <div className="flex flex-col md:flex-row gap-3">
                      <td colSpan="7" className="px-4 py-6 text-center text-surface-500 dark:text-surface-400">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search ingredients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-9 w-full md:w-64"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
                  </div>
                  
                  {/* Category Filter */}
                  <div className="flex items-center">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="select"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Stock Filter */}
                  <div className="flex items-center">
                    <select
                      value={filterStock}
                      onChange={(e) => setFilterStock(e.target.value)}
                      className="select"
                    >
                      <option value="all">All Stock Levels</option>
                      <option value="low">Low Stock</option>
                      <option value="out">Out of Stock</option>
                    </select>
                  </div>
                  
                  {/* Sort Options */}
                  <div className="flex items-center">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="select"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="stock">Sort by Stock Level</option>
                      <option value="category">Sort by Category</option>
                    </select>
                  </div>
                </div>
                
                {/* Add Ingredient Button */}
                <button
                  onClick={() => setIsAddingIngredient(true)}
                  className="btn btn-primary flex items-center justify-center gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Ingredient</span>
                </button>
              </div>
              
              {/* Ingredients Table */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-100 dark:bg-surface-700 text-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Category</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Stock</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Par Level</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Vendor</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Cost</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                      {filteredIngredients.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-6 text-center text-surface-500 dark:text-surface-400">
                            {searchTerm || filterCategory !== 'all' || filterStock !== 'all' ? 
                              "No ingredients match your search criteria." : 
                              "No ingredients found. Add your first ingredient!"}
                          </td>
                        </tr>
                      ) : (
                        filteredIngredients.map(ingredient => (
                          <tr 
                            key={ingredient.id} 
                            className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                            onClick={() => setSelectedIngredient(ingredient)}
                          >
                            <td className="px-4 py-3">{ingredient.name}</td>
                            <td className="px-4 py-3">{ingredient.category}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`
                                  ${ingredient.currentStock === 0 ? 'text-red-600 dark:text-red-400' : 
                                    ingredient.currentStock < ingredient.parLevel ? 'text-yellow-600 dark:text-yellow-400' : 
                                    'text-green-600 dark:text-green-400'}
                                  font-medium
                                `}>
                                  {ingredient.currentStock} {ingredient.unitType}
                                </span>
                                {ingredient.currentStock === 0 && (
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 dark:bg-red-900">
                                    <WarningIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                                  </span>
                                )}
                                {ingredient.currentStock > 0 && ingredient.currentStock < ingredient.parLevel && (
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-yellow-100 dark:bg-yellow-900">
                                    <WarningIcon className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {ingredient.parLevel} {ingredient.unitType}
                            </td>
                            <td className="px-4 py-3">
                              {ingredient.vendor || "-"}
                            </td>
                            <td className="px-4 py-3">
                              ${ingredient.cost.toFixed(2)}/{ingredient.unitType}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                <button 
                                  className="p-1 text-surface-500 hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingIngredient(ingredient);
                                  }}
                                  aria-label="Edit"
                                >
                                  <EditIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  className="p-1 text-surface-500 hover:text-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteIngredient(ingredient.id, ingredient.name);
                                  }}
                                  aria-label="Delete"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Generate Purchase Order Button */}
              <div className="mt-4 flex justify-end">
                <button
                    onClick={handleCreatePO}
                  className="btn bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  Generate Purchase Orders
                </button>
              </div>
              
              {/* Add/Edit Ingredient Modal */}
              {(isAddingIngredient || editingIngredient) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                          {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
                        </h3>
                        <button 
                          onClick={() => {
                            setIsAddingIngredient(false);
                            setEditingIngredient(null);
                          }}
                          className="text-surface-500 hover:text-surface-700"
                        >
                          <XIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <IngredientForm 
                        ingredient={editingIngredient} 
                        onSubmit={editingIngredient ? handleUpdateIngredient : handleAddIngredient}
                        onCancel={() => {
                          setIsAddingIngredient(false);
                          setEditingIngredient(null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ingredient Details Modal */}
              {selectedIngredient && !actionMode && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                          {selectedIngredient.name}
                        </h3>
                        <button 
                          onClick={() => setSelectedIngredient(null)}
                          className="text-surface-500 hover:text-surface-700"
                        >
                          <XIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Stock Information */}
                        <div>
                          <h4 className="text-lg font-semibold mb-3">Stock Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 py-2">
                              <span className="text-surface-500">Current Stock:</span>
                              <span className={`font-medium ${
                                selectedIngredient.currentStock === 0 ? 'text-red-600 dark:text-red-400' : 
                                selectedIngredient.currentStock < selectedIngredient.parLevel ? 'text-yellow-600 dark:text-yellow-400' : 
                                'text-green-600 dark:text-green-400'
                              }`}>
                                {selectedIngredient.currentStock} {selectedIngredient.unitType}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 py-2">
                              <span className="text-surface-500">Par Level:</span>
                              <span>{selectedIngredient.parLevel} {selectedIngredient.unitType}</span>
                            </div>
                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 py-2">
                              <span className="text-surface-500">Cost per Unit:</span>
                              <span>${selectedIngredient.cost.toFixed(2)}/{selectedIngredient.unitType}</span>
                            </div>
                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 py-2">
                              <span className="text-surface-500">Last Restocked:</span>
                              <span>{selectedIngredient.lastRestocked || 'Not recorded'}</span>
                            </div>
                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 py-2">
                              <span className="text-surface-500">Expiration Date:</span>
                              <span>{selectedIngredient.expirationDate || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 py-2">
                              <span className="text-surface-500">Storage Location:</span>
                              <span>{selectedIngredient.location || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Vendor Information */}
                        <div>
                          <h4 className="text-lg font-semibold mb-3">Vendor Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 py-2">
                              <span className="text-surface-500">Category:</span>
                              <span>{selectedIngredient.category}</span>
                            </div>
                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 py-2">
                              <span className="text-surface-500">Vendor:</span>
                              <span>{selectedIngredient.vendor || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 py-2">
                              <span className="text-surface-500">Vendor Contact:</span>
                              <span>{selectedIngredient.vendorContact || 'Not specified'}</span>
                            </div>
                          </div>
                          
                          {/* Notes */}
                          <div className="mt-4">
                            <h4 className="text-lg font-semibold mb-2">Notes</h4>
                            <div className="p-3 bg-surface-50 dark:bg-surface-700 rounded-lg">
                              {selectedIngredient.notes || 'No notes available'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap justify-end gap-2 mt-6">
                        <button
                          onClick={() => setEditingIngredient(selectedIngredient)}
                          className="btn btn-outline flex items-center gap-1"
                        >
                          <EditIcon className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={handleAddStock}
                          className="btn bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add Stock
                        </button>
                        <button
                          onClick={() => setActionMode('log-waste')}
                          className="btn bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Log Waste
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Waste Logging Modal */}
              {selectedIngredient && actionMode === 'log-waste' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg max-w-xl w-full">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Log Waste: {selectedIngredient.name}</h3>
                        <button 
                          onClick={() => setActionMode(null)}
                          className="text-surface-500 hover:text-surface-700"
                        >
                          <XIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <WasteLogForm 
                        ingredient={selectedIngredient}
                        onSubmit={handleLogWaste}
                        onCancel={() => setActionMode(null)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Waste Log Tab */}
          {activeTab === 'waste' && (
            <motion.div
              key="waste-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Waste Log Actions */}
              <div className="mb-4 flex flex-col md:flex-row gap-3 justify-between">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search Field */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search waste logs..."
                      value={wasteSearchTerm}
                      onChange={(e) => setWasteSearchTerm(e.target.value)}
                      className="input pl-9 w-full md:w-64"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
                  </div>
                  
                  {/* Date Range Filter */}
                  <div className="flex items-center">
                    <select
                      value={wasteFilter.dateRange}
                      onChange={(e) => setWasteFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="select"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                  
                  {/* Reason Filter */}
                  <div className="flex items-center">
                    <select
                      value={wasteFilter.reason}
                      onChange={(e) => setWasteFilter(prev => ({ ...prev, reason: e.target.value }))}
                      className="select"
                    >
                      <option value="all">All Reasons</option>
                      {[...new Set(waste.map(w => w.reason))].map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Log New Waste Button */}
                <button
                  onClick={() => {
                    const id = ingredients.allIds[0];
                    if (id) {
                      setSelectedIngredient(ingredients.byId[id]);
                      setActionMode('log-waste');
                    } else {
                      toast.error('You need to add ingredients before logging waste');
                    }
                  }}
                  className="btn bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1"
                  disabled={ingredients.allIds.length === 0}
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Log New Waste</span>
                </button>
              </div>
              
              {/* Waste Analytics */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4 flex items-center gap-3">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <DollarSignIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-surface-500">Total Waste Cost</div>
                    <div className="text-xl font-bold">${wasteAnalytics.totalCost.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="card p-4 flex items-center gap-3">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                    <TrashIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-surface-500">Waste Entries</div>
                    <div className="text-xl font-bold">{wasteAnalytics.totalItems}</div>
                  </div>
                </div>
                
                <div className="card p-4 flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <FileBarChartIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-surface-500">Most Wasted (Cost)</div>
                    <div className="text-xl font-bold truncate max-w-[180px]">
                      {wasteAnalytics.topIngredient ? 
                        `${wasteAnalytics.topIngredient[0]}` : 
                        'None'}
                    </div>
                    {wasteAnalytics.topIngredient && (
                      <div className="text-sm text-red-500">${wasteAnalytics.topIngredient[1].toFixed(2)}</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-100 dark:bg-surface-700 text-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Ingredient</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Actions</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Quantity</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Reason</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Cost Impact</th>
                        <th className="px-4 py-3 text-left text-surface-600 dark:text-surface-300 font-medium">Logged By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                      {filteredWaste.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-6 text-center text-surface-500 dark:text-surface-400">
                            No waste logs match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredWaste.map(wasteEntry => (
                          <tr key={wasteEntry.id}>
                            <td className="px-4 py-3">
                              {new Date(wasteEntry.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td className="px-4 py-3">{wasteEntry.ingredientName}</td>
                            <td className="px-4 py-3">
                              <button 
                                className="p-1 text-surface-500 hover:text-blue-500"
                                onClick={() => {
                                  // Show waste details
                                  const ingredient = ingredients.byId[wasteEntry.ingredientId];
                                  // Format the waste details for display
                                  const details = `
                                    <div class="space-y-3">
                                      <div>
                                        <span class="font-medium">Date:</span> ${new Date(wasteEntry.date).toLocaleDateString('en-US', { 
                                          year: 'numeric', month: 'long', day: 'numeric' 
                                        })}
                                      </div>
                                      <div>
                                        <span class="font-medium">Ingredient:</span> ${wasteEntry.ingredientName}
                                      </div>
                                      <div>
                                        <span class="font-medium">Quantity:</span> ${wasteEntry.quantity} ${wasteEntry.unitType || ingredient?.unitType || 'units'}
                                      </div>
                                      <div>
                                        <span class="font-medium">Reason:</span> ${wasteEntry.reason}
                                      </div>
                                      <div>
                                        <span class="font-medium">Cost Impact:</span> $${wasteEntry.costImpact.toFixed(2)}
                                      </div>
                                      <div>
                                        <span class="font-medium">Logged By:</span> ${wasteEntry.loggedBy}
                                      </div>
                                      ${wasteEntry.notes ? `
                                      <div>
                                        <span class="font-medium">Notes:</span> ${wasteEntry.notes}
                                      </div>
                                      ` : ''}
                                    </div>
                                  `;
                                  
                                  toast.info(details, { dangerouslySetInnerHTML: true, autoClose: false });
                                }}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              {wasteEntry.quantity} {wasteEntry.unitType || ingredients.byId[wasteEntry.ingredientId]?.unitType || 'units'}
                            </td>
                            <td className="px-4 py-3">{wasteEntry.reason}</td>
                            <td className="px-4 py-3 text-red-600 dark:text-red-400">
                              ${wasteEntry.costImpact.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">{wasteEntry.loggedBy}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Purchase Orders Tab */}
          {activeTab === 'purchase-orders' && (
            <motion.div
              key="purchase-orders-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Purchase Order Filters and Actions */}
              <div className="mb-4 flex flex-col md:flex-row gap-3 justify-between">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search Field */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search purchase orders..."
                      value={poSearchTerm}
                      onChange={(e) => setPoSearchTerm(e.target.value)}
                      className="input pl-9 w-full md:w-64"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
                  </div>
                  
                  {/* Status Filter */}
                  <div className="flex items-center">
                    <select
                      value={poStatusFilter}
                      onChange={(e) => setPoStatusFilter(e.target.value)}
                      className="select"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="ordered">Ordered</option>
                      <option value="received">Received</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  {/* Vendor Filter */}
                  <div className="flex items-center">
                    <select
                      value={poVendorFilter}
                      onChange={(e) => setPoVendorFilter(e.target.value)}
                      className="select"
                    >
                      <option value="all">All Vendors</option>
                      {vendors.map(vendor => (
                        <option key={vendor} value={vendor}>{vendor}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCreatePO}
                    className="btn btn-primary flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Create Purchase Order
                  </button>
                  <button
                    onClick={handleGeneratePurchaseOrder}
                    className="btn bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-1"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    Auto-Generate
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Create Purchase Order Modal */}
                {isCreatingPO && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">Create Purchase Order</h3>
                          <button 
                            onClick={() => setIsCreatingPO(false)}
                            className="text-surface-500 hover:text-surface-700"
                          >
                            <XIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const vendor = e.target.vendor.value;
                          const notes = e.target.notes.value;
                          
                          if (!vendor || vendor.trim() === "") {
                            toast.error('Please select a vendor');
                            return;
                          }
                          
                          if (newPOItems.length === 0) {
                            toast.error('Please add at least one item to the order');
                            return;
                          }
                          
                          // Submit the purchase order
                          dispatch(generatePurchaseOrder({ vendor, items: newPOItems, notes }));
                          setIsCreatingPO(false);
                          toast.success(`Purchase order created successfully`);
                        }}>
                          <div className="space-y-4">
                            {/* Vendor Selection */}
                            <div>
                              <label htmlFor="vendor" className="label">Vendor *</label>
                              <select
                                id="vendor"
                                name="vendor"
                                className="select"
                                required
                              >
                                <option value="">Select Vendor</option>
                                {vendors.map(vendor => (
                                  <option key={vendor} value={vendor}>{vendor}</option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Add Items */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="label mb-0">Order Items *</label>
                                <select
                                  className="select !w-auto !py-1 !h-9 text-sm"
                                  onChange={handleAddItemToPO}
                                  value=""
                                >
                                  <option value="">+ Add Ingredient</option>
                                  {allIngredients
                                    .filter(ing => !newPOItems.some(item => item.ingredientId === ing.id))
                                    .map(ing => (
                                      <option key={ing.id} value={ing.id}>
                                        {ing.name} (${ing.cost.toFixed(2)}/{ing.unitType})
                                      </option>
                                    ))
                                  }
                                </select>
                              </div>
                              
                              {newPOItems.length === 0 ? (
                                <div className="border border-dashed border-surface-300 dark:border-surface-600 p-4 rounded-lg text-center text-surface-500">
                                  No items added. Use the dropdown above to add ingredients to this order.
                                </div>
                              ) : (
                                <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-surface-100 dark:bg-surface-700 text-sm">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-surface-600 dark:text-surface-300 font-medium">Item</th>
                                        <th className="px-4 py-2 text-left text-surface-600 dark:text-surface-300 font-medium">Quantity</th>
                                        <th className="px-4 py-2 text-left text-surface-600 dark:text-surface-300 font-medium">Unit Price</th>
                                        <th className="px-4 py-2 text-left text-surface-600 dark:text-surface-300 font-medium">Total</th>
                                        <th className="px-4 py-2 text-surface-600 dark:text-surface-300 font-medium w-16">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                                      {newPOItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                                          <td className="px-4 py-2">{item.name}</td>
                                          <td className="px-4 py-2">
                                            <div className="flex gap-1 items-center">
                                              <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdatePOItemQuantity(index, parseInt(e.target.value) || 1)}
                                                className="input !py-1 !h-8 w-20 text-center"
                                              />
                                              <span className="text-surface-500 text-sm">{item.unitType}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-2">${item.unitPrice.toFixed(2)}</td>
                                          <td className="px-4 py-2 font-medium">${item.totalPrice.toFixed(2)}</td>
                                          <td className="px-4 py-2">
                                            <button
                                              type="button"
                                              onClick={() => handleRemovePOItem(index)}
                                              className="p-1 text-surface-500 hover:text-red-500"
                                            >
                                              <XIcon className="h-4 w-4" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot className="bg-surface-50 dark:bg-surface-700">
                                      <tr>
                                        <td colSpan="3" className="px-4 py-2 text-right font-medium">Total Amount:</td>
                                        <td colSpan="2" className="px-4 py-2 text-primary font-bold">
                                          ${newPOItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              )}
                            </div>
                            
                            {/* Notes */}
                            <div>
                              <label htmlFor="notes" className="label">Notes</label>
                              <textarea
                                id="notes"
                                name="notes"
                                rows="3"
                                className="input"
                                placeholder="Add any additional instructions or notes for this order"
                              ></textarea>
                            </div>
                            
                            <div className="flex justify-end space-x-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setIsCreatingPO(false)}
                                className="btn btn-outline"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={newPOItems.length === 0}
                              >
                                Create Purchase Order
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              
                {purchaseOrders.length === 0 ? (
                  <div className="card p-6 text-center text-surface-500 dark:text-surface-400">
                    No purchase orders found. Generate purchase orders for low-stock items.
                  </div>
                ) : (
                  purchaseOrders.map(po => (
                    <div key={po.id} className="card p-5">
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div className="mb-3 md:mb-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Purchase Order #{po.id.slice(-6)}</h3>
                            <span className={`
                              px-2 py-1 text-xs font-medium rounded-full ${
                                po.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                                po.status === 'ordered' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                                po.status === 'received' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-300'
                              }
                            `}>
                              {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                            <span>Date: {po.date}</span>
                            <span className="mx-2">•</span>
                            <span>Vendor: {po.vendor}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <select
                            value={po.status}
                            onChange={(e) => {
                              dispatch(updatePurchaseOrderStatus({
                                id: po.id,
                                status: e.target.value
                              }));
                              toast.success(`Purchase order status updated to ${e.target.value}`);
                            }}
                            className="select !py-1 !h-9"
                          >
                            <option value="pending">Pending</option>
                            <option value="ordered">Ordered</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {po.status !== 'received' && po.status !== 'cancelled' && (
                            <button
                              onClick={() => handleReceivePO(po)}
                              className="btn bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 !py-1 !h-9"
                            >
                              <TruckIcon className="h-4 w-4" /> Receive
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700">
                        <table className="w-full">
                          <thead className="bg-surface-100 dark:bg-surface-700 text-sm">
                            <tr>
                              <th className="px-4 py-2 text-left text-surface-600 dark:text-surface-300 font-medium">Item</th>
                              <th className="px-4 py-2 text-left text-surface-600 dark:text-surface-300 font-medium">Quantity</th>
                              <th className="px-4 py-2 text-left text-surface-600 dark:text-surface-300 font-medium">Unit Price</th>
                              <th className="px-4 py-2 text-left text-surface-600 dark:text-surface-300 font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                            {po.items.map((item, index) => (
                              <tr key={index} className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                                <td className="px-4 py-2">{item.name}</td>
                                <td className="px-4 py-2">
                                  {item.quantity} {ingredients.byId[item.ingredientId]?.unitType || 'units'}
                                </td>
                                <td className="px-4 py-2">${item.unitPrice.toFixed(2)}</td>
                                <td className="px-4 py-2">${item.totalPrice.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-surface-50 dark:bg-surface-700">
                            <tr>
                              <td colSpan="3" className="px-4 py-2 text-right font-medium">Total Amount:</td>
                              <td className="px-4 py-2 text-primary font-bold">${po.totalAmount.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      
                      {po.notes && (
                        <div className="mt-3 text-sm bg-surface-50 dark:bg-surface-700 p-3 rounded-md">
                          <span className="font-medium">Notes:</span> {po.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    )}
  );
};

export default Inventory;