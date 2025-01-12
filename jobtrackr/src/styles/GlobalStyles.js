import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary-blue: #1A365D;
    --primary-teal: #2C7A7B;
    --accent-coral: #F56565;
    --accent-yellow: #F6E05E;
    --text-dark: #2D3748;
    --text-light: #718096;
    --bg-light: #F7FAFC;
    --white: #FFFFFF;
    --sidebar-width: 250px;
    --success: #48BB78;
    --warning: #ECC94B;
    --error: #F56565;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg-light);
    color: var(--text-dark);
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
  }
`;

export default GlobalStyles; 