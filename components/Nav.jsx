/*navigation bar component, has links to all pages on the website*/

import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";

const StyledNav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  border-bottom: 2px solid #666;
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

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  transition: 0.3s;
`;

const LogoutButton = styled.button`
  background: none;

  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.7;
  }
`;

const Nav = () => {
  return (
    <StyledNav>
      <NavLinks>
        <StyledLink href="/">
          <Image src="/home.png" alt="Home" width={25} height={25} />
          Home
        </StyledLink>

        <StyledLink href="/rankings">
          <Image src="/rankings.png" alt="Rankings" width={25} height={25} />
          Rankings
        </StyledLink>

        <StyledLink href="/stats">
          <Image src="/stats.png" alt="Stats" width={25} height={25} />
          Stats
        </StyledLink>

        <StyledLink href="/favorites">
          <Image src="/favorites.png" alt="Favorites" width={25} height={25} />
          Favorites
        </StyledLink>

        <StyledLink href="/tournament">
          <Image src="/trophy.svg" alt="Tournament" width={25} height={25} />
          Tournament
        </StyledLink>
      </NavLinks>
      <AuthButtons>
        (
        <>
          <StyledLink href="/sign-in">
            <Image src="/login.png" alt="Log In" width={25} height={25} />
            Log In / Sign up
          </StyledLink>
        </>
        )
      </AuthButtons>
    </StyledNav>
  );
};

export default Nav;
