import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import TableFloorPlan from '../components/TableFloorPlan';
import { updateTable, setTableStatus, addTable, deleteTable } from '../redux/slices/tablesSlice';

const Tables = () => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const sections = useSelector((state) => state.tables.sections);
  
  const [selectedTable, setSelectedTable] = useState(null);
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
    server: '',
    notes: ''
  });

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
                        <div className={`w-3 h-3 rounded-full ${
                          selectedTable.status === 'available' ? 'bg-green-500' :
                          selectedTable.status === 'occupied' ? 'bg-red-500' :
                          selectedTable.status === 'reserved' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        } mr-2`}></div>
                        <span className="capitalize">{selectedTable.status}</span>
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
                  
                  {isEditMode ? (
                    <div>
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
                  ) : (
                    <div>
                      {/* Table actions */}
                      {!tableAction ? (
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
                      ) : (
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
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                  <p>Select a table to view details and take actions</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Add Table Modal */}
        {isAddingTable && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-md">
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