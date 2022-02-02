import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { getTournaments } from "../services/TournamentService";
import { Row, Col, Container } from "react-bootstrap";
import TournamentsByCategoryCard from "./TournamentsByCategoryCard";
// import { Link } from 'react-router-dom';

// eslint-disable-next-line no-unused-vars
function Landing(props) {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const loadTournaments = async () => {
      const { response, isError } = await getTournaments();
      if (isError) {
        setTournaments([]);
      } else {
        setTournaments(response.data);
      }
    };
    loadTournaments();
  }, []);

  return (
    <div>
      {!tournaments ? (
        <h1 className="text-center">Tournaments are Loading...</h1>
      ) : (
        <Container>
          <h3 className="mt-3 mb-3">Join our upcoming tournamnets</h3>
          <Row className="mb-4">
            {/* Set the margin bottom of the left side card to 4 when they are collapsing to have a spacing between the cards in the first row */}
            <Col lg={6} className="mb-4 mb-lg-0">
              <TournamentsByCategoryCard
                tournaments={tournaments}
                category="START"
              />
            </Col>
            <Col>
              <TournamentsByCategoryCard
                tournaments={tournaments}
                category="SPORT"
              />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <TournamentsByCategoryCard
                tournaments={tournaments}
                category="CHALLENGER"
              />
            </Col>
            <Col></Col>
          </Row>
          <div>
            <pre>{JSON.stringify(tournaments, null, 4)}</pre>
          </div>
        </Container>
      )}
    </div>
  );
}

export default Landing;
