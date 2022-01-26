import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';

function SignUp (props) {
  return (
    <>
      <Card>
        <Card.Header>Sign up</Card.Header>
        <Card.Body>
          <Card.Text className='text-center'>
            Already have an account? <Link to='/log-in'>Log in!</Link>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
}

export default SignUp;