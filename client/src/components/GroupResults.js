import React from "react";
import { Table, Card } from "react-bootstrap";
import useWindowDimensions from "../services/WindowDimensions";

function GroupResults({ results }) {
  // retruns matrix table with players in rows and columns and with the corresponding results with each other
  //   for finding the scores for the right cells, nested map functions are applied
  const groups = [...results];
  const HighlightWinnerGame = ({ score1, score2 }) => {
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

  // console.log(useWindowDimensions().width);
  // 576

  const windowWidth = useWindowDimensions().width;

  return (
    <Card className="shadow-sm tournament-tables mb-3">
      <Card.Header>
        <h4 className="mb-0">Group results</h4>
      </Card.Header>
      <Card.Body>
        <div className="scrolling-wrapper">
          <div>
            {groups.map((group, k) => {
              return (
                <Table bordered key={k} className="d-inline-flex">
                  <tbody>
                    <tr>
                      <th className="text-info col-width">{group.name}</th>
                      {group.players.map((player, i) => {
                        return (
                          <th
                            scope="col"
                            key={i}
                            style={{ width: "45px" }}
                            className="text-center"
                          >
                            {windowWidth > 576
                              ? player.last_name
                              : player.last_name.substring(0, 3)}
                          </th>
                        );
                      })}
                      <th
                        scope="col"
                        style={{ borderLeft: "2px double rgb(52, 152, 219)" }}
                      >
                        {windowWidth > 576 ? "Sets" : "Set"}
                      </th>
                      <th scope="col" className="text-center">
                        {windowWidth > 576 ? "Games" : "Gam"}
                      </th>
                      <th scope="col">
                        {windowWidth > 576 ? "Position" : "Pos"}
                      </th>
                    </tr>
                    {group.players.map((rowPlayer, i) => {
                      const playerScore = group.scores.find(
                        (score) => score.player.id === rowPlayer.id
                      );
                      return (
                        <tr key={i}>
                          <th scope="row">
                            {windowWidth > 576
                              ? `${rowPlayer.first_name} ${rowPlayer.last_name}`
                              : rowPlayer.last_name}
                          </th>
                          {/* Score calculation for each cell */}
                          {group.players.map((playerInner, j) => {
                            let toRender = "";
                            let set = undefined;
                            if (playerInner.id === rowPlayer.id) {
                              toRender = "--";
                            } else {
                              set = group.set_stats.find(
                                ({ player_1, player_2 }) => {
                                  return (
                                    player_1.id === rowPlayer.id &&
                                    player_2.id === playerInner.id
                                  );
                                }
                              );
                              if (set) {
                                //   toRender = `${set.score_p1} : ${set.score_p2}`;
                                // toRender = highlightWinnerGame(
                                //   set.score_p1,
                                //   set.score_p2
                                // );
                                toRender = (
                                  <HighlightWinnerGame
                                    score1={set.score_p1}
                                    score2={set.score_p2}
                                  />
                                );
                              }
                              if (!set) {
                                set = group.set_stats.find(
                                  ({ player_1, player_2 }) => {
                                    return (
                                      player_1.id === playerInner.id &&
                                      player_2.id === rowPlayer.id
                                    );
                                  }
                                );
                                if (set) {
                                  // toRender = `${set.score_p2} : ${set.score_p1}`;
                                  // toRender = HighlightWinnerGame(
                                  //   set.score_p2,
                                  //   set.score_p1
                                  // );
                                  toRender = (
                                    <HighlightWinnerGame
                                      score1={set.score_p2}
                                      score2={set.score_p1}
                                    />
                                  );
                                }
                              }
                            }
                            return (
                              <td
                                key={j}
                                className={lightBgClassForScoresInTd(toRender)}
                                style={{ borderRight: "none" }}
                              >
                                {toRender}
                              </td>
                            );
                          })}

                          <td
                            className="text-center"
                            style={{
                              borderLeft: "2px double rgb(52, 152, 219)",
                            }}
                          >
                            {playerScore && playerScore.sets_won}
                          </td>
                          <td className="text-center">
                            {playerScore && playerScore.games}
                          </td>
                          <td className="text-center">
                            {playerScore &&
                              playerScore.position !== 0 &&
                              playerScore.position}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              );
            })}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default GroupResults;
