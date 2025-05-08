import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError('');
    
    if (!searchQuery.trim()) {
      setSearchError('Please enter a block hash or height');
      return;
    }
    
    // Check if input is a block hash (64 hex characters)
    const blockHashRegex = /^[a-fA-F0-9]{64}$/;
    
    // Check if input is a block height (numeric)
    const blockHeightRegex = /^\d+$/;
    
    if (blockHashRegex.test(searchQuery)) {
      // Valid hash format, navigate to block details page
      navigate(`/btc/block/${searchQuery}`);
    } else if (blockHeightRegex.test(searchQuery)) {
      // For block heights, we'll need to implement this later
      // First get the block hash for this height then redirect
      setSearchError('Block height search will be implemented soon');
    } else {
      // Invalid input format
      setSearchError('Please enter a valid block hash (64 hex characters) or block height');
    }
  };
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <Logo to="/">
            <LogoImage src="/block-logo.png" alt="Logo" />
            <LogoText>Dup Block Explorer</LogoText>
          </Logo>
        </LogoSection>
        
        <SearchSection>
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by block hash or height"
              aria-label="Search for block hash or height"
            />
            <SearchButton type="submit" aria-label="Search">
              Search
            </SearchButton>
          </SearchForm>
          {searchError && <ErrorMessage>{searchError}</ErrorMessage>}
        </SearchSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

// Styled components
const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  width: 100vw;
  max-width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0;
  box-sizing: border-box;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LogoSection = styled.div`
  flex: 0 0 auto;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  
  &:hover {
    text-decoration: none;
  }
`;

const LogoIcon = styled.span`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  padding: 0.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
  transform: rotate(12deg);
  padding: 1.2rem;
  padding-left: 1.3rem;
  padding-right: 1.1rem;
`;

const LogoImage = styled.img`
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const SearchSection = styled.div`
  flex: 1 1 auto;
  max-width: 600px;
  margin: 0 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    margin: 0;
  }
`;

const SearchForm = styled.form`
  display: flex;
  width: 100%;
`;

const SearchInput = styled.input`
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin-top: 0.5rem;
  padding-left: 0.5rem;
`;

const NavSection = styled.nav`
  flex: 0 0 auto;
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  margin-left: 1.5rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default Header;