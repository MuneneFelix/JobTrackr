import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.fullHeight ? '60vh' : '200px'};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-light);
  border-top: 4px solid var(--primary-teal);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

function LoadingSpinner({ fullHeight }) {
  return (
    <SpinnerContainer fullHeight={fullHeight}>
      <Spinner />
    </SpinnerContainer>
  );
}

LoadingSpinner.propTypes = {
  fullHeight: PropTypes.bool
};

LoadingSpinner.defaultProps = {
  fullHeight: false
};

export default LoadingSpinner; 