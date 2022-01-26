import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './App.css';
import { Outlet, useLocation } from 'react-router-dom';

function App () {
  // Using react Hooks and react-router's useLocation() to set the active key on two separte Nav components
  const location = useLocation().pathname
  const [active, setActive] = useState(location);
  
  useEffect(() => {
    setActive(location)
  },[location])

  console.log('Path: ' + useLocation().pathname + ' Active: ' + active)

  return (
    <>
      <Navbar collapseOnSelect bg='primary' expand='lg' variant='dark'>
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>Tennis tournaments</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse className="d-flex justify-content-between" id="responsive-navbar-nav">
            <Nav className="me-auto" activeKey={active}>
              <LinkContainer to="/">
                <Nav.Link>Dashboard</Nav.Link>
              </LinkContainer>
            </Nav>
            <Nav activeKey={active}>
              <LinkContainer to="/sign-up">
                <Nav.Link>Sign up</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/log-in">
                <Nav.Link>Log in</Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <br />
      
      <Container className='pt-3'>
        <Outlet />
      </Container>
    </>
  );
}

export default App;