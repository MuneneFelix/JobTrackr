import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const JobContext = createContext(null);

const initialState = {
  jobs: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    type: 'all',
    location: 'all'
  }
};

function jobReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_JOBS':
      return { ...state, jobs: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}

export function JobProvider({ children }) {
  const [state, dispatch] = useReducer(jobReducer, initialState);

  const fetchJobs = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Replace with actual API call
      const response = await fetch('/api/jobs');
      const data = await response.json();
      dispatch({ type: 'SET_JOBS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const value = {
    ...state,
    fetchJobs,
    dispatch
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
}

JobProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useJobs() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
} 