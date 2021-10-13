import { Container, Navbar, Form, Modal, Button } from 'react-bootstrap';
import { useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Link} from 'react-router-dom';
import loginLogo from '../menu-login.png';
import myLogo from '../myLogo.png';
import './HeaderNav.css'
import API from '../API';

function ModalLog(props) {

    const submit = async (e) => {
        e.preventDefault();
        await API.logOut();
        props.setLoggedIn(false);
        props.setUser('');
        props.setUpdated(true);
        props.handleClose();
    }
    
    return (
        <Modal show={props.show} onHide={props.handleClose}>

            { props.loggedIn ? <>

            <Modal.Header closeButton>
                <Modal.Title>Ciao {`${props.user}`}</Modal.Title>
            </Modal.Header>


            <Form onSubmit={submit}>
                <Modal.Body>
                <Form.Label>Sei sicuro di effettuare il logout?</Form.Label>
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.handleClose}>
                        No
                    </Button>
                    <Button variant="dark" type="submit">
                        Si
                    </Button>
                </Modal.Footer>
            </Form></>


            :
                <>

                <Modal.Header closeButton>
                <Modal.Title>Ciao User</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                <Form.Label>Accesso non eseguito</Form.Label>
                </Modal.Body>
                
                <Modal.Footer>
                    <Link to="/login"><Button variant="dark" onClick={props.handleClose}>Accedi</Button></Link>
                </Modal.Footer>
                </>
            }
        </Modal>
    );
}

const HeaderNav = (props) => {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Navbar className='bg-personal'>
                <Container>
                    <Navbar.Brand><img src={myLogo} alt='' className='myLogo'></img></Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        {props.loggedIn ? 
                        <span onClick={handleShow} style={{cursor:'pointer'}}><img src={loginLogo} alt='' className='loginLogo'></img>Questionari di {props.user}</span>
                        :
                        <span onClick={handleShow} style={{cursor:'pointer'}}><img src={loginLogo} alt='' className='loginLogo'></img>I miei questionari</span>
                        }
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
                </Navbar>
            <ModalLog show={show} handleClose={handleClose} handleShow={handleShow} user={props.user} setUser={props.setUser} setLoggedIn={props.setLoggedIn} loggedIn={props.loggedIn} setUpdated={props.setUpdated}/>
        </>
    );
}

export default HeaderNav;