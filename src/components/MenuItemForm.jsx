import { useState, useEffect } from 'react';
import { getIcon } from '../utils/iconUtils';

const MenuItemForm = ({ onClose, onSubmit, item = null, isEditing = false, isLoading = false }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    allergens: [],
    isVegetarian: false,
    popularity: 'medium',
    image: null
  });
  
  // Allergen input state
  const [allergenInput, setAllergenInput] = useState('');
  
  // Icons
  const CloseIcon = getIcon('x');
  const SaveIcon = getIcon('save');
  const PlusIcon = getIcon('plus');
  const TrashIcon = getIcon('trash');
  const ImageIcon = getIcon('image');
  const LoaderIcon = getIcon('loader');
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Populate form with item data if editing
  useEffect(() => {
    if (item && isEditing) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || 0,
        cost: item.cost || 0,
        allergens: item.allergens || [],
        isVegetarian: item.isVegetarian || false,
        popularity: item.popularity || 'medium',
        image: item.image || null
      });
    }
  }, [item, isEditing]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle price and cost input with validation
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: ''
      }));
    } else if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Add allergen to the list
  const handleAddAllergen = () => {
    if (allergenInput.trim() === '') return;
    
    const newAllergen = allergenInput.trim().toLowerCase();
    
    if (!formData.allergens.includes(newAllergen)) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, newAllergen]
      }));
    }
    
    setAllergenInput('');
  };
  
  // Remove allergen from the list
  const handleRemoveAllergen = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }));
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.price === '' || isNaN(formData.price) || formData.price < 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (formData.cost === '' || isNaN(formData.cost) || formData.cost < 0) {
      newErrors.cost = 'Cost must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
            disabled={isLoading}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="label">Item Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input ${errors.name ? 'border-red-500 dark:border-red-400' : ''}`}
                placeholder="e.g., Grilled Salmon, Caesar Salad"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="price" className="label">Price *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleNumberChange}
                step="0.01"
                min="0"
                className={`input ${errors.price ? 'border-red-500 dark:border-red-400' : ''}`}
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
            
            <div>
              <label htmlFor="cost" className="label">Cost *</label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleNumberChange}
                step="0.01"
                min="0"
                className={`input ${errors.cost ? 'border-red-500 dark:border-red-400' : ''}`}
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Brief description of this menu item"
                disabled={isLoading}
              ></textarea>
            </div>
            
            <div>
              <label className="label">Popularity</label>
              <select
                name="popularity"
                value={formData.popularity}
                onChange={handleChange}
                className="select"
                disabled={isLoading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="flex items-center space-x-2 mt-8">
                <input
                  type="checkbox"
                  name="isVegetarian"
                  checked={formData.isVegetarian}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                  disabled={isLoading}
                />
                <span>Vegetarian</span>
              </label>
            </div>
            
            <div className="md:col-span-2">
              <label className="label">Allergens</label>
              <div className="flex">
                <input
                  type="text"
                  value={allergenInput}
                  onChange={(e) => setAllergenInput(e.target.value)}
                  className="input rounded-r-none"
                  placeholder="e.g., dairy, nuts, gluten"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleAddAllergen}
                  className="bg-primary text-white px-3 py-2 rounded-r-lg hover:bg-primary-dark"
                  disabled={isLoading || !allergenInput.trim()}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              
              {formData.allergens.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allergens.map((allergen, index) => (
                    <div key={index} className="flex items-center bg-surface-200 dark:bg-surface-700 px-2 py-1 rounded text-sm">
                      <span>{allergen}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergen)}
                        className="ml-1 text-red-500 hover:text-red-600"
                        disabled={isLoading}
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <SaveIcon className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;