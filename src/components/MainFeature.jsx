import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

// Initial set of tables with their properties
const initialTables = [
  { id: 1, number: 1, capacity: 2, status: 'available', shape: 'circle' },
  { id: 2, number: 2, capacity: 4, status: 'occupied', shape: 'rectangle', customer: 'Smith Family', timeRemaining: 35 },
  { id: 3, number: 3, capacity: 2, status: 'reserved', shape: 'circle', reservationTime: '7:30 PM' },
  { id: 4, number: 4, capacity: 6, status: 'available', shape: 'rectangle' },
  { id: 5, number: 5, capacity: 4, status: 'occupied', shape: 'rectangle', customer: 'Johnson Party', timeRemaining: 15 },
  { id: 6, number: 6, capacity: 2, status: 'available', shape: 'circle' },
  { id: 7, number: 7, capacity: 8, status: 'reserved', shape: 'rectangle', reservationTime: '8:00 PM' },
  { id: 8, number: 8, capacity: 4, status: 'available', shape: 'rectangle' },
  { id: 9, number: 9, capacity: 2, status: 'cleaning', shape: 'circle' },
  { id: 10, number: 10, capacity: 4, status: 'available', shape: 'rectangle' },
];

// Hardcoded waitlist entries
const initialWaitlist = [
  { id: 1, name: 'Garcia Family', size: 4, waitTime: 25, phoneNumber: '555-123-4567' },
  { id: 2, name: 'Martinez Party', size: 2, waitTime: 15, phoneNumber: '555-987-6543' },
  { id: 3, name: 'Wilson Group', size: 6, waitTime: 40, phoneNumber: '555-456-7890' },
];

const MainFeature = () => {
  const [tables, setTables] = useState(initialTables);
  const [waitlist, setWaitlist] = useState(initialWaitlist);
  const [selectedTable, setSelectedTable] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    partySize: '',
    phoneNumber: '',
    notes: '',
    reservationTime: '',
    duration: '60',
  });
  const [filter, setFilter] = useState('all');
  const [isAddingToWaitlist, setIsAddingToWaitlist] = useState(false);
  const [waitlistFormData, setWaitlistFormData] = useState({
    name: '',
    size: '',
    phoneNumber: '',
    notes: '',
  });

  // Icons
  const CircleIcon = getIcon('circle');
  const SquareIcon = getIcon('square');
  const CheckIcon = getIcon('check');
  const XIcon = getIcon('x');
  const ClockIcon = getIcon('clock');
  const UsersIcon = getIcon('users');
  const PhoneIcon = getIcon('phone');
  const EditIcon = getIcon('edit');
  const PlusIcon = getIcon('plus');
  const TimerIcon = getIcon('timer');
  const CleaningIcon = getIcon('spray-can');
  const SearchIcon = getIcon('search');

  // Function to handle table selection
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setActionType(null);
    
    // Pre-fill form if table is occupied or reserved
    if (table.status === 'occupied' && table.customer) {
      setFormData({
        ...formData,
        customerName: table.customer,
        partySize: table.capacity,
        phoneNumber: table.phoneNumber || '',
        notes: table.notes || '',
      });
    } else if (table.status === 'reserved' && table.reservationTime) {
      setFormData({
        ...formData,
        customerName: table.customer || '',
        partySize: table.capacity,
        phoneNumber: table.phoneNumber || '',
        notes: table.notes || '',
        reservationTime: table.reservationTime,
      });
    } else {
      // Reset form for available tables
      setFormData({
        customerName: '',
        partySize: table.capacity,
        phoneNumber: '',
        notes: '',
        reservationTime: '',
        duration: '60',
      });
    }
  };

  // Function to handle table action selection
  const handleActionSelect = (action) => {
    setActionType(action);
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to handle waitlist form input changes
  const handleWaitlistInputChange = (e) => {
    const { name, value } = e.target;
    setWaitlistFormData({
      ...waitlistFormData,
      [name]: value,
    });
  };

  // Function to add party to waitlist
  const handleAddToWaitlist = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!waitlistFormData.name || !waitlistFormData.size || !waitlistFormData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Create new waitlist entry
    const newWaitlistEntry = {
      id: Date.now(),
      name: waitlistFormData.name,
      size: parseInt(waitlistFormData.size),
      waitTime: 15 + (parseInt(waitlistFormData.size) * 5), // Simple calculation for wait time
      phoneNumber: waitlistFormData.phoneNumber,
      notes: waitlistFormData.notes,
    };
    
    // Add to waitlist
    setWaitlist([...waitlist, newWaitlistEntry]);
    
    // Reset form and close
    setWaitlistFormData({
      name: '',
      size: '',
      phoneNumber: '',
      notes: '',
    });
    setIsAddingToWaitlist(false);
    
    // Show success toast
    toast.success(`${newWaitlistEntry.name} added to waitlist`);
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form based on action type
    if (actionType === 'seat' || actionType === 'reserve') {
      if (!formData.customerName || !formData.partySize) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      if (actionType === 'reserve' && !formData.reservationTime) {
        toast.error('Please select a reservation time');
        return;
      }
    }
    
    // Update table status based on action
    const updatedTables = tables.map(table => {
      if (table.id === selectedTable.id) {
        switch (actionType) {
          case 'seat':
            return {
              ...table,
              status: 'occupied',
              customer: formData.customerName,
              partySize: parseInt(formData.partySize),
              phoneNumber: formData.phoneNumber,
              notes: formData.notes,
              timeRemaining: parseInt(formData.duration),
            };
          case 'reserve':
            return {
              ...table,
              status: 'reserved',
              customer: formData.customerName,
              partySize: parseInt(formData.partySize),
              phoneNumber: formData.phoneNumber,
              notes: formData.notes,
              reservationTime: formData.reservationTime,
            };
          case 'clear':
            return {
              ...table,
              status: 'cleaning',
              customer: null,
              partySize: null,
              phoneNumber: null,
              notes: null,
              timeRemaining: null,
              reservationTime: null,
            };
          case 'finish-cleaning':
            return {
              ...table,
              status: 'available',
            };
          default:
            return table;
        }
      }
      return table;
    });
    
    setTables(updatedTables);
    setSelectedTable(null);
    setActionType(null);
    
    // Show success toast
    switch (actionType) {
      case 'seat':
        toast.success(`Table ${selectedTable.number} has been seated with ${formData.customerName}`);
        break;
      case 'reserve':
        toast.success(`Table ${selectedTable.number} has been reserved for ${formData.customerName} at ${formData.reservationTime}`);
        break;
      case 'clear':
        toast.info(`Table ${selectedTable.number} has been marked for cleaning`);
        break;
      case 'finish-cleaning':
        toast.success(`Table ${selectedTable.number} is now available`);
        break;
      default:
        break;
    }
  };

  // Function to remove party from waitlist
  const handleRemoveFromWaitlist = (id) => {
    const partyToRemove = waitlist.find(party => party.id === id);
    setWaitlist(waitlist.filter(party => party.id !== id));
    toast.success(`${partyToRemove.name} removed from waitlist`);
  };

  // Function to seat party from waitlist
  const handleSeatFromWaitlist = (party) => {
    // Find suitable available table
    const suitableTable = tables.find(table => 
      table.status === 'available' && table.capacity >= party.size
    );
    
    if (suitableTable) {
      // Update table status
      const updatedTables = tables.map(table => {
        if (table.id === suitableTable.id) {
          return {
            ...table,
            status: 'occupied',
            customer: party.name,
            partySize: party.size,
            phoneNumber: party.phoneNumber,
            notes: party.notes || '',
            timeRemaining: 60,
          };
        }
        return table;
      });
      
      // Remove from waitlist
      setWaitlist(waitlist.filter(p => p.id !== party.id));
      
      // Update tables
      setTables(updatedTables);
      
      // Show success toast
      toast.success(`${party.name} seated at Table ${suitableTable.number}`);
    } else {
      toast.error('No suitable table available for this party');
    }
  };

  // Filtered tables based on selected filter
  const filteredTables = filter === 'all' 
    ? tables 
    : tables.filter(table => table.status === filter);

  // Set up a timer to update the time remaining for occupied tables
  useEffect(() => {
    const timer = setInterval(() => {
      setTables(prevTables => 
        prevTables.map(table => {
          if (table.status === 'occupied' && table.timeRemaining) {
            const newTimeRemaining = table.timeRemaining - 1;
            
            // If time is up, don't automatically change status, just show 0
            if (newTimeRemaining <= 0) {
              return {
                ...table,
                timeRemaining: 0
              };
            }
            
            return {
              ...table,
              timeRemaining: newTimeRemaining
            };
          }
          return table;
        })
      );
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // Get status color based on table status
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-blue-500';
      case 'cleaning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get the action buttons based on table status
  const getActionButtons = (table) => {
    switch (table.status) {
      case 'available':
        return (
          <>
            <button
              onClick={() => handleActionSelect('seat')}
              className="flex items-center px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50"
            >
              <UsersIcon className="w-4 h-4 mr-2" />
              Seat Guests
            </button>
            <button
              onClick={() => handleActionSelect('reserve')}
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50"
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              Make Reservation
            </button>
          </>
        );
      case 'occupied':
        return (
          <button
            onClick={() => handleActionSelect('clear')}
            className="flex items-center px-3 py-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            Clear Table
          </button>
        );
      case 'reserved':
        return (
          <>
            <button
              onClick={() => handleActionSelect('seat')}
              className="flex items-center px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50"
            >
              <UsersIcon className="w-4 h-4 mr-2" />
              Seat Now
            </button>
            <button
              onClick={() => handleActionSelect('clear')}
              className="flex items-center px-3 py-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50"
            >
              <XIcon className="w-4 h-4 mr-2" />
              Cancel Reservation
            </button>
          </>
        );
      case 'cleaning':
        return (
          <button
            onClick={() => handleActionSelect('finish-cleaning')}
            className="flex items-center px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            Mark as Clean
          </button>
        );
      default:
        return null;
    }
  };

  // Get form content based on action type
  const getFormContent = () => {
    switch (actionType) {
      case 'seat':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="customerName" className="label">Customer Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="partySize" className="label">Party Size *</label>
              <input
                type="number"
                id="partySize"
                name="partySize"
                value={formData.partySize}
                onChange={handleInputChange}
                className="input"
                min="1"
                max={selectedTable ? selectedTable.capacity : 10}
                required
              />
              {selectedTable && (
                <p className="text-xs text-surface-500 mt-1">
                  Table capacity: {selectedTable.capacity}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="label">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="duration" className="label">Estimated Duration (minutes)</label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="select"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="label">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input"
                rows="3"
                placeholder="Any special requests or notes"
              ></textarea>
            </div>
          </>
        );
      case 'reserve':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="customerName" className="label">Customer Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="partySize" className="label">Party Size *</label>
              <input
                type="number"
                id="partySize"
                name="partySize"
                value={formData.partySize}
                onChange={handleInputChange}
                className="input"
                min="1"
                max={selectedTable ? selectedTable.capacity : 10}
                required
              />
              {selectedTable && (
                <p className="text-xs text-surface-500 mt-1">
                  Table capacity: {selectedTable.capacity}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="reservationTime" className="label">Reservation Time *</label>
              <input
                type="time"
                id="reservationTime"
                name="reservationTime"
                value={formData.reservationTime}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="label">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="label">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input"
                rows="3"
                placeholder="Any special requests or notes"
              ></textarea>
            </div>
          </>
        );
      case 'clear':
        return (
          <div className="py-4 text-center">
            <p className="mb-4">Are you sure you want to clear this table?</p>
            {selectedTable && selectedTable.customer && (
              <p className="font-medium mb-2">{selectedTable.customer}</p>
            )}
            {selectedTable && selectedTable.status === 'occupied' && (
              <div className="flex justify-center items-center text-sm text-surface-600 dark:text-surface-400 mb-4">
                <TimerIcon className="w-4 h-4 mr-1" />
                <span>{selectedTable.timeRemaining || 0} minutes</span>
              </div>
            )}
          </div>
        );
      case 'finish-cleaning':
        return (
          <div className="py-4 text-center">
            <p className="mb-4">Mark this table as clean and available?</p>
            <p className="font-medium">Table {selectedTable ? selectedTable.number : ''}</p>
          </div>
        );
      default:
        return (
          <div className="py-4">
            <p className="text-center mb-4">Select an action for this table</p>
            <div className="flex flex-col space-y-2">
              {selectedTable && getActionButtons(selectedTable)}
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Table Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Table Layout Section */}
        <div className="md:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Restaurant Floor Plan</h3>
            
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm rounded-md border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 py-1 px-3"
              >
                <option value="all">All Tables</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
          </div>
          
          {/* Table status legend */}
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>Reserved</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span>Cleaning</span>
            </div>
          </div>
          
          {/* Table grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTables.map(table => (
              <motion.div
                key={table.id}
                className={`relative p-4 rounded-lg border ${
                  selectedTable && selectedTable.id === table.id
                    ? 'border-primary dark:border-primary-light'
                    : 'border-surface-200 dark:border-surface-700'
                } ${
                  table.status === 'available'
                    ? 'bg-white dark:bg-surface-800'
                    : 'bg-surface-50 dark:bg-surface-700'
                } cursor-pointer transition-all duration-150`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTableSelect(table)}
              >
                <div className="absolute top-2 right-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`}></div>
                </div>
                
                <div className="flex flex-col items-center">
                  {table.shape === 'circle' ? (
                    <div className="w-12 h-12 rounded-full border-2 border-surface-300 dark:border-surface-600 flex items-center justify-center mb-2">
                      <span className="font-medium">{table.number}</span>
                    </div>
                  ) : (
                    <div className="w-12 h-12 border-2 border-surface-300 dark:border-surface-600 flex items-center justify-center mb-2">
                      <span className="font-medium">{table.number}</span>
                    </div>
                  )}
                  
                  <div className="text-sm font-medium mb-1">Table {table.number}</div>
                  
                  <div className="flex items-center text-xs text-surface-600 dark:text-surface-400 mb-2">
                    <UsersIcon className="w-3 h-3 mr-1" />
                    <span>{table.capacity}</span>
                  </div>
                  
                  <div className="text-xs font-medium">{getStatusText(table.status)}</div>
                  
                  {table.status === 'occupied' && table.timeRemaining !== undefined && (
                    <div className={`flex items-center mt-1 text-xs ${
                      table.timeRemaining <= 15 ? 'text-red-500 dark:text-red-400' : 'text-surface-600 dark:text-surface-400'
                    }`}>
                      <TimerIcon className="w-3 h-3 mr-1" />
                      <span>{table.timeRemaining} min</span>
                    </div>
                  )}
                  
                  {table.status === 'reserved' && table.reservationTime && (
                    <div className="flex items-center mt-1 text-xs text-blue-600 dark:text-blue-400">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      <span>{table.reservationTime}</span>
                    </div>
                  )}
                  
                  {(table.status === 'occupied' || table.status === 'reserved') && table.customer && (
                    <div className="mt-2 text-xs truncate max-w-full text-center">
                      {table.customer}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Right side panel (Table Details and Waitlist) */}
        <div className="flex flex-col space-y-6">
          {/* Table Details Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedTable 
                ? `Table ${selectedTable.number} Details` 
                : 'Select a Table'}
            </h3>
            
            {selectedTable ? (
              <div>
                {/* Table info */}
                <div className="mb-4 p-3 bg-surface-100 dark:bg-surface-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(selectedTable.status)} mr-2`}></div>
                      <span className="font-medium">{getStatusText(selectedTable.status)}</span>
                    </div>
                    <div className="flex items-center text-sm text-surface-600 dark:text-surface-400">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      <span>Capacity: {selectedTable.capacity}</span>
                    </div>
                  </div>
                  
                  {selectedTable.status === 'occupied' && selectedTable.customer && (
                    <>
                      <div className="mb-1 font-medium">{selectedTable.customer}</div>
                      <div className="flex items-center text-sm text-surface-600 dark:text-surface-400 mb-1">
                        <TimerIcon className="w-4 h-4 mr-1" />
                        <span>Time remaining: {selectedTable.timeRemaining || 0} min</span>
                      </div>
                      {selectedTable.phoneNumber && (
                        <div className="flex items-center text-sm text-surface-600 dark:text-surface-400">
                          <PhoneIcon className="w-4 h-4 mr-1" />
                          <span>{selectedTable.phoneNumber}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {selectedTable.status === 'reserved' && selectedTable.reservationTime && (
                    <>
                      <div className="mb-1 font-medium">{selectedTable.customer}</div>
                      <div className="flex items-center text-sm text-surface-600 dark:text-surface-400 mb-1">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>Reserved for: {selectedTable.reservationTime}</span>
                      </div>
                      {selectedTable.phoneNumber && (
                        <div className="flex items-center text-sm text-surface-600 dark:text-surface-400">
                          <PhoneIcon className="w-4 h-4 mr-1" />
                          <span>{selectedTable.phoneNumber}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {selectedTable.status === 'cleaning' && (
                    <div className="flex items-center text-sm text-surface-600 dark:text-surface-400">
                      <CleaningIcon className="w-4 h-4 mr-1" />
                      <span>Table needs cleaning</span>
                    </div>
                  )}
                </div>
                
                {/* Table action form */}
                <div className="border border-surface-200 dark:border-surface-700 rounded-lg p-4">
                  <h4 className="font-medium mb-3">
                    {actionType 
                      ? actionType === 'seat' 
                        ? 'Seat Guests' 
                        : actionType === 'reserve' 
                          ? 'Make Reservation' 
                          : actionType === 'clear' 
                            ? 'Clear Table' 
                            : actionType === 'finish-cleaning' 
                              ? 'Finish Cleaning' 
                              : 'Actions'
                      : 'Choose Action'}
                  </h4>
                  
                  <form onSubmit={handleSubmit}>
                    {getFormContent()}
                    
                    {actionType && (
                      <div className="flex justify-end mt-4 space-x-2">
                        <button
                          type="button"
                          onClick={() => setActionType(null)}
                          className="btn btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`btn ${
                            actionType === 'clear' 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'btn-primary'
                          }`}
                        >
                          {actionType === 'seat' ? 'Seat Guests' : 
                            actionType === 'reserve' ? 'Make Reservation' : 
                            actionType === 'clear' ? 'Clear Table' : 
                            actionType === 'finish-cleaning' ? 'Mark Available' : 'Confirm'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                <SearchIcon className="w-8 h-8 mx-auto mb-2" />
                <p>Select a table to view details and take actions</p>
              </div>
            )}
          </div>
          
          {/* Waitlist Card */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Waitlist</h3>
              <button 
                onClick={() => setIsAddingToWaitlist(true)}
                className="flex items-center text-sm px-2 py-1 rounded-md bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary/30"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            
            <AnimatePresence>
              {isAddingToWaitlist && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <form onSubmit={handleAddToWaitlist} className="border border-surface-200 dark:border-surface-700 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Add to Waitlist</h4>
                    
                    <div className="mb-3">
                      <label htmlFor="name" className="label">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={waitlistFormData.name}
                        onChange={handleWaitlistInputChange}
                        className="input"
                        placeholder="Enter party name"
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="size" className="label">Party Size *</label>
                      <input
                        type="number"
                        id="size"
                        name="size"
                        value={waitlistFormData.size}
                        onChange={handleWaitlistInputChange}
                        className="input"
                        min="1"
                        placeholder="Number of guests"
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="phoneNumber" className="label">Phone Number *</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={waitlistFormData.phoneNumber}
                        onChange={handleWaitlistInputChange}
                        className="input"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="notes" className="label">Notes</label>
                      <input
                        type="text"
                        id="notes"
                        name="notes"
                        value={waitlistFormData.notes}
                        onChange={handleWaitlistInputChange}
                        className="input"
                        placeholder="Special requests or notes"
                      />
                    </div>
                    
                    <div className="flex justify-end mt-3 space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingToWaitlist(false)}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Add to Waitlist
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            
            {waitlist.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {waitlist.map((party) => (
                  <motion.div
                    key={party.id}
                    className="border border-surface-200 dark:border-surface-700 rounded-lg p-3 flex justify-between items-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <div className="font-medium mb-1">{party.name}</div>
                      <div className="flex items-center text-sm text-surface-600 dark:text-surface-400 mb-1">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        <span>Party of {party.size}</span>
                      </div>
                      <div className="flex items-center text-sm text-surface-600 dark:text-surface-400 mb-1">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        <span>Wait: ~{party.waitTime} min</span>
                      </div>
                      <div className="flex items-center text-xs text-surface-600 dark:text-surface-400">
                        <PhoneIcon className="w-3 h-3 mr-1" />
                        <span>{party.phoneNumber}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleSeatFromWaitlist(party)}
                        className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                      >
                        Seat
                      </button>
                      <button 
                        onClick={() => handleRemoveFromWaitlist(party.id)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-surface-500 dark:text-surface-400">
                <p>No parties waiting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainFeature;