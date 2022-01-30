import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { getUser } from "../services/AuthService";
import { Navigate } from "react-router-dom";

function Profile({ isLoggedIn }) {
  const userInfo = () => {
    return JSON.stringify(getUser());
  };

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  const userData = getUser();

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
        {userInfo()}
      </Card.Body>
    </Card>
  );
}

export default Profile;
