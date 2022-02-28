import Reacket from "reacket";
import { useState, useEffect } from "react";
import axios from "axios";

function DrawResults({ forTournament }) {
  const [draw, setDraw] = useState();
  //   const [matches, setMatches] = useState([]);
  //   const matches = require("./testData.json"); // manual data for tournamnet draw
  let matches = [];

  const getResults = async () => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/elimination-draw/?tournament_id=${forTournament}`;
    console.log(url);
    try {
      const response = await axios.get(url);
      setDraw(response.data);
    } catch (e) {
      setDraw();
      console.error(e);
    }
  };

  useEffect(() => {
    getResults();
  }, []);

  //   Make sure the passed data for concersion has the right number of matches
  if (draw) {
    if (draw.matches.length !== draw.size - 1) {
      console.error(
        `Reacket: there should be ${draw.size - 1} matches but ${
          draw.matches.length
        } was provided`
      );
    } else {
      matches = ConvertDrawResultsForReacket(draw);
    }
  } else {
    return null;
  }

  return (
    <div className="scrolling-wrapper">
      <Reacket matches={matches} />
    </div>
  );
}

export default DrawResults;

function ConvertDrawResultsForReacket(dataToConvert) {
  // Coverts server response to data format used by Reacket
  let dataToReturn = [];

  const convertPlayer = (playerToConvert) => {
    let convertedPlayer = {};
    convertedPlayer.id = playerToConvert.id;
    convertedPlayer.name =
      playerToConvert.first_name + " " + playerToConvert.last_name;
    convertedPlayer.seed = undefined; // forcefully set to undefined - this fgeature is not yet implemented to backend and probably it does not have any affect on the rendering
    return convertedPlayer;
  };

  dataToConvert.matches.map((matchToConvert) => {
    let convertedMacth = {};
    let convertedPlayers = [];
    let convertedScore = [];

    convertedMacth.id = matchToConvert.match;
    convertedMacth.round = matchToConvert.round_of;
    convertedMacth.match = matchToConvert.match;
    // Convert Player_1
    convertedPlayers.push(convertPlayer(matchToConvert.set_stat.player_1));
    // Convert Player_2
    convertedPlayers.push(convertPlayer(matchToConvert.set_stat.player_2));
    // Assign players to wanted result format
    convertedMacth.players = convertedPlayers;

    // Convert Score
    convertedScore.push(matchToConvert.set_stat.score_p1);
    convertedScore.push(matchToConvert.set_stat.score_p2);
    convertedMacth.score = convertedScore;
    dataToReturn.push(convertedMacth);
  });
  console.log("Concerted data:");
  console.log(dataToReturn);

  return dataToReturn;
}
