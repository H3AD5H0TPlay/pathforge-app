import React, { useState } from 'react';
import axios from 'axios';
import './AddJobForm.css';

const AddJobForm = ({ onJobAdded, onClose, token, isDemoMode }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    requirements: '',
    notes: '',
    status: 'applied'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert requirements string to array
      const requirementsArray = formData.requirements
        .split('\n')
        .map(req => req.trim())
        .filter(req => req.length > 0);

      // Prepare job data
      const jobData = {
        ...formData,
        requirements: requirementsArray,
        salary: formData.salary ? (isNaN(formData.salary) ? formData.salary : Number(formData.salary)) : undefined,
        appliedDate: new Date().toISOString()
      };

      console.log('Submitting job data:', jobData);
      console.log('Using token for job creation:', token ? token.substring(0, 20) + '...' : 'No token available');

      if (!token) {
        throw new Error('No authentication token available. Please login first.');
      }

      let response;
      
      // Handle demo mode
      if (isDemoMode || (token && token.startsWith('demo-mode-token-'))) {
        console.log('🎭 Demo mode - simulating job creation');
        // Create a mock response for demo mode
        response = {
          data: {
            _id: 'demo-' + Date.now(),
            ...jobData,
            appliedDate: jobData.appliedDate,
            updatedAt: new Date().toISOString(),
            postedBy: 'demo-user'
          }
        };
        console.log('Demo job created:', response.data);
      } else {
        response = await axios.post('/jobs', jobData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Job created:', response.data);
      }
      
      // Notify parent component
      if (onJobAdded) {
        onJobAdded(response.data);
      }

      // Close form
      if (onClose) {
        onClose();
      }

      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        salary: '',
        description: '',
        requirements: '',
        notes: '',
        status: 'applied'
      });

    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-job-overlay">
      <div className="add-job-form">
        <div className="form-header">
          <h2>Add New Job Application</h2>
          <button 
            type="button" 
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Senior React Developer"
              />
            </div>
            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="e.g. TechCorp Inc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA or Remote"
              />
            </div>
            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. 120000 or 100k - 130k"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Application Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Brief description of the role..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements</label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="3"
              placeholder="Enter each requirement on a new line..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Any additional notes about this application..."
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !formData.title || !formData.company}
            >
              {loading ? 'Adding Job...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobForm;