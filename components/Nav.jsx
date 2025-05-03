/*navigation bar component, has links to all pages on the website*/

import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";

const StyledNav = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  margin: 0px;
  background-color: white;
  border-bottom: 2px solid #000;
  font-family: Quicksand;
  z-index: 9;
  min-width: 100vh;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: black;
  font-weight: bold;
  font-size: 16px;
  transition: 0.3s;

  &:hover {
    opacity: 0.7;
  }
`;

const Nav = () => {
  return (
    <StyledNav>
      <NavLinks>
        <StyledLink href="/">REFLEX DUEL</StyledLink>
      </NavLinks>
    </StyledNav>
  );
};

export default Nav;
