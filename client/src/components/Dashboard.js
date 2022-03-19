import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { getTournaments } from "../services/TournamentService";
import { Row, Col, Container } from "react-bootstrap";
import TournamentsByCategoryCard from "./TournamentsByCategoryCard";
import CreateTournamentForm from "./CreateTournamentForm";
// import { Link } from 'react-router-dom';

function Dasboard({ isManager }) {
  const [tournaments, setTournaments] = useState([]);
  const [isTournamentCreated, setIsTournamentCreated] = useState(false);

  const loadTournaments = async () => {
    const { response, isError } = await getTournaments();
    if (isError) {
      setTournaments([]);
    } else {
      setTournaments(response.data);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  if (isTournamentCreated === true) {
    setIsTournamentCreated(false);
    loadTournaments();
  }

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

            <Row className="mx-0">
              <Col></Col>
              {/* on md changes the main container width this is why we need to define different width for sm and md */}
              <Col sm="10" md="8" className="px-0">
                <CreateTournamentForm
                  setIsTournamentCreated={setIsTournamentCreated}
                  isManager={isManager}
                />

                <TournamentsByCategoryCard
                  tournaments={tournaments}
                  category="START"
                />
                <TournamentsByCategoryCard
                  tournaments={tournaments}
                  category="SPORT"
                />
                <TournamentsByCategoryCard
                  tournaments={tournaments}
                  category="CHALLENGER"
                />
              </Col>
              <Col></Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
}

export default Dasboard;
