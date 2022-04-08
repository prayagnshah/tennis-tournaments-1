import axios from "axios";

export const getTournaments = async () => {
  const url = `${process.env.REACT_APP_BASE_URL}/tennis/tournaments/`;
  try {
    const response = await axios.get(url);
    return { response, isError: false };
  } catch (response) {
    return { response, isError: true };
  }
};

export const getTournamentDetail = async (id) => {
  const url = `${process.env.REACT_APP_BASE_URL}/tennis/tournament/${id}/`;
  try {
    const response = await axios.get(url);
    return { response, isError: false };
  } catch (response) {
    return { response, isError: true };
  }
};
