import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useAdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('');
  const location = useLocation();

  // Update active nav item based on current route
  useEffect(() => {
    const path = location.pathname;
    const activeItem = path.split('/').pop() || 'dashboard';
    setActiveNavItem(activeItem);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return {
    mobileMenuOpen,
    activeNavItem,
    toggleMobileMenu,
    closeMobileMenu,
  };
}
