import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { getIcon } from '../utils/iconUtils';

const ALLERGEN_OPTIONS = [
  'gluten', 'dairy', 'nuts', 'soy', 'shellfish', 'fish', 'eggs', 'peanuts'
];

const POPULARITY_OPTIONS = [
  'low', 'medium', 'high'
];

const MenuItemForm = ({ onClose, onSubmit, item, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    allergens: [],
    isVegetarian: false,
    popularity: 'medium',
    image: null
  });
  
  // Icons
  const CloseIcon = getIcon('x');
  const SaveIcon = getIcon('save');
  const DollarSignIcon = getIcon('dollar-sign');
  const ImageIcon = getIcon('image');
  const PlusIcon = getIcon('plus');
  const LeafIcon = getIcon('leaf');
  const TrendingUpIcon = getIcon('trending-up');
  
  // Initialize form with item data if editing
  useEffect(() => {
    if (isEditing && item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        cost: item.cost?.toString() || '',
        allergens: item.allergens || [],
        isVegetarian: item.isVegetarian || false,
        popularity: item.popularity || 'medium',
        image: item.image || null
      });
    }
  }, [isEditing, item]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle allergen selection
  const handleAllergenToggle = (allergen) => {
    setFormData(prev => {
      const allergens = prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen];
        
      return {
        ...prev,
        allergens
      };
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price) {
      // Show error toast or validation message
      return;
    }
    
    // Parse numeric values
    const processedData = {
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0
    };
    
    onSubmit(processedData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="label">Item Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Chicken Parmesan, Caesar Salad"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="3"
              placeholder="Describe this menu item"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="price" className="label">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input pl-7"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="cost" className="label">Food Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="input pl-7"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="label mb-2">Allergens (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map(allergen => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => handleAllergenToggle(allergen)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.allergens.includes(allergen)
                      ? 'bg-red-500 text-white'
                      : 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isVegetarian"
              name="isVegetarian"
              checked={formData.isVegetarian}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isVegetarian" className="cursor-pointer flex items-center">
              <LeafIcon className="w-4 h-4 mr-1 text-green-500" />
              <span>Vegetarian</span>
            </label>
          </div>
          
          <div className="mb-6">
            <label htmlFor="popularity" className="label">Popularity</label>
            <select
              id="popularity"
              name="popularity"
              value={formData.popularity}
              onChange={handleChange}
              className="select"
            >
              {POPULARITY_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {isEditing ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;