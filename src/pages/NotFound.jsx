import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./NotFound.css";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Loopin</title>
        <meta name="description" content="The page you're looking for could not be found." />
      </Helmet>
      <div className="not-found-container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <Link to="/" className="btn-home">
            Go to Home
          </Link>
        </div>
      </div>
    </>
  );
}
