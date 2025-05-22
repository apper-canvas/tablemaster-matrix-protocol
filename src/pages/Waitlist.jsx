import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import WaitlistEntry from '../components/WaitlistEntry';
import { getIcon } from '../utils/iconUtils';
import { 
  fetchWaitlist, 
  addToWaitlist, 
  updateWaitlistEntry, 
  notifyCustomer, 
  seatCustomer, 
  removeFromWaitlist 
} from '../services/waitlistService';

const Waitlist = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    partySize: 2,
    notes: ''
  });
  
  // Icons
  const PlusIcon = getIcon('plus');
  const RefreshIcon = getIcon('refresh-cw');
  
  // Fetch waitlist data
  const loadWaitlist = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await fetchWaitlist();
      // Filter to only show waiting customers
      const activeEntries = data.filter(entry => entry.status === 'waiting');
      setWaitlist(activeEntries);
    } catch (error) {
      console.error("Error loading waitlist:", error);
      setIsError(true);
      toast.error("Failed to load waitlist data.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadWaitlist();
    // Refresh every minute to keep estimates current
    const interval = setInterval(loadWaitlist, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'partySize' ? parseInt(value, 10) : value
    });
  };
  
  // Add customer to waitlist
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setIsAddingCustomer(true);
    
    try {
      // Validate form data
      if (!formData.customerName) {
        toast.error("Customer name is required");
        return;
      }
      
      if (!formData.phoneNumber) {
        toast.error("Phone number is required");
        return;
      }
      
      const newCustomer = {
        Name: formData.customerName,
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        partySize: formData.partySize || 1,
        notes: formData.notes || '',
        timeAdded: new Date().toISOString(),
        status: 'waiting',
        notified: false
      };
      
      await addToWaitlist(newCustomer);
      toast.success("Customer added to waitlist");
      
      // Reset form
      setFormData({
        customerName: '',
        phoneNumber: '',
        partySize: 2,
        notes: ''
      });
      
      // Close form and refresh list
      setIsAddingCustomer(false);
      loadWaitlist();
      
    } catch (error) {
      toast.error("Failed to add customer to waitlist");
    } finally {
      setIsAddingCustomer(false);
    }
  };
  
  // Edit waitlist entry
  const handleEditEntry = (entry) => {
    setCurrentEntry(entry);
    setFormData({
      customerName: entry.customerName,
      phoneNumber: entry.phoneNumber,
      partySize: entry.partySize,
      notes: entry.notes || ''
    });
    setIsEditingCustomer(true);
  };
  
  // Update waitlist entry
  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    if (!currentEntry) return;
    
    try {
      const updatedEntry = {
        Id: currentEntry.id,
        Name: formData.customerName,
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        partySize: formData.partySize,
        notes: formData.notes
      };
      
      await updateWaitlistEntry(updatedEntry);
      toast.success("Waitlist entry updated");
      
      // Reset and refresh
      setIsEditingCustomer(false);
      setCurrentEntry(null);
      loadWaitlist();
      
    } catch (error) {
      toast.error("Failed to update waitlist entry");
    }
  };
  
  // Notify customer
  const handleNotifyCustomer = async (entry) => {
    try {
      await notifyCustomer(entry.id);
      loadWaitlist();
    } catch (error) {
      toast.error("Failed to notify customer");
    }
  };
  
  // Seat customer
  const handleSeatCustomer = async (entry) => {
    try {
      await seatCustomer(entry.id);
      loadWaitlist();
    } catch (error) {
      toast.error("Failed to seat customer");
    }
  };
  
  // Remove customer from waitlist
  const handleRemoveCustomer = async (entry) => {
    if (confirm(`Remove ${entry.customerName} from the waitlist?`)) {
      try {
        await removeFromWaitlist(entry.id);
        loadWaitlist();
      } catch (error) {
        toast.error("Failed to remove customer from waitlist");
      }
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Waitlist</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => loadWaitlist()}
            className="btn btn-outline-primary"
            disabled={isLoading}>
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button 
            onClick={() => setIsAddingCustomer(true)}
            className="btn btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add to Waitlist
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      ) : isError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Failed to load waitlist. Please try refreshing the page.</p>
        </div>
      ) : waitlist.length === 0 ? (
        <div className="text-center py-10 bg-surface-100 dark:bg-surface-800 rounded-lg">
          <p className="text-surface-600 dark:text-surface-300">No customers currently on the waitlist.</p>
        </div>
      ) : (
        <div>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            {waitlist.length} {waitlist.length === 1 ? 'party' : 'parties'} waiting
          </p>
          <div className="grid gap-4">
            {waitlist.map(entry => (
              <WaitlistEntry
                key={entry.id}
                entry={entry}
                onNotify={handleNotifyCustomer}
                onSeat={handleSeatCustomer}
                onEdit={handleEditEntry}
                onRemove={handleRemoveCustomer}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Add Customer Modal */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add to Waitlist</h2>
            <form onSubmit={handleAddCustomer}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Party Size</label>
                <input
                  type="number"
                  name="partySize"
                  min="1"
                  value={formData.partySize}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input w-full"
                  rows="3"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingCustomer(false)}
                  className="btn btn-outline">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isAddingCustomer}>
                  {isAddingCustomer ? 'Adding...' : 'Add to Waitlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Customer Modal */}
      {isEditingCustomer && currentEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Waitlist Entry</h2>
            <form onSubmit={handleUpdateEntry}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Party Size</label>
                <input
                  type="number"
                  name="partySize"
                  min="1"
                  value={formData.partySize}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input w-full"
                  rows="3"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditingCustomer(false);
                    setCurrentEntry(null);
                  }}
                  className="btn btn-outline">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary">
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Waitlist;