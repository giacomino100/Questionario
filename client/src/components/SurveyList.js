import { useEffect, useState } from 'react';
import {Redirect, Link} from 'react-router-dom';
import {Table, Form, Modal, Button, Row, Alert } from 'react-bootstrap';
import API from '../API';
import Spinner from 'react-bootstrap/Spinner'

function ModalCompile(props) {
  const [name, setName] = useState('');
  const [valid, setValid] = useState(false);

  const submit = async (e) => {
      e.preventDefault();

      if(name == '')
        setValid(false);
      else{
          props.setClient(name);
          setValid(true);
        }
  }
  
  return (
      <Modal show={props.show} onHide={props.handleClose} backdrop="static">
      {valid && <Redirect to={{
                  pathname: "/compile",
                  state: { idSurvey: props.idSurvey, name: props.name, description: props.description, client: props.client }
                }} />}    

          <Modal.Header closeButton>
              <Modal.Title>Attenzione!</Modal.Title>
          </Modal.Header>

          <Form  onSubmit={submit}>

              <Modal.Body>
                <Form.Group controlId='selectedName'>
                  <Form.Label>Per favore inserisci il tuo nome prima di iniziare</Form.Label>
                  <Form.Control type='text' onChange={ev => setName(ev.target.value)} required/>
                </Form.Group>              
              </Modal.Body>
              
              <Modal.Footer>
                  <Button type="submit">Ok, fatto!</Button>
              </Modal.Footer>
          </Form>
      </Modal>
  );
}

function SurveyRow(props){
  const [show, setShow] = useState(false);
  const [client, setClient] = useState('');
  const [viewers, setViewers] = useState(0);
  const [loadingViewers, setLoadingViewers] = useState(true);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let statusClass = null;

  useEffect( () => {
    let subscription = true;
    const getResultsByIdSurvey = async(id) => {
      try {
        const resultsBySurvey = await API.getClientsByIdSurvey(id);
        if(subscription){
          setViewers(resultsBySurvey.length);
          setLoadingViewers(false)
        }
      } catch (err) {
        console.error(err.error);      
      }
    }
    if(props.readOnly && props.loggedIn){
        getResultsByIdSurvey(props.idSurvey)
    }

    return () => subscription = false;
  }, [props.readOnly, props.loggedIn])
  
  
  switch(props.status) {
    case 'added':
      statusClass = 'table-success';
      break;
    default:
      break;
  }


    return (<>
        <tr className={statusClass}>
            <td>{props.name}</td>
            <td>{props.description}</td>

           {props.loggedIn ? <>{loadingViewers ? <td><Spinner animation="border" role="status">
                                                        <span className="visually-hidden"></span>
                                                      </Spinner>
                                                  </td> : <td>{viewers}</td>}</> 
                                                  : 
                                                  <td><Button  onClick={handleShow}>Compila</Button></td>}

           {(props.loggedIn && viewers>0) ? <td><Link to={{
                  pathname: "/result",
                  state: { idSurvey: props.idSurvey, name: props.name, description: props.description}
                }}><Button>Visualizza risultati</Button></Link></td> : <td></td>}
          </tr>
        <ModalCompile idSurvey={props.idSurvey} name={props.name} description={props.description} show={show} handleClose={handleClose} handleShow={handleShow} client={client} setClient={setClient}/>
    </>);
}


function SurveyList(props){
    const [message, setMessage] = useState('');

    return ( <>

    {props.loggedIn ? <h3>Ciao {props.user}, ecco i tuoi questionari</h3> : <h3>Ciao, ecco i questionari che puoi compilare</h3>}
    {message && <Row>
         <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
      </Row> }
    <Table striped bordered>
        <thead>
            <tr>
              <th>Questionario</th>
              <th>Descrizione</th>
              {props.loggedIn ? <th>N. Utilizzatori</th> : <th> </th>}
            </tr>
        </thead>
        <tbody>
          {props.loggedIn ? props.surveys.map((sv) =>  <SurveyRow key={sv.id} idSurvey={sv.id} name={sv.name} description={sv.description} loggedIn={props.loggedIn} status={sv.status} readOnly={props.readOnly}/>)
          : props.surveys.map(sv => <SurveyRow key={sv.id} idSurvey={sv.id} name={sv.name} description={sv.description} loggedIn={props.loggedIn} status={sv.status} readOnly={props.readOnly}/>)}
        </tbody>
    </Table>
    </>
);
}

export default SurveyList;
