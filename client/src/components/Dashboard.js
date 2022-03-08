import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { getTournaments } from "../services/TournamentService";
import { Row, Col, Container } from "react-bootstrap";
import TournamentsByCategoryCard from "./TournamentsByCategoryCard";
// import { Link } from 'react-router-dom';

// eslint-disable-next-line no-unused-vars
function Dasboard(props) {
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

  const TournamnetsCardLayout = ({ tournaments, category }) => {
    return (
      <Row className="mb-4">
        <Col></Col>
        {/* on md changes the main container width this is why we need to define different width for sm and md */}
        <Col sm="10" md="8">
          <TournamentsByCategoryCard
            tournaments={tournaments}
            category={category}
          />
        </Col>
        <Col></Col>
      </Row>
    );
  };

  return (
    <>
      <Container className="px-0">
        {!tournaments ? (
          <h1 className="text-center">Tournaments are Loading...</h1>
        ) : (
          <>
            <h3 className="mt-3 mb-3 text-center">
              Join our upcoming tournamnets
            </h3>
            <TournamnetsCardLayout tournaments={tournaments} category="START" />
            <TournamnetsCardLayout tournaments={tournaments} category="SPORT" />
            <TournamnetsCardLayout
              tournaments={tournaments}
              category="CHALLENGER"
            />
          </>
        )}
      </Container>
    </>
  );
}

export default Dasboard;
