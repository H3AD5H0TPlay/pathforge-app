import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../contexts/AuthContext';
import Column from './Column';
import AddJobForm from './AddJobForm';
import './Board.css';

// Initial empty data structure
const emptyData = {
  jobs: {},
  columns: {
    'applied': {
      id: 'applied',
      title: 'Applied',
      jobIds: []
    },
    'interview': {
      id: 'interview',
      title: 'Interview',
      jobIds: []
    },
    'offer': {
      id: 'offer',
      title: 'Offer',
      jobIds: []
    },
    'rejected': {
      id: 'rejected',
      title: 'Rejected',
      jobIds: []
    }
  },
  columnOrder: ['applied', 'interview', 'offer', 'rejected']
};

const Board = () => {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('demoMode') === 'true';
  });

  // Debug logging (only show if needed)
  useEffect(() => {
    if (token) {
      console.log('✅ Token loaded:', token.substring(0, 20) + '...');
    } else {
      console.log('ℹ️ No authentication token - click "Login for Testing" to authenticate');
    }
  }, [token]);

  // Demo login function for testing
  const handleDemoLogin = async () => {
    if (isLoggingIn) return; // Prevent multiple simultaneous login attempts
    
    try {
      setIsLoggingIn(true);
      setError(''); // Clear any previous errors
      console.log('Starting demo login process...');
      console.log('Axios base URL:', axios.defaults.baseURL);
      
      // First, test if the auth endpoints are reachable
      console.log('Testing backend endpoints...');
      try {
        // Test if the auth routes are working by checking a simple endpoint
        const testResponse = await axios.get('/auth/test').catch(() => null);
        console.log('Auth endpoint test result:', testResponse ? 'Available' : 'Not available');
      } catch (e) {
        console.log('Auth endpoint test completed, proceeding...');
      }
      
      // First try to register a test user
      console.log('Attempting to register user at:', `${axios.defaults.baseURL}/auth/register`);
      let registerSuccess = false;
      
      try {
        const registerResponse = await axios.post('/auth/register', {
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpassword123'
        });
        console.log('✅ Registration successful:', registerResponse.data);
        registerSuccess = true;
      } catch (err) {
        console.log('⚠️ Registration failed:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          url: `${axios.defaults.baseURL}/auth/register`
        });
        
        // If user already exists (400 error), that's fine
        if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
          console.log('✅ User already exists, proceeding to login...');
          registerSuccess = true;
        } else {
          console.error('❌ Registration failed with unexpected error:', err.response?.data);
          // Continue anyway, maybe user exists
          registerSuccess = true;
        }
      }

      if (!registerSuccess) {
        throw new Error('Registration failed and cannot proceed to login');
      }

      // Now login to get the token
      console.log('Attempting login at:', `${axios.defaults.baseURL}/auth/login`);
      const loginResponse = await axios.post('/auth/login', {
        email: 'test@example.com',
        password: 'testpassword123'
      });

      console.log('Login response status:', loginResponse.status);
      console.log('Login response data:', loginResponse.data);

      if (loginResponse.data.success && loginResponse.data.token) {
        const newToken = loginResponse.data.token;
        
        // Store token with verification
        console.log('Storing token in localStorage...');
        localStorage.setItem('token', newToken);
        
        // Verify storage immediately
        const storedToken = localStorage.getItem('token');
        console.log('Token storage verification:', storedToken === newToken ? 'SUCCESS' : 'FAILED');
        console.log('Stored token preview:', storedToken ? storedToken.substring(0, 20) + '...' : 'NULL');
        
        // Update state
        setToken(newToken);
        console.log('Demo login successful, token stored and state updated');
        
        // Trigger a re-fetch of jobs with the new token
        setTimeout(() => {
          console.log('Fetching jobs with new token...');
          fetchJobs();
        }, 100);
      } else {
        throw new Error(`Login response invalid: ${JSON.stringify(loginResponse.data)}`);
      }
    } catch (err) {
      console.error('❌ Demo login error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        fullError: err
      });
      
      let errorMessage = 'Authentication failed';
      if (err.response?.status === 401) {
        errorMessage = 'Invalid credentials - this might indicate the backend database is not properly set up';
      } else if (err.response?.status === 500) {
        errorMessage = 'Backend server error - check if MongoDB is connected';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to backend server - check if it\'s running on port 3000';
      } else if (err.response?.data?.message) {
        errorMessage = `Backend error: ${err.response.data.message}`;
      } else {
        errorMessage = `Network error: ${err.message}`;
      }
      
      setError(errorMessage);
      
      // Offer a fallback demo mode
      console.log('🔄 Consider using demo mode without backend authentication');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      // Health endpoint is at root level, not under /api
      const healthURL = 'http://localhost:3000/health';
      // console.log('Checking backend health at:', healthURL); // Reduced logging
      const response = await axios.get(healthURL, { timeout: 5000 });
      // console.log('Backend health check response:', response.status); // Reduced logging
      setBackendStatus('connected');
      return true;
    } catch (err) {
      console.error('Backend health check failed:', {
        message: err.message,
        response: err.response?.status,
        baseURL: axios.defaults.baseURL,
        healthURL: 'http://localhost:3000/health'
      });
      setBackendStatus('disconnected');
      return false;
    }
  };

  // API Functions
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we're in demo mode (fake token)
      if (token && token.startsWith('demo-mode-token-')) {
        console.log('🎭 Demo mode detected - using sample data instead of API calls');
        // Use sample data for demo mode
        loadSampleData();
        return;
      }
      
      const response = await axios.get('/jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const jobs = response.data;
      
      // Transform jobs data to match our board structure
      const jobsById = {};
      const columnJobIds = {
        applied: [],
        interview: [],
        offer: [],
        rejected: []
      };

      jobs.forEach(job => {
        // Format job data for SQLite (uses regular id field, not _id)
        const formattedJob = {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          status: job.status,
          appliedDate: new Date(job.appliedDate).toISOString().split('T')[0],
          lastUpdate: new Date(job.updatedAt).toISOString().split('T')[0],
          notes: job.notes || '',
          description: job.description || '',
          requirements: job.requirements || [],
          postedBy: job.postedBy
        };

        jobsById[job.id] = formattedJob;
        
        // Add to appropriate column
        if (columnJobIds[job.status]) {
          columnJobIds[job.status].push(job.id);
        } else {
          columnJobIds.applied.push(job.id); // Default to applied if status is unknown
        }
      });

      // Update the data structure
      setData({
        jobs: jobsById,
        columns: {
          applied: { id: 'applied', title: 'Applied', jobIds: columnJobIds.applied },
          interview: { id: 'interview', title: 'Interview', jobIds: columnJobIds.interview },
          offer: { id: 'offer', title: 'Offer', jobIds: columnJobIds.offer },
          rejected: { id: 'rejected', title: 'Rejected', jobIds: columnJobIds.rejected }
        },
        columnOrder: ['applied', 'interview', 'offer', 'rejected']
      });

    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      console.log(`Updating job ${jobId} status to ${newStatus}`);
      
      // Handle demo mode - just return success without API call
      if (isDemoMode || (token && token.startsWith('demo-mode-token-'))) {
        console.log('🎭 Demo mode - simulating job status update');
        return true;
      }
      
      const response = await axios.patch(`/jobs/${jobId}`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Job status updated:', response.data);
      return true;
    } catch (err) {
      console.error('Error updating job status:', err);
      setError(err.response?.data?.message || 'Failed to update job status');
      // Re-fetch jobs to revert any local changes
      if (token && backendStatus === 'connected' && !isDemoMode) {
        fetchJobs();
      }
      return false;
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      console.log(`Deleting job ${jobId}`);
      
      // Handle demo mode - skip API call
      if (!isDemoMode && !(token && token.startsWith('demo-mode-token-'))) {
        await axios.delete(`/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Job deleted from backend');
      } else {
        console.log('🎭 Demo mode - simulating job deletion');
      }
      
      // Remove job from local state
      const newJobs = { ...data.jobs };
      delete newJobs[jobId];
      
      const newColumns = { ...data.columns };
      Object.keys(newColumns).forEach(columnId => {
        newColumns[columnId] = {
          ...newColumns[columnId],
          jobIds: newColumns[columnId].jobIds.filter(id => id !== jobId)
        };
      });
      
      setData({
        ...data,
        jobs: newJobs,
        columns: newColumns
      });
      
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const addJob = (newJob) => {
    console.log('Adding new job to board:', newJob);
    
    // Add job to jobs object (using SQLite id field, not _id)
    const newJobs = {
      ...data.jobs,
      [newJob.id]: {
        id: newJob.id,
        title: newJob.title,
        company: newJob.company,
        location: newJob.location,
        salary: newJob.salary,
        status: newJob.status,
        appliedDate: new Date(newJob.appliedDate).toISOString().split('T')[0],
        lastUpdate: new Date(newJob.updatedAt).toISOString().split('T')[0],
        notes: newJob.notes || '',
        description: newJob.description || '',
        requirements: newJob.requirements || [],
        postedBy: newJob.postedBy
      }
    };
    
    // Add job ID to appropriate column
    const newColumns = { ...data.columns };
    if (newColumns[newJob.status]) {
      newColumns[newJob.status] = {
        ...newColumns[newJob.status],
        jobIds: [...newColumns[newJob.status].jobIds, newJob.id]
      };
    }
    
    setData({
      ...data,
      jobs: newJobs,
      columns: newColumns
    });
  };

  const loadSampleData = () => {
    try {
      console.log('Loading sample data...');
      // Sample data for development testing
      const sampleJobs = {
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
      }
    };

    const sampleColumns = {
      applied: { id: 'applied', title: 'Applied', jobIds: ['job-1', 'job-3'] },
      interview: { id: 'interview', title: 'Interview', jobIds: ['job-2'] },
      offer: { id: 'offer', title: 'Offer', jobIds: ['job-4'] },
      rejected: { id: 'rejected', title: 'Rejected', jobIds: [] }
    };

    setData({
      jobs: sampleJobs,
      columns: sampleColumns,
      columnOrder: ['applied', 'interview', 'offer', 'rejected']
    });

    setLoading(false);
    setError(null);
    console.log('Sample data loaded successfully');
    } catch (err) {
      console.error('Error loading sample data:', err);
      setError('Failed to load sample data');
      setLoading(false);
    }
  };

  // Check backend status and fetch jobs on component mount
  useEffect(() => {
    // console.log('useEffect called with token:', token); // Reduced logging
    
    const initializeApp = async () => {
      // Check if we're in demo mode first
      if (isDemoMode || (token && token.startsWith('demo-mode-token-'))) {
        console.log('🎭 Demo mode detected - loading sample data immediately');
        loadSampleData();
        return;
      }
      
      // Always check backend status first
      const isBackendConnected = await checkBackendStatus();
      
      if (token && isBackendConnected) {
        console.log('Calling fetchJobs with token:', token);
        fetchJobs();
      } else {
        console.log('Using sample data for development - Backend:', isBackendConnected ? 'Connected' : 'Disconnected');
        // Load sample data for development
        loadSampleData();
      }
    };
    
    initializeApp();
  }, [token, isDemoMode]);

  const onDragEnd = async (result) => {
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

    // Optimistically update the UI
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

    // Update the job status on the server (only if we have a token and backend is connected)
    if (token && backendStatus === 'connected') {
      const success = await updateJobStatus(draggableId, destination.droppableId);
      if (!success) {
        // If API call failed, the fetchJobs call in updateJobStatus will revert the UI
        return;
      }
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="board">
        <div className="board-header">
          <h1>Job Application Tracker</h1>
        </div>
        <div className="board-loading">
          <p>Loading your job applications...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="board">
        <div className="board-header">
          <h1>Job Application Tracker</h1>
        </div>
        <div className="board-error">
          <p>Error: {error}</p>
          <button onClick={fetchJobs} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (Object.keys(data.jobs).length === 0) {
    return (
      <div className="board">
        <div className="board-header">
          <div className="header-left">
            <h1>Job Application Tracker</h1>
            <div className={`backend-status ${backendStatus}`}>
              <span className="status-dot"></span>
              Backend: {backendStatus === 'checking' ? 'Checking...' : 
                       backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
              {backendStatus === 'disconnected' && <span className="dev-mode"> (Dev Mode)</span>}
            </div>
          </div>
          {!token && backendStatus === 'connected' && (
            <div style={{display: 'flex', gap: '0.5rem', flexDirection: 'column'}}>
              <button 
                className="auth-btn"
                onClick={() => {
                  console.log('Login button clicked!');
                  handleDemoLogin();
                }}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Logging in...' : 'Login for Testing'}
              </button>
              <button 
                className="auth-btn"
                style={{fontSize: '0.8rem', padding: '0.3rem 0.8rem'}}
                onClick={() => {
                  console.log('Using demo mode without backend auth');
                  const demoToken = 'demo-mode-token-' + Date.now();
                  localStorage.setItem('token', demoToken);
                  localStorage.setItem('demoMode', 'true');
                  setToken(demoToken);
                  setIsDemoMode(true);
                  setError('');
                  console.log('✅ Demo mode activated - backend authentication bypassed');
                }}
              >
                Demo Mode (Skip Auth)
              </button>
            </div>
          )}
        </div>
        {error && (
          <div className="board-error" style={{margin: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444'}}>
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        <div className="board-empty">
          {!token ? (
            <>
              <h2>Welcome to PathForge!</h2>
              <p>Please log in to start tracking your job applications.</p>
              {backendStatus === 'connected' && (
                <p style={{color: '#f59e0b', marginTop: '1rem'}}>
                  Click "Login for Testing" in the top right to get started.
                </p>
              )}
            </>
          ) : (
            <>
              <h2>No Job Applications Yet</h2>
              <p>Start tracking your job applications by adding your first job!</p>
              <button 
                className="add-first-job-btn"
                onClick={() => setShowAddJobForm(true)}
              >
                Add Your First Job
              </button>
            </>
          )}
        </div>
        {showAddJobForm && (
          <AddJobForm
            token={token}
            onJobAdded={addJob}
            onClose={() => setShowAddJobForm(false)}
            isDemoMode={isDemoMode}
          />
        )}
      </div>
    );
  }

  try {
    return (
      <div className="board">
        <div className="board-header">
          <div className="header-left">
            <h1>Job Application Tracker</h1>
            <div className={`backend-status ${backendStatus}`}>
              <span className="status-dot"></span>
              Backend: {backendStatus === 'checking' ? 'Checking...' : 
                       backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
              {backendStatus === 'disconnected' && <span className="dev-mode"> (Dev Mode)</span>}
            </div>
          </div>
          <div className="header-right">
            {!token && backendStatus === 'connected' && (
              <div style={{display: 'flex', gap: '0.5rem', flexDirection: 'column'}}>
                <button 
                  className="auth-btn"
                  onClick={() => {
                    console.log('Login button clicked!');
                    handleDemoLogin();
                  }}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login for Testing'}
                </button>
                <button 
                  className="auth-btn"
                  style={{fontSize: '0.8rem', padding: '0.3rem 0.8rem'}}
                  onClick={() => {
                    console.log('Using demo mode without backend auth');
                    const demoToken = 'demo-mode-token-' + Date.now();
                    localStorage.setItem('token', demoToken);
                    localStorage.setItem('demoMode', 'true');
                    setToken(demoToken);
                    setIsDemoMode(true);
                    setError('');
                    console.log('✅ Demo mode activated - backend authentication bypassed');
                  }}
                >
                  Demo Mode (Skip Auth)
                </button>
              </div>
            )}
            {/* Demo mode indicator */}
            {isDemoMode && (
              <div style={{fontSize: '0.9rem', background: 'rgba(251, 191, 36, 0.2)', color: '#f59e0b', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem'}}>
                🎭 Demo Mode Active - No backend required
              </div>
            )}
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && !isDemoMode && (
              <div style={{fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem'}}>
                Token: {token ? 'Present' : 'None'} | Backend: {backendStatus}
              </div>
            )}
            <div className="board-stats">
              <span className="stat">
                <strong>{Object.keys(data.jobs).length}</strong> Total Applications
              </span>
              <span className="stat">
                <strong>{data.columns.interview.jobIds.length + data.columns.offer.jobIds.length}</strong> Active
              </span>
            </div>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="board-content">
            {data.columnOrder.map((columnId, index) => {
              const column = data.columns[columnId];
              const jobs = column.jobIds.map(jobId => data.jobs[jobId]).filter(Boolean);

              return (
                <div key={column.id}>
                  <Column
                    column={column}
                    jobs={jobs}
                    index={index}
                    onAddJob={() => {
                      if (!token) {
                        setError('Please login first to add jobs.');
                        return;
                      }
                      setShowAddJobForm(true);
                    }}
                    onDeleteJob={deleteJob}
                  />
                </div>
              );
            })}
          </div>
        </DragDropContext>
        
        {showAddJobForm && (
          <AddJobForm
            token={token}
            onJobAdded={addJob}
            onClose={() => setShowAddJobForm(false)}
            isDemoMode={isDemoMode}
          />
        )}
      </div>
    );
  } catch (err) {
    console.error('Render error:', err);
    return (
      <div className="board">
        <div className="board-header">
          <h1>Job Application Tracker</h1>
        </div>
        <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>Error: {err.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      </div>
    );
  }
};

export default Board;