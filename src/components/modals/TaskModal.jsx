import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Tag, FileText, Users, 
  Repeat, Paperclip, MessageSquare, Link
} from 'lucide-react';

export default function TaskModal({ 
  show, 
  onClose, 
  onSubmit, 
  initialTask = {}, 
  users = [], 
  mode = 'create',
  submitting = false 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: [],
    dueDate: '',
    category: 'general',
    recurrence: {
      frequency: 'none',
      endDate: null
    },
    comments: [],
    attachments: [],
    linkedMemos: [],
    delegatedTo: null,
    ...initialTask
  });

  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);

  useEffect(() => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignedTo: [],
      dueDate: '',
      category: 'general',
      recurrence: {
        frequency: 'none',
        endDate: null
      },
      comments: [],
      attachments: [],
      linkedMemos: [],
      delegatedTo: null,
      ...initialTask
    });
    setActiveTab('details');
  }, [initialTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-2xl bg-base-100 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200 mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="text-lg font-semibold">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="max-h-[calc(85vh-8rem)] overflow-y-auto p-4">
          {/* Tabs */}
          <div className="flex border-b mb-4 overflow-x-auto no-scrollbar">
            <button
              className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'details' ? 'border-b-2 border-primary font-medium' : 'text-base-content/70'}`}
              onClick={() => setActiveTab('details')}
            >
              <FileText className="h-4 w-4" />
              <span>Details</span>
            </button>
            <button
              className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'comments' ? 'border-b-2 border-primary font-medium' : 'text-base-content/70'}`}
              onClick={() => setActiveTab('comments')}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Comments</span>
                {formData.comments?.length > 0 && (
                  <span className="badge badge-sm badge-primary">{formData.comments.length}</span>
                )}
              </div>
            </button>
            <button
              className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'attachments' ? 'border-b-2 border-primary font-medium' : 'text-base-content/70'}`}
              onClick={() => setActiveTab('attachments')}
            >
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span>Attachments</span>
                {formData.attachments?.length > 0 && (
                  <span className="badge badge-sm badge-primary">{formData.attachments.length}</span>
                )}
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                type="text"
                placeholder="Task title"
                className="input input-bordered w-full"
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                placeholder="Task description"
                className="textarea textarea-bordered w-full h-24"
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.status}
                  onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Priority</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.priority}
                  onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Assigned To</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.assignedTo?.[0] || ''}
                onChange={e => setFormData(f => ({ ...f, assignedTo: [e.target.value] }))}
              >
                <option value="">Select Assignee</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Due Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Category</span>
              </label>
              <input
                type="text"
                placeholder="Task category"
                className="input input-bordered w-full"
                value={formData.category}
                onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
              />
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Recurrence</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                      className="select select-bordered w-full"
                      value={formData.recurrence?.frequency || 'none'}
                      onChange={e => setFormData(f => ({
                        ...f,
                        recurrence: { ...f.recurrence, frequency: e.target.value }
                      }))}
                    >
                      <option value="none">No Recurrence</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {formData.recurrence?.frequency !== 'none' && (
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={formData.recurrence?.endDate ? new Date(formData.recurrence.endDate).toISOString().split('T')[0] : ''}
                        onChange={e => setFormData(f => ({
                          ...f,
                          recurrence: { ...f.recurrence, endDate: e.target.value }
                        }))}
                        placeholder="End Date"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <div className="space-y-4">
                  {formData.comments?.length === 0 ? (
                    <div className="text-center py-8 text-base-content/60">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No comments yet</p>
                      <p className="text-sm">Be the first to comment on this task</p>
                    </div>
                  ) : (
                    formData.comments?.map((comment, index) => (
                      <div key={index} className="bg-base-200 rounded-lg p-3 hover:bg-base-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.user?.name || 'User'}</span>
                              <span className="text-xs text-base-content/60">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="input input-bordered flex-1"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (!newComment.trim()) return;
                      setFormData(f => ({
                        ...f,
                        comments: [...(f.comments || []), {
                          text: newComment,
                          createdAt: new Date().toISOString()
                        }]
                      }));
                      setNewComment('');
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {formData.attachments?.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between bg-base-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{attachment.filename}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => {
                          setFormData(f => ({
                            ...f,
                            attachments: f.attachments.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData(f => ({
                          ...f,
                          attachments: [...(f.attachments || []), {
                            filename: file.name,
                            file
                          }]
                        }));
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-base-300">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 
              <span className="loading loading-spinner"></span> : 
              mode === 'create' ? 'Create Task' : 'Save Changes'
            }
          </button>
        </div>
      </div>
    </div>
  );
}