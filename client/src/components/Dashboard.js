import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { getTournaments } from "../services/TournamentService";
import { Row, Col, Container, Button } from "react-bootstrap";
import TournamentsByCategoryCard from "./TournamentsByCategoryCard";
import CreateTournamentForm from "./CreateTournamentForm";
// import { Link } from 'react-router-dom';

function Dasboard({ isManager }) {
  const [tournaments, setTournaments] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isTournamentCreated, setIsTournamentCreated] = useState(false);
  const [showTournamentForm, setShowTournamentForm] = useState(false);

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

  const TournamnetsCardLayout = ({ tournaments, category }) => {
    return (
      <Row className="mb-4 mx-0">
        <Col></Col>
        {/* on md changes the main container width this is why we need to define different width for sm and md */}
        <Col sm="10" md="8" className="px-0">
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

            {isManager && (
              <Row className="mb-4 mx-0">
                <Col></Col>
                <Col sm="10" md="8">
                  {showTournamentForm ? (
                    <CreateTournamentForm
                      setIsTournamentCreated={setIsTournamentCreated}
                      setShowTournamentForm={setShowTournamentForm}
                    />
                  ) : (
                    <div className="d-grid">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setShowTournamentForm(true);
                        }}
                      >
                        + Create Tournament
                      </Button>
                    </div>
                  )}
                </Col>
                <Col></Col>
              </Row>
            )}
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
