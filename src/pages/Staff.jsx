import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { fetchStaffMembers, deleteStaffMember } from '../services/staffService';
import StaffForm from '../components/StaffForm';
import StaffDetail from '../components/StaffDetail';
import { format } from 'date-fns';

const Staff = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    roles: [],
    minRating: '',
    maxRating: '',
    minOrders: '',
    maxOrders: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [viewingStaffId, setViewingStaffId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [staffStats, setStaffStats] = useState({
    total: 0,
    byRole: {},
    averageRating: 0
  });

  // Icons
  const PlusIcon = getIcon('plus');
  const SearchIcon = getIcon('search');
  const FilterIcon = getIcon('filter');
  const EditIcon = getIcon('edit');
  const TrashIcon = getIcon('trash');
  const EyeIcon = getIcon('eye');
  const UserIcon = getIcon('user');
  const ServerIcon = getIcon('utensils');
  const HostIcon = getIcon('doorOpen');
  const BartenderIcon = getIcon('wineGlass');
  const RefreshIcon = getIcon('refreshCw');
  const ChevronDownIcon = getIcon('chevronDown');
  const StarIcon = getIcon('star');
  const CloseIcon = getIcon('x');

  const loadStaffMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {};
      
      if (searchTerm) {
        filters.searchTerm = searchTerm;
      }
      
      // Handle multiple role filters
      if (this.filters.roles && this.filters.roles.length > 0) {
        filters.roles = this.filters.roles;
      }
      
      // Add numeric range filters
      if (this.filters.minRating) {
        filters.minRating = parseFloat(this.filters.minRating);
      }
      if (this.filters.maxRating) {
        filters.maxRating = parseFloat(this.filters.maxRating);
      }
      if (this.filters.minOrders) {
        filters.minOrders = parseInt(this.filters.minOrders);
      }
      if (this.filters.maxOrders) {
        filters.maxOrders = parseInt(this.filters.maxOrders);
      }
      
      const data = await fetchStaffMembers(filters);
      setStaffMembers(data);
      
      // Calculate stats
      if (data.length > 0) {
        const roles = {};
        let totalRating = 0;
        let ratingCount = 0;
        
        data.forEach(staff => {
          roles[staff.role] = (roles[staff.role] || 0) + 1;
          
          if (staff.averageRating !== null && staff.averageRating !== undefined) {
            totalRating += staff.averageRating;
            ratingCount++;
          }
        });
        
        setStaffStats({
          total: data.length,
          byRole: roles,
          averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0
        });
      } else {
        setStaffStats({
          total: 0,
          byRole: {},
          averageRating: 0
        });
      }
    } catch (err) {
      console.error('Error loading staff members:', err);
      setError('Failed to load staff members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaffMembers();
  }, []); // Load on initial render

  const handleSearch = (e) => {
    e.preventDefault();
    loadStaffMembers();
  };

  const handleAddStaff = () => {
    setEditingStaffId(null);
    setShowForm(true);
  };

  const handleEditStaff = (staffId) => {
    setEditingStaffId(staffId);
    setShowForm(true);
  };

  const handleViewStaff = (staffId) => {
    setViewingStaffId(staffId);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingStaffId(null);
    loadStaffMembers();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStaffId(null);
  };

  const handleCloseDetail = () => {
    setViewingStaffId(null);
  };

  const confirmDelete = (staffId, staffName) => {
    setStaffToDelete({ id: staffId, name: staffName });
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    
    try {
      await deleteStaffMember(staffToDelete.id);
      loadStaffMembers();
      setShowDeleteConfirm(false);
      setStaffToDelete(null);
    } catch (err) {
      console.error('Error deleting staff member:', err);
      toast.error('Failed to delete staff member');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setStaffToDelete(null);
  };

  const handleFilterChange = (type, value) => {
    let updatedFilters = { ...filters };
    
    if (type === 'role') {
      // Toggle role selection
      if (updatedFilters.roles.includes(value)) {
        updatedFilters.roles = updatedFilters.roles.filter(role => role !== value);
      } else {
        updatedFilters.roles = [...updatedFilters.roles, value];
      }
    } else {
      updatedFilters[type] = value;
    }
    
    setFilters(updatedFilters);
  };
  
  const clearFilters = () => {
    setFilters({
      roles: [],
      minRating: '',
      maxRating: '',
      minOrders: '',
      maxOrders: ''
    });
  };
  
  const hasActiveFilters = () => {
    return (
      filters.roles.length > 0 ||
      filters.minRating !== '' ||
      filters.maxRating !== '' ||
      filters.minOrders !== '' ||
      filters.maxOrders !== ''
    );
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Server':
        return <ServerIcon className="h-5 w-5 text-blue-500" />;
      case 'Host':
        return <HostIcon className="h-5 w-5 text-green-500" />;
      case 'Bartender':
        return <BartenderIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const applyFilters = () => {
    loadStaffMembers();
    if (window.innerWidth < 768) {
      setShowFilters(false); // Close filter panel on mobile after applying
    }
  };
  
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const roleOptions = ['Server', 'Host', 'Bartender'];

  return (
    <div className="app-container py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Staff Management</h1>
            <p className="text-surface-600 dark:text-surface-400">Manage your restaurant staff and track performance</p>
          </div>
          <button
            onClick={handleAddStaff}
            className="btn btn-primary flex items-center gap-2 mt-4 md:mt-0"
          >
            <PlusIcon className="h-4 w-4" /> Add Staff Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-1">
              <UserIcon className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Total Staff</h2>
            </div>
            <p className="text-3xl font-bold">{staffStats.total}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(staffStats.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center gap-1 text-sm bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-full">
                  {getRoleIcon(role)}
                  <span>{role}: {count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-1">
              <StarIcon className="h-5 w-5 text-yellow-500" />
              <h2 className="font-semibold">Average Rating</h2>
            </div>
            <p className="text-3xl font-bold">{staffStats.averageRating}</p>
            <div className="flex mt-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  className={`h-5 w-5 ${i < Math.round(staffStats.averageRating) ? 'text-yellow-500' : 'text-surface-300 dark:text-surface-600'}`} 
                />
              ))}
            </div>
          </div>
          
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search staff by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary ml-2">
              Search
            </button>
          </form>

          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="btn btn-outline flex items-center justify-center gap-1 text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <CloseIcon className="h-4 w-4" /> Clear Filters
              </button>
            )}
            <button
              onClick={toggleFilters}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} flex items-center justify-center gap-1`}
            >
              <FilterIcon className="h-4 w-4" /> 
              Filters
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <button
              onClick={loadStaffMembers}
              className="btn btn-outline flex items-center justify-center gap-2"
            >
              <RefreshIcon className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.roles.map(role => (
              <div key={role} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light rounded-full text-sm">
                {getRoleIcon(role)}
                <span>{role}</span>
                <button 
                  onClick={() => handleFilterChange('role', role)}
                  className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {filters.minRating && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 rounded-full text-sm">
                <StarIcon className="h-3 w-3" />
                <span>Min Rating: {filters.minRating}</span>
                <button 
                  onClick={() => handleFilterChange('minRating', '')}
                  className="ml-1 rounded-full hover:bg-yellow-500/20 p-0.5"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.maxRating && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 rounded-full text-sm">
                <StarIcon className="h-3 w-3" />
                <span>Max Rating: {filters.maxRating}</span>
                <button 
                  onClick={() => handleFilterChange('maxRating', '')}
                  className="ml-1 rounded-full hover:bg-yellow-500/20 p-0.5"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.minOrders && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full text-sm">
                <span>Min Orders: {filters.minOrders}</span>
                <button 
                  onClick={() => handleFilterChange('minOrders', '')}
                  className="ml-1 rounded-full hover:bg-blue-500/20 p-0.5"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {filters.maxOrders && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full text-sm">
                <span>Max Orders: {filters.maxOrders}</span>
                <button 
                  onClick={() => handleFilterChange('maxOrders', '')}
                  className="ml-1 rounded-full hover:bg-blue-500/20 p-0.5"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 card overflow-hidden"
          >
            <div className="p-4 border-b border-surface-200 dark:border-surface-700">
              <h3 className="font-medium">Filter Staff Members</h3>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Role Filter */}
              <div>
                <h4 className="font-medium mb-2 text-surface-700 dark:text-surface-300">Role</h4>
                <div className="space-y-2">
                  {roleOptions.map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filters.roles.includes(role)}
                        onChange={() => handleFilterChange('role', role)}
                        className="rounded text-primary focus:ring-primary dark:bg-surface-700"
                      />
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(role)}
                        <span>{role}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Rating Filter */}
              <div>
                <h4 className="font-medium mb-2 text-surface-700 dark:text-surface-300">Rating</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">Min Rating</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="5" 
                      step="0.1" 
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Max Rating</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="5" 
                      step="0.1" 
                      value={filters.maxRating}
                      onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>
              
              {/* Orders Processed Filter */}
              <div>
                <h4 className="font-medium mb-2 text-surface-700 dark:text-surface-300">Orders Processed</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">Min Orders</label>
                    <input 
                      type="number" 
                      min="0"
                      value={filters.minOrders}
                      onChange={(e) => handleFilterChange('minOrders', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Max Orders</label>
                    <input 
                      type="number" 
                      min="0"
                      value={filters.maxOrders}
                      onChange={(e) => handleFilterChange('maxOrders', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-surface-50 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 flex justify-end">
              <div className="flex gap-2">
                <button 
                  onClick={clearFilters}
                  className="btn btn-outline"
                >
                  Clear All
                </button>
                <button 
                  onClick={applyFilters}
                  className="btn btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Staff List */}
        <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card border border-surface-200 dark:border-surface-700 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={loadStaffMembers} 
                className="btn btn-outline flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshIcon className="h-4 w-4" /> Try Again
              </button>
            </div>
          ) : staffMembers.length === 0 ? (
            <div className="p-8 text-center">
              <UserIcon className="h-12 w-12 mx-auto text-surface-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No staff members found</h3>
              <p className="text-surface-500 dark:text-surface-400 mb-4">
                {searchTerm || hasActiveFilters() ? 'Try changing your search or filters' : 'Add your first staff member to get started'}
              </p>
              <button
                onClick={handleAddStaff}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                <PlusIcon className="h-4 w-4" /> Add Staff Member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-100 dark:bg-surface-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Sales</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                  {staffMembers.map((staff) => (
                    <tr key={staff.Id} className="hover:bg-surface-50 dark:hover:bg-surface-750">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-light flex items-center justify-center">
                            {getRoleIcon(staff.role)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">{staff.Name}</div>
                            {staff.Tags && staff.Tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {staff.Tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                                {staff.Tags.length > 2 && (
                                  <span className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 text-xs rounded-full">
                                    +{staff.Tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-surface-100 dark:bg-surface-700 font-medium">
                          {staff.role || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {staff.ordersProcessed || 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        ${(staff.salesAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm mr-1">{(staff.averageRating || 0).toFixed(1)}</span>
                          <StarIcon className={`h-4 w-4 ${staff.averageRating > 0 ? 'text-yellow-500' : 'text-surface-300 dark:text-surface-600'}`} />
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {staff.CreatedOn ? format(new Date(staff.CreatedOn), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleViewStaff(staff.Id)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                            aria-label="View staff details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditStaff(staff.Id)}
                            className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                            aria-label="Edit staff member"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => confirmDelete(staff.Id, staff.Name)}
                            className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                            aria-label="Delete staff member"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Modal for add/edit form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-surface-200 dark:border-surface-700">
              <h2 className="text-xl font-semibold">{editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
            </div>
            <StaffForm 
              staffId={editingStaffId} 
              onSuccess={handleFormSuccess} 
              onCancel={handleFormCancel} 
            />
          </div>
        </div>
      )}
      
      {/* Modal for staff details */}
      {viewingStaffId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <StaffDetail 
              staffId={viewingStaffId} 
              onClose={handleCloseDetail} 
              onEdit={handleEditStaff} 
            />
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Delete Staff Member</h3>
              <p className="mt-2 text-surface-600 dark:text-surface-400">
                Are you sure you want to delete the staff member "{staffToDelete?.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                type="button" 
                onClick={cancelDelete}
                className="btn btn-outline flex items-center gap-2"
              >
                <CloseIcon className="h-4 w-4" /> Cancel
              </button>
              <button 
                type="button" 
                onClick={handleDelete}
                className="btn bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;