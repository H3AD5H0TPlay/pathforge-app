import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import './JobCard.css';

const JobCard = ({ job, index, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'var(--primary-color)';
      case 'interview': return 'var(--warning-color)';
      case 'offer': return 'var(--success-color)';
      case 'rejected': return 'var(--error-color)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (typeof salary === 'number') {
      return `$${salary.toLocaleString()}`;
    }
    return salary;
  };

  return (
    <Draggable draggableId={job.id} index={index} isDragDisabled={false}>
      {(provided, snapshot) => (
        <div 
          className={`job-card ${snapshot.isDragging ? 'dragging' : ''}`} 
          data-job-id={job.id}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="job-card-header">
            <h3 className="job-title">{job.title}</h3>
            <span 
              className="job-status"
              style={{ backgroundColor: getStatusColor(job.status) }}
            >
              {job.status}
            </span>
          </div>
          
          <div className="job-company">
            <span className="company-name">{job.company}</span>
            {job.location && <span className="job-location">{job.location}</span>}
          </div>

          {job.salary && (
            <div className="job-salary">
              {formatSalary(job.salary)}
            </div>
          )}

          <div className="job-dates">
            <span className="applied-date">
              Applied: {formatDate(job.appliedDate)}
            </span>
            {job.lastUpdate && (
              <span className="last-update">
                Updated: {formatDate(job.lastUpdate)}
              </span>
            )}
          </div>

          {job.notes && (
            <div className="job-notes">
              <p>{job.notes}</p>
            </div>
          )}

          <div className="job-actions">
            <button className="btn-secondary">Edit</button>
            <button className="btn-primary">View Details</button>
            <button 
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(job.id);
              }}
              title="Delete job application"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default JobCard;