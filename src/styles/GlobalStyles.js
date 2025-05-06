import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: ${props => props.theme.fonts.main};
    background-color: ${props => props.theme.colors.lightGray};
    color: ${props => props.theme.colors.text};
    line-height: 1.5;
  }

  #root {
    display: flex;
    flex-direction: column;
  }

  a {
    text-decoration: none;
    color: ${props => props.theme.colors.primary};
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    text-align: left;
    padding: ${props => props.theme.spacing.small};
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
  }
`;

export default GlobalStyles;
