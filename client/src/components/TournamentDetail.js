import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import {
  Card,
  Button,
  Tabs,
  Tab,
  Alert,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import PlayersTable from "./PlayersTable";
import { getUser, getAccessToken } from "../services/AuthService";
import { getTournamentDetail } from "../services/TournamentService";
import { tournamentColor } from "../services/colors";
import GroupResults from "./GroupResults";
import DrawResults from "./DrawResults";
import CreateGroupFormCard from "./CreateGroupFormCard";
import CreateSetFormCard from "./CreateSetFormCard";
import CreateDrawFromCard from "./CreateDrawFormCard";

import {
  BsFillCalendarMinusFill,
  BsFillPinMapFill,
  BsPeopleFill,
} from "react-icons/bs";
import { GiTennisCourt } from "react-icons/gi";
// const Reacket = require("reacket");

function TournamentDetail({ isLoggedIn, isManager }) {
  const [tournament, setTournament] = useState();
  const [alertDetail, setAlertDetail] = useState({
    show: false,
    variant: undefined,
    text: undefined,
  });
  const [groups, setGroups] = useState([]);
  const [draw, setDraw] = useState();

  const params = useParams();

  const loadTournamentDetail = async () => {
    const { response, isError } = await getTournamentDetail(params.id);
    if (isError) {
      setTournament({});
    } else {
      setTournament(response.data);
    }
  };

  const getGroups = async () => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/groups-for-tournament/${params.id}/`;
    try {
      const response = await axios.get(url);
      setGroups(response.data);
    } catch (e) {
      setGroups();
      console.error(e);
    }
  };

  const getEliminationDraw = async () => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/elimination-draw/?tournament_id=${params.id}`;
    try {
      const response = await axios.get(url);
      setDraw(response.data);
    } catch (e) {
      setDraw();
      console.error(e);
    }
  };

  useEffect(() => {
    loadTournamentDetail();
    getGroups();
    getEliminationDraw();
  }, []);

  // const updateResults = () => {
  //   loadResults();
  // };

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
              <Col className="d-flex justify-content-end mb-1 mb-sm-0 header-border">
                <div>
                  <h6 className="mb-0 align-items-center d-flex">
                    <strong>{tournament.status}</strong>
                  </h6>
                </div>
              </Col>
              <Col md="auto" className="d-flex justify-content-end">
                <h6 className="mb-0 align-items-center d-flex">
                  <strong>{`${tournament.category} TOUR 2022`}</strong>
                </h6>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
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
        setAlertDetail({
          show: true,
          variant: "success",
          text: "You have succesfully registered for the tournament",
        });
      } else if (response.data.status === "INTERESTED") {
        setAlertDetail({
          show: true,
          variant: "warning",
          text: "Tournament capacity is alredy full, you have been added to the replacements list. If someone cancelles his registration or the tournament capacity gets increased you might be added into the registered category",
        });
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
      setAlertDetail({
        show: true,
        variant: "success",
        text: "Your registration was cancelled",
      });
      return { response, isError: false };
    } catch (error) {
      if ("non_field_errors" in error.response.data) {
        setAlertDetail({
          show: true,
          variant: "danger",
          text: error.response.data["non_field_errors"],
        });
      }
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

  function ShowAlert() {
    if (alertDetail.show) {
      return (
        <Alert
          variant={alertDetail.variant}
          onClose={() => setAlertDetail({ show: false })}
          dismissible
        >
          {alertDetail.text}
        </Alert>
      );
    } else {
      return null;
    }
  }

  const updateTournamentStatus = async (toStatus) => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/tournament/${params.id}/`;
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.put(url, { status: toStatus }, { headers });
      loadTournamentDetail();
      setAlertDetail({
        show: true,
        variant: "success",
        text: `Tournament has been ${toStatus}`,
      });
    } catch (e) {
      console.error(e.response);
    }
  };

  const UpdateStatusButton = () => {
    let toStatus;
    let buttonTittle;
    if (tournament.status === "OPEN") {
      toStatus = "CONSOLIDATED";
      buttonTittle = "Consolidate Tournament";
    } else if (tournament.status === "CONSOLIDATED") {
      toStatus = "COMPLETED";
      buttonTittle = "Complete Tournament";
    }
    if (buttonTittle) {
      return (
        <Button
          onClick={() => {
            updateTournamentStatus(toStatus);
          }}
        >
          {buttonTittle}
        </Button>
      );
    } else {
      return null;
    }
  };

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
                <Card className="shadow-sm tournament-tables mb-3">
                  <Card.Header style={headerColor}>
                    <CardHeaderRender />
                  </Card.Header>
                  <Card.Body>
                    <ShowAlert />

                    <p className="d-flex flex-wrap justify-content-sm-between">
                      <strong style={{ marginRight: "1em" }}>
                        <BsFillCalendarMinusFill className="" />
                        &nbsp;&nbsp;
                        {date.toLocaleDateString("US-EN", options)}
                      </strong>
                      <strong style={{ marginRight: "1em" }}>
                        <BsFillPinMapFill className="" />
                        &nbsp;
                        {tournament.place}
                      </strong>
                      <strong style={{ marginRight: "1em" }}>
                        <GiTennisCourt className="" />
                        &nbsp;&nbsp;
                        {tournament.surface}
                      </strong>
                      <strong style={{ marginRight: "1em" }}>
                        <BsPeopleFill className="" />
                        &nbsp;&nbsp;
                        {`${activePlayersCount()}/${tournament.capacity}`}
                      </strong>
                    </p>

                    <hr />

                    <div className="d-flex justify-content-center mt-3">
                      {isLoggedIn ? (
                        <>
                          {isManager ? (
                            <UpdateStatusButton />
                          ) : (
                            <>
                              {isLoggedInUserRegistered() ? (
                                <>
                                  {tournament.status === "OPEN" && (
                                    <Button
                                      variant="danger"
                                      onClick={() =>
                                        cancelRegistration(tournament.id)
                                      }
                                    >
                                      Cancel registration
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <>
                                  {tournament.status !== "COMPLETED" && (
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
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <p className="text-warning text-center">
                          Please log in or sign up to register to this
                          tournament
                        </p>
                      )}
                    </div>
                  </Card.Body>
                </Card>

                <Card className="shadow-sm tournament-tables mb-3">
                  <Card.Body>
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
                  </Card.Body>
                </Card>

                <CreateGroupFormCard
                  tournament={tournament}
                  groups={groups}
                  loadResults={getGroups}
                  isManager={isManager}
                />

                <CreateSetFormCard
                  loadResults={getGroups}
                  tournament={tournament}
                  groups={groups}
                  draw={draw}
                  isManager={isManager}
                  getEliminationDraw={getEliminationDraw}
                />

                {groups.length > 0 && (
                  <>
                    <GroupResults results={groups} />
                    <CreateDrawFromCard
                      getGroups={getGroups}
                      tournament={tournament}
                      isManager={isManager}
                      draw={draw}
                      getEliminationDraw={getEliminationDraw}
                    />
                    <DrawResults draw={draw} />
                    {/* <Card className="shadow-sm tournament-tables my-3">
                      <Card.Header>
                        <h4 className="mb-0">Main draw</h4>
                      </Card.Header>
                      <Card.Body>
                        <DrawResults forTournament={params.id} />
                      </Card.Body>
                    </Card> */}
                  </>
                )}
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
