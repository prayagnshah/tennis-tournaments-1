/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Formik } from "formik";
import { Link, Navigate } from "react-router-dom";
import {
  Card,
  Button,
  Form,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";

function LogIn({ isLoggedIn, logIn }) {
  const [isSubmitted, setSubmitted] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const onSubmit = async (values, actions) => {
    try {
      const { response, isError } = await logIn(values.email, values.password);
      console.log("username: " + values.email);
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
      <Container>
        <Row>
          <Col></Col>
          {/* From xs to sm has 12. from sm to lg has 8. From lg has 6  */}
          <Col sm="8" lg="6">
            <Card>
              <Card.Header>Log in</Card.Header>
              <Card.Body>
                <Formik
                  initialValues={{
                    email: "",
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
                    <>
                      {"__all__" in errors && (
                        <Alert variant="danger">{errors.__all__}</Alert>
                      )}
                      {"detail" in errors && (
                        <Alert variant="danger">{errors.detail}</Alert>
                      )}
                      <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="username">
                          <Form.Label>Email address:</Form.Label>
                          <Form.Control
                            name="email"
                            required
                            type="email"
                            onChange={handleChange}
                            value={values.email}
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
          </Col>
          <Col></Col>
        </Row>
      </Container>
    </>
  );
}

export default LogIn;
