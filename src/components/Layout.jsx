import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';

const Layout = () => {
  return (
    <LayoutContainer>
      <Header />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  max-width: 100%;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  flex-grow: 1;
  width: 100vw;
  max-width: 100%;
  padding: 0;
  box-sizing: border-box;
`;

export default Layout;