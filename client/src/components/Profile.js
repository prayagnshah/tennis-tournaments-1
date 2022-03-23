import React from "react";
import { useState, useEffect } from "react";
import { Card, Row, Col, Table, Container } from "react-bootstrap";
import { getUser } from "../services/AuthService";
import { Navigate, Link } from "react-router-dom";
import useWindowDimensions from "../services/WindowDimensions";
import axios from "axios";
import { tournamentColor } from "../services/colors";

function Profile({ isLoggedIn }) {
  // const userInfo = () => {
  //   return <pre>{JSON.stringify(getUser())}</pre>;
  // };
  const headerColor = (category) => {
    let toReturn;
    if (category === "START") {
      toReturn = tournamentColor.start;
    } else if (category === "SPORT") {
      toReturn = tournamentColor.sport;
    } else if (category === "CHALLENGER") {
      toReturn = tournamentColor.challenger;
    }
    return toReturn;
  };

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
    <Container className="px-0">
      <Row className="mx-0">
        <Col></Col>
        <Col lg="10" className="px-0">
          <Card className="mb-3 tournament-tables shadow-sm">
            <Card.Header>
              <h3 className="mb-0">
                <strong>
                  {userData.first_name} {userData.last_name}
                </strong>
                {" - UID: "}
                {userData.id}
              </h3>
            </Card.Header>
            <Card.Body>
              <br />
              <p>{userData.username}</p>
              <br />
              <hr />
              {!userRegistrations ? (
                <h3>Loading...</h3>
              ) : (
                <Table hover className="mb-0 p-0" size="sm">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Tournament</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="d-none d-sm-table-cell">
                        Registration status
                      </th>
                      <th className="d-none d-sm-table-cell">Reg. ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRegistrations.map((registration, i) => {
                      const eventDate = new Date(
                        registration.tournament.event_date
                      );
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
                          <td
                            style={headerColor(
                              registration.tournament.category
                            )}
                          >
                            {registration.tournament.category}
                          </td>
                          <td>
                            <Link
                              to={`/tournament/${registration.tournament.id}`}
                              className="text-decoration-none"
                            >
                              {registration.tournament.name}
                            </Link>
                          </td>
                          <td>
                            {eventDate.toLocaleDateString("cs-CZ", options)}
                          </td>
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
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
}

export default Profile;
