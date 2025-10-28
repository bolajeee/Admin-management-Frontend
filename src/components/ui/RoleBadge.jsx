import React, { useState, useEffect } from 'react';
import { getUserRoleSync, getRoleBadgeClass, formatRoleName, fetchRoleMap } from '../../utils/roleUtils';
import { axiosInstance } from '../../lib/axios';

/**
 * RoleBadge component for consistent role display across the application
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Badge size ('sm', 'md', 'lg')
 * @param {Object} props.roleMap - Pre-fetched role mapping (optional)
 */
const RoleBadge = ({ user, className = '', size = 'sm', roleMap: propRoleMap }) => {
  const [roleMap, setRoleMap] = useState(propRoleMap || {});
  const [loading, setLoading] = useState(!propRoleMap);

  useEffect(() => {
    if (!propRoleMap) {
      fetchRoleMap(axiosInstance).then(map => {
        setRoleMap(map);
        setLoading(false);
      });
    }
  }, [propRoleMap]);

  if (loading && !propRoleMap) {
    return (
      <span className={`badge badge-ghost ${size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : ''} ${className}`}>
        <span className="loading loading-spinner loading-xs"></span>
      </span>
    );
  }

  const role = getUserRoleSync(user, roleMap);
  const badgeClass = getRoleBadgeClass(role);
  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';

  return (
    <span className={`badge ${badgeClass} ${sizeClass} ${className}`}>
      {formatRoleName(role)}
    </span>
  );
};

export default RoleBadge;