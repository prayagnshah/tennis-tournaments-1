// import React from "react";
import { useState } from "react";
import { Formik } from "formik";
import { Form, Button, CloseButton, Card } from "react-bootstrap";
import * as Yup from "yup";
import axios from "axios";
import { getAccessToken } from "../services/AuthService";

function CreateGroupFormCard({ tournament, groups, loadResults, isManager }) {
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);

  const onSubmit = async (values, actions) => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/groups-for-tournament/${tournament.id}/`;
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    values.tournament = tournament.id;
    // console.log(values);

    try {
      await axios.post(url, values, { headers });

      setShowCreateGroupForm(false);
    } catch (response) {
      const data = response.response.data;
      if (data.players) {
        actions.setFieldError("players", data.players);
      } else {
        console.error(data);
      }
    }
    await loadResults();
  };

  const isPlayerInGroup = (player) => {
    let toReturn = false;
    if (groups.length > 0) {
      groups.map((group) => {
        group.players.map((groupPayer) => {
          if (player.id === groupPayer.id) {
            toReturn = true;
          }
        });
      });
    }

    return toReturn;
  };

  return (
    <>
      {isManager && tournament.status === "CONSOLIDATED" && (
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            {!showCreateGroupForm ? (
              <div className="d-grid">
                <Button
                  variant="primary"
                  onClick={() => setShowCreateGroupForm(true)}
                >
                  + Create group
                </Button>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between">
                  <h4>Add tournament group </h4>
                  <CloseButton
                    variant="white"
                    onClick={() => setShowCreateGroupForm(false)}
                  />
                </div>

                <hr />
                <Formik
                  initialValues={{
                    name: "",
                    players: [],
                  }}
                  validationSchema={Yup.object({
                    name: Yup.string()
                      .max(15, "Must be 15 characters or less")
                      .required("Required"),
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
                        <Form.Label>Group name:</Form.Label>
                        <Form.Control
                          className={
                            errors.name && touched.name ? "is-invalid" : ""
                          }
                          name="name"
                          onChange={handleChange}
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

                      <Form.Group className="mb-3" controlId="players">
                        <Form.Label>Select players:</Form.Label>
                        <Form.Select
                          aria-label="Players select"
                          className={
                            errors.players && touched.players
                              ? "is-invalid"
                              : ""
                          }
                          name="players"
                          onChange={handleChange}
                          value={values.players}
                          onBlur={handleBlur}
                          multiple
                          //   as="select"
                        >
                          {tournament.registrations.map((registration, i) => {
                            if (
                              !isPlayerInGroup(registration.user) &&
                              registration.status === "REGISTERED"
                            ) {
                              return (
                                <option value={registration.user.id} key={i}>
                                  {`${registration.user.first_name} ${registration.user.last_name}`}
                                </option>
                              );
                            }
                          })}
                        </Form.Select>
                        {errors.players && touched.players && (
                          <Form.Control.Feedback type="invalid">
                            {errors.players}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      <Button type="submit" variant="primary">
                        Submit
                      </Button>
                    </Form>
                  )}
                </Formik>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
}

export default CreateGroupFormCard;
