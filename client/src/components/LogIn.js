import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';

function LogIn (props) {
  return (
    <>
      <Card>
        <Card.Header>Log in</Card.Header>
        <Card.Body>
          <Card.Text className='text-center'>
            Don't have an account? <Link to='/sign-up'>Sign up!</Link>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
}

export default LogIn;