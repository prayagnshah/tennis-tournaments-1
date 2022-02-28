import React from "react";
import { Table } from "react-bootstrap";

function GroupResults({ results }) {
  // retruns matrix table with players in rows and columns and with the corresponding results with each other
  //   for finding the scores for the right cells, nested map functions are applied
  const highlightWinnerGame = (score1, score2) => {
    if (score1 > score2) {
      return (
        <span>
          <span>{score1}</span>
          <span className="text-muted"> : {score2}</span>
        </span>
      );
    } else {
      return (
        <span>
          <span className="text-muted">{score1} : </span>
          <span>{score2}</span>
        </span>
      );
    }
  };

  const lightBgClassForScoresInTd = (toRender) => {
    let toReturn = "text-center";
    if (toRender === "--") {
      toReturn = "text-center bg-light";
    }
    return toReturn;
  };

  return (
    <div>
      {results.map((group, k) => {
        return (
          <Table bordered key={k} className="d-inline-flex">
            <tbody>
              <tr>
                <th className="text-info" style={{ width: "150px" }}>
                  {group.name}
                </th>
                {group.players.map((player, i) => {
                  return (
                    <th
                      scope="col"
                      key={i}
                      style={{ width: "90px" }}
                      className="text-center"
                    >{`${player.last_name}`}</th>
                  );
                })}
                <th scope="col">Sets</th>
                <th scope="col">Games</th>
                <th scope="col">Position</th>
              </tr>
              {group.players.map((player, i) => {
                return (
                  <tr key={i}>
                    <th scope="row">{`${player.first_name} ${player.last_name}`}</th>
                    {/* Score calculation for each cell */}
                    {group.players.map((playerInner, j) => {
                      let toRender = "";
                      let set = undefined;
                      if (playerInner.id === player.id) {
                        toRender = "--";
                      } else {
                        set = group.set_stats.find(({ player_1, player_2 }) => {
                          return (
                            player_1.id === player.id &&
                            player_2.id === playerInner.id
                          );
                        });
                        if (set) {
                          //   toRender = `${set.score_p1} : ${set.score_p2}`;
                          toRender = highlightWinnerGame(
                            set.score_p1,
                            set.score_p2
                          );
                        }
                        if (!set) {
                          set = group.set_stats.find(
                            ({ player_1, player_2 }) => {
                              return (
                                player_1.id === playerInner.id &&
                                player_2.id === player.id
                              );
                            }
                          );
                          if (set) {
                            // toRender = `${set.score_p2} : ${set.score_p1}`;
                            toRender = highlightWinnerGame(
                              set.score_p2,
                              set.score_p1
                            );
                          }
                        }
                      }
                      return (
                        <td
                          key={j}
                          className={lightBgClassForScoresInTd(toRender)}
                        >
                          {toRender}
                        </td>
                      );
                    })}
                    <td>3</td>
                    <td>10</td>
                    <td>1</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        );
      })}
    </div>
  );
}

export default GroupResults;
