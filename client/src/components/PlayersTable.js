import React from "react";
import { Table } from "react-bootstrap";

function PlayersTable({ registeredPlayers, status }) {
  let counter = 0;

  return (
    <>
      {!registeredPlayers ? (
        <p>Loading..</p>
      ) : (
        <>
          <Table striped hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                {status !== "CANCELLED" ? (
                  <th>Registered on</th>
                ) : (
                  <th>Cancelled on</th>
                )}
                <th>Leaderboard pos.</th>
                <th>Reg. number</th>
              </tr>
            </thead>

            <tbody>
              {registeredPlayers.map((regsitration, i) => {
                if (regsitration.status === status) {
                  counter += 1;
                  const regDate = new Date(regsitration.registered_on);
                  const cancelDate = new Date(regsitration.cancelled_on);
                  const options = {
                    weekday: undefined,
                    year: "2-digit",
                    month: "short",
                    day: "numeric",
                  };
                  const timeOptions = {
                    hour: "2-digit",
                    minute: "2-digit",
                  };
                  return (
                    <tr key={i}>
                      <td>{counter}</td>
                      <td>
                        {regsitration.user.first_name}{" "}
                        {regsitration.user.last_name}
                      </td>
                      {status !== "CANCELLED" ? (
                        <td>
                          {regDate.toLocaleDateString("cs-CZ", options)}
                          {" - "}
                          {regDate.toLocaleTimeString("cs-CZ", timeOptions)}
                        </td>
                      ) : (
                        <td>
                          {cancelDate.toLocaleDateString("cs-CZ", options)}
                          {" - "}
                          {cancelDate.toLocaleTimeString("cs-CZ", timeOptions)}
                        </td>
                      )}
                      <td>Na</td>
                      <td>{regsitration.id}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
}

export default PlayersTable;
