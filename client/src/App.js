/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import { Container, Navbar, Nav, Button, Form } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./App.css";
import { Outlet, useLocation, Route, Routes } from "react-router-dom";
import axios from "axios";

import Landing from "./components/Landing";
import LogIn from "./components/LogIn";
import SignUp from "./components/SignUp";

function App() {
  const [isLoggedIn, setLoggedIn] = useState(() => {
    return window.localStorage.getItem("tennis.auth") !== null;
  });

  const logIn = async (username, password) => {
    const url = `${process.env.REACT_APP_BASE_URL}/api/log_in/`;
    try {
      const response = await axios.post(url, { username, password });
      window.localStorage.setItem("tennis.auth", JSON.stringify(response.data));
      setLoggedIn(true);
      return { response, isError: false };
    } catch (error) {
      return { response: error, isError: true };
    }
  };

  const logOut = () => {
    window.localStorage.removeItem("tennis.auth");
    setLoggedIn(false);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Layout isLoggedIn={isLoggedIn} logOut={logOut} />}
      >
        <Route index element={<Landing />} />
        <Route path="sign-up" element={<SignUp isLoggedIn={isLoggedIn} />} />
        <Route
          path="log-in"
          element={<LogIn logIn={logIn} isLoggedIn={isLoggedIn} />}
        />
        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
            </main>
          }
        />
      </Route>
    </Routes>
  );
}

// eslint-disable-next-line react/prop-types
function Layout({ isLoggedIn, logOut }) {
  // Using react Hooks and react-router's useLocation() to set the active key on two separte Nav components
  const location = useLocation().pathname;
  const [active, setActive] = useState(location);

  useEffect(() => {
    setActive(location);
  }, [location]);

  console.log("Path: " + useLocation().pathname + " Active: " + active);

  return (
    <>
      <Navbar collapseOnSelect bg="primary" expand="lg" variant="dark">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Tennis tournaments</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse
            className="d-flex justify-content-between"
            id="responsive-navbar-nav"
          >
            <Nav className="me-auto" activeKey={active}>
              <LinkContainer to="/">
                <Nav.Link>Dashboard</Nav.Link>
              </LinkContainer>
            </Nav>
            <Nav activeKey={active}>
              {isLoggedIn ? (
                <Form>
                  <Button type="button" onClick={() => logOut()}>
                    Log out
                  </Button>
                </Form>
              ) : (
                <>
                  <LinkContainer to="/sign-up">
                    <Nav.Link>Sign up</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/log-in">
                    <Nav.Link>Log in</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <br />

      <Container className="pt-3">
        <Outlet />
      </Container>
    </>
  );
}

export default App;
