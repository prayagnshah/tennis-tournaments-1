/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Formik } from "formik";
import { Link, Navigate } from "react-router-dom";
import { Card, Button, Form, Alert } from "react-bootstrap";

function LogIn({ isLoggedIn, logIn }) {
  const [isSubmitted, setSubmitted] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const onSubmit = async (values, actions) => {
    try {
      const { response, isError } = await logIn(
        values.username,
        values.password
      );
      if (isError) {
        const data = response.response.data;
        console.log(data);

        for (const value in data) {
          // console.log("value: " + value);
          // console.log("Data: " + data);
          actions.setFieldError(value, data[value]);
          //actions.setFieldError(value, data[value].join(" "));
        }
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isSubmitted || isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Card>
        <Card.Header>Log in</Card.Header>
        <Card.Body>
          <Formik
            initialValues={{
              username: "",
              password: "",
            }}
            onSubmit={onSubmit}
          >
            {({ handleChange, handleSubmit, values, errors, isSubmitting }) => (
              <>
                {"__all__" in errors && (
                  <Alert variant="danger">{errors.__all__}</Alert>
                )}
                {"detail" in errors && (
                  <Alert variant="danger">{errors.detail}</Alert>
                )}
                <Form noValidate onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Username:</Form.Label>
                    <Form.Control
                      name="username"
                      onChange={handleChange}
                      value={values.username}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control
                      name="password"
                      type="password"
                      onChange={handleChange}
                      vale={values.password}
                    />
                  </Form.Group>
                  <div className="d-grid mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                    >
                      Log in
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </Formik>
          <Card.Text className="text-center">
            Don't have an account? <Link to="/sign-up">Sign up!</Link>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
}

export default LogIn;
