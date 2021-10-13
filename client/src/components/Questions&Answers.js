import { Form, Card, Col, Row, Alert} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { iconDelete, iconUp, iconDown } from './icons.js';
import API from '../API';

function Answer(props){
    const [type, setType] = useState(''); //qua sarebbe stato piu corretto inizilizzarlo a zero
  
    useEffect(()=>{
      if(props.readOnly){
        const myType = props.value.filter( x => x.numberA == props.numberA).map(x => x.value);
        setType(myType == 1 ? true : false)
      }
    }, [props.value, props.numberA, props.readOnly])
  
    const editAnswerClose = (ev) => {
      setType(ev.target.checked);
      const qResults = props.results.filter( r => r.numberQ != props.numberQ);
      const otherResults = props.results.filter( r => r.numberQ == props.numberQ).filter(r=> r.numberA != props.numberA);
      let newResult = {client: props.client, idSurvey: props.idSurvey, numberQ: props.numberQ, numberA: props.numberA, value: type ? 0 : 1}
      otherResults.push(newResult);
      const finalArray = otherResults.concat(qResults);
      props.setResults(finalArray);
    }
  
    return(<>
            <Form.Group controlId="formBasicCheckbox" style={{padding: "5px"}}>
              <Row>
                <Col>
                {props.loggedIn || props.readOnly ? 
                <Form.Check disabled type="checkbox" label={props.text} onChange={ev => editAnswerClose(ev)} checked={type}/>         
                :
                <Form.Check type="checkbox" label={props.text} onChange={ev => editAnswerClose(ev)} checked={type}/>
                }
                </Col>
                <Col>
                {(props.loggedIn && !props.readOnly) ? <span style={{cursor: 'pointer'}} onClick={() => props.deleteAnswer(props.id)}>{iconDelete}</span> : ''}
                </Col>
              </Row>
            </Form.Group>
          </> )
  }
  
  function Question(props){
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dirty, setDirty] = useState(true);
    const [value, setValue] = useState('');
    const [errorMessageLength, setErrorMessageLength] = useState('') ;
  
    useEffect( () => {
      if(!dirty){
          setDirty(true);
      }
    }, [dirty])
  
    useEffect ( () => {    
      const getAllAnswersById = async(id) => {
          try {
            const answers = await API.getAllAnswersById(id);
            setAnswers(answers);
            /** Questo if serve per poter settare il vettore che deve contenere i risultati dell'utilizzatore */
            if(!props.readOnly){
              if(props.type == 0){
                props.setResults([...props.results, {client: props.client, idSurvey: props.idSurvey, numberQ: props.numberQ, numberA: undefined, value: ''}])
              }else{
                const newResults = props.results;
                answers.forEach(a => newResults.push({client: props.client, idSurvey: props.idSurvey, numberQ: props.numberQ, numberA: a.numberA, value: 0}))
                props.setResults(newResults);
              }
            }
          } catch (err) {
            console.error(err.error);
          }
        }
  
      if(!props.loggedIn || props.readOnly){
        getAllAnswersById(props.idQuestion).then( () =>{
          setLoading(false);
        })
      } else if(props.answers){
            setAnswers(props.answers);
      }
  
    }, [props.answers]);
  
    useEffect(()=>{
      if(props.readOnly){
        const myValue = props.results.filter(x => x.numberQ == props.numberQ)
        if(props.type == 0){
          const open = myValue.filter(x => x.numberA == undefined);
          setValue(open[0].value)
        } else{
          setValue(myValue);
        }
      }
    }, [props.results, props.readOnly, props.numberA, props.type, props.numberQ])
  
    const deleteAnswer = (text) => {
      let index = answers.indexOf(text);
      answers.splice(index, 1);
      setDirty(false);
    }
  
    const editAnswerOpen = (ev) => {
      if(ev.target.value.length <= 200){
        setValue(ev.target.value)
        const qResults = props.results;
        const otherResults = qResults.filter( r => r.numberQ != props.numberQ);
        let newResult = {client: props.client, idSurvey: props.idSurvey, numberQ: props.numberQ, numberA: undefined, value: ev.target.value}
        otherResults.push(newResult)
        props.setResults(otherResults);
      } else
        setErrorMessageLength("Puoi inserire al massimo 200 caratteri")
    }
  
    return( <Card style={{padding:"20px", margin:"10px"}}>
  
             {(props.loggedIn && !props.readOnly) ? <>
             <Row>
               <Col>
                <span style={{cursor: 'pointer'}} onClick={() => props.moveUp(props.numberQ)}>{iconUp}</span>&nbsp;
                <span style={{cursor: 'pointer'}} onClick={() => props.moveDown(props.numberQ)}>{iconDown}</span> 
               </Col>
               <Col className='d-flex justify-content-end'>
                <span style={{cursor: 'pointer'}} onClick={() => props.deleteQuestion(props.numberQ)}>{iconDelete}</span>&nbsp;
               </Col>
             </Row>
              </> : ''}
            
            {(props.loggedIn && !props.readOnly) ? <hr></hr> : ''}
  
            <Row>
              <Col sm><h4>{props.numberQ}. {props.text}&nbsp;</h4></Col>
              <Col sm>{!props.type && <h6>Domanda {props.optional ? "facoltativa" : "obbligatoria"}</h6>}</Col>
              {props.type == 1 && <Col sm><h6>Max: {props.max} - Min: {props.min}</h6></Col>}
            </Row>
  
            {props.type ? <>
            {loading ? <span>🕗 Please wait, loading all answers... 🕗</span> :
              answers.map( a =><Answer key={a.numberA} 
              numberA={a.numberA} 
              text={a.text} 
              deleteAnswer={deleteAnswer} 
              loggedIn={props.loggedIn} 
              numberQ={props.numberQ} 
              idSurvey={props.idSurvey} 
              results={props.results} 
              setResults={props.setResults} 
              value = {value}
              client={props.client}
              readOnly={props.readOnly}>
              </Answer>)}
            </> :            
            <Form.Group className="mb-3" controlId="controlTextarea">
              {errorMessageLength ? <Alert variant='danger' onClose={() => setErrorMessageLength('')} dismissible>{errorMessageLength}</Alert> : ''}
              {props.loggedIn || props.readOnly  ? 
              <>
              <Form.Control disabled as="textarea" rows={3} value={value} onChange={ev => editAnswerOpen(ev)} />
              </>
              :
              <>
              <Form.Label>{value.length}/200</Form.Label>
              <Form.Control as="textarea" rows={3} value={value} onChange={ev => editAnswerOpen(ev)} />
              </>}
            </Form.Group>
            }     
            </Card>
    )
  }

  export {Answer, Question};
