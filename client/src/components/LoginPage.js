import React from 'react';
import { useState } from 'react';
import {Link} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

import API from '../API';

const LoginPage = (props) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [valid, setValid] = useState(true);

    const submit = async (e) => {
        e.preventDefault();

        setValid(true);

        const user = await API.logIn({ username: username, password: password});

        setUsername('');
        setPassword('');
        if (user) {
            props.setUser(user);
            props.setUpdated(true);
            props.setLoggedIn(true);
        }
        else
            setValid(false);
    };

    return (
        <Container>
            <br />
            <br />

            <Row>
                <Col className='d-flex justify-content-center'>
                    <h1>Questionario.App</h1>
                </Col>
            </Row>
            <Row>
                <Col className='d-flex justify-content-center'>
                    <h3>Accedi</h3>
                </Col>
            </Row>

            { !valid && <Row>
                <Col className='d-flex justify-content-center'>
                    <Alert variant='danger'>Incorrect Email and/or Password.</Alert>
                </Col>
            </Row> }

            <Row className='d-flex justify-content-center'>
                <Col sm={6}>
                    <Form onSubmit={submit}>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" onChange={(e) => setUsername(e.target.value)} value={username} required />
                        </Form.Group>

                        <Form.Group controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" onChange={(e) => setPassword(e.target.value)} value={password} required />
                        </Form.Group>

                        <Row className='d-flex justify-content-center'>
                            <Link to="/"><Button variant='secondary' onClick={() => props.setUpdated(true)}> Cancel</Button></Link>&nbsp;
                            <Button variant="dark" type="submit">Log in</Button>
                        </Row>
                    </Form>
                </Col>
            </Row>

        </Container>
    );
};

export default LoginPage;