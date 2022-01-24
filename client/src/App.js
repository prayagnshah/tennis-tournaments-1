import React from 'react';

import './App.css';
import { Outlet } from 'react-router-dom';

function App () {
  return (
    <>
      <h1>App component</h1>
      <Outlet />
    </>
  );
}

export default App;