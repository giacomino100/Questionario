import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../API';
import { Form, Button, Alert, Modal} from 'react-bootstrap';
import { iconBack } from './icons.js';
import { Question } from './Questions&Answers.js'

function ModalEnd(props) {

  return (
      <Modal show={props.show} onHide={props.handleClose} backdrop="static">
          <Modal.Header>
              <Modal.Title>Complimenti, hai terminato il questionario!</Modal.Title>
          </Modal.Header>
          <Form>
            <Modal.Body>
              <Form.Group controlId='selectedName'>
                <Form.Label>Clicca sul tasto per tornare ai questionari</Form.Label>
              </Form.Group>              
            </Modal.Body>
            <Modal.Footer>
                <Link to="/"><Button>Vai</Button></Link>
            </Modal.Footer>
          </Form>
      </Modal>
  );
}

function Module(props){
  const location = useLocation();
  const [idSurvey, setIdSurvey] = useState(location.state ? location.state.idSurvey : '');
  const [name, setName] = useState(location.state ? location.state.name : '');
  const [description, setDescription] = useState(location.state ? location.state.description : '');
  const [client, setClient] = useState(location.state ? location.state.client : '');

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([])
  const [results, setResults] = useState([]);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [validate, setValidate] = useState(false);
  const [message, setMessage] = useState([]);


  useEffect ( () => {
    const getAllQuestionsById = async(id) => {
        try {
          const questions = await API.getAllQuestionsById(id);
          setQuestions(questions);
        } catch (err) {
          console.error(err.error);        
        }
      }
    getAllQuestionsById(idSurvey).then( () => {
      setLoading(false);
    })
  }, [idSurvey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    
    let mess = [];

    for(let i = 0; i < questions.length; i++){
      const answersChecked = results.filter( r => r.numberQ == questions[i].numberQ && r.value == 1).length;
      if(questions[i].type == 1){
        if(answersChecked < questions[i].min){
          mess.push(`Errore domanda ${questions[i].numberQ}: rispettare il minimo`);
        }
        if(answersChecked > questions[i].max){
          mess.push(`Errore domanda ${questions[i].numberQ}: rispettare il massimo`);
        }
      } else{
        const answerOpen = results.filter( r => r.numberQ == questions[i].numberQ);
        /**Qua ho dovuto inserire un doppio controllo perchè se non si tocca il box abbiamo una risposta vuota, viceversa se scrivo
         *  e poi cancello ho una stringa vuota
         */
        if(questions[i].optional == 0 && (answerOpen.length == 0 || answerOpen[0].value=='')){ 
          mess.push(`Errore domanda ${questions[i].numberQ}: la domanda è obbligatoria!`);
        }
      }
    }

    setMessage(mess)

    if(mess.length != 0) 
      setValidate(true)
    else 
      setValidate(false)

    if(mess.length == 0){ // si puo integrare questo if nell'else precedente
      results.forEach( async r => await API.publishResult(r));
      setShow(true)
    } 

  };



  return ( <>
      <Link to="/"><span style={{cursor:'pointer'}} onClick={() => props.setUpdated(true)}>{iconBack}&nbsp;Torna ai questionari</span></Link>
      <hr></hr> 
      <h1>Ciao {client}</h1>&nbsp; &nbsp; 

      <h1>Titolo: {name}</h1>
      <h3>Descrizione: {description}</h3>
      {loading ? <span>🕗 Please wait, loading all questions... 🕗</span> :
      <>
      {questions.map( q => <Question key={q.number} 
        idQuestion={q.id} 
        numberQ={q.numberQ} 
        text={q.text}
        type={q.type} 
        optional={q.optional}
        max={q.max}
        min={q.min}
        idSurvey={idSurvey} 
        results={results}
        setResults={setResults} 
        client={client}
        readOnly={props.readOnly}>
        </Question>)}
      </>}
      {validate ? <>{ message.map( m => <Alert key={m} variant='danger'>{m}</Alert>)}</> : ''}
      <Button variant='primary' onClick={handleSubmit}>Invia</Button>
      <ModalEnd show={show} handleClose={handleClose} handleShow={handleShow} results={results}/>
     </>

  );
}

export {Module};
