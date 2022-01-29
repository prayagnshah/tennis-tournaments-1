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
