import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { getTournamentDetail } from "../services/TournamentService";
import {
  Card,
  Button,
  Tabs,
  Tab,
  Alert,
  Badge,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import PlayersTable from "./PlayersTable";
import { getUser, getAccessToken } from "../services/AuthService";
import { tournamentColor } from "../services/colors";
import GroupResults from "./GroupResults";
import DrawResults from "./DrawResults";
import axios from "axios";
// const Reacket = require("reacket");

function TournamentDetail({ isLoggedIn }) {
  const [tournament, setTournament] = useState();
  const [alertDetail, setAlertDetail] = useState({
    show: false,
    variant: undefined,
  });
  const [results, setResults] = useState([]);
  const params = useParams();

  const loadTournamentDetail = async () => {
    const { response, isError } = await getTournamentDetail(params.id);
    if (isError) {
      setTournament({});
    } else {
      setTournament(response.data);
    }
  };

  const loadResults = async () => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/groups-for-tournament/${params.id}/`;
    try {
      const response = await axios.get(url);
      setResults(response.data);
    } catch (e) {
      setResults();
      console.error(e);
    }
  };

  useEffect(() => {
    loadTournamentDetail();
    loadResults();
  }, []);

  let headerColor = "";
  let date = "";
  if (tournament) {
    if (tournament.category === "START") {
      headerColor = tournamentColor.start;
      // headerColor = "yellow";
    } else if (tournament.category === "SPORT") {
      // headerColor = "bg-warning";
      headerColor = tournamentColor.sport;
    } else if (tournament.category === "CHALLENGER") {
      // headerColor = "bg-danger";
      headerColor = tournamentColor.challenger;
    }
    date = new Date(tournament.event_date);
  }

  const options = {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  const CardHeaderRender = () => {
    return (
      <Container className="px-0">
        <Row className="align-items-center d-flex">
          <Col className="align-items-center d-flex">
            <h3 className="mb-0">
              <strong>{tournament.name}</strong>
            </h3>
          </Col>

          <Col>
            <Row>
              <Col className="d-flex justify-content-end justify-content-sm-start mb-1 mb-sm-0">
                <h4 className="mb-0 align-items-center d-flex">
                  <Badge bg="info" className="">
                    {tournament.status}
                  </Badge>
                </h4>
              </Col>
              <Col className=" d-flex justify-content-end">
                <h5 className="mb-0 align-items-center d-flex">
                  <Badge bg="primary" className="">
                    {`${tournament.category} TOUR 2022`}
                  </Badge>
                </h5>

                {/* <span className="">|| </span> */}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
    // return (
    //   <div className="d-flex justify-content-between align-items-center">
    //     <h3 className="mb-0">
    //
    //     </h3>
    //     <span>
    //       <h4 className="mb-0 align-items-center d-flex">
    //         <Badge bg="info" className="d-flex">
    //           {tournament.status}
    //         </Badge>
    //         &nbsp;
    //         <span>|| START Tour 2022</span>
    //       </h4>
    //     </span>
    //   </div>
    // );
  };

  const registerForTournament = async (tournamentID) => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/registrations/`;
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.post(
        url,
        {
          tournament: tournamentID,
        },
        { headers }
      );
      loadTournamentDetail();
      if (response.data.status === "REGISTERED") {
        setAlertDetail({ show: true, variant: "success" });
      } else if (response.data.status === "INTERESTED") {
        setAlertDetail({ show: true, variant: "warning" });
      }

      return { response, isError: false };
    } catch (error) {
      console.log(error);
      return { response: error, isError: true };
    }
  };

  const cancelRegistration = async (tournamentID) => {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const userData = getUser();
    let registrationID = undefined;
    tournament.registrations.map((registration) => {
      if (
        (registration.user.username === userData.username) &
        (registration.status !== "CANCELLED")
      ) {
        registrationID = registration.id;
      }
    });
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/registrations/${registrationID}/`;
    try {
      const response = await axios.put(
        url,
        { tournament: tournamentID },
        { headers }
      );
      loadTournamentDetail();
      setAlertDetail({ show: true, variant: "danger" });
      return { response, isError: false };
    } catch (error) {
      return { response: error, isError: true };
    }
  };

  const isLoggedInUserRegistered = () => {
    let isRegistered = false;
    const userData = getUser();
    tournament.registrations.map((registration) => {
      if (
        (registration.user.username === userData.username) &
        (registration.status !== "CANCELLED")
      ) {
        isRegistered = true;
      }
    });
    return isRegistered;
  };

  const activePlayersCount = () => {
    // returns the number REGISTERED adn INTERESTED players
    let count = 0;
    tournament.registrations.map((registration) => {
      if (registration.status !== "CANCELLED") {
        count += 1;
      }
    });
    return count;
  };

  function RegisterAlert() {
    let text = "";
    if (alertDetail.variant === "success") {
      text = "You have succesfully registered for the tournament";
    } else if (alertDetail.variant === "warning") {
      text =
        "Tournament capacity is alredy full, you have been added to the replacements list. If someone cancelles his registration or the tournament capacity gets increased you might be added into the registered category";
    } else if (alertDetail.variant === "danger") {
      text = "Your registration was cancelled";
    }
    if (alertDetail.show) {
      return (
        <Alert
          variant={alertDetail.variant}
          onClose={() => setAlertDetail({ show: false })}
          dismissible
        >
          {text}
        </Alert>
      );
    } else {
      return null;
    }
  }

  return (
    <>
      {!tournament ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <Container className="px-0">
            <Row className="mx-0">
              <Col></Col>
              <Col lg="10" className="px-0">
                <Card className="shadow tournament-tables">
                  <Card.Header style={headerColor}>
                    <CardHeaderRender />
                  </Card.Header>
                  <Card.Body>
                    <RegisterAlert />
                    {/* <Card.Body style={{ backgroundColor: "rgb(236, 240, 241)" }}> */}
                    <Badge bg="primary tournamnet-info-badge">
                      {date.toLocaleDateString("US-EN", options)}
                    </Badge>
                    {/* <p>Date: {date.toLocaleDateString("US-EN", options)}</p> */}
                    <p>Location: {tournament.place}</p>
                    {/* <p>Prestige: {tournament.prestige}</p> */}
                    <p>Surface: {tournament.surface}</p>
                    <p>
                      Capacity:{" "}
                      {`${activePlayersCount()}/${tournament.capacity}`}
                    </p>
                    {/* <p>Status: {tournament.status}</p> */}
                    {/* <p>Price: {`${tournament.price} Czk`}</p> */}

                    <div className="d-flex justify-content-center">
                      {isLoggedIn ? (
                        <>
                          {isLoggedInUserRegistered() ? (
                            <Button
                              variant="danger"
                              onClick={() => cancelRegistration(tournament.id)}
                            >
                              Cancel registration
                            </Button>
                          ) : (
                            <Button
                              className="shadow-sm"
                              variant="success"
                              onClick={() =>
                                registerForTournament(tournament.id)
                              }
                            >
                              Register for the tournament
                            </Button>
                          )}
                        </>
                      ) : (
                        <p className="text-warning text-center">
                          Please log in or sign up to register to this
                          tournament
                        </p>
                      )}
                    </div>
                    <hr />
                    <Tabs
                      defaultActiveKey="registered"
                      id="uncontrolled-tab"
                      className="mb-3"
                    >
                      <Tab eventKey="registered" title="Registered">
                        <PlayersTable
                          registeredPlayers={tournament.registrations}
                          status="REGISTERED"
                        />
                      </Tab>
                      <Tab eventKey="interested" title="Interested">
                        <PlayersTable
                          registeredPlayers={tournament.registrations}
                          status="INTERESTED"
                        />
                      </Tab>
                      <Tab eventKey="withdrawn" title="Withdrawn">
                        <PlayersTable
                          registeredPlayers={tournament.registrations}
                          status="CANCELLED"
                        />
                      </Tab>
                    </Tabs>

                    {results.length > 0 && (
                      <>
                        <br />
                        <hr />
                        <h3 className="text-center bg-light mb-3 p-2">
                          Results
                        </h3>
                        <div className="scrolling-wrapper">
                          <GroupResults
                            results={results}
                            tournament={tournament}
                          />
                        </div>

                        {/* <pre>{JSON.stringify(results, null, 4)}</pre> */}
                        <br />
                        <br />
                        <DrawResults forTournament={params.id} />
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col></Col>
            </Row>
          </Container>

          {/* <div>
            <pre>{JSON.stringify(tournament, null, 4)}</pre>
          </div> */}
        </>
      )}
    </>
  );
}

export default TournamentDetail;
