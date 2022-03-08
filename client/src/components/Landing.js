import React from "react";
import { Link, Navigate } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
function Landing({ isLoggedIn }) {
  if (isLoggedIn) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <div className="container d-flex mh-100">
        <div className="text-center my-auto mx-auto">
          <h2>
            <p>Welcome to Tennis Tournaments.</p>
            <p>Community where you can freely join amateur tournaments!</p>
          </h2>
          <hr />
          <h5 className="text-secondary mb-3">
            Three categories for different levels from beginner to advanced
          </h5>

          <Link className="btn btn-info mx-2" to="/sign-up">
            Sign up!
          </Link>
          <Link className="btn btn-info mx-2" to="/log-in">
            Log in!
          </Link>
        </div>
      </div>
    </>
  );
}

export default Landing;
