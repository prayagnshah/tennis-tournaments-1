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

function CreateDrawFromCard({
  getGroups,
  tournament,
  isManager,
  draw,
  getEliminationDraw,
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

  const onSubmit = async (values, actions) => {
    const url = `${process.env.REACT_APP_BASE_URL}/tennis/elimination-draw/`;
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

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
      // console.error(data);
      if ("non_field_errors" in data) {
        setAlertDetail({
          show: true,
          variant: "danger",
          text: data["non_field_errors"],
        });
      } else {
        for (const value in data) {
          actions.setFieldError(value, data[value]);
        }
      }

      // if (data.players) {
      //   actions.setFieldError("players", data.players);
      // } else {
      //   console.error(data);
      // }
    }
    await getGroups();
    await getEliminationDraw();
  };

  const drawsCreated = () => {
    if (draw && draw[0] && draw[1]) {
      return true;
    }
    return false;
  };

  //   const PlayerOptions = ({ values }) => {
  //     //   If group is selected then show in options just players who are in the group, else show all registered players
  //     let foundGroup;
  //     if (values.group) {
  //       foundGroup = groups.find((group) => {
  //         return group.id === Number(values.group);
  //       });
  //     }
  //     return (
  //       <>
  //         <option value="">---</option>
  //         {foundGroup
  //           ? foundGroup.players.map((player) => (
  //               <option
  //                 value={player.id}
  //                 key={player.id}
  //               >{`${player.first_name} ${player.last_name}`}</option>
  //             ))
  //           : tournament.registrations.map((registration) => {
  //               if (registration.status === "REGISTERED") {
  //                 return (
  //                   <option
  //                     value={registration.user.id}
  //                     key={registration.user.id}
  //                   >
  //                     {`${registration.user.first_name} ${registration.user.last_name}`}
  //                   </option>
  //                 );
  //               }
  //             })}
  //       </>
  //     );
  //   };

  return (
    <>
      {tournament.status === "CONSOLIDATED" && isManager && !drawsCreated() && (
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            {showSetForm ? (
              <>
                <div className="d-flex justify-content-between">
                  <h4>Create elemination draw </h4>
                  <CloseButton
                    variant="white"
                    onClick={() => setShowSetForm(false)}
                  />
                </div>
                <hr />
                <ShowAlert />

                <Formik
                  initialValues={{
                    size: "",
                    type_of: "",
                    players: [],
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
                          <Form.Group className="mb-3" controlId="size">
                            <Form.Label>Select draw size</Form.Label>
                            <Form.Select
                              aria-label="Select draw size"
                              className={
                                errors.size && touched.size ? "is-invalid" : ""
                              }
                              name="size"
                              onChange={handleChange}
                              value={values.size}
                              onBlur={handleBlur}
                            >
                              <option value="">---</option>
                              <option value="4">4</option>
                              <option value="8">8</option>
                              <option value="16">16</option>
                              <option value="32">32</option>
                            </Form.Select>
                            {errors.size && touched.size && (
                              <Form.Control.Feedback type="invalid">
                                {errors.size}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="type_of">
                            <Form.Label>
                              Select elimination draw type
                            </Form.Label>
                            <Form.Select
                              aria-label="Select elimination draw type"
                              className={
                                errors.type_of && touched.type_of
                                  ? "is-invalid"
                                  : ""
                              }
                              name="type_of"
                              onChange={handleChange}
                              value={values.type_of}
                              onBlur={handleBlur}
                            >
                              <option value="">---</option>
                              <option value="MAIN">MAIN</option>
                              <option value="SECONDARY">SECONDARY</option>
                            </Form.Select>
                            {errors.type_of && touched.type_of && (
                              <Form.Control.Feedback type="invalid">
                                {errors.type_of}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

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
                            if (registration.status === "REGISTERED") {
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
                      {/* <pre>{JSON.stringify(errors, null, 4)}</pre>
                      <pre>{JSON.stringify(touched, null, 4)}</pre> */}

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
                  + Create elimination draw
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
}

export default CreateDrawFromCard;
