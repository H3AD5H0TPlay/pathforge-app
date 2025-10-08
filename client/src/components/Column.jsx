import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import JobCard from './JobCard';
import './Column.css';

const Column = ({ column, jobs, index, onAddJob, onDeleteJob }) => {
  const getColumnColor = (status) => {
    switch (status) {
      case 'applied': return '#667eea';
      case 'interview': return '#f59e0b';
      case 'offer': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="column">
      <div 
        className="column-header"
        style={{ borderTopColor: getColumnColor(column.id) }}
      >
        <h2 className="column-title">{column.title}</h2>
        <span className="job-count">{jobs.length}</span>
      </div>
      
      <Droppable 
        droppableId={column.id} 
        isDropDisabled={false} 
        isCombineEnabled={false}
        ignoreContainerClipping={false}
        renderClone={undefined}
      >
        {(provided, snapshot) => (
          <div
            className={`job-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {jobs.map((job, index) => (
              <JobCard 
                key={job.id} 
                job={job} 
                index={index}
                onDelete={onDeleteJob}
              />
            ))}
            {provided.placeholder}
            
            {jobs.length === 0 && (
              <div className="empty-column">
                <p>No jobs in this stage</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
      
      <div className="column-footer">
        <button 
          className="add-job-btn"
          onClick={onAddJob}
        >
          + Add Job
        </button>
      </div>
    </div>
  );
};

export default Column;