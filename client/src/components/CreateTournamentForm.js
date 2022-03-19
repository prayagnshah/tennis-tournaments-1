import React from "react";
import { useState } from "react";
import { Formik } from "formik";
import { Form, Button, CloseButton, Card } from "react-bootstrap";
import * as Yup from "yup";
// import { useState } from "react";
import axios from "axios";

import { getAccessToken } from "../services/AuthService";

function CreateTournamentForm({ setIsTournamentCreated, isManager }) {
  const [showTournamentForm, setShowTournamentForm] = useState(false);

  const onSubmit = async (values, actions) => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/tournaments/`;
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    let valuestToSubmit;

    // Test data setup
    // values.category = "START";
    // values.name = "Test";
    // values.event_date = "";
    // values.place = "palm";
    // values.prestige = 5;
    // values.surface = "CLAY";
    // values.capacity = 16;
    // values.status = "OPEN";
    // values.price = 500;
    // values.event_date = "2022-03-20";

    valuestToSubmit = { ...values }; // copy values to avoid event_date warning once the format is changed for backend

    // Set the corract date format for backend
    valuestToSubmit.event_date += "T09:00:00Z";

    try {
      await axios.post(url, valuestToSubmit, { headers });
      setIsTournamentCreated(true);
      formDisappear();

      actions.resetForm({
        values: {
          name: "",
          place: "",
          prestige: "",
          category: "",
          event_date: "",
          surface: "",
          capacity: "",
          status: "",
          price: "",
        },
      });
    } catch (response) {
      const data = response.response.data;
      for (const value in data) {
        actions.setFieldError(value, data[value]);
      }
    }
  };

  const formDisappear = () => {
    setShowTournamentForm(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <>
      {isManager && (
        <>
          {showTournamentForm ? (
            <>
              <Card className="mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <h4>Add tournament group </h4>
                    <CloseButton
                      variant="white"
                      onClick={() => formDisappear()}
                    />
                  </div>
                  <hr />
                  <Formik
                    initialValues={{
                      name: "",
                      place: "",
                      prestige: "",
                      category: "",
                      event_date: "",
                      surface: "",
                      capacity: "",
                      status: "",
                      price: "",
                    }}
                    validationSchema={Yup.object({
                      name: Yup.string()
                        .max(50, "Must be 50 characters or less")
                        .required("Required"),
                      place: Yup.string()
                        .max(20, "Must be 15 characters or less")
                        .required("Required"),
                      prestige: Yup.mixed().required("Required"),
                      category: Yup.mixed().required("Required"),
                      event_date: Yup.mixed().required("Required"),
                      surface: Yup.mixed().required("Required"),
                      capacity: Yup.mixed().required("Required"),
                      status: Yup.mixed().required("Required"),
                      price: Yup.mixed().required("Required"),
                    })}
                    onSubmit={onSubmit}
                  >
                    {({
                      handleChange,
                      handleSubmit,
                      handleBlur,
                      values,
                      errors,
                      touched,
                    }) => (
                      <Form noValidate onSubmit={handleSubmit} className="">
                        <Form.Group className="mb-3" controlId="name">
                          <Form.Label>Tournament name:</Form.Label>
                          <Form.Control
                            className={
                              errors.name && touched.name ? "is-invalid" : ""
                            }
                            name="name"
                            onChange={handleChange}
                            // required
                            value={values.name}
                            type="text"
                            onBlur={handleBlur}
                          />
                          {errors.name && touched.name && (
                            <Form.Control.Feedback type="invalid">
                              {errors.name}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="place">
                          <Form.Label>Place:</Form.Label>
                          <Form.Control
                            className={
                              errors.place && touched.place ? "is-invalid" : ""
                            }
                            name="place"
                            onChange={handleChange}
                            required
                            value={values.place}
                            type="text"
                            onBlur={handleBlur}
                          />
                          {errors.place && touched.place && (
                            <Form.Control.Feedback type="invalid">
                              {errors.place}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="place">
                          <Form.Label>Prestige:</Form.Label>
                          <Form.Select
                            aria-label="Category select"
                            className={
                              errors.prestige && touched.prestige
                                ? "is-invalid"
                                : ""
                            }
                            name="prestige"
                            onChange={handleChange}
                            value={values.prestige}
                            onBlur={handleBlur}
                          >
                            <option>---</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                          </Form.Select>
                          {errors.prestige && touched.prestige && (
                            <Form.Control.Feedback type="invalid">
                              {errors.prestige}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="category">
                          <Form.Label>Category:</Form.Label>
                          <Form.Select
                            aria-label="Category select"
                            className={
                              errors.category && touched.category
                                ? "is-invalid"
                                : ""
                            }
                            name="category"
                            onChange={handleChange}
                            value={values.category}
                            onBlur={handleBlur}
                          >
                            <option>---</option>
                            <option value="START">START</option>
                            <option value="SPORT">SPORT</option>
                            <option value="CHALLENGER">CHALLENGER</option>
                          </Form.Select>
                          {errors.category && touched.category && (
                            <Form.Control.Feedback type="invalid">
                              {errors.category}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="event_date">
                          <Form.Label>Date:</Form.Label>
                          <Form.Control
                            type="date"
                            name="event_date"
                            className={
                              errors.event_date && touched.event_date
                                ? "is-invalid"
                                : ""
                            }
                            onChange={handleChange}
                            required
                            value={values.event_date}
                            onBlur={handleBlur}
                          />
                          {errors.event_date && touched.event_date && (
                            <Form.Control.Feedback type="invalid">
                              {errors.event_date}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="surface">
                          <Form.Label>Surface:</Form.Label>
                          <Form.Select
                            aria-label="Surface select"
                            className={
                              errors.surface && touched.surface
                                ? "is-invalid"
                                : ""
                            }
                            name="surface"
                            onChange={handleChange}
                            value={values.surface}
                            onBlur={handleBlur}
                          >
                            <option>---</option>
                            <option value="CLAY">CLAY</option>
                            <option value="HARD">HARD</option>
                            <option value="ARTIFICAL_TURF">
                              ARTIFICAL_TURF
                            </option>
                            <option value="GRASS">GRASS</option>
                          </Form.Select>
                          {errors.surface && touched.surface && (
                            <Form.Control.Feedback type="invalid">
                              {errors.surface}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="capacity">
                          <Form.Label>Capacity:</Form.Label>
                          <Form.Select
                            aria-label="Surface select"
                            className={
                              errors.capacity && touched.capacity
                                ? "is-invalid"
                                : ""
                            }
                            name="capacity"
                            onChange={handleChange}
                            value={values.capacity}
                            onBlur={handleBlur}
                          >
                            <option>---</option>
                            <option value="8">8</option>
                            <option value="16">16</option>
                            <option value="32">32</option>
                          </Form.Select>
                          {errors.capacity && touched.capacity && (
                            <Form.Control.Feedback type="invalid">
                              {errors.capacity}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="status">
                          <Form.Label>Status:</Form.Label>
                          <Form.Select
                            aria-label="Surface select"
                            className={
                              errors.status && touched.status
                                ? "is-invalid"
                                : ""
                            }
                            name="status"
                            onChange={handleChange}
                            value={values.status}
                            onBlur={handleBlur}
                          >
                            <option>---</option>
                            <option value="OPEN">OPEN</option>
                            <option value="CONSOLIDATED">CONSOLIDATED</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </Form.Select>
                          {errors.status && touched.status && (
                            <Form.Control.Feedback type="invalid">
                              {errors.status}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="price">
                          <Form.Label>Price:</Form.Label>
                          <Form.Select
                            aria-label="Surface select"
                            className={
                              errors.price && touched.price ? "is-invalid" : ""
                            }
                            name="price"
                            onChange={handleChange}
                            value={values.price}
                            onBlur={handleBlur}
                          >
                            <option>---</option>
                            <option value="500">500 CZK</option>
                            <option value="1000">1000 CZK</option>
                          </Form.Select>
                          {errors.price && touched.price && (
                            <Form.Control.Feedback type="invalid">
                              {errors.price}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        {/* {errors && (
              <div>
                <div>{JSON.stringify(errors, null, 2)}</div>
                <div>{JSON.stringify(touched, null, 2)}</div>
                <div>{JSON.stringify(values, null, 2)}</div>
              </div>
            )} */}

                        <Button type="submit" variant="primary">
                          Submit
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Card.Body>
              </Card>
            </>
          ) : (
            <div className="d-grid mb-4">
              <Button
                variant="primary"
                onClick={() => {
                  setShowTournamentForm(true);
                }}
              >
                + Create Tournament
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default CreateTournamentForm;
