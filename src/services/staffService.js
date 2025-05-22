/**
 * Staff Service - Handles all staff member related API operations
 */

/**
 * Fetches staff members with optional filtering
 * @param {Object} filters - Optional filters to apply to the query
 * @returns {Promise<Array>} - Array of staff members
 */
export const fetchStaffMembers = async (filters = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Define query parameters
    const params = {
      fields: [
        "Id", "Name", "Tags", "role", "ordersProcessed", 
        "salesAmount", "averageRating", "CreatedOn", "ModifiedOn"
      ],
      orderBy: [
        {
          fieldName: "Name",
          SortType: "ASC"
        }
      ],
      where: []
    };

    // Add text search filter
    if (filters.searchTerm) {
      params.where.push({
        fieldName: "Name",
        operator: "Contains",
        values: [filters.searchTerm]
      });
    }

    // Handle multiple role filters
    if (filters.roles && filters.roles.length > 0) {
      params.where.push({
        fieldName: "role",
        operator: "ExactMatch",
        values: filters.roles
      });
    }
    
    // Add rating range filters
    if (filters.minRating !== undefined && filters.minRating !== '') {
      params.where.push({
        fieldName: "averageRating",
        operator: "GreaterThanOrEqualTo",
        values: [parseFloat(filters.minRating)]
      });
    }
    
    if (filters.maxRating !== undefined && filters.maxRating !== '') {
      params.where.push({
        fieldName: "averageRating",
        operator: "LessThanOrEqualTo", 
        values: [parseFloat(filters.maxRating)]
      });
    }
    
    // Add orders processed range filters
    if (filters.minOrders !== undefined && filters.minOrders !== '') {
      params.where.push({
        fieldName: "ordersProcessed",
        operator: "GreaterThanOrEqualTo",
        values: [parseInt(filters.minOrders)]
      });
    }
    
    if (filters.maxOrders !== undefined && filters.maxOrders !== '') {
      params.where.push({
        fieldName: "ordersProcessed",
        operator: "LessThanOrEqualTo",
        values: [parseInt(filters.maxOrders)]
      });
    }
    
    // Add support for sorting (future enhancement)
    if (filters.sortBy) {
      params.orderBy = [{
        fieldName: filters.sortBy,
        SortType: filters.sortDirection || "ASC"
      })];
    }

    const response = await apperClient.fetchRecords("staff_member", params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching staff members:", error);
    throw error;
  }
};

/**
 * Fetch a single staff member by ID
 * @param {string} staffId - The ID of the staff member to fetch
 * @returns {Promise<Object>} - Staff member data
 */
export const fetchStaffMemberById = async (staffId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById("staff_member", staffId);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching staff member with ID ${staffId}:`, error);
    throw error;
  }
};

/**
 * Create or update a staff member
 * @param {Object} staffData - The staff data to save
 * @returns {Promise<Object>} - Created or updated staff member
 */
export const saveStaffMember = async (staffData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    if (staffData.Id) {
      // Update existing staff member
      const response = await apperClient.updateRecord("staff_member", { records: [staffData] });
      return response.results[0].data;
    } else {
      // Create new staff member
      const response = await apperClient.createRecord("staff_member", { records: [staffData] });
      return response.results[0].data;
    }
  } catch (error) {
    console.error("Error saving staff member:", error);
    throw error;
  }
};

/**
 * Delete a staff member
 * @param {string} staffId - The ID of the staff member to delete
 */
export const deleteStaffMember = async (staffId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    await apperClient.deleteRecord("staff_member", { RecordIds: [staffId] });
    return true;
  } catch (error) {
    console.error(`Error deleting staff member with ID ${staffId}:`, error);
    throw error;
  }
};