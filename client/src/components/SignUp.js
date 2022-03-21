/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Formik } from "formik";
import { Link, Navigate } from "react-router-dom";
import { Card, Button, Form, Container, Col, Row } from "react-bootstrap";
import axios from "axios";

function SignUp(props) {
  const [isSubmitted, setSubmitted] = useState(false);
  const onSubmit = async (values, actions) => {
    const url = `${process.env.REACT_APP_BASE_URL}/api/sign_up/`;
    console.log(url);
    const formData = new FormData();
    // Duplicating email info as backend main identifier is username for now. We set username and email a same value
    // Future improvement possibility - change backend to use just email field
    formData.append("username", values.email);
    formData.append("email", values.email);
    formData.append("first_name", values.firstName);
    formData.append("last_name", values.lastName);
    formData.append("password1", values.password);
    formData.append("password2", values.password);
    // console.log("password:");
    // console.log(values.password);
    // console.log(formData.password1);
    // console.log(formData);
    try {
      await axios.post(url, formData);
      console.log("submitted");
      setSubmitted(true);
    } catch (response) {
      const data = response.response.data;
      for (const value in data) {
        actions.setFieldError(value, data[value]);
      }
    }
  };

  if (isSubmitted) {
    return <Navigate to="/log-in" />;
  }

  if (props.isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Container>
        <Row>
          <Col></Col>
          {/* From xs to sm has 12. from sm to lg has 8. From lg has 6  */}
          <Col sm="8" lg="6">
            <Card>
              <Card.Header>Sign up</Card.Header>
              <Card.Body>
                <Formik
                  initialValues={{
                    email: "",
                    firstName: "",
                    lastName: "",
                    password: "",
                  }}
                  onSubmit={onSubmit}
                >
                  {({
                    handleChange,
                    handleSubmit,
                    values,
                    errors,
                    isSubmitting,
                  }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="username">
                        <Form.Label>Email address:</Form.Label>
                        <Form.Control
                          className={"email" in errors ? "is-invalid" : ""}
                          name="email"
                          onChange={handleChange}
                          required
                          values={values.email}
                          type="email"
                        />
                        {"username" in errors && (
                          <Form.Control.Feedback type="invalid">
                            {errors.username}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="firstName">
                        <Form.Label>First name:</Form.Label>
                        <Form.Control
                          className={"firstName" in errors ? "is-invalid" : ""}
                          name="firstName"
                          onChange={handleChange}
                          required
                          values={values.firstName}
                        />
                        {"firstName" in errors && (
                          <Form.Control.Feedback type="invalid">
                            {errors.firstName}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="lastName">
                        <Form.Label>Last name:</Form.Label>
                        <Form.Control
                          className={"lastName" in errors ? "is-invalid" : ""}
                          name="lastName"
                          onChange={handleChange}
                          required
                          values={values.lastName}
                        />
                        {"lastName" in errors && (
                          <Form.Control.Feedback type="invalid">
                            {errors.lastName}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password:</Form.Label>
                        <Form.Control
                          className={"password1" in errors ? "is-invalid" : ""}
                          name="password"
                          onChange={handleChange}
                          required
                          type="password"
                          value={values.password}
                        />
                        {"password1" in errors && (
                          <Form.Control.Feedback type="invalid">
                            {errors.password1}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                      <div className="d-grid mb-3">
                        <Button
                          disabled={isSubmitting}
                          type="submit"
                          variant="primary"
                        >
                          Sign up
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
                <Card.Text className="text-center">
                  Already have an account? <Link to="/log-in">Log in!</Link>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col></Col>
        </Row>
      </Container>
    </>
  );
}

export default SignUp;
