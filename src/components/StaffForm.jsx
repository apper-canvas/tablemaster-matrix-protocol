import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createStaffMember, updateStaffMember, getStaffMemberById } from '../services/staffService';
import { getIcon } from '../utils/iconUtils';

const StaffForm = ({ staffId = null, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    role: '',
    ordersProcessed: 0,
    salesAmount: 0,
    averageRating: 0,
    Tags: ''
  });
  const [errors, setErrors] = useState({});

  const SaveIcon = getIcon('save');
  const CancelIcon = getIcon('x');
  const LoadingIcon = getIcon('loader');

  // If staffId is provided, fetch the staff data
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!staffId) return;
      
      setIsLoadingData(true);
      try {
        const staffData = await getStaffMemberById(staffId);
        if (staffData) {
          // Convert Tags from array to comma-separated string for the form
          const formattedData = {
            ...staffData,
            Tags: staffData.Tags ? staffData.Tags.join(',') : ''
          };
          setFormData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching staff data:', error);
        toast.error('Failed to load staff data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchStaffData();
  }, [staffId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name.trim()) {
      newErrors.Name = 'Name is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    // Validate numeric fields
    if (formData.ordersProcessed !== null && formData.ordersProcessed !== undefined && isNaN(Number(formData.ordersProcessed))) {
      newErrors.ordersProcessed = 'Must be a number';
    }
    
    if (formData.salesAmount !== null && formData.salesAmount !== undefined && isNaN(Number(formData.salesAmount))) {
      newErrors.salesAmount = 'Must be a number';
    }
    
    if (formData.averageRating !== null && formData.averageRating !== undefined) {
      const rating = Number(formData.averageRating);
      if (isNaN(rating)) {
        newErrors.averageRating = 'Must be a number';
      } else if (rating < 0 || rating > 5) {
        newErrors.averageRating = 'Rating must be between 0 and 5';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format the data for submission
      const dataToSubmit = {
        ...formData,
        // Convert string values to proper types
        ordersProcessed: formData.ordersProcessed !== null && formData.ordersProcessed !== undefined ? Number(formData.ordersProcessed) : null,
        salesAmount: formData.salesAmount !== null && formData.salesAmount !== undefined ? Number(formData.salesAmount) : null,
        averageRating: formData.averageRating !== null && formData.averageRating !== undefined ? Number(formData.averageRating) : null,
        // Convert comma-separated tags to array
        Tags: formData.Tags ? formData.Tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      
      if (staffId) {
        await updateStaffMember(staffId, dataToSubmit);
      } else {
        await createStaffMember(dataToSubmit);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving staff member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return <div className="flex justify-center items-center p-8"><LoadingIcon className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="label" htmlFor="Name">Name</label>
        <input id="Name" name="Name" type="text" value={formData.Name} onChange={handleChange} className="input" placeholder="Staff Member Name" />
        {errors.Name && <p className="text-red-500 text-sm mt-1">{errors.Name}</p>}
      </div>
      
      <div>
        <label className="label" htmlFor="role">Role</label>
        <select id="role" name="role" value={formData.role} onChange={handleChange} className="select">
          <option value="">Select a role</option>
          <option value="Server">Server</option>
          <option value="Host">Host</option>
          <option value="Bartender">Bartender</option>
        </select>
        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
      </div>
      
      <div>
        <label className="label" htmlFor="Tags">Tags (comma-separated)</label>
        <input id="Tags" name="Tags" type="text" value={formData.Tags} onChange={handleChange} className="input" placeholder="tag1, tag2, tag3" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label" htmlFor="ordersProcessed">Orders Processed</label>
          <input id="ordersProcessed" name="ordersProcessed" type="number" value={formData.ordersProcessed} onChange={handleChange} className="input" min="0" />
          {errors.ordersProcessed && <p className="text-red-500 text-sm mt-1">{errors.ordersProcessed}</p>}
        </div>
        
        <div>
          <label className="label" htmlFor="salesAmount">Sales Amount</label>
          <input id="salesAmount" name="salesAmount" type="number" value={formData.salesAmount} onChange={handleChange} className="input" min="0" step="0.01" />
          {errors.salesAmount && <p className="text-red-500 text-sm mt-1">{errors.salesAmount}</p>}
        </div>
        
        <div>
          <label className="label" htmlFor="averageRating">Average Rating (0-5)</label>
          <input id="averageRating" name="averageRating" type="number" value={formData.averageRating} onChange={handleChange} className="input" min="0" max="5" step="0.1" />
          {errors.averageRating && <p className="text-red-500 text-sm mt-1">{errors.averageRating}</p>}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn btn-outline flex items-center gap-2"
          disabled={isLoading}
        >
          <CancelIcon className="h-4 w-4" /> Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingIcon className="animate-spin h-4 w-4" />
          ) : (
            <SaveIcon className="h-4 w-4" />
          )}
          {staffId ? 'Update' : 'Create'} Staff Member
        </button>
      </div>
    </form>
  );
};

export default StaffForm;