/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./App.css";
import {
  Outlet,
  useLocation,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

import Landing from "./components/Landing";
import LogIn from "./components/LogIn";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import { getUser, isTokenExpired } from "./services/AuthService";
import TournamentDetail from "./components/TournamentDetail";
import Dasboard from "./components/Dashboard";

function App() {
  const [isLoggedIn, setLoggedIn] = useState(() => {
    return window.localStorage.getItem("tennis.auth") !== null;
  });
  let navigate = useNavigate();

  useEffect(() => {
    // if refresh token is expired on refresh, log out user
    const auth = JSON.parse(window.localStorage.getItem("tennis.auth"));
    if (auth && isTokenExpired(auth.refresh)) {
      window.localStorage.removeItem("tennis.auth");
      setLoggedIn(false);
    }
  }, []);

  const logIn = async (username, password) => {
    const url = `${process.env.REACT_APP_BASE_URL}/api/log_in/`;
    try {
      const response = await axios.post(url, { username, password });
      window.localStorage.setItem("tennis.auth", JSON.stringify(response.data));
      setLoggedIn(true);
      // console.log(getUser());
      return { response, isError: false };
    } catch (error) {
      return { response: error, isError: true };
    }
  };

  const logOut = () => {
    window.localStorage.removeItem("tennis.auth");
    setLoggedIn(false);
    navigate("/");
  };

  const isManager = () => {
    if (isLoggedIn && getUser().group === "Manager") {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Layout isLoggedIn={isLoggedIn} logOut={logOut} />}
      >
        <Route index element={<Landing isLoggedIn={isLoggedIn} />} />
        <Route path="sign-up" element={<SignUp isLoggedIn={isLoggedIn} />} />
        <Route
          path="log-in"
          element={<LogIn logIn={logIn} isLoggedIn={isLoggedIn} />}
        />
        <Route path="profile" element={<Profile isLoggedIn={isLoggedIn} />} />
        <Route
          path="dashboard"
          element={<Dasboard isManager={isManager()} />}
        />
        <Route
          path="tournament/:id"
          element={
            <TournamentDetail isLoggedIn={isLoggedIn} isManager={isManager()} />
          }
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

  const userData = getUser();
  let mainClass = "";

  useEffect(() => {
    setActive(location);
  }, [location]);

  // console.log("Path: " + useLocation().pathname + " Active: " + active);
  // console.log("PATHNAME:");
  // console.log(active);

  if (active == "/") {
    mainClass = "main-container";
  } else {
    mainClass = "main-container bg-light";
  }

  return (
    <>
      <div className={mainClass}>
        <Navbar collapseOnSelect bg="primary" expand="lg" variant="dark">
          <Container>
            <LinkContainer to="/">
              <Navbar.Brand>
                <strong>Tennis tournaments</strong>
              </Navbar.Brand>
            </LinkContainer>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto" activeKey={active}>
                <LinkContainer to="/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
              </Nav>
              <Nav activeKey={active}>
                {isLoggedIn ? (
                  <>
                    <LinkContainer to="/profile">
                      <Nav.Link
                        className={
                          userData.group === "Manager" && "text-warning"
                        }
                      >
                        <strong>{userData.first_name}</strong>
                      </Nav.Link>
                    </LinkContainer>
                    <Nav.Link onClick={() => logOut()}>Log out</Nav.Link>
                  </>
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

        {/* <br /> */}

        <Container className="pt-3 d-flex px-0" style={{ flexGrow: 1 }}>
          <Outlet />
        </Container>

        <div>
          <Navbar
            collapseOnSelect
            bg="primary"
            expand="lg"
            variant="dark"

            // className="d-flex flex-column min-vh-100"
            // fixed="bottom"
          >
            <Container>
              {/* <Navbar.Brand href="#">&copy; 2022</Navbar.Brand> */}
              <span className="text-light">
                <small>&copy; 2022</small>
              </span>
              <span className="text-light">
                <small>
                  Created by:{" "}
                  <a
                    className="text-decoration-none"
                    href="https://github.com/Odusseus55"
                  >
                    Matyas M
                  </a>
                </small>
              </span>
            </Container>
          </Navbar>
        </div>
      </div>
    </>
  );
}

export default App;
