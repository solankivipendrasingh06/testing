'use client';

import { useState } from 'react';
import Select from 'react-select';

const options = [
  { value: 'Alphabets', label: 'Alphabets' },
  { value: 'Numbers', label: 'Numbers' },
  { value: 'Highest lowercase alphabet', label: 'Highest lowercase alphabet' }
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: state.isFocused ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: '0.2rem',
    boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
    '&:hover': {
      borderColor: '#6366f1'
    }
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
    color: 'white',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'rgba(99, 102, 241, 0.4)'
    }
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '4px',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#e0e7ff',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#e0e7ff',
    ':hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#ef4444',
    },
  }),
};

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setApiResponse(null);
    setSelectedOptions([]);
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
      if (!parsedData.data || !Array.isArray(parsedData.data)) {
        throw new Error('JSON must contain a "data" array');
      }
    } catch (e) {
      setError('Invalid JSON format. Example: { "data": ["A","C","z"] }');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bfhl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });
      
      const data = await res.json();
      setApiResponse(data);
    } catch (e) {
      setError('API request failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderFilteredResponse = () => {
    if (!apiResponse || selectedOptions.length === 0) return null;

    const selectedValues = selectedOptions.map(opt => opt.value);
    
    return (
      <div className="response-container">
        {selectedValues.includes('Numbers') && (
          <div className="response-section">
            <div className="response-title">Numbers</div>
            <div className="response-data">
              {apiResponse.numbers?.join(', ') || ''}
            </div>
          </div>
        )}
        {selectedValues.includes('Alphabets') && (
          <div className="response-section">
            <div className="response-title">Alphabets</div>
            <div className="response-data">
              {apiResponse.alphabets?.join(', ') || ''}
            </div>
          </div>
        )}
        {selectedValues.includes('Highest lowercase alphabet') && (
          <div className="response-section">
            <div className="response-title">Highest Lowercase Alphabet</div>
            <div className="response-data">
              {apiResponse.highest_lowercase_alphabet?.join(', ') || ''}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Data Processor</h1>
      <p className="subtitle">Bajaj Finserv Health Dev Challenge</p>
      
      <div className="form-group">
        <label className="input-label">API Input (JSON)</label>
        <textarea 
          className={`json-input ${error ? 'error' : ''}`}
          placeholder='{ "data": ["A","C","z"] }'
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            if (error) setError(null);
          }}
        />
        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}
      </div>
      
      <button 
        className="submit-btn" 
        onClick={handleSubmit}
        disabled={loading || !jsonInput.trim()}
      >
        {loading ? 'Processing...' : 'Submit Data'}
      </button>

      {apiResponse && (
        <div className="select-container">
          <label className="input-label">Multi Filter</label>
          <Select
            isMulti
            name="filters"
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"
            styles={customSelectStyles}
            onChange={setSelectedOptions}
            placeholder="Select filters to view results..."
          />
        </div>
      )}

      {renderFilteredResponse()}
    </div>
  );
}
