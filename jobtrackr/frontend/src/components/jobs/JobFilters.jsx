import styled from 'styled-components';
import PropTypes from 'prop-types';

const FiltersContainer = styled.div`
  background: var(--white);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--bg-light);
  border-radius: 6px;
  font-size: 1rem;
  color: var(--text-dark);
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-teal);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--bg-light);
  border-radius: 6px;
  font-size: 1rem;
  color: var(--text-dark);
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-teal);
  }
`;

function JobFilters({ onFilterChange }) {
  return (
    <FiltersContainer>
      <FilterRow>
        <FormGroup>
          <Label>Search</Label>
          <Input 
            type="text" 
            placeholder="Search jobs..."
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>Company</Label>
          <Select onChange={(e) => onFilterChange('company', e.target.value)}>
            <option value="">All Companies</option>
            <option value="google">Google</option>
            <option value="microsoft">Microsoft</option>
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>Status</Label>
          <Select onChange={(e) => onFilterChange('status', e.target.value)}>
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="updated">Updated</option>
          </Select>
        </FormGroup>
      </FilterRow>
    </FiltersContainer>
  );
}

JobFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
};

export default JobFilters; 