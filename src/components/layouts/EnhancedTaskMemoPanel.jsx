import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Bell,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Flag,
  Eye,
  MessageSquare
} from "lucide-react";
import { useTaskStore } from "../../store/useTaskStore";
import { useMemoStore } from "../../store/useMemoStore";
import { useAuthStore } from "../../store/useAuthStore";
import UserAvatar from "../ui/UserAvatar";

const EnhancedTaskMemoPanel = ({ activeTab, setActiveTab, isMobile = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const { authUser } = useAuthStore();
  const { tasks, getUserTasks, isUserTasksLoading } = useTaskStore();
  const { userMemos, getUserMemos, isUserMemosLoading } = useMemoStore();

  useEffect(() => {
    if (authUser?._id) {
      getUserTasks(authUser._id);
      getUserMemos(authUser._id);
    }
  }, [authUser, getUserTasks, getUserMemos]);

  // Filter tasks and memos based on search term
  const filteredTasks = (tasks || []).filter(task =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10); // Limit to 10 for panel

  const filteredMemos = (userMemos || []).filter(memo =>
    memo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memo.content?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10); // Limit to 10 for panel

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "text-error";
      case "high": return "text-warning";
      case "medium": return "text-info";
      case "low": return "text-success";
      default: return "text-base-content";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "text-error";
      case "high": return "text-warning"; 
      case "medium": return "text-info";
      case "low": return "text-success";
      default: return "text-base-content";
    }
  };

  const TaskItem = ({ task }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 bg-base-100 rounded-lg border border-base-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
          <h4 className="font-medium text-sm text-base-content truncate">{task.title}</h4>
        </div>
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
            <MoreVertical className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <p className="text-xs text-base-content/60 mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignedTo && <UserAvatar user={task.assignedTo} size="w-5 h-5" />}
          <span className={`badge badge-xs ${
            task.status === 'completed' ? 'badge-success' :
            task.status === 'in-progress' ? 'badge-info' : 'badge-ghost'
          }`}>
            {task.status}
          </span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-base-content/60">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );

  const MemoItem = ({ memo }) => {
    const isRead = memo.readBy?.some(read => read.user === authUser._id) || false;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 rounded-lg border transition-all cursor-pointer ${
          isRead 
            ? 'bg-base-100 border-base-300' 
            : 'bg-primary/5 border-primary/20 shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className={`h-4 w-4 ${getSeverityColor(memo.severity)}`} />
            <h4 className={`font-medium text-sm text-base-content ${!isRead ? 'font-semibold' : ''}`}>
              {memo.title}
            </h4>
          </div>
          <div className="flex items-center gap-1">
            {!isRead && <div className="w-2 h-2 bg-primary rounded-full"></div>}
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                <MoreVertical className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-base-content/60 mb-3 line-clamp-2">{memo.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserAvatar user={memo.createdBy} size="w-5 h-5" />
            <span className="text-xs text-base-content/60">{memo.createdBy?.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-base-content/60">
            <Clock className="h-3 w-3" />
            {new Date(memo.createdAt).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`flex flex-col bg-base-100 ${isMobile ? 'h-64' : 'h-full'}`}>
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-3">
          <div className="tabs tabs-boxed tabs-sm">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`tab gap-2 ${activeTab === "tasks" ? "tab-active" : ""}`}
            >
              <CheckSquare className="h-4 w-4" />
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("memos")}
              className={`tab gap-2 ${activeTab === "memos" ? "tab-active" : ""}`}
            >
              <Bell className="h-4 w-4" />
              Memos
            </button>
          </div>
          
          <button className="btn btn-primary btn-xs gap-1">
            <Plus className="h-3 w-3" />
            New
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-base-content/40" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered input-xs w-full pl-8"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence mode="wait">
          {activeTab === "tasks" ? (
            <motion.div
              key="tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {isUserTasksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading loading-spinner loading-sm"></div>
                </div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskItem key={task._id} task={task} />
                ))
              ) : (
                <div className="text-center py-8 text-base-content/60">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks found</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="memos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {isUserMemosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading loading-spinner loading-sm"></div>
                </div>
              ) : filteredMemos.length > 0 ? (
                filteredMemos.map((memo) => (
                  <MemoItem key={memo._id} memo={memo} />
                ))
              ) : (
                <div className="text-center py-8 text-base-content/60">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No memos found</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-base-300">
        <div className="flex items-center justify-between text-xs text-base-content/60">
          <span>
            {activeTab === "tasks" ? filteredTasks.length : filteredMemos.length} {activeTab}
          </span>
          <button className="btn btn-ghost btn-xs">View All</button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTaskMemoPanel;