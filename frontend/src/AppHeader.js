import React, { Component } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import itlogo from "./itlogo.svg";

class AppHeader extends Component {
  render() {
    return (
      <Banner>
        <HeaderContainer>
          <Header>
            <Title>
              speakIT <SmallTitle>Digital speakers list</SmallTitle>
            </Title>
            <Link to="/">
              <ITLogo src={itlogo} />
            </Link>
          </Header>
        </HeaderContainer>

        <NavigationContainer>
          <Navigation>
            <NavigationItem to="/user">User</NavigationItem>
            <NavigationItem to="/list">Lists</NavigationItem>
            <NavigationItem to="/admin">Admin</NavigationItem>
          </Navigation>
        </NavigationContainer>
      </Banner>
    );
  }
}

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 1rem 1rem;
`;

const Banner = styled.div`
  background-color: #ffffff;
  box-shadow: 0 0 9px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 5rem;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-flow: row-wrap;
  width: 100%;
  max-width: 75em;
  padding: 0 1rem;
`;

const ITLogo = styled.img`
  @media (min-width: 900px) {
    width: 96px;
  }
  @media (max-width: 900px) {
    display: none;
  }
`;

const Title = styled.div`
  font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
  font-weight: 500;
  color: #0a0a0a;
  @media (min-width: 900px) {
    font-size: 3rem;
  }
  @media (max-width: 900px) {
    font-size: 2rem;
  }
`;

const SmallTitle = styled.small`
  font-weight: 200;
  color: #4a4a4a;
  @media (min-width: 900px) {
    font-size: 80%;
  }
  @media (max-width: 900px) {
    display: block;
    margin-top: 10px;
    font-size: 1.2rem;
  }
`;

const NavigationContainer = styled.div`
  box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.3);
  background-color: #c4c4c4;
  display: flex;
  justify-content: space-around;
`;

const Navigation = styled.nav`
  display: flex;
  @media (min-width: 900px) {
    flex-direction: row;
  }
  @media (max-width: 900px) {
    flex-direction: column;
    justify-content: space-around;
    width: 100%;
  }
`;

const NavigationItem = styled(Link)`
  @media (min-width: 900px) {
    width: 200px;
  }
  @media (max-width: 900px) {
    width: 100%;
  }
  min-height: 2em;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: #c4c4c4;
  text-decoration: none;
  color: #4a4a4a;
  font-family: AvenirNext;
  font-weight: bold;
  font-size: 1.25rem;
  :hover {
    background-color: #E4E4E4;
  }
  :active {
    background-color: #D4D4D4;
  }
`;

export default AppHeader;
