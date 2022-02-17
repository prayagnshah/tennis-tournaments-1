import axios from "axios";

export const getUser = () => {
  const auth = JSON.parse(window.localStorage.getItem("tennis.auth"));
  if (auth) {
    // eslint-disable-next-line prettier/prettier
    const [,payload,] = auth.access.split(".");
    const decoded = window.atob(payload);
    return JSON.parse(decoded);
  }
  return undefined;
};

export const getAccessToken = async () => {
  // Read access token from local storage or request a new one from server

  const requestAccessToken = async (auth) => {
    // request new access token from server with refresh token

    const url = `${process.env.REACT_APP_BASE_URL}/api/token/refresh/`;
    try {
      const response = await axios.post(url, {
        refresh: auth.refresh,
      });

      auth.access = response.data.access;
      window.localStorage.setItem("tennis.auth", JSON.stringify(auth));

      return response.data.access;
    } catch (error) {
      return error;
    }
  };

  const isTokenExpired = (token) => {
    // eslint-disable-next-line prettier/prettier
    const [,payload,] = token.split(".");
    const decoded = window.atob(payload);
    const exp = JSON.parse(decoded).exp;
    // console.log("Expiry time in minutes:");
    // console.log(Date.now() - exp * 1000);
    if (Date.now() >= exp * 1000) {
      return true;
    } else {
      return false;
    }
  };

  const auth = JSON.parse(window.localStorage.getItem("tennis.auth"));

  if (auth) {
    if (isTokenExpired(auth.access)) {
      const accessToken = await requestAccessToken(auth);

      return accessToken;
    } else {
      return auth.access;
    }
  }
  return undefined;
};
