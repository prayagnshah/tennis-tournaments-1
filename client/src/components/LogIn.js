import React, { useState } from 'react';
import { Formik } from 'formik';
import { Link, Navigate } from 'react-router-dom';
import { Card, Button, Form } from 'react-bootstrap';

function LogIn (props) {

  const [isSubmitted, setSubmitted] = useState(false);
  const onSubmit = (values, actions) => setSubmitted(true);

  if (isSubmitted) {
    return <Navigate to='/' />;
  }

  return (
    <>
      <Card>
        <Card.Header>Log in</Card.Header>
        <Card.Body>
          <Formik
            initialValues={{
              username: '',
              password: ''
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
                    value={values.username}
                  />
                </Form.Group>
                <Form.Group className='mb-3' controlId='password'>
                  <Form.Label>Password:</Form.Label>
                  <Form.Control 
                    name='password' 
                    type='password' 
                    onChange={handleChange}
                    vale={values.password}
                  />
                </Form.Group>
                <div className='d-grid mb-3'>
                  <Button type='submit' variant='primary'>Log in</Button>
                </div>
              </Form>
            )}
          </Formik>
          <Card.Text className='text-center'>
            Don't have an account? <Link to='/sign-up'>Sign up!</Link>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
}

export default LogIn;