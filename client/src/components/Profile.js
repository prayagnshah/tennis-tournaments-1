import React from "react";
import { useState, useEffect } from "react";
import { Card, Row, Col, Table } from "react-bootstrap";
import { getUser } from "../services/AuthService";
import { Navigate, Link } from "react-router-dom";
import useWindowDimensions from "../services/WindowDimensions";
import axios from "axios";

function Profile({ isLoggedIn }) {
  // const userInfo = () => {
  //   return <pre>{JSON.stringify(getUser())}</pre>;
  // };

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  const [userRegistrations, setUserRegistrations] = useState();

  const userData = getUser();
  // eslint-disable-next-line no-unused-vars
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    const getUserRegistrations = async () => {
      const url = `${process.env.REACT_APP_BASE_URL}/tennis/registrations/user/${userData.id}`;
      try {
        const response = await axios.get(url);
        setUserRegistrations(response.data);
      } catch (e) {
        console.error(e);
        setUserRegistrations();
      }
    };

    getUserRegistrations();
  }, []);

  return (
    <Card className="mb-3">
      <Card.Header>
        <h4>
          {userData.first_name} {userData.last_name}
        </h4>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col>
            <p>Email address:</p>
            <p>User ID:</p>
          </Col>
          <Col>
            <p>{userData.username}</p>
            <p>{userData.id}</p>
          </Col>
        </Row>
        <hr />
        {!userRegistrations ? (
          <h3>Loading...</h3>
        ) : (
          <Table striped hover>
            <thead>
              <tr>
                <th>Category</th>
                <th>Tournament</th>
                <th>Date</th>
                <th>Status</th>
                <th className="d-none d-sm-table-cell">Registration status</th>
                <th className="d-none d-sm-table-cell">Reg. ID</th>
              </tr>
            </thead>
            <tbody>
              {userRegistrations.map((registration, i) => {
                const eventDate = new Date(registration.tournament.event_date);
                let options = {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                };
                if (width < 575) {
                  options.weekday = undefined;
                  options.year = undefined;
                }
                return (
                  <tr key={i}>
                    <td>{registration.tournament.category}</td>
                    <td>
                      <Link
                        to={`/tournament/${registration.tournament.id}`}
                        className="text-decoration-none"
                      >
                        {registration.tournament.name}
                      </Link>
                    </td>
                    <td>{eventDate.toLocaleDateString("cs-CZ", options)}</td>
                    <td>{registration.tournament.status}</td>
                    <td className="d-none d-sm-table-cell">
                      {registration.status}
                    </td>
                    <td className="d-none d-sm-table-cell">
                      {registration.id}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}

export default Profile;
