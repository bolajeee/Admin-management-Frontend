/**
 * Utility functions for handling user roles consistently across the application
 */

// Cache for role mappings to avoid repeated API calls
let roleMapCache = null;
let roleMapPromise = null;

/**
 * Fetch role mappings from the backend
 * @param {Object} axiosInstance - Axios instance for API calls
 * @returns {Promise<Object>} Role mapping object
 */
export const fetchRoleMap = async (axiosInstance) => {
    if (roleMapCache) {
        return roleMapCache;
    }

    if (roleMapPromise) {
        return roleMapPromise;
    }

    roleMapPromise = (async () => {
        try {
            const response = await axiosInstance.get('/roles');
            const roles = response.data.data || response.data.roles || response.data || [];
            const mapping = {};

            roles.forEach(role => {
                if (role._id && role.name) {
                    mapping[role._id] = role.name;
                }
            });

            // Add default mappings
            mapping['admin'] = 'admin';
            mapping['employee'] = 'employee';
            mapping['manager'] = 'manager';
            mapping['user'] = 'user';

            roleMapCache = mapping;
            return mapping;
        } catch (error) {
            console.log('Could not fetch roles, using default mapping:', error.response?.data);
            // Set default role mapping if API fails
            const defaultMapping = {
                'admin': 'admin',
                'employee': 'employee',
                'manager': 'manager',
                'user': 'user'
            };
            roleMapCache = defaultMapping;
            return defaultMapping;
        } finally {
            roleMapPromise = null;
        }
    })();

    return roleMapPromise;
};

/**
 * Get display role name from user data
 * @param {Object} user - User object
 * @param {Object} roleMap - Role mapping object (optional, will fetch if not provided)
 * @param {Object} axiosInstance - Axios instance (required if roleMap not provided)
 * @returns {Promise<string>|string} Role display name
 */
export const getUserRole = async (user, roleMap = null, axiosInstance = null) => {
    // If roleMap is not provided, fetch it
    if (!roleMap && axiosInstance) {
        roleMap = await fetchRoleMap(axiosInstance);
    }

    return getUserRoleSync(user, roleMap || {});
};

/**
 * Get display role name from user data (synchronous version)
 * @param {Object} user - User object
 * @param {Object} roleMap - Role mapping object
 * @returns {string} Role display name
 */
export const getUserRoleSync = (user, roleMap = {}) => {
    if (!user) return 'user';

    const { role } = user;

    // Handle different role data structures with role mapping
    let displayRole = 'employee'; // default

    // Check if role is a populated object with name
    if (typeof role === 'object' && role?.name) {
        displayRole = role.name;
    }
    // Check if role is a direct string (not ObjectId)
    else if (typeof role === 'string' && role !== '' && !role.match(/^[0-9a-fA-F]{24}$/)) {
        displayRole = role;
    }
    // Check if role is an ObjectId and we have a mapping for it
    else if (typeof role === 'string' && role.match(/^[0-9a-fA-F]{24}$/) && roleMap[role]) {
        displayRole = roleMap[role];
    }
    // Check user.isAdmin flag
    else if (user.isAdmin === true || user.isAdmin === 'true') {
        displayRole = 'admin';
    }
    // Check if user.role exists and is not an ObjectId
    else if (user.role && typeof user.role === 'object' && user.role.name) {
        displayRole = user.role.name;
    }
    else if (user.role && typeof user.role === 'string' && !user.role.match(/^[0-9a-fA-F]{24}$/)) {
        displayRole = user.role;
    }
    // Check if user.role is an ObjectId and we have a mapping
    else if (user.role && typeof user.role === 'string' && user.role.match(/^[0-9a-fA-F]{24}$/) && roleMap[user.role]) {
        displayRole = roleMap[user.role];
    }
    // Check for admin-like properties
    else if (user.permissions && user.permissions.includes('admin')) {
        displayRole = 'admin';
    }
    // Check email patterns (common admin emails)
    else if (user.email && (user.email.includes('admin') || user.email.includes('manager'))) {
        displayRole = 'admin';
    }

    return displayRole;
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @param {Object} roleMap - Role mapping object
 * @returns {boolean} True if user is admin
 */
export const isUserAdmin = (user, roleMap = {}) => {
    const role = getUserRoleSync(user, roleMap);
    return role === 'admin';
};

/**
 * Get role badge class for styling
 * @param {string} role - Role name
 * @returns {string} CSS class for role badge
 */
export const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin':
            return 'badge-primary';
        case 'manager':
            return 'badge-secondary';
        case 'employee':
        case 'user':
        default:
            return 'badge-ghost';
    }
};

/**
 * Get role color class for styling
 * @param {string} role - Role name
 * @returns {string} CSS class for role color
 */
export const getRoleColorClass = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin':
            return 'bg-blue-100 text-blue-700';
        case 'manager':
            return 'bg-purple-100 text-purple-700';
        case 'employee':
        case 'user':
        default:
            return 'bg-green-100 text-green-700';
    }
};

/**
 * Format role name for display
 * @param {string} role - Role name
 * @returns {string} Formatted role name
 */
export const formatRoleName = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};