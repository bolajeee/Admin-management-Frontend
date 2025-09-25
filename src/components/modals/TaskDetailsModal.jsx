import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import UserAvatar from '../ui/UserAvatar';
import ConfirmationModal from './ConfirmationModal';
import { axiosInstance } from '../../lib/axios';

function TaskDetailsModal({ task, onClose, onDelete, users, getUserById, setUserInfoSidebar }) {
  const { getTaskAuditLog, addTaskComment, getTaskComments, uploadTaskAttachment, listTaskAttachments, deleteTaskAttachment } = useTaskStore();
  const [tab, setTab] = useState('comments');
  const [auditLog, setAuditLog] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const backendUrl = 'http://localhost:5000';

  useEffect(() => {
    if (task.deleted) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [task.deleted, onClose]);

  useEffect(() => {
    if (tab === 'attachments') {
      setLoadingAttachments(true);
      listTaskAttachments(task._id)
        .then(files => setAttachments(files))
        .catch(() => setAttachments([]))
        .finally(() => setLoadingAttachments(false));
    } else if (tab === 'comments') {
      setLoadingComments(true);
      getTaskComments(task._id)
        .then(data => setComments(data))
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false));
    } else if (tab === 'activity') {
      setLoadingAudit(true);
      getTaskAuditLog(task._id)
        .then(data => setAuditLog(data))
        .catch(() => setAuditLog([]))
        .finally(() => setLoadingAudit(false));
    }
  }, [tab, task._id, listTaskAttachments, getTaskComments, getTaskAuditLog]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);
    try {
      await addTaskComment(task._id, { text: commentText });
      setCommentText('');
      // Refresh comments
      setLoadingComments(true);
      const newComments = await getTaskComments(task._id);
      setComments(newComments);
    } catch (err) {
      setCommentError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
      setLoadingComments(false);
    }
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAttachment(true);
    setAttachmentError(null);
    try {
      await uploadTaskAttachment(task._id, file);
      // Refresh attachments
      setLoadingAttachments(true);
      const newFiles = await listTaskAttachments(task._id);
      setAttachments(newFiles);
    } catch (err) {
      setAttachmentError('Failed to upload attachment');
    } finally {
      setUploadingAttachment(false);
      setLoadingAttachments(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    setAttachmentError(null);
    try {
      await deleteTaskAttachment(task._id, attachmentId);
      // Refresh attachments
      setLoadingAttachments(true);
      const newFiles = await listTaskAttachments(task._id);
      setAttachments(newFiles);
    } catch (err) {
      setAttachmentError('Failed to delete attachment');
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId, filename) => {
    try {
      const response = await axiosInstance.get(`/tasks/${task._id}/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      setAttachmentError('Failed to download attachment');
    }
  };

  const confirmDeleteTask = async () => {
    await onDelete(task._id);
    setShowDeleteModal(false);
  };

  return (  
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-base-100 p-0 rounded-xl shadow-2xl w-[95vw] max-w-2xl flex flex-col overflow-hidden">
          {task.deleted ? (
            <div className="flex flex-col items-center justify-center p-12">
              <h2 className="text-2xl font-bold mb-4">Task Deleted</h2>
              <p className="mb-6 text-base-content/70">This task has been deleted and is no longer available.</p>
              <button className="btn btn-primary" onClick={onClose}>Close</button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center px-6 pt-6 pb-2 border-b border-base-300 bg-base-200">
                <h2 className="text-2xl font-bold">Task Details</h2>
                <button className="btn btn-sm" onClick={onClose}>Close</button>
              </div>
              {/* Delete button with confirmation */}
              <div className="flex justify-end px-6 pt-2">
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Task
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {/* Left: Task Info */}
                <div className="flex-1 min-w-[250px] space-y-6 bg-base-100 rounded-xl shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-2xl text-primary">{task.title}</div>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} title="Close"><span className="text-xl">×</span></button>
                  </div>
                  {/* Assignees */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-base-content/80">Assignees</span>
                      <span className="badge badge-primary badge-sm">{(task.assignedTo || []).length}</span>
                      </div>
                    <div className="flex gap-2 flex-wrap">
                      {(task.assignedTo || []).map(uid => {
                        const userId = typeof uid === 'object' ? uid._id || uid.id || JSON.stringify(uid) : uid;
                        const user = getUserById(userId);
                        if (!user) return null;
                        return (
                          <UserAvatar
                            key={userId}
                            user={user}
                            size="w-10 h-10"
                            textSize="text-base"
                            onClick={setUserInfoSidebar}
                          />
                        );
                      })}
                    </div>
                  </div>
                  {/* Task Properties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                      <span className="material-icons text-base-content/60 text-sm">flag</span> {task.status}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                      <span className="material-icons text-base-content/60 text-sm">priority_high</span> {task.priority}
                    </span>
                    {task.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                        <span className="material-icons text-base-content/60 text-sm">category</span> {task.category}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                        <span className="material-icons text-base-content/60 text-sm">event</span> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.recurrence?.frequency && task.recurrence.frequency !== 'none' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border border-base-300 bg-base-200 text-xs">
                        <span className="material-icons text-base-content/60 text-sm">repeat</span> {task.recurrence.frequency}
                      </span>
                    )}
                  </div>
                  {/* Description */}
                  <div className="mb-2">
                    <div className="font-medium text-base-content/80 mb-1">Description</div>
                    <div className="text-base-content/90 whitespace-pre-line bg-base-200 rounded p-3 shadow-inner min-h-[48px]">{task.description || <span className="text-base-content/40">No description</span>}</div>
                  </div>
                </div>
                {/* Right: Tabs (Details, Comments, Attachments, Activity) */}
                <div className="w-full md:w-80 bg-base-200 rounded-xl p-4 flex flex-col gap-2 border-l border-base-300">
                  <div className="flex gap-2 border-b pb-2 mb-2">
                    <button className={`btn btn-xs ${tab === 'comments' ? 'btn-primary' : ''}`} onClick={() => setTab('comments')}>Comments</button>
                    <button className={`btn btn-xs ${tab === 'attachments' ? 'btn-primary' : ''}`} onClick={() => setTab('attachments')}>Attachments</button>
                    <button className={`btn btn-xs ${tab === 'activity' ? 'btn-primary' : ''}`} onClick={() => setTab('activity')}>Activity</button>
                  </div>
                  {tab === 'comments' && (
                    <>
                      <div className="bg-base-100 rounded-lg p-3 shadow-inner">
                        <div className="font-semibold mb-2">Comments</div>
                        <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                          <input
                            type="text"
                            className="input input-bordered flex-1"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            disabled={submittingComment}
                            required
                          />
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submittingComment || !commentText.trim()}
                          >
                            {submittingComment ? 'Adding...' : 'Add'}
                          </button>
                        </form>
                        {commentError && <div className="text-error text-sm mb-2">{commentError}</div>}
                        {loadingComments ? (
                          <div className="text-base-content/70">Loading comments...</div>
                        ) : comments.length === 0 ? (
                          <div className="text-base-content/70">No comments yet.</div>
                        ) : (
                          <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {comments.map((c) => {
                              // Fix: Correctly access the comment text using c.text instead of c.comment
                              const commentText = c.text || c.comment || "";
                              const user = c.user && typeof c.user === 'object'
                                ? c.user
                                : users.find(u => u._id === c.user) || {};

                              return (
                                <li key={c._id || c.id} className="border-b pb-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {user.profilePicture && user.profilePicture.trim() !== "" ? (
                                      <img src={user.profilePicture} alt={user.name || user.email || 'User'} className="w-6 h-6 rounded-full border border-primary" />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full border border-primary bg-base-300 flex items-center justify-center text-xs font-bold text-primary">
                                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="font-semibold text-xs text-primary">{user.name || user.email || 'User'}</span>
                                    <span className="text-xs text-base-content/60">{new Date(c.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div className="text-sm whitespace-pre-wrap">{commentText}</div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </>
                  )}
                  {tab === 'attachments' && (
                    <div className="bg-base-100 rounded-lg p-3 shadow-inner">
                      <div className="font-semibold mb-2">Attachments</div>
                      <div className="mb-4">
                        <input type="file" onChange={handleUploadAttachment} className="file-input file-input-bordered w-full" disabled={uploadingAttachment} />
                        {attachmentError && <div className="text-error text-sm mt-2">{attachmentError}</div>}
                        {uploadingAttachment && <div className="text-base-content/70 mt-2">Uploading...</div>}
                      </div>
                      {loadingAttachments ? (
                        <div className="text-base-content/70">Loading attachments...</div>
                      ) : attachments.length === 0 ? (
                        <div className="text-base-content/70">No attachments yet.</div>
                      ) : (
                        <div className="space-y-4 max-h-72 overflow-y-auto">
                          {attachments.map((a) => (
                            <div key={a._id || a.id} className="border border-base-300 rounded-lg overflow-hidden">
                              <div className="p-3 bg-base-100">
                                <div className="flex justify-between items-center">
                                  <div className="truncate flex-1">
                                    <p className="font-medium truncate">{a.filename || a.name || 'File'}</p>
                                    <p className="text-xs text-base-content/60">
                                      {((a.size || 0) / 1024).toFixed(1)} KB • Uploaded {a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : 'recently'}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleDownloadAttachment(a._id, a.filename || a.name || 'File')}
                                      className="btn btn-xs btn-secondary"
                                      title="Download file"
                                    >
                                      Download
                                    </button>
                                    <button
                                      className="btn btn-xs btn-error"
                                      onClick={() => handleDeleteAttachment(a._id)}
                                      disabled={uploadingAttachment}
                                      title="Delete attachment"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {tab === 'activity' && (
                    <div className="bg-base-100 rounded-lg p-3 shadow-inner max-h-60 overflow-y-auto">
                      <div className="font-semibold mb-2">Activity Log</div>
                      {loadingAudit ? (
                        <div className="text-base-content/70">Loading activity...</div>
                      ) : auditLog.length === 0 ? (
                        <div className="text-base-content/70">No activity found.</div>
                      ) : (
                        <ul className="space-y-2">
                          {auditLog.map((log, index) => {
                            const formattedDate = log.timestamp || log.createdAt || log.updatedAt
                              ? new Date(log.timestamp || log.createdAt || log.updatedAt).toLocaleString()
                              : 'Unknown date';
                            const key = log._id || log.id || `activity-${index}`;
                            return (
                              <li key={key} className="border-b pb-1">
                                <div className="text-xs text-base-content/60">
                                  {formattedDate !== 'Invalid Date' ? formattedDate : 'Date not available'}
                                </div>
                                <div className="text-sm">{log.action} {log.details && `- ${log.details}`}</div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteTask}
                title="Delete Task"
                message={`Are you sure you want to delete this task?`}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default TaskDetailsModal;
