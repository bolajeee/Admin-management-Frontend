import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  MessageSquare,
  Bell,
  CheckSquare,
  FileText,
  Settings,
  Clock,
  ArrowRight,
  Command
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Mock search data - replace with actual API calls
  const searchData = [
    // Users
    { id: 1, type: 'user', title: 'John Doe', subtitle: 'Software Engineer', url: '/admin/employees/1', icon: Users },
    { id: 2, type: 'user', title: 'Jane Smith', subtitle: 'Product Manager', url: '/admin/employees/2', icon: Users },
    
    // Tasks
    { id: 3, type: 'task', title: 'Update Documentation', subtitle: 'Due tomorrow', url: '/admin/tasks/3', icon: CheckSquare },
    { id: 4, type: 'task', title: 'Fix Login Bug', subtitle: 'High priority', url: '/admin/tasks/4', icon: CheckSquare },
    
    // Memos
    { id: 5, type: 'memo', title: 'Team Meeting', subtitle: 'Weekly standup', url: '/admin/memos/5', icon: Bell },
    { id: 6, type: 'memo', title: 'Policy Update', subtitle: 'Remote work guidelines', url: '/admin/memos/6', icon: Bell },
    
    // Messages
    { id: 7, type: 'message', title: 'Chat with John', subtitle: 'Last message: "Thanks!"', url: '/admin/messages/7', icon: MessageSquare },
    
    // Reports
    { id: 8, type: 'report', title: 'Monthly Analytics', subtitle: 'Performance metrics', url: '/admin/reports/8', icon: FileText },
    
    // Settings
    { id: 9, type: 'setting', title: 'User Management', subtitle: 'Manage user accounts', url: '/admin/employees', icon: Settings },
    { id: 10, type: 'setting', title: 'System Settings', subtitle: 'Configure system', url: '/admin/settings', icon: Settings }
  ];

  // Search function
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 8)); // Limit results
      setSelectedIndex(0);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleResultClick = (result) => {
    navigate(result.url);
    onClose();
    setQuery('');
  };

  const getTypeColor = (type) => {
    const colors = {
      user: 'text-blue-500',
      task: 'text-green-500',
      memo: 'text-yellow-500',
      message: 'text-purple-500',
      report: 'text-indigo-500',
      setting: 'text-gray-500'
    };
    return colors[type] || 'text-base-content';
  };

  const getTypeBadge = (type) => {
    const badges = {
      user: 'User',
      task: 'Task',
      memo: 'Memo',
      message: 'Message',
      report: 'Report',
      setting: 'Setting'
    };
    return badges[type] || type;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="p-4 border-b border-base-300">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search users, tasks, memos, messages..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-none outline-none text-base-content placeholder-base-content/50 text-lg"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <kbd className="kbd kbd-sm">⌘</kbd>
                  <kbd className="kbd kbd-sm">K</kbd>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                  <p className="text-base-content/60 mt-2">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, index) => {
                    const IconComponent = result.icon;
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultClick(result)}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-base-200 transition-colors text-left ${
                          isSelected ? 'bg-primary/10 border-r-2 border-r-primary' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-base-200 ${getTypeColor(result.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-base-content truncate">
                              {result.title}
                            </h3>
                            <span className={`badge badge-sm ${getTypeColor(result.type)} bg-opacity-20`}>
                              {getTypeBadge(result.type)}
                            </span>
                          </div>
                          <p className="text-sm text-base-content/60 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                        
                        {isSelected && (
                          <ArrowRight className="h-4 w-4 text-primary" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ) : query.trim() ? (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 text-base-content/30 mx-auto mb-3" />
                  <p className="text-base-content/60">No results found for "{query}"</p>
                  <p className="text-sm text-base-content/40 mt-1">
                    Try searching for users, tasks, memos, or messages
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Command className="h-12 w-12 text-base-content/30 mx-auto mb-3" />
                  <p className="text-base-content/60">Start typing to search</p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm text-base-content/40">
                    <div className="flex items-center gap-1">
                      <kbd className="kbd kbd-sm">↑</kbd>
                      <kbd className="kbd kbd-sm">↓</kbd>
                      <span>Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="kbd kbd-sm">↵</kbd>
                      <span>Select</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="kbd kbd-sm">Esc</kbd>
                      <span>Close</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {results.length > 0 && (
              <div className="p-3 border-t border-base-300 bg-base-50 text-center">
                <p className="text-xs text-base-content/50">
                  Showing {results.length} results • Use ↑↓ to navigate • Enter to select
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;