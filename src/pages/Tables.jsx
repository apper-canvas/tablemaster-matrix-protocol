import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import { format, parseISO, addDays, isBefore, isAfter, formatDistanceToNow } from 'date-fns';
import { getIcon } from '../utils/iconUtils';
import TableFloorPlan from '../components/TableFloorPlan';
import {
  updateTable, setTableStatus, addTable, deleteTable, addReservation, updateReservation, cancelReservation, addToWaitlist, updateWaitlistEntry, notifyCustomer, removeFromWaitlist
} from '../redux/slices/tablesSlice';

const Tables = () => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const sections = useSelector((state) => state.tables.sections);
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [activeTab, setActiveTab] = useState('floorplan');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableForm, setNewTableForm] = useState({
    number: '',
    capacity: 2,
    shape: 'circle',
    section: 'main',
    x: 100,
    y: 100,
    width: 60,
    height: 60
  });
  
  const [tableAction, setTableAction] = useState(null);
  const [actionForm, setActionForm] = useState({
    customerName: '',
    phoneNumber: '',
    partySize: '',
    reservationTime: '',
    estimatedDuration: 60,
    notes: '',
    server: '',
  });

  // Reservation state
  const reservations = useSelector((state) => state.tables.reservations);
  const [isAddingReservation, setIsAddingReservation] = useState(false);
  const [isEditingReservation, setIsEditingReservation] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reservationFilter, setReservationFilter] = useState('upcoming');
  
  // Waitlist state
  const waitlist = useSelector((state) => state.tables.waitlist);
  const [waitlistFilter, setWaitlistFilter] = useState('waiting');
  // Icons
  const EditIcon = getIcon('edit');
  const SaveIcon = getIcon('save');
  const PlusIcon = getIcon('plus');
  const TrashIcon = getIcon('trash');
  const UsersIcon = getIcon('users');
  const ClockIcon = getIcon('clock');
  const SquareIcon = getIcon('square');
  const CircleIcon = getIcon('circle');
  const CheckIcon = getIcon('check');
  const XIcon = getIcon('x');
  const PhoneIcon = getIcon('phone');
  const UserIcon = getIcon('user');
  const CalendarIcon = getIcon('calendar');
  const SearchIcon = getIcon('search');
  const FilterIcon = getIcon('filter');
  const AlertCircleIcon = getIcon('alert-circle');
  const BellIcon = getIcon('bell');
  const BellOffIcon = getIcon('bell-off');
  const ClipboardIcon = getIcon('clipboard');
  const SendIcon = getIcon('send');
  const TimerIcon = getIcon('timer');
  const UserXIcon = getIcon('user-x');

  // Handle selecting a table
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setTableAction(null);  
    
    // Pre-fill form data based on table status
    if (table.status === 'occupied') {
      setActionForm({
        customerName: table.customer || '',
        phoneNumber: table.phoneNumber || '',
        partySize: table.capacity || 2,
        server: table.server || '',
        estimatedDuration: 60,
        notes: table.notes || ''
      });
    } else if (table.status === 'reserved') {
      setActionForm({
        customerName: table.customerName || '',
        phoneNumber: table.phoneNumber || '',
        partySize: table.capacity || 2,
        reservationTime: table.reservationTime ? new Date(table.reservationTime).toISOString().slice(0, 16) : '',
        estimatedDuration: 60,
        notes: table.notes || ''
      });
    } else {
      // Reset form for other statuses
      setActionForm({
        customerName: '',
        phoneNumber: '',
        partySize: table.capacity || 2,
        reservationTime: '',
        estimatedDuration: 60,
        server: '',
        notes: ''
      });
    }
  };

  const handleAddNewReservation = () => {
    // Reset the form data and show the form
    setSelectedReservation(null);
    // Find the first available table as default
    const availableTable = tables.find(table => table.status === 'available');
    
    setActionForm({
      customerName: '',
      phoneNumber: '',
      partySize: availableTable ? availableTable.capacity : 2,
      reservationTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(0, 16), // 1 hour from now
      estimatedDuration: 60,
      notes: '',
      tableId: availableTable ? availableTable.id : ''
    });
    
    setIsAddingReservation(true);
  };

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation);
    setActionForm({
      customerName: reservation.customerName,
      phoneNumber: reservation.phoneNumber || '',
      partySize: reservation.partySize,
      reservationTime: new Date(reservation.reservationTime).toISOString().slice(0, 16),
      estimatedDuration: reservation.duration || 60,
      notes: reservation.notes || '',
      tableId: reservation.tableId
    });
    setIsEditingReservation(true);
  };

  const handleCancelReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelDialog(true);
  };

  const confirmCancelReservation = (reason = '') => {
    if (!selectedReservation) return;
    
    dispatch(cancelReservation({
      id: selectedReservation.id,
      reason
    }));
    
    toast.success(`Reservation for ${selectedReservation.customerName} has been cancelled`);
    setShowCancelDialog(false);
    setSelectedReservation(null);
  };

  // Handle table action selection
  const handleTableAction = (action) => {
    setTableAction(action);
  };

  // Handle action form input changes
  const handleActionFormChange = (e) => {
    const { name, value } = e.target;
    setActionForm({
      ...actionForm,
      [name]: value
    });
  };

  // Handle new table form changes
  const handleNewTableFormChange = (e) => {
    const { name, value } = e.target;
    setNewTableForm({
      ...newTableForm,
      [name]: name === 'number' || name === 'capacity' || name === 'width' || name === 'height' || name === 'x' || name === 'y' 
        ? parseInt(value, 10) 
        : value
    });
  };

  // Handle adding a new table
  const handleAddTable = () => {
    // Validate form
    if (!newTableForm.number) {
      toast.error('Table number is required');
      return;
    }
    
    if (tables.some(t => parseInt(t.number) === parseInt(newTableForm.number))) {
      toast.error('Table number already exists');
      return;
    }
    
    // Add table
    dispatch(addTable(newTableForm));
    toast.success(`Table ${newTableForm.number} added successfully`);
    
    // Reset form and close
    setNewTableForm({
      number: '',
      capacity: 2,
      shape: 'circle',
      section: 'main',
      x: 100,
      y: 100,
      width: 60,
      height: 60
    });
    setIsAddingTable(false);
  };

  // Handle deleting a table
  const handleDeleteTable = () => {
    if (!selectedTable) return;
    
    dispatch(deleteTable(selectedTable.id));
    toast.success(`Table ${selectedTable.number} deleted`);
    setSelectedTable(null);
  };

  // Handle form submission for table actions
  const handleActionSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedTable) return;
    
    // Validate form based on action
    if ((tableAction === 'seat' || tableAction === 'reserve') && !actionForm.customerName) {
      toast.error('Customer name is required');
      return;
    }
    
    if (tableAction === 'reserve' && !actionForm.reservationTime) {
      toast.error('Reservation time is required');
      return;
    }
    
    // Process different actions
    switch (tableAction) {
      case 'seat':
        const currentTime = new Date().toISOString();
        const estimatedEndTime = new Date(Date.now() + actionForm.estimatedDuration * 60000).toISOString();
        
        dispatch(setTableStatus({
          id: selectedTable.id,
          status: 'occupied',
          customer: actionForm.customerName,
          timeSeated: currentTime,
          estimatedEndTime: estimatedEndTime,
          server: actionForm.server,
          phoneNumber: actionForm.phoneNumber
        }));
        
        toast.success(`Table ${selectedTable.number} seated with ${actionForm.customerName}`);
        break;
        
      case 'reserve':
        dispatch(setTableStatus({
          id: selectedTable.id,
          status: 'reserved',
          customerName: actionForm.customerName,
          phoneNumber: actionForm.phoneNumber,
          reservationTime: actionForm.reservationTime
        }));
        
        toast.success(`Table ${selectedTable.number} reserved for ${actionForm.customerName}`);
        break;
        
      case 'clear':
        dispatch(setTableStatus({
          id: selectedTable.id,
          status: 'cleaning'
        }));
        
        toast.info(`Table ${selectedTable.number} marked for cleaning`);
        break;
        
      case 'finish-cleaning':
        dispatch(setTableStatus({
          id: selectedTable.id,
          status: 'available'
        }));
        
        toast.success(`Table ${selectedTable.number} is now available`);
        break;
        
      default:
        break;
    }
    
    // Reset action after submission
    setTableAction(null);
  };
  
  // Handle reservation form submission
  const handleReservationSubmit = (e) => {
    e.preventDefault();
    
    // Validate the form
    if (!actionForm.customerName) {
      toast.error('Customer name is required');
      return;
    }
    
    if (!actionForm.reservationTime) {
      toast.error('Reservation time is required');
      return;
    }
    
    if (!actionForm.tableId) {
      toast.error('Please select a table');
      return;
    }
    
    const reservationData = {
      tableId: actionForm.tableId,
      customerName: actionForm.customerName,
      phoneNumber: actionForm.phoneNumber,
      partySize: parseInt(actionForm.partySize, 10) || 2,
      reservationTime: actionForm.reservationTime,
      duration: parseInt(actionForm.estimatedDuration, 10) || 60,
      notes: actionForm.notes
    };
    
    if (isEditingReservation && selectedReservation) {
      // Update existing reservation
      dispatch(updateReservation({
        id: selectedReservation.id,
        ...reservationData
      }));
      
      toast.success(`Reservation for ${actionForm.customerName} has been updated`);
      setIsEditingReservation(false);
    } else {
      // Create new reservation
      dispatch(addReservation(reservationData));
      toast.success(`Reservation for ${actionForm.customerName} has been created`);
      setIsAddingReservation(false);
    }
    
    // If the table was selected on the floor plan, update it to show selection
    if (selectedTable && selectedTable.id === actionForm.tableId) {
      // Update the selected table to show the reservation info
      const table = tables.find(t => t.id === actionForm.tableId);
      if (table) {
        handleSelectTable(table);
      }
    }
    
    setSelectedReservation(null);
  };


  // Get available actions based on table status
  const getAvailableActions = (table) => {
    if (!table) return [];
    
    switch (table.status) {
      case 'available':
        return [
          { id: 'seat', label: 'Seat Guests', icon: 'users' },
          { id: 'reserve', label: 'Make Reservation', icon: 'calendar' }
        ];
      case 'occupied':
        return [
          { id: 'clear', label: 'Clear Table', icon: 'check' }
        ];
      case 'reserved':
        return [
          { id: 'seat', label: 'Seat Now', icon: 'users' },
          { id: 'clear', label: 'Cancel Reservation', icon: 'x' }
        ];
      case 'cleaning':
        return [
          { id: 'finish-cleaning', label: 'Mark as Clean', icon: 'check' }
        ];
      default:
        return [];
    }
  };

  // Get form content based on action type
  const getFormContent = () => {
    switch (tableAction) {
      case 'seat':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="customerName" className="label">Customer Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={actionForm.customerName}
                onChange={handleActionFormChange}
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
                value={actionForm.partySize}
                onChange={handleActionFormChange}
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
              <label htmlFor="server" className="label">Server</label>
              <input
                type="text"
                id="server"
                name="server"
                value={actionForm.server}
                onChange={handleActionFormChange}
                className="input"
                placeholder="Enter server name"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="label">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={actionForm.phoneNumber}
                onChange={handleActionFormChange}
                className="input"
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="estimatedDuration" className="label">Estimated Duration (minutes)</label>
              <select
                id="estimatedDuration"
                name="estimatedDuration"
                value={actionForm.estimatedDuration}
                onChange={handleActionFormChange}
                className="select"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
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
                value={actionForm.customerName}
                onChange={handleActionFormChange}
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
                value={actionForm.partySize}
                onChange={handleActionFormChange}
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
                type="datetime-local"
                id="reservationTime"
                name="reservationTime"
                value={actionForm.reservationTime}
                onChange={handleActionFormChange}
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
                value={actionForm.phoneNumber}
                onChange={handleActionFormChange}
                className="input"
                placeholder="Enter phone number"
              />
            </div>
          </>
        );
        
      case 'clear':
      case 'finish-cleaning':
        return (
          <div className="py-4 text-center">
            <p className="mb-4">
              {tableAction === 'clear' 
                ? 'Are you sure you want to clear this table?' 
                : 'Mark this table as clean and available?'}
            </p>
            {selectedTable && selectedTable.customer && tableAction === 'clear' && (
              <p className="font-medium mb-2">{selectedTable.customer}</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  // Filter reservations based on the selected filter
  const filteredReservations = useMemo(() => {
    const now = new Date();
    
    switch (reservationFilter) {
      case 'today':
        return reservations.filter(res => {
          const resDate = new Date(res.reservationTime);
          return resDate.toDateString() === now.toDateString() && res.status === 'confirmed';
        });
      case 'upcoming':
        return reservations.filter(res => {
          const resDate = new Date(res.reservationTime);
          return isAfter(resDate, now) && res.status === 'confirmed';
        });
      case 'past':
        return reservations.filter(res => {
          const resDate = new Date(res.reservationTime);
          return isBefore(resDate, now) && res.status === 'confirmed';
        });
      case 'cancelled':
        return reservations.filter(res => res.status === 'cancelled');
      default:
        return reservations;
    }
  }, [reservations, reservationFilter]);

  // Filter waitlist entries based on status
  const filteredWaitlist = useMemo(() => {
    switch (waitlistFilter) {
      case 'waiting':
        return waitlist.filter(entry => entry.status === 'waiting');
      case 'notified':
        return waitlist.filter(entry => entry.notified && entry.status === 'waiting');
      case 'seated':
        return waitlist.filter(entry => entry.status === 'seated');
      case 'cancelled':
        return waitlist.filter(entry => entry.status === 'cancelled');
      default:
        return waitlist;
    }
  }, [waitlist, waitlistFilter]);

  // Waitlist management
  const [isAddingToWaitlist, setIsAddingToWaitlist] = useState(false);
  const [isEditingWaitlist, setIsEditingWaitlist] = useState(false);
  const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState(null);
  const [waitlistForm, setWaitlistForm] = useState({
    customerName: '',
    phoneNumber: '',
    partySize: 2,
    notes: ''
  });
  const [showRemoveWaitlistDialog, setShowRemoveWaitlistDialog] = useState(false);
  const [removeReason, setRemoveReason] = useState('seated');

  // Handle adding to waitlist
  const handleAddToWaitlist = () => {
    setWaitlistForm({
      customerName: '',
      phoneNumber: '',
      partySize: 2,
      notes: ''
    });
    setIsAddingToWaitlist(true);
  };

  // Handle editing waitlist entry
  const handleEditWaitlist = (entry) => {
    setSelectedWaitlistEntry(entry);
    setWaitlistForm({
      customerName: entry.customerName,
      phoneNumber: entry.phoneNumber,
      partySize: entry.partySize,
      notes: entry.notes || ''
    });
    setIsEditingWaitlist(true);
  };

  // Handle waitlist form change
  const handleWaitlistFormChange = (e) => {
    const { name, value } = e.target;
    setWaitlistForm({
      ...waitlistForm,
      [name]: name === 'partySize' ? parseInt(value, 10) || '' : value
    });
  };

  // Handle waitlist form submission
  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!waitlistForm.customerName) {
      toast.error('Customer name is required');
      return;
    }
    
    if (isEditingWaitlist && selectedWaitlistEntry) {
      // Update existing entry
      dispatch(updateWaitlistEntry({
        id: selectedWaitlistEntry.id,
        ...waitlistForm
      }));
      toast.success(`Updated waitlist entry for ${waitlistForm.customerName}`);
      setIsEditingWaitlist(false);
    } else {
      // Add new entry
      dispatch(addToWaitlist(waitlistForm));
      toast.success(`Added ${waitlistForm.customerName} to the waitlist`);
      setIsAddingToWaitlist(false);
    }
    
    setSelectedWaitlistEntry(null);
  };

  // Handle notifying customer
  const handleNotifyCustomer = (entry) => {
    dispatch(notifyCustomer({ id: entry.id }));
    toast.success(`Notification sent to ${entry.customerName}`);
  };

  // Handle removing from waitlist dialog
  const handleRemoveFromWaitlist = (entry, reason) => {
    setSelectedWaitlistEntry(entry);
    setRemoveReason(reason);
    setShowRemoveWaitlistDialog(true);
  };

  // Confirm removal from waitlist
  const confirmRemoveFromWaitlist = () => {
    if (!selectedWaitlistEntry) return;
    
    dispatch(removeFromWaitlist({
      id: selectedWaitlistEntry.id,
      reason: removeReason
    }));
    
    toast.success(
      removeReason === 'seated' 
        ? `${selectedWaitlistEntry.customerName} has been seated` 
        : `${selectedWaitlistEntry.customerName} has been removed from the waitlist`
    );
    setShowRemoveWaitlistDialog(false);
  };

  // Reservation Management Component
  const ReservationManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter reservations by search term
    const searchedReservations = filteredReservations.filter(res =>
      res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.phoneNumber.includes(searchTerm)
    );
    
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Reservations</h3>
          <button
            onClick={handleAddNewReservation}
            className="btn btn-primary"
          >
            <PlusIcon className="w-4 h-4 mr-2" /> New Reservation
          </button>
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-surface-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-surface-500" />
            <select
              value={reservationFilter}
              onChange={(e) => setReservationFilter(e.target.value)}
              className="select"
            >
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="past">Past</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
        
        {searchedReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Table</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Party Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {searchedReservations.map(reservation => {
                  const table = tables.find(t => t.id === reservation.tableId);
                  return (
                    <tr key={reservation.id} className="hover:bg-surface-100 dark:hover:bg-surface-700/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">{reservation.customerName}</div>
                        <div className="text-sm text-surface-500">{reservation.phoneNumber}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {table ? (
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${
                              table.status === 'available' ? 'bg-green-500' :
                              table.status === 'occupied' ? 'bg-red-500' :
                              table.status === 'reserved' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            } mr-2`}></div>
                            <span>Table {table.number}</span>
                          </div>
                        ) : (
                          <span className="text-surface-500">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>{format(parseISO(reservation.reservationTime), 'MMM d, yyyy')}</div>
                        <div className="text-sm text-surface-500">
                          {format(parseISO(reservation.reservationTime), 'h:mm a')}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {reservation.partySize}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reservation.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                        }`}>
                          {reservation.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center space-x-2">
                          {reservation.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleEditReservation(reservation)}
                                className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700"
                                title="Edit"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancelReservation(reservation)}
                                className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 text-red-500"
                                title="Cancel"
                              >
                                <XIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-surface-500">No reservations found</div>
        )}
      </div>
    );
  };

  // Waitlist Management Component
  const WaitlistManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter waitlist by search term
    const searchedWaitlist = filteredWaitlist.filter(entry =>
      entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.phoneNumber.includes(searchTerm)
    );
    
    // Calculate wait time elapsed
    const getWaitTimeElapsed = (timeAdded) => {
      const addedTime = new Date(timeAdded);
      const now = new Date();
      const diffMs = now - addedTime;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins} min`;
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}m`;
      }
    };
    
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Waitlist</h3>
          <button
            onClick={handleAddToWaitlist}
            className="btn btn-primary"
          >
            <PlusIcon className="w-4 h-4 mr-2" /> Add to Waitlist
          </button>
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-surface-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-surface-500" />
            <select
              value={waitlistFilter}
              onChange={(e) => setWaitlistFilter(e.target.value)}
              className="select"
            >
              <option value="waiting">Waiting</option>
              <option value="notified">Notified</option>
              <option value="seated">Seated</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
        
        {searchedWaitlist.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Party Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Wait Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {searchedWaitlist.map(entry => (
                  <tr key={entry.id} className="hover:bg-surface-100 dark:hover:bg-surface-700/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{entry.customerName}</div>
                      <div className="text-sm text-surface-500">{entry.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {entry.partySize}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <TimerIcon className="w-4 h-4 mr-1 text-surface-500" />
                        <div>
                          <div className="font-medium">{getWaitTimeElapsed(entry.timeAdded)}</div>
                          <div className="text-xs text-surface-500">Est: {entry.estimatedWaitTime} min</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'waiting' 
                          ? entry.notified 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                          : entry.status === 'seated'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                      }`}>
                        {entry.status === 'waiting' 
                          ? entry.notified ? 'Notified' : 'Waiting' 
                          : entry.status === 'seated' ? 'Seated' : 'Cancelled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {entry.status === 'waiting' && (
                          <>
                            <button
                              onClick={() => handleNotifyCustomer(entry)}
                              className={`p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 ${
                                entry.notified ? 'text-blue-500' : 'text-yellow-500'
                              }`}
                              title={entry.notified ? 'Notify Again' : 'Notify'}
                              disabled={entry.notified}
                            >
                              {entry.notified ? <BellOffIcon className="w-4 h-4" /> : <BellIcon className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleRemoveFromWaitlist(entry, 'seated')}
                              className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 text-green-500"
                              title="Seat Customer"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditWaitlist(entry)}
                              className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700"
                              title="Edit"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveFromWaitlist(entry, 'cancelled')}
                              className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 text-red-500"
                              title="Remove"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-surface-500">
            <ClipboardIcon className="h-12 w-12 mx-auto mb-3 text-surface-400" />
            <p>No customers on the waitlist</p>
            <button 
              onClick={handleAddToWaitlist}
              className="mt-4 btn btn-outline"
            >
              Add Customer to Waitlist
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container py-6 md:py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Tables & Reservations</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`btn ${isEditMode ? 'btn-primary' : 'btn-outline'}`}
            >
              {isEditMode ? (
                <><SaveIcon className="w-4 h-4 mr-2" /> Save Layout</>
              ) : (
                <><EditIcon className="w-4 h-4 mr-2" /> Edit Layout</>
              )}
            </button>
            
            <button
              onClick={() => setIsAddingTable(true)}
              className="btn btn-outline"
              disabled={!isEditMode}
            >
              <PlusIcon className="w-4 h-4 mr-2" /> Add Table
            </button>
          </div>
        </div>
        
        <div className="flex mb-6 border-b border-surface-200 dark:border-surface-700">
          <button
            onClick={() => setActiveTab('floorplan')}
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'floorplan'
                ? 'border-b-2 border-primary text-primary dark:text-primary-light'
                : 'border-b-2 border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
            }`}
          >
            Floor Plan
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'reservations'
                ? 'border-b-2 border-primary text-primary dark:text-primary-light'
                : 'border-b-2 border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
            }`}
          >
            Reservations
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'waitlist'
                ? 'border-b-2 border-primary text-primary dark:text-primary-light'
                : 'border-b-2 border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
            }`}
          >
            Waitlist
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'border-b-2 border-primary text-primary dark:text-primary-light'
                : 'border-b-2 border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
            }`}
          >
            Analytics
          </button>
        </div>
        
        {/* Main Content Area - Shows different content based on the active tab */}
        
        <div className="space-y-6">
          {/* Floor Plan Tab */}
          {activeTab === 'floorplan' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Floor Plan */}
              <div className="md:col-span-2 card p-6">
                <TableFloorPlan 
                  tables={tables} 
                  sections={sections}
                  selectedTable={selectedTable}
                  onSelectTable={handleSelectTable}
                  isEditMode={isEditMode}
                />
              </div>
              
              {/* Table Details & Actions */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedTable ? `Table ${selectedTable.number}` : 'Select a Table'}
                </h3>
                
                {selectedTable ? (
                  <div>
                    {/* Table details */}
                    <div className="bg-surface-100 dark:bg-surface-700 p-4 rounded-lg mb-4">
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full ${
                            selectedTable.status === 'available' ? 'bg-green-500' :
                            selectedTable.status === 'occupied' ? 'bg-red-500' :
                            selectedTable.status === 'reserved' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          } mr-2`}></div>
                          <span className="capitalize">{selectedTable.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        <span>{selectedTable.capacity} seats</span>
                      </div>
                    </div>
                    
                    {selectedTable.status === 'occupied' && (
                      <>
                        <div className="mb-1 font-medium">{selectedTable.customer}</div>
                        
                        {selectedTable.timeSeated && (
                          <div className="flex items-center text-sm text-surface-600 dark:text-surface-400 mb-1">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            <span>Seated: {new Date(selectedTable.timeSeated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        )}
                        
                        {selectedTable.server && (
                          <div className="flex items-center text-sm text-surface-600 dark:text-surface-400 mb-1">
                            <UserIcon className="w-4 h-4 mr-1" />
                            <span>Server: {selectedTable.server}</span>
                          </div>
                        )}
                        
                        {selectedTable.phoneNumber && (
                          <div className="flex items-center text-sm text-surface-600 dark:text-surface-400">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            <span>{selectedTable.phoneNumber}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {selectedTable.status === 'reserved' && (
                      <>
                        <div className="mb-1 font-medium">{selectedTable.customerName}</div>
                        
                        {selectedTable.reservationTime && (
                          <div className="flex items-center text-sm text-surface-600 dark:text-surface-400 mb-1">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            <span>Reserved: {new Date(selectedTable.reservationTime).toLocaleString([], {
                              weekday: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        )}
                        
                        {selectedTable.phoneNumber && (
                          <div className="flex items-center text-sm text-surface-600 dark:text-surface-400">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            <span>{selectedTable.phoneNumber}</span>
                          </div>
                        )}
                      </>
                    )}
                    </div>

                    {selectedTable && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-3">Edit Table</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="label">Table Number</label>
                            <input
                              type="number"
                              className="input"
                              value={selectedTable.number}
                              onChange={(e) => dispatch(updateTable({
                                id: selectedTable.id,
                                number: parseInt(e.target.value, 10)
                              }))}
                              min="1"
                            />
                          </div>
                          
                          <div>
                            <label className="label">Capacity</label>
                            <input
                              type="number"
                              className="input"
                              value={selectedTable.capacity}
                              onChange={(e) => dispatch(updateTable({
                                id: selectedTable.id,
                                capacity: parseInt(e.target.value, 10)
                              }))}
                              min="1"
                            />
                          </div>
                          
                          <div>
                            <label className="label">Shape</label>
                            <div className="flex space-x-4 mt-1">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="shape"
                                  checked={selectedTable.shape === 'circle'}
                                  onChange={() => dispatch(updateTable({
                                    id: selectedTable.id,
                                    shape: 'circle'
                                  }))}
                                  className="mr-2"
                                />
                                <CircleIcon className="w-4 h-4 mr-1" />
                                Circle
                              </label>
                              
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="shape"
                                  checked={selectedTable.shape === 'rectangle'}
                                  onChange={() => dispatch(updateTable({
                                    id: selectedTable.id,
                                    shape: 'rectangle'
                                  }))}
                                  className="mr-2"
                                />
                                <SquareIcon className="w-4 h-4 mr-1" />
                                Rectangle
                              </label>
                            </div>
                          </div>
                          
                          <div>
                            <label className="label">Section</label>
                            <select
                              className="select"
                              value={selectedTable.section}
                              onChange={(e) => dispatch(updateTable({
                                id: selectedTable.id,
                                section: e.target.value
                              }))}
                            >
                              {sections.map(section => (
                                <option key={section.id} value={section.id}>
                                  {section.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="pt-2">
                            <button
                              onClick={handleDeleteTable}
                              className="btn bg-red-500 hover:bg-red-600 text-white w-full"
                            >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Delete Table
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    {!tableAction ? (
                      <>
                        {/* Table actions */}
                        <div>
                          <h4 className="font-medium mb-3">Actions</h4>
                          <div className="space-y-2">
                            {getAvailableActions(selectedTable).map(action => (
                              <button
                                key={action.id}
                                onClick={() => handleTableAction(action.id)}
                                className="btn btn-outline w-full flex items-center justify-center"
                              >
                                {getIcon(action.icon)({ className: "w-4 h-4 mr-2" })}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h4 className="font-medium mb-3">
                            {tableAction === 'seat' ? 'Seat Guests' :
                             tableAction === 'reserve' ? 'Make Reservation' :
                             tableAction === 'clear' ? 'Clear Table' :
                             tableAction === 'finish-cleaning' ? 'Finish Cleaning' : 'Action'}
                          </h4>
                          
                          <form onSubmit={handleActionSubmit}>
                            {getFormContent()}
                            
                            <div className="flex justify-end space-x-2 mt-4">
                              <button
                                type="button"
                                onClick={() => setTableAction(null)}
                                className="btn btn-outline"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className={`btn ${
                                  tableAction === 'clear' 
                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                    : 'btn-primary'
                                }`}
                              >
                                Confirm
                              </button>
                            </div>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-6">
                <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                  <p>Select a table to view details and take actions</p>
                )}
              </div>
            )}
          </div>
        )}
  
          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <ReservationManagement />
          )}
          
          {/* Waitlist Tab */}
          {activeTab === 'waitlist' && (
            <WaitlistManagement />
          )}
          
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Table Analytics</h3>
              <p className="text-center py-8 text-surface-500">Analytics functionality coming soon</p>
            </div>
          )}
        </div>
        
        {/* Add/Edit Reservation Modal */}
        {(isAddingReservation || isEditingReservation) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {isEditingReservation ? 'Edit Reservation' : 'New Reservation'}
              </h3>
              
              <form onSubmit={handleReservationSubmit}>
                <div className="space-y-4 mb-4">
                  <div>
                    <label htmlFor="customerName" className="label">Customer Name *</label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={actionForm.customerName}
                      onChange={handleActionFormChange}
                      className="input"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="label">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={actionForm.phoneNumber}
                      onChange={handleActionFormChange}
                      className="input"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tableId" className="label">Table *</label>
                    <select
                      id="tableId"
                      name="tableId"
                      value={actionForm.tableId}
                      onChange={handleActionFormChange}
                      className="select"
                      required
                    >
                      <option value="">Select a table</option>
                      {tables.map(table => (
                        <option key={table.id} value={table.id} disabled={table.status === 'occupied'}>
                          Table {table.number} ({table.capacity} seats) - {table.status === 'occupied' ? 'Occupied' : table.status === 'reserved' ? 'Reserved' : 'Available'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="partySize" className="label">Party Size *</label>
                    <input
                      type="number"
                      id="partySize"
                      name="partySize"
                      value={actionForm.partySize}
                      onChange={handleActionFormChange}
                      className="input"
                      min="1"
                      required
                    />
                    {actionForm.tableId && (
                      <p className="text-xs text-surface-500 mt-1">
                        Table capacity: {tables.find(t => t.id === actionForm.tableId)?.capacity || 'Unknown'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="reservationTime" className="label">Reservation Time *</label>
                    <input
                      type="datetime-local"
                      id="reservationTime"
                      name="reservationTime"
                      value={actionForm.reservationTime}
                      onChange={handleActionFormChange}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="estimatedDuration" className="label">Duration</label>
                    <select
                      id="estimatedDuration"
                      name="estimatedDuration"
                      value={actionForm.estimatedDuration}
                      onChange={handleActionFormChange}
                      className="select"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                      <option value="180">180 minutes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="label">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={actionForm.notes}
                      onChange={handleActionFormChange}
                      className="textarea"
                      placeholder="Add any special requests or notes"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingReservation(false);
                      setIsEditingReservation(false);
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {isEditingReservation ? 'Update Reservation' : 'Create Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Cancel Reservation Confirmation Dialog */}
        {showCancelDialog && selectedReservation && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center mb-6 text-red-500">
                <AlertCircleIcon className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Cancel Reservation</h3>
              </div>
              
              <p className="mb-4">Are you sure you want to cancel the reservation for <strong>{selectedReservation.customerName}</strong>?</p>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="btn btn-outline"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={() => confirmCancelReservation('Cancelled by staff')}
                  className="btn bg-red-500 hover:bg-red-600 text-white"
                >
                  Cancel Reservation
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Table Modal */}
      {/* Add/Edit Waitlist Entry Modal */}
      {(isAddingToWaitlist || isEditingWaitlist) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isEditingWaitlist ? 'Edit Waitlist Entry' : 'Add to Waitlist'}
            </h3>
            
            <form onSubmit={handleWaitlistSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="customerName" className="label">Customer Name *</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={waitlistForm.customerName}
                    onChange={handleWaitlistFormChange}
                    className="input"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="label">Phone Number *</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={waitlistForm.phoneNumber}
                    onChange={handleWaitlistFormChange}
                    className="input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="partySize" className="label">Party Size *</label>
                  <input
                    type="number"
                    id="partySize"
                    name="partySize"
                    value={waitlistForm.partySize}
                    onChange={handleWaitlistFormChange}
                    className="input"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="label">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={waitlistForm.notes}
                    onChange={handleWaitlistFormChange}
                    className="input"
                    placeholder="Any special requests or notes"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingToWaitlist(false);
                    setIsEditingWaitlist(false);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditingWaitlist ? 'Update Entry' : 'Add to Waitlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Remove from Waitlist Confirmation Dialog */}
      {showRemoveWaitlistDialog && selectedWaitlistEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-6 text-red-500">
              <AlertCircleIcon className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">
                {removeReason === 'seated' ? 'Seat Customer' : 'Remove from Waitlist'}
              </h3>
            </div>
            
            <p className="mb-4">
              {removeReason === 'seated' 
                ? `Are you sure you want to mark ${selectedWaitlistEntry.customerName} as seated?` 
                : `Are you sure you want to remove ${selectedWaitlistEntry.customerName} from the waitlist?`}
            </p>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowRemoveWaitlistDialog(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveFromWaitlist}
                className={`btn ${removeReason === 'seated' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
              >
                {removeReason === 'seated' ? 'Yes, Seat Customer' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
      
        {isAddingTable && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Add New Table</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Table Number *</label>
                  <input
                    type="number"
                    name="number"
                    value={newTableForm.number}
                    onChange={handleNewTableFormChange}
                    className="input"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="label">Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={newTableForm.capacity}
                    onChange={handleNewTableFormChange}
                    className="input"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="label">Shape</label>
                  <div className="flex space-x-4 mt-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="shape"
                        value="circle"
                        checked={newTableForm.shape === 'circle'}
                        onChange={handleNewTableFormChange}
                        className="mr-2"
                      />
                      <CircleIcon className="w-4 h-4 mr-1" />
                      Circle
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="shape"
                        value="rectangle"
                        checked={newTableForm.shape === 'rectangle'}
                        onChange={handleNewTableFormChange}
                        className="mr-2"
                      />
                      <SquareIcon className="w-4 h-4 mr-1" />
                      Rectangle
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="label">Section</label>
                  <select
                    name="section"
                    value={newTableForm.section}
                    onChange={handleNewTableFormChange}
                    className="select"
                  >
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Width</label>
                    <input
                      type="number"
                      name="width"
                      value={newTableForm.width}
                      onChange={handleNewTableFormChange}
                      className="input"
                      min="40"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Height</label>
                    <input
                      type="number"
                      name="height"
                      value={newTableForm.height}
                      onChange={handleNewTableFormChange}
                      className="input"
                      min="40"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsAddingTable(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTable}
                  className="btn btn-primary"
                >
                  Add Table
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Tables;