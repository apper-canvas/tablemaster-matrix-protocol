import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO, addMinutes } from 'date-fns';
import { HexColorPicker } from 'react-colorful';
import { getIcon } from '../utils/iconUtils';
import { fetchTables, createTable, updateTable, deleteTable } from '../services/tableService';
import { fetchTableSections } from '../services/tableService';
import { fetchReservations, createReservation, updateReservation, cancelReservation } from '../services/reservationService';
import { fetchWaitlist, addToWaitlist, updateWaitlistEntry } from '../services/waitlistService';
import TableFloorPlan from '../components/TableFloorPlan';
import {
  setTableStatus,
  notifyCustomer, removeFromWaitlist
} from '../redux/slices/tablesSlice';

// Tab component for navigation
const Tab = ({ active, children, onClick }) => (
  <button
    className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
      active
        ? 'border-primary text-primary dark:text-primary-light'
        : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

// Modal background component
const ModalOverlay = ({ isOpen, onClose, children }) => {
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackgroundClick}
        >
          <motion.div
            className="w-full max-w-xl bg-white dark:bg-surface-800 rounded-xl shadow-lg relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="mb-6 text-surface-600 dark:text-surface-300">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className="btn btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

// Table Edit Form
const TableForm = ({ isOpen, onClose, initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    number: '',
    capacity: 2,
    shape: 'rectangle',
    width: 80,
    height: 60,
    section: 'main',
    ...initialData
  });
  
  const sections = useSelector(state => state.tables.sections);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        number: '',
        capacity: 2,
        shape: 'rectangle',
        width: 80,
        height: 60,
        section: 'main',
        ...initialData
      });
    }
  }, [initialData, isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'width' || name === 'height' 
        ? parseInt(value, 10) 
        : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };
  
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          {initialData?.id ? 'Edit Table' : 'Add New Table'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="number">Table Number</label>
              <input
                type="number"
                id="number"
                name="number"
                className="input"
                value={formData.number}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
            
            <div>
              <label className="label" htmlFor="capacity">Seating Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                className="input"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                max="20"
              />
            </div>
            
            <div>
              <label className="label" htmlFor="shape">Table Shape</label>
              <select
                id="shape"
                name="shape"
                className="select"
                value={formData.shape}
                onChange={handleChange}
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="width">Width (px)</label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  className="input"
                  value={formData.width}
                  onChange={handleChange}
                  required
                  min="40"
                  max="200"
                />
              </div>
              <div>
                <label className="label" htmlFor="height">Height (px)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  className="input"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  min="40"
                  max="200"
                />
              </div>
            </div>
            
            <div>
              <label className="label" htmlFor="section">Section</label>
              <select
                id="section"
                name="section"
                className="select"
                value={formData.section}
                onChange={handleChange}
              >
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {initialData?.id ? 'Update Table' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

// Reservation Form
const ReservationForm = ({ isOpen, onClose, initialData, onSubmit, tables }) => {
  const [formData, setFormData] = useState({
    tableId: '',
    customerName: '',
    phoneNumber: '',
    partySize: 2,
    reservationTime: format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm"),
    duration: 90,
    notes: '',
    ...initialData
  });
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        tableId: '',
        customerName: '',
        phoneNumber: '',
        partySize: 2,
        reservationTime: format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm"),
        duration: 90,
        notes: '',
        ...initialData
      });
    }
  }, [initialData, isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'partySize' || name === 'duration' 
        ? parseInt(value, 10) 
        : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };
  
  // Filter tables that can accommodate the party size
  const availableTables = tables.filter(table => table.capacity >= formData.partySize);
  
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          {initialData?.id ? 'Edit Reservation' : 'New Reservation'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="customerName">Customer Name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                className="input"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="label" htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className="input"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="label" htmlFor="partySize">Party Size</label>
              <input
                type="number"
                id="partySize"
                name="partySize"
                className="input"
                value={formData.partySize}
                onChange={handleChange}
                required
                min="1"
                max="20"
              />
            </div>
            
            <div>
              <label className="label" htmlFor="tableId">Table</label>
              <select
                id="tableId"
                name="tableId"
                className="select"
                value={formData.tableId}
                onChange={handleChange}
                required
              >
                <option value="">Select a table</option>
                {availableTables.map(table => (
                  <option key={table.id} value={table.id}>
                    Table {table.number} ({table.capacity} seats) - {table.status}
                  </option>
                ))}
              </select>
              {formData.partySize > 1 && availableTables.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  No tables available for this party size
                </p>
              )}
            </div>
            
            <div>
              <label className="label" htmlFor="reservationTime">Reservation Time</label>
              <input
                type="datetime-local"
                id="reservationTime"
                name="reservationTime"
                className="input"
                value={formData.reservationTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="label" htmlFor="duration">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                className="input"
                value={formData.duration}
                onChange={handleChange}
                required
                min="30"
                step="15"
              />
            </div>
            
            <div>
              <label className="label" htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                className="input h-24"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {initialData?.id ? 'Update Reservation' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

// Waitlist Form
const WaitlistForm = ({ isOpen, onClose, initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    partySize: 2,
    notes: '',
    ...initialData
  });
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        customerName: '',
        phoneNumber: '',
        partySize: 2,
        notes: '',
        ...initialData
      });
    }
  }, [initialData, isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'partySize' ? parseInt(value, 10) : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };
  
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          {initialData?.id ? 'Edit Waitlist Entry' : 'Add to Waitlist'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="wl-customerName">Customer Name</label>
              <input
                type="text"
                id="wl-customerName"
                name="customerName"
                className="input"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="label" htmlFor="wl-phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="wl-phoneNumber"
                name="phoneNumber"
                className="input"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="label" htmlFor="wl-partySize">Party Size</label>
              <input
                type="number"
                id="wl-partySize"
                name="partySize"
                className="input"
                value={formData.partySize}
                onChange={handleChange}
                required
                min="1"
                max="20"
              />
            </div>
            
            <div>
              <label className="label" htmlFor="wl-notes">Notes</label>
              <textarea
                id="wl-notes"
                name="notes"
                className="input h-24"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {initialData?.id ? 'Update Entry' : 'Add to Waitlist'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

// Main Tables component
const Tables = () => {
  const dispatch = useDispatch();
  const tablesFromStore = useSelector(state => state.tables.tables);
  const sections = useSelector(state => state.tables.sections);
  const reservationsFromStore = useSelector(state => state.tables.reservations);
  
  // New state for data from API
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const waitlist = useSelector(state => state.tables.waitlist);
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTab, setActiveTab] = useState('tables-list');
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalState, setModalState] = useState({
    tableForm: false,
    reservationForm: false,
    waitlistForm: false,
    confirmationModal: false
  });
  const [currentAction, setCurrentAction] = useState(null);
  const [formInitialData, setFormInitialData] = useState(null);
  
  // Get available tables (for reservations)
  const availableTables = tables.filter(table => 
    table.status === 'available' || (formInitialData && table.id === formInitialData.id)
  );
  
  // Get active reservations and waitlist
  const activeReservations = reservations.filter(res => res.status !== 'cancelled');
  const activeWaitlist = waitlist.filter(entry => entry.status === 'waiting');
  
  // Icon components
  const PlusIcon = getIcon('plus');
  const EditIcon = getIcon('edit');
  const TrashIcon = getIcon('trash');
  const RefreshIcon = getIcon('refresh-cw');
  const CheckIcon = getIcon('check');
  const XIcon = getIcon('x');
  const PhoneIcon = getIcon('phone');
  const MoveIcon = getIcon('move');
  const BookmarkIcon = getIcon('bookmark');
  const ListIcon = getIcon('list');
  const CalendarIcon = getIcon('calendar');
  const UsersIcon = getIcon('users');
  
  // Format time
  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch tables and sections from API
        const [tablesData, sectionsData, reservationsData, waitlistData] = await Promise.all([
          fetchTables(),
          fetchTableSections(),
          fetchReservations(),
          fetchWaitlist()
        ]);
        
        setTables(tablesData.map(table => ({
          ...table,
          id: table.Id
        })));
        
        setReservations(reservationsData.map(reservation => ({
          ...reservation,
          id: reservation.Id
        })));
        
        // Update Redux store if needed for compatibility with existing code
        // This would ideally be refactored to use only the API data
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data. Please try again.");
      }
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return format(parseISO(timeString), 'h:mm a - MMM d');
    } catch (error) {
      return timeString;
    }
  };
  
  // Handle form submissions
  const handleTableFormSubmit = (data) => {
    if (data.Id || data.id) {
      const tableId = data.Id || data.id;
      updateTable({ ...data, Id: tableId });
      toast.success(`Table ${data.number} updated successfully`);
    } else { 
      // Set default position if this is a new table
      const newData = {
        ...data,
        x: 50,
        y: 50
      };
      dispatch(addTable(newData));
      toast.success(`Table ${data.number} created successfully`);
    }
  };
  
  const handleReservationFormSubmit = (data) => {
    if (data.Id || data.id) {
      updateReservation({ ...data, Id: data.Id || data.id });
      toast.success(`Reservation for ${data.customerName} updated`);
    } else {
      createReservation(data);
      toast.success(`Reservation for ${data.customerName} created`);
    }
  };
  
   const handleWaitlistFormSubmit = (data) => {
    if (data.id) {
      dispatch(updateWaitlistEntry(data));
      toast.success(`Waitlist entry for ${data.customerName} updated`);
    } else {
      dispatch(addToWaitlist(data));
      toast.success(`${data.customerName} added to waitlist`);
    }
  };
  
  // Handle table status changes
  const handleStatusChange = (tableId, newStatus, additionalData = {}) => {
    dispatch(setTableStatus({ id: tableId, status: newStatus, ...additionalData }));
    toast.info(`Table status changed to ${newStatus}`);
    setSelectedTable(tables.find(t => t.id === tableId));
  };
  
  // Handle confirmation actions
  const handleConfirmAction = () => {
    if (!currentAction) return;
    
    switch (currentAction.type) {
      case 'delete-table':
        deleteTable(currentAction.id);
        setSelectedTable(null);
        toast.success('Table deleted successfully');
        break;
      case 'cancel-reservation':
        dispatch(cancelReservation({ id: currentAction.id, reason: 'Customer cancelled' }));
        toast.info('Reservation cancelled');
        break;
      case 'remove-waitlist':
        dispatch(removeFromWaitlist({ id: currentAction.id, reason: 'cancelled' }));
        toast.info('Customer removed from waitlist');
        break;
      case 'seat-waitlist':
        dispatch(removeFromWaitlist({ id: currentAction.id, reason: 'seated' }));
        toast.success('Customer seated');
        break;
      default:
        break;
    }
  };
  
  // Open table form
  const openTableForm = (table = null) => {
    setFormInitialData(table);
    setModalState({...modalState, tableForm: true});
  };
  
  // Open reservation form
  const openReservationForm = (reservation = null) => {
    setFormInitialData(reservation);
    setModalState({...modalState, reservationForm: true});
  };
  
  // Open waitlist form
  const openWaitlistForm = (entry = null) => {
    setFormInitialData(entry);
    setModalState({...modalState, waitlistForm: true});
  };
  
  // Open confirmation modal
  const openConfirmationModal = (action) => {
    setCurrentAction(action);
    setModalState({...modalState, confirmationModal: true});
  };
  
  // Close all modals
  const closeModals = () => {
    setModalState({
      tableForm: false,
      reservationForm: false,
      waitlistForm: false,
      confirmationModal: false
    });
    setFormInitialData(null);
  };
  
  return (
    <div className="app-container py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Table Management</h1>
          {loading ? (
            <p className="text-surface-600 dark:text-surface-400">
              Loading table data...
            </p>
          ) : (
            <p className="text-surface-600 dark:text-surface-400">
              Manage restaurant tables, reservations, and waitlist
            </p>
          )}
        </div>
        
        {/* Tab navigation */}
        <div className="border-b border-surface-200 dark:border-surface-700">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            <Tab
              active={activeTab === 'tables-list'}
              onClick={() => setActiveTab('tables-list')}
            >
              <div className="flex items-center">
                <ListIcon className="w-4 h-4 mr-2" />
                Table List
              </div>
            </Tab>
            <Tab
              active={activeTab === 'reservations'}
              onClick={() => setActiveTab('reservations')}
            >
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Reservations
              </div>
            </Tab>
            <Tab
              active={activeTab === 'waitlist'}
              onClick={() => setActiveTab('waitlist')}
            >
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-2" />
                Waitlist
              </div>
            </Tab>
          </div>
        </div>
        
        {/* Tab content */}
        <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card border border-surface-200 dark:border-surface-700 overflow-hidden">
          {/* Table List Tab */}
          {activeTab === 'tables-list' && (
            <div className="p-6">
              {!loading && (
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => openTableForm()}
                  className="btn btn-primary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Table
                </button>
              </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-100 dark:bg-surface-700">
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Table</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Capacity</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Section</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Details</th>
                      <th className="px-4 py-3 text-right font-medium text-surface-600 dark:text-surface-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-3 text-center">
                          Loading tables...
                        </td>
                      </tr>
                    ) : (
                      tables.map(table => (
                        <tr key={table.id} className="hover:bg-surface-50 dark:hover:bg-surface-750">
                        <td className="px-4 py-3 font-medium">{table.number}</td>
                        <td className="px-4 py-3">{table.capacity} seats</td>
                        <td className="px-4 py-3">{sections.find(s => s.id === table.section)?.name || table.section}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            table.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            table.status === 'occupied' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            table.status === 'reserved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {table.status === 'occupied' && table.customer}
                          {table.status === 'reserved' && table.customerName}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedTable(table)}
                            className="text-primary hover:text-primary-dark font-medium mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openTableForm(table)}
                            className="text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openConfirmationModal({
                              type: 'delete-table',
                              id: table.id
                            })}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div className="p-6">
              {!loading && (
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => openReservationForm()}
                  className="btn btn-primary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Reservation
                </button>
              </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-100 dark:bg-surface-700">
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Customer</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Table</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Party Size</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Date & Time</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-surface-600 dark:text-surface-300">Actions</th>
                    </tr>
                  </thead>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-3 text-center">
                          Loading reservations...
                        </td>
                      </tr>
                    ) : (
                  <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                    {activeReservations.map(reservation => {
                      const table = tables.find(t => t.id === reservation.tableId);
                      return (
                        <tr key={reservation.id} className="hover:bg-surface-50 dark:hover:bg-surface-750">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{reservation.customerName}</div>
                              <div className="text-xs text-surface-500 dark:text-surface-400">{reservation.phoneNumber}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {table ? `Table ${table.number}` : 'Unknown Table'}
                          </td>
                          <td className="px-4 py-3">{reservation.partySize} people</td>
                          <td className="px-4 py-3">{formatTime(reservation.reservationTime)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              reservation.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              reservation.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openReservationForm(reservation)}
                              className="text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openConfirmationModal({
                                type: 'cancel-reservation',
                                id: reservation.id
                              })}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                    )}
                </table>
                
                {activeReservations.length === 0 && (
                  <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Active Reservations</h3>
                    <button
                      onClick={() => openReservationForm()}
                      className="btn btn-outline mt-4"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create a Reservation
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Waitlist Tab */}
          {activeTab === 'waitlist' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => openWaitlistForm()}
                  className="btn btn-primary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add to Waitlist
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-100 dark:bg-surface-700">
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Customer</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Party Size</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Time Added</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Est. Wait Time</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-300">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-surface-600 dark:text-surface-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                    {activeWaitlist.map(entry => (
                      <tr key={entry.id} className="hover:bg-surface-50 dark:hover:bg-surface-750">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{entry.customerName}</div>
                            <div className="text-xs text-surface-500 dark:text-surface-400">{entry.phoneNumber}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{entry.partySize} people</td>
                        <td className="px-4 py-3">{formatTime(entry.timeAdded)}</td>
                        <td className="px-4 py-3">{entry.estimatedWaitTime} min</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.notified ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {entry.notified ? 'Notified' : 'Waiting'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!entry.notified && (
                            <button
                              onClick={() => dispatch(notifyCustomer({ id: entry.id })) || toast.success(`${entry.customerName} has been notified`)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                              title="Mark as notified"
                            >
                              <PhoneIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openConfirmationModal({
                              type: 'seat-waitlist',
                              id: entry.id
                            })}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-3"
                            title="Seat customer"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openWaitlistForm(entry)}
                            className="text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200 mr-3"
                            title="Edit entry"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openConfirmationModal({
                              type: 'remove-waitlist',
                              id: entry.id
                            })}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove from waitlist"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {activeWaitlist.length === 0 && (
                  <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                    <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Waitlist is Empty</h3>
                    <button
                      onClick={() => openWaitlistForm()}
                      className="btn btn-outline mt-4"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add a Customer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
      )}
        </div>
      </div>
      
      {/* Modals */}
      <TableForm
        isOpen={modalState.tableForm}
        onClose={closeModals}
        initialData={formInitialData}
        onSubmit={handleTableFormSubmit}
      />
      
      <ReservationForm
        isOpen={modalState.reservationForm}
        onClose={closeModals}
        initialData={formInitialData}
        onSubmit={handleReservationFormSubmit}
        tables={availableTables}
      />
      
      <WaitlistForm
        isOpen={modalState.waitlistForm}
        onClose={closeModals}
        initialData={formInitialData}
        onSubmit={handleWaitlistFormSubmit}
      />
      
      <ConfirmationModal
        isOpen={modalState.confirmationModal}
        onClose={closeModals}
        onConfirm={handleConfirmAction}
        title={
          currentAction?.type === 'delete-table' ? 'Confirm Table Deletion' :
          currentAction?.type === 'cancel-reservation' ? 'Confirm Reservation Cancellation' :
          currentAction?.type === 'remove-waitlist' ? 'Confirm Removal from Waitlist' :
          currentAction?.type === 'seat-waitlist' ? 'Confirm Seating Customer' :
          'Confirm Action'
        }
        message={
          currentAction?.type === 'delete-table' ? 'Are you sure you want to delete this table? This action cannot be undone.' :
          currentAction?.type === 'cancel-reservation' ? 'Are you sure you want to cancel this reservation? The customer will need to make a new reservation if they want to dine later.' :
          currentAction?.type === 'remove-waitlist' ? 'Are you sure you want to remove this customer from the waitlist?' :
          currentAction?.type === 'seat-waitlist' ? 'Confirm that this customer is being seated. They will be removed from the waitlist.' :
          'Are you sure you want to proceed with this action?'
        }
      />
    </div>
  );
};

export default Tables;