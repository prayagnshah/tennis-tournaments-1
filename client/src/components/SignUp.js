import React, { useState } from 'react';
import { Formik } from 'formik';
import { Link, Navigate } from 'react-router-dom';
import { Card, Button, Form } from 'react-bootstrap';

function SignUp (props) {

  const [isSubmitted, setSubmitted] = useState(false);
  const onSubmit = (values, actions) => setSubmitted(true);

  if (isSubmitted) {
    return <Navigate to='/log-in' />;
  }

  return (
    <>
      <Card>
        <Card.Header>Sign up</Card.Header>
        <Card.Body>
          <Formik
            initialValues={{
              username: '',
              firstName: '',
              lastName: '',
              password: '',
            }}
            onSubmit={onSubmit}
          >
            {({
              handleChange,
              handleSubmit,
              values
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className='mb-3' controlId='username'>
                  <Form.Label>Username:</Form.Label>
                  <Form.Control
                    name='username'
                    onChange={handleChange}
                    values={values.username}
                  />
                </Form.Group>
                <Form.Group className='mb-3' controlId='firstName'>
                  <Form.Label>First name:</Form.Label>
                  <Form.Control
                    name='firstName'
                    onChange={handleChange}
                    values={values.firstName}
                  />
                </Form.Group>
                <Form.Group className='mb-3' controlId='lastName'>
                  <Form.Label>Last name:</Form.Label>
                  <Form.Control
                    name='lastName'
                    onChange={handleChange}
                    values={values.lastName}
                  />
                </Form.Group>
                <Form.Group className='mb-3' controlId='password'>
                  <Form.Label>Password:</Form.Label>
                  <Form.Control
                    name='password'
                    onChange={handleChange}
                    type='password'
                    value={values.password}
                  />
                </Form.Group>
                <div className='d-grid mb-3'>
                  <Button type='submit' variant='primary'>Sign up</Button>
                </div>
              </Form>
            )}
          </Formik>
          <Card.Text className='text-center'>
            Already have an account? <Link to='/log-in'>Log in!</Link>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
}

export default SignUp;