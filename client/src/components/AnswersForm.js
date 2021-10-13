import { Form, Row, Col, Alert} from 'react-bootstrap';
import { useState } from 'react';
import { iconPlus } from './icons.js';

function AnswerForm(props){
    const [text, setText] = useState('');
    const [errorMessage, setErrorMessage] = useState('')
    
    const handleSubmit = (event) => {
        event.preventDefault();
        if(props.answers.length < 10){ //vincolo per poter inserire al massimo 10 risposte

            let valid = true;
            if(text == ''){
                valid = false
                setErrorMessage('La domanda non può contenere opzioni vuote')
            }

            if(valid){
                const newAnswer = {numberA: props.numberA, text: text}
                props.setAnswers([...props.answers, newAnswer]);
                setText('');
                props.addNumberA()
            }
        }
    };

    return (
            <Form.Group controlId='selectedAnswer'>  
             {errorMessage ? <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert> : ''}
            <Row className='d-flex justify-content-center'>
                <Col>
                <Form.Control type='answers' value={text} onChange={ev => setText(ev.target.value)} />
                </Col>
                <Col>
                <span style={{cursor: 'pointer'}} onClick={handleSubmit}>{iconPlus}</span>&nbsp;
                </Col>
            </Row>
            </Form.Group>
        )

}

export {AnswerForm}