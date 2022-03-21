// import React from "react";
import { useState } from "react";
import { Formik } from "formik";
import {
  Card,
  Button,
  CloseButton,
  Form,
  Alert,
  Col,
  Row,
} from "react-bootstrap";
// import * as Yup from "yup";
import axios from "axios";

import { getAccessToken } from "../services/AuthService";

function CreateSetFormCard({
  loadResults,
  tournament,
  groups,
  draw,
  isManager,
}) {
  const [showSetForm, setShowSetForm] = useState(false);
  const [alertDetail, setAlertDetail] = useState({
    show: false,
    variant: undefined,
    text: undefined,
  });

  const ShowAlert = () => {
    if (alertDetail.show) {
      return (
        <Alert
          variant={alertDetail.variant}
          onClose={() => setAlertDetail({ show: false })}
          dismissible
        >
          {alertDetail.text}
        </Alert>
      );
    } else {
      return null;
    }
  };

  const onSubmit = async (values) => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/sets/`;
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Test data
    // values.player_1 = 3;
    // values.player_2 = 4;
    // values.score_p1 = 6;
    // values.score_p2 = 4;

    // values.group = 31;
    // drawmatch

    values.tournament = tournament.id;
    try {
      await axios.post(url, values, { headers });
      setShowSetForm(false);
      setAlertDetail({
        show: false,
        variant: undefined,
        text: undefined,
      });
    } catch (response) {
      const data = response.response.data;
      //   console.error(data);
      if ("non_field_errors" in data) {
        setAlertDetail({
          show: true,
          variant: "danger",
          text: data["non_field_errors"],
        });
      }

      if ("draw_match" in data) {
        setAlertDetail({
          show: true,
          variant: "danger",
          text: "This match in the given draw already exists",
        });
      }

      //   if (data.players) {
      //     actions.setFieldError("players", data.players);
      //   } else {
      //     console.error(data);
      //   }
    }
    await loadResults();
  };

  const PlayerOptions = ({ values }) => {
    //   If group is selected then show in options just players who are in the group, else show all registered players
    let foundGroup;
    if (values.group) {
      foundGroup = groups.find((group) => {
        return group.id === Number(values.group);
      });
    }
    return (
      <>
        <option value="">---</option>
        {foundGroup
          ? foundGroup.players.map((player) => (
              <option
                value={player.id}
                key={player.id}
              >{`${player.first_name} ${player.last_name}`}</option>
            ))
          : tournament.registrations.map((registration) => {
              if (registration.status === "REGISTERED") {
                return (
                  <option
                    value={registration.user.id}
                    key={registration.user.id}
                  >
                    {`${registration.user.first_name} ${registration.user.last_name}`}
                  </option>
                );
              }
            })}
      </>
    );
  };

  return (
    <>
      {tournament.status === "CONSOLIDATED" && isManager && (
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            {showSetForm ? (
              <>
                <div className="d-flex justify-content-between">
                  <h4>Add set result </h4>
                  <CloseButton
                    variant="white"
                    onClick={() => setShowSetForm(false)}
                  />
                </div>
                <hr />
                <ShowAlert />

                <Formik
                  initialValues={{
                    player_1: "",
                    player_2: "",
                    score_p1: "0",
                    score_p2: "0",
                    group: "",
                    draw_match: "",
                  }}
                  //   validationSchema={Yup.object({
                  //     name: Yup.string()
                  //       .max(15, "Must be 15 characters or less")
                  //       .required("Required"),
                  //   })}
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
                    <Form noValidate onSubmit={handleSubmit}>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="group">
                            <Form.Label>Select group</Form.Label>
                            <Form.Select
                              aria-label="Select group for players set"
                              className={
                                errors.group && touched.group
                                  ? "is-invalid"
                                  : ""
                              }
                              name="group"
                              onChange={handleChange}
                              value={values.group}
                              onBlur={handleBlur}
                              disabled={values.draw_match && true}
                            >
                              <option value="">---</option>
                              {groups.map((group) => (
                                <option value={group.id} key={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </Form.Select>
                            {errors.group && touched.group && (
                              <Form.Control.Feedback type="invalid">
                                {errors.group}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="draw_match">
                            <Form.Label>Select draw match</Form.Label>
                            <Form.Select
                              aria-label="Select draw match"
                              className={
                                errors.draw_match && touched.draw_match
                                  ? "is-invalid"
                                  : ""
                              }
                              name="draw_match"
                              onChange={handleChange}
                              value={values.draw_match}
                              onBlur={handleBlur}
                              disabled={values.group && true}
                            >
                              <option value="">---</option>
                              {draw &&
                                draw[0] &&
                                draw[0].matches.map((match) => {
                                  return (
                                    <option
                                      value={match.id}
                                      key={match.id}
                                    >{`${draw[0].type_of} - Match No. ${match.match}, round: ${match.round_of}`}</option>
                                  );
                                })}
                              {draw &&
                                draw[1] &&
                                draw[1].matches.map((match) => {
                                  return (
                                    <option
                                      value={match.id}
                                      key={match.id}
                                    >{`${draw[1].type_of} - Match No. ${match.match}, round: ${match.round_of}`}</option>
                                  );
                                })}
                              {/* {groups.map((group) => (
                            <option value={group.id} key={group.id}>
                              {group.name}
                            </option>
                          ))} */}
                            </Form.Select>
                            {errors.draw_match && touched.draw_match && (
                              <Form.Control.Feedback type="invalid">
                                {errors.draw_match}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="player_1">
                            <Form.Label>Player 1</Form.Label>
                            <Form.Select
                              aria-label="Select player 1"
                              className={
                                errors.player_1 && touched.player_1
                                  ? "is-invalid"
                                  : ""
                              }
                              name="player_1"
                              onChange={handleChange}
                              value={values.player_1}
                              onBlur={handleBlur}
                            >
                              <PlayerOptions values={values} />

                              {/* {tournament.registrations.map((registration) => {
                            if (registration.status === "REGISTERED") {
                              return (
                                <option
                                  value={registration.user.id}
                                  key={registration.user.id}
                                >
                                  {`${registration.user.first_name} ${registration.user.last_name}`}
                                </option>
                              );
                            }
                          })} */}
                            </Form.Select>
                            {errors.player_1 && touched.player_1 && (
                              <Form.Control.Feedback type="invalid">
                                {errors.player_1}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="score_p1">
                            <Form.Label>Score for Player 1</Form.Label>
                            <Form.Select
                              aria-label="Score player 1"
                              className={
                                errors.score_p1 && touched.score_p1
                                  ? "is-invalid"
                                  : ""
                              }
                              name="score_p1"
                              onChange={handleChange}
                              value={values.score_p1}
                              onBlur={handleBlur}
                            >
                              {[...Array(8).keys()].map((x) => (
                                <option value={x.toString()} key={x}>
                                  {x}
                                </option>
                              ))}
                            </Form.Select>
                            {errors.score_p1 && touched.score_p1 && (
                              <Form.Control.Feedback type="invalid">
                                {errors.score_p1}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="player_2">
                            <Form.Label>Player 2</Form.Label>
                            <Form.Select
                              aria-label="Select player 2"
                              className={
                                errors.player_2 && touched.player_2
                                  ? "is-invalid"
                                  : ""
                              }
                              name="player_2"
                              onChange={handleChange}
                              value={values.player_2}
                              onBlur={handleBlur}
                            >
                              <PlayerOptions values={values} />
                              {/* <option value="">---</option>
                          {tournament.registrations.map((registration) => {
                            if (registration.status === "REGISTERED") {
                              return (
                                <option
                                  value={registration.user.id}
                                  key={registration.user.id}
                                >
                                  {`${registration.user.first_name} ${registration.user.last_name}`}
                                </option>
                              );
                            }
                          })} */}
                            </Form.Select>
                            {errors.player_2 && touched.player_2 && (
                              <Form.Control.Feedback type="invalid">
                                {errors.player_2}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="score_p2">
                            <Form.Label>Score for player 2</Form.Label>
                            <Form.Select
                              aria-label="Score player 2"
                              className={
                                errors.score_p2 && touched.score_p2
                                  ? "is-invalid"
                                  : ""
                              }
                              name="score_p2"
                              onChange={handleChange}
                              value={values.score_p2}
                              onBlur={handleBlur}
                            >
                              {[...Array(8).keys()].map((x) => (
                                <option value={x.toString()} key={x}>
                                  {x}
                                </option>
                              ))}
                            </Form.Select>
                            {errors.score_p2 && touched.score_p2 && (
                              <Form.Control.Feedback type="invalid">
                                {errors.score_p2}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button type="submit" variant="primary">
                        Submit
                      </Button>
                    </Form>
                  )}
                </Formik>
              </>
            ) : (
              <div className="d-grid">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowSetForm(true);
                  }}
                >
                  + Add set result
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
}

export default CreateSetFormCard;
