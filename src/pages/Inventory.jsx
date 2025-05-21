import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { 
  addIngredient, 
  updateIngredient, 
  deleteIngredient, 
  addStock, 
  logWaste, 
  generatePurchaseOrder 
} from '../redux/slices/inventorySlice';

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
    reason: '',
    loggedBy: '',
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
    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
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
  const dispatch = useDispatch();
  const ingredients = useSelector(state => state.inventory.ingredients);
  const waste = useSelector(state => state.inventory.waste);
  const purchaseOrders = useSelector(state => state.inventory.purchaseOrders);
  
  const [activeTab, setActiveTab] = useState('ingredients');
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [actionMode, setActionMode] = useState(null); // 'add-stock', 'log-waste', etc.
  
  // Icons
  const PlusIcon = getIcon('plus');
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
  
  // Filter and sort ingredients
  const filteredIngredients = ingredients.allIds
    .map(id => ingredients.byId[id])
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
  
  // Handle adding a new ingredient
  const handleAddIngredient = (formData) => {
    dispatch(addIngredient(formData));
    setIsAddingIngredient(false);
    toast.success(`${formData.name} added to inventory`);
  };
  
  // Handle updating an ingredient
  const handleUpdateIngredient = (formData) => {
    dispatch(updateIngredient({
      id: editingIngredient.id,
      ...formData
    }));
    setEditingIngredient(null);
    toast.success(`${formData.name} updated successfully`);
  };
  
  // Handle deleting an ingredient
  const handleDeleteIngredient = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      dispatch(deleteIngredient(id));
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
    dispatch(logWaste(wasteData));
    setActionMode(null);
    toast.success(`Waste logged successfully`);
  };
  
  // Handle generating purchase orders
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
    </div>
  );
};

export default Inventory;