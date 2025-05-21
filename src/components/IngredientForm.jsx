import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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
    </form>
  );
};

export default IngredientForm;