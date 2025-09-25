import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import UserAvatar from '../ui/UserAvatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

const KanbanBoard = ({ tasks, onDragEnd, users, getUserById, onViewTask, isLoading }) => {
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

  // Split columns into two rows: first 3, then 2
  const firstRow = ["todo", "in_progress", "completed"];
  const secondRow = ["blocked", "cancelled"];

  return (
    <div className="flex flex-col gap-4 p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* First row: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {firstRow.map(columnId => {
            const column = columns[columnId];
            return (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-base-200 rounded-lg p-4 w-full h-[60vh] overflow-y-auto ${snapshot.isDraggingOver ? 'bg-base-300' : ''}`}
                  >
                    <h2 className="font-bold mb-4">{column.name}</h2>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : column.items.length === 0 ? (
                      <div className="text-center text-base-content/60 py-8">No tasks in this column.</div>
                    ) : (
                      column.items.map((item, index) => {
                        const creator = getUserById(item.createdBy);
                        return (
                          <Draggable key={item._id} draggableId={item._id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-4 shadow-md cursor-pointer ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}`}
                                onClick={() => onViewTask(item)}
                              >
                                <CardHeader>
                                  <CardTitle>{item.title}</CardTitle>
                                  <span className={`badge badge-sm ${item.priority === 'high' ? 'badge-error' : item.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                                    {item.priority}
                                  </span>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm my-2">{item.description}</p>
                                </CardContent>
                                <CardFooter>
                                  <div className="flex items-center gap-2">
                                    {creator && <UserAvatar user={creator} size="w-8 h-8" />}
                                    <span className="text-xs font-semibold">{creator ? creator.name : 'Unknown'}</span>
                                  </div>
                                  <div className="flex -space-x-2">
                                    {item.assignedTo.map(assigneeId => {
                                      const user = getUserById(assigneeId);
                                      return user ? <UserAvatar key={user._id} user={user} size="w-8 h-8" /> : null;
                                    })}
                                  </div>
                                  {item.dueDate && <span className="text-xs">Due: {new Date(item.dueDate).toLocaleDateString()}</span>}
                                </CardFooter>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
        {/* Second row: 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secondRow.map(columnId => {
            const column = columns[columnId];
            return (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-base-200 rounded-lg p-4 w-full h-[60vh] overflow-y-auto ${snapshot.isDraggingOver ? 'bg-base-300' : ''}`}
                  >
                    <h2 className="font-bold mb-4">{column.name}</h2>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : column.items.length === 0 ? (
                      <div className="text-center text-base-content/60 py-8">No tasks in this column.</div>
                    ) : (
                      column.items.map((item, index) => {
                        const creator = getUserById(item.createdBy);
                        return (
                          <Draggable key={item._id} draggableId={item._id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-4 shadow-md cursor-pointer ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}`}
                                onClick={() => onViewTask(item)}
                              >
                                <CardHeader>
                                  <CardTitle>{item.title}</CardTitle>
                                  <span className={`badge badge-sm ${item.priority === 'high' ? 'badge-error' : item.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                                    {item.priority}
                                  </span>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm my-2">{item.description}</p>
                                </CardContent>
                                <CardFooter>
                                  <div className="flex items-center gap-2">
                                    {creator && <UserAvatar user={creator} size="w-8 h-8" />}
                                    <span className="text-xs font-semibold">{creator ? creator.name : 'Unknown'}</span>
                                  </div>
                                  <div className="flex -space-x-2">
                                    {item.assignedTo.map(assigneeId => {
                                      const user = getUserById(assigneeId);
                                      return user ? <UserAvatar key={user._id} user={user} size="w-8 h-8" /> : null;
                                    })}
                                  </div>
                                  {item.dueDate && <span className="text-xs">Due: {new Date(item.dueDate).toLocaleDateString()}</span>}
                                </CardFooter>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
