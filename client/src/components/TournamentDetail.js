import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { getTournamentDetail } from "../services/TournamentService";
import { Card, Button, Tabs, Tab, Table } from "react-bootstrap";

function TournamentDetail({ isLoggedIn }) {
  const [tournament, setTournament] = useState({ test: "test" });
  const params = useParams();

  useEffect(() => {
    const loadTournamentDetail = async () => {
      const { response, isError } = await getTournamentDetail(params.id);
      if (isError) {
        setTournament({});
      } else {
        setTournament(response.data);
      }
    };
    loadTournamentDetail();
  }, []);

  let headerColor = "";
  if (tournament.category === "START") {
    headerColor = "yellow";
  } else if (tournament.category === "SPORT") {
    headerColor = "bg-warning";
  } else if (tournament.category === "CHALLENGER") {
    headerColor = "bg-danger";
  }

  const date = new Date(tournament.event_date);
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

  const PlayersTable = () => {
    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Registered on</th>
            <th>Leaderboard pos.</th>
            <th>Reg. number</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Nadal</td>
            <td>30.1.22</td>
            <td>6</td>
            <td>23456</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Federer</td>
            <td>25.1.22</td>
            <td>20</td>
            <td>10056</td>
          </tr>
        </tbody>
      </Table>
    );
  };

  return (
    <>
      {!tournament ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <Card>
            {tournament.category === "START" ? (
              <Card.Header style={{ backgroundColor: headerColor }}>
                <CardHeaderRender />
              </Card.Header>
            ) : (
              <Card.Header className={headerColor}>
                <CardHeaderRender />
              </Card.Header>
            )}
            <Card.Body>
              {/* <Card.Body style={{ backgroundColor: "rgb(236, 240, 241)" }}> */}
              <p>Date: {date.toLocaleDateString("cs-CZ", options)}</p>
              <p>Location: {tournament.place}</p>
              <p>Prestige: {tournament.prestige}</p>
              <p>Surface: {tournament.surface}</p>
              <p>Capacity: {`0/${tournament.capacity}`}</p>
              <p>Status: {tournament.status}</p>
              <p>Price: {`${tournament.price} Czk`}</p>

              {isLoggedIn && (
                <>
                  <Button variant="primary">Register for the tournament</Button>{" "}
                  <Button variant="danger">Cancel registration</Button>
                </>
              )}
              <hr />
              <Tabs
                defaultActiveKey="registered"
                id="uncontrolled-tab"
                className="mb-3"
              >
                <Tab eventKey="registered" title="Registered">
                  <PlayersTable />
                </Tab>
                <Tab eventKey="interested" title="Interested">
                  <PlayersTable />
                </Tab>
                <Tab eventKey="withdrawn" title="Withdrawn">
                  <PlayersTable />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
          <div>
            <pre>{JSON.stringify(tournament, null, 4)}</pre>
          </div>
        </>
      )}
    </>
  );
}

export default TournamentDetail;
