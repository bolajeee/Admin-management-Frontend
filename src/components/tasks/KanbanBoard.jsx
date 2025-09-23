import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import UserAvatar from '../ui/UserAvatar';

const KanbanBoard = ({ tasks, onDragEnd, users, getUserById, onViewTask }) => {
  const columns = {
    todo: {
      name: 'To Do',
      items: tasks.filter(task => task.status === 'todo'),
    },
    in_progress: {
      name: 'In Progress',
      items: tasks.filter(task => task.status === 'in_progress'),
    },
    completed: {
      name: 'Completed',
      items: tasks.filter(task => task.status === 'completed'),
    },
    blocked: {
      name: 'Blocked',
      items: tasks.filter(task => task.status === 'blocked'),
    },
    cancelled: {
      name: 'Cancelled',
      items: tasks.filter(task => task.status === 'cancelled'),
    },
  };

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-base-200 rounded-lg p-4 w-80 flex-shrink-0"
                >
                  <h2 className="font-bold mb-4">{column.name}</h2>
                  {column.items.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-base-100 rounded-lg p-4 mb-4 shadow-md cursor-pointer"
                          onClick={() => onViewTask(item)}
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-bold">{item.title}</p>
                            <span className={`badge badge-sm ${item.priority === 'high' ? 'badge-error' : item.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-sm my-2">{item.description}</p>
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex -space-x-2">
                              {item.assignedTo.map(assigneeId => {
                                const user = getUserById(assigneeId);
                                return user ? <UserAvatar key={user._id} user={user} size="w-8 h-8" /> : null;
                              })}
                            </div>
                            {item.dueDate && <span className="text-xs">Due: {new Date(item.dueDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
