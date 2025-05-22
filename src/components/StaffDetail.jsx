import { useState, useEffect } from 'react';
import { getStaffMemberById } from '../services/staffService';
import { getIcon } from '../utils/iconUtils';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const StaffDetail = ({ staffId, onClose, onEdit }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [error, setError] = useState(null);

  const CloseIcon = getIcon('x');
  const EditIcon = getIcon('edit');
  const UserIcon = getIcon('user');
  const CalendarIcon = getIcon('calendar');
  const TagIcon = getIcon('tag');
  const ClipboardIcon = getIcon('clipboardList');
  const DollarIcon = getIcon('dollarSign');
  const StarIcon = getIcon('star');

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!staffId) {
        setError('No staff ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const data = await getStaffMemberById(staffId);
        setStaffData(data);
      } catch (err) {
        console.error('Error fetching staff data:', err);
        setError('Failed to load staff details');
        toast.error('Failed to load staff details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
  }, [staffId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Error</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!staffData) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Staff Details</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <p>No data found for this staff member.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Staff Details</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(staffId)} 
            className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
            aria-label="Edit staff member"
          >
            <EditIcon className="h-5 w-5 text-primary" />
          </button>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
            aria-label="Close details"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <UserIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-medium">{staffData.Name}</h4>
            <p className="text-surface-600 dark:text-surface-400">{staffData.role || 'No role assigned'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-surface-500" />
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Joined</p>
              <p>{staffData.CreatedOn ? format(new Date(staffData.CreatedOn), 'MMM d, yyyy') : 'Unknown'}</p>
            </div>
          </div>

          {staffData.Tags && staffData.Tags.length > 0 && (
            <div className="flex items-center gap-3">
              <TagIcon className="h-5 w-5 text-surface-500" />
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {staffData.Tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-surface-100 dark:bg-surface-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardIcon className="h-5 w-5 text-blue-500" />
              <h5 className="font-medium">Orders Processed</h5>
            </div>
            <p className="text-2xl font-semibold text-center">{staffData.ordersProcessed || 0}</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarIcon className="h-5 w-5 text-green-500" />
              <h5 className="font-medium">Sales Amount</h5>
            </div>
            <p className="text-2xl font-semibold text-center">
              ${(staffData.salesAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <StarIcon className="h-5 w-5 text-yellow-500" />
              <h5 className="font-medium">Average Rating</h5>
            </div>
            <div className="flex justify-center items-center">
              <p className="text-2xl font-semibold">{(staffData.averageRating || 0).toFixed(1)}</p>
              <p className="text-surface-500 dark:text-surface-400 ml-1">/5</p>
            </div>
            <div className="flex justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.round(staffData.averageRating || 0) ? 'text-yellow-500' : 'text-surface-300 dark:text-surface-600'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetail;