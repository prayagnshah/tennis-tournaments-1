import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { getTournamentDetail } from "../services/TournamentService";
import { Card, Button, Tabs, Tab, Alert } from "react-bootstrap";
import PlayersTable from "./PlayersTable";
import { getUser, getAccessToken } from "../services/AuthService";
import { tournamentColor } from "../services/colors";
import GroupResults from "./GroupResults";
import axios from "axios";

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
      <h3 className="mb-0 d-flex justify-content-between">
        <strong>{tournament.name}</strong>
        <span>
          <span className="text-success">OPEN&nbsp;</span>
          <span>|| START Tour 2022</span>
        </span>
      </h3>
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
          <Card className="shadow">
            <Card.Header style={headerColor}>
              <CardHeaderRender />
            </Card.Header>
            <Card.Body>
              <RegisterAlert />
              {/* <Card.Body style={{ backgroundColor: "rgb(236, 240, 241)" }}> */}
              <p>Date: {date.toLocaleDateString("cs-CZ", options)}</p>
              <p>Location: {tournament.place}</p>
              <p>Prestige: {tournament.prestige}</p>
              <p>Surface: {tournament.surface}</p>
              <p>
                Capacity: {`${activePlayersCount()}/${tournament.capacity}`}
              </p>
              <p>Status: {tournament.status}</p>
              <p>Price: {`${tournament.price} Czk`}</p>

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
                        onClick={() => registerForTournament(tournament.id)}
                      >
                        Register for the tournament
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-warning text-center">
                    Please log in or sign up to register to this tournament
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
                  <h3 className="text-center bg-light mb-3 p-2">Results</h3>
                  <GroupResults results={results} tournament={tournament} />
                  <pre>{JSON.stringify(results, null, 4)}</pre>
                </>
              )}
            </Card.Body>
          </Card>
          {/* <div>
            <pre>{JSON.stringify(tournament, null, 4)}</pre>
          </div> */}
        </>
      )}
    </>
  );
}

export default TournamentDetail;
