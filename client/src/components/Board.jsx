import React, { useState } from 'react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import Column from './Column';
import './Board.css';

// Hard-coded data for initial development
const initialData = {
  jobs: {
    'job-1': {
      id: 'job-1',
      title: 'Senior React Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: 120000,
      status: 'applied',
      appliedDate: '2024-01-15',
      lastUpdate: '2024-01-16',
      notes: 'Great company culture, remote-first approach. Looking for someone with 5+ years React experience.'
    },
    'job-2': {
      id: 'job-2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '100k - 130k',
      status: 'interview',
      appliedDate: '2024-01-10',
      lastUpdate: '2024-01-18',
      notes: 'Technical interview scheduled for next week. Focus on system design and algorithms.'
    },
    'job-3': {
      id: 'job-3',
      title: 'Frontend Developer',
      company: 'Design Studios',
      location: 'New York, NY',
      salary: 95000,
      status: 'applied',
      appliedDate: '2024-01-12',
      lastUpdate: '2024-01-14',
      notes: 'Creative agency with focus on UI/UX. Portfolio review pending.'
    },
    'job-4': {
      id: 'job-4',
      title: 'Software Engineer',
      company: 'Big Tech Corp',
      location: 'Seattle, WA',
      salary: 150000,
      status: 'offer',
      appliedDate: '2023-12-20',
      lastUpdate: '2024-01-19',
      notes: 'Received offer! Need to negotiate salary and start date. Great benefits package.'
    },
    'job-5': {
      id: 'job-5',
      title: 'React Native Developer',
      company: 'Mobile First',
      location: 'Austin, TX',
      salary: 110000,
      status: 'rejected',
      appliedDate: '2024-01-05',
      lastUpdate: '2024-01-17',
      notes: 'Not selected for final round. Feedback: good technical skills but looking for more mobile experience.'
    },
    'job-6': {
      id: 'job-6',
      title: 'Lead Developer',
      company: 'Enterprise Solutions',
      location: 'Chicago, IL',
      salary: 140000,
      status: 'interview',
      appliedDate: '2024-01-08',
      lastUpdate: '2024-01-19',
      notes: 'Leadership role with team of 8 developers. Final interview with VP Engineering tomorrow.'
    }
  },
  columns: {
    'applied': {
      id: 'applied',
      title: 'Applied',
      jobIds: ['job-1', 'job-3']
    },
    'interview': {
      id: 'interview',
      title: 'Interview',
      jobIds: ['job-2', 'job-6']
    },
    'offer': {
      id: 'offer',
      title: 'Offer',
      jobIds: ['job-4']
    },
    'rejected': {
      id: 'rejected',
      title: 'Rejected',
      jobIds: ['job-5']
    }
  },
  columnOrder: ['applied', 'interview', 'offer', 'rejected']
};

const Board = () => {
  const [data, setData] = useState(initialData);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // If no destination, do nothing
    if (!destination) {
      return;
    }

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    // Moving within the same column
    if (start === finish) {
      const newJobIds = Array.from(start.jobIds);
      newJobIds.splice(source.index, 1);
      newJobIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        jobIds: newJobIds
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn
        }
      });
      return;
    }

    // Moving between columns
    const startJobIds = Array.from(start.jobIds);
    startJobIds.splice(source.index, 1);
    const newStart = {
      ...start,
      jobIds: startJobIds
    };

    const finishJobIds = Array.from(finish.jobIds);
    finishJobIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      jobIds: finishJobIds
    };

    // Update job status when moving between columns
    const updatedJob = {
      ...data.jobs[draggableId],
      status: destination.droppableId,
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    setData({
      ...data,
      jobs: {
        ...data.jobs,
        [draggableId]: updatedJob
      },
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    });
  };

  return (
    <div className="board">
      <div className="board-header">
        <h1>Job Application Tracker</h1>
        <div className="board-stats">
          <span className="stat">
            <strong>{Object.keys(data.jobs).length}</strong> Total Applications
          </span>
          <span className="stat">
            <strong>{data.columns.interview.jobIds.length + data.columns.offer.jobIds.length}</strong> Active
          </span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-content">
          {data.columnOrder.map((columnId, index) => {
            const column = data.columns[columnId];
            const jobs = column.jobIds.map(jobId => data.jobs[jobId]);

            return (
              <Draggable key={column.id} draggableId={column.id} index={index} isDragDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Column
                      key={column.id}
                      column={column}
                      jobs={jobs}
                      index={index}
                    />
                  </div>
                )}
              </Draggable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;