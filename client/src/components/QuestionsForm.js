import { Form, Button, Col, Row, Alert} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { AnswerForm } from './AnswersForm.js'
import { Answer } from './Questions&Answers'


function QuestionForm(props){
    const [text, setText] = useState('');
    const [type, setType] = useState(false);
    const [optional, setOptional] = useState(false);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(1);
    const [dirty, setDirty] = useState(false);
    const [numberA, setNumberA] = useState(1);
    const [answers, setAnswers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('') ;
    const [values, setValues] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const [valuesMax, setValuesMax] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    useEffect( () => {
        if(!dirty){
            setDirty(true);
        }
    }, [dirty, values]) // qui si puo evitare di renderizzare ogni volta che cambia il values

    useEffect(() => {
        setNumberA(1);
        setOptional(false)
        setAnswers([]);
    }, [type])

    useEffect(()=>{
        let newValues = values.filter( x => x >= min);
        if(min == 0)
            setMax(1);
        else
            setMax(min)
        setValuesMax(newValues);
    }, [min, values]); // qui si puo evitare di renderizzare ogni volta che cambia il values
    
    const addNumberA = () => {
        setNumberA(numberA+1); //errore
    }

    const clearAll = () => {
        setText('');
        setType(false);
        setOptional(false);
        setMin(0);
        setMax(1);
        setAnswers([]);
    }

    /**  Refuso: qui non gestisco il numero della risposta quando 
    *    elimino una risposta. Comunque viene garantita la coerenza della coppia numberQ numberA nel 
    *   momento in cui vado a caricare le domande dal DB nel momento della visualizzazione dell'invio dei risultati.
    *   Logicamente non è una buona pratica
    */

    const deleteAnswer = (text) => {
        let index = answers.indexOf(text);
        answers.splice(index, 1);
        setDirty(false);
    }


    const handleSubmit = (event) => {
        event.preventDefault();

        const newQuestion = {numberQ: props.numberQ, text: text, type: type, optional: optional, min: min, max: max, answers: answers};
       
        let valid = true;
        let lessAnswers = false;
        let noTextQuestion = false;

        if( newQuestion.text == ''){
            valid = false;
            noTextQuestion = true;
        }
        if( type == 1 && newQuestion.answers.length < min){ //solamente se la rispota è opzionale faccio il controllo per verificare che siano almento un numero di opzioni pari al minimo
            valid = false;
            lessAnswers = true;
        }
        if(valid){
            props.addNumberQ();
            props.setQuestions([...props.questions, newQuestion]);
            clearAll();
        }else{
            if(noTextQuestion)
                setErrorMessage('Il testo della domanda non può essere vuoto');
            if(lessAnswers)
                setErrorMessage(`Devi inserire almeno ${min} opzioni`);
        }
    };



    return (<Form>
            <h2>Inserisci i dati della nuova domanda</h2>
            {errorMessage ? <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert> : ''}
            <Form.Group controlId='selectedText'>
                <Form.Label>Testo Domanda</Form.Label>
                <Form.Control type='testo' value={text} onChange={ev => setText(ev.target.value)}/>
            </Form.Group>
            <Row>
                <Col>
                    <Form.Group controlId="selectedType">
                        <Form.Check type="checkbox" label="Risposta chiusa" onChange={ev => setType(ev.target.checked ? true : false)} checked={type} />
                    </Form.Group>
                </Col>
            {type ? <>
                <Col>
                    <Form.Group controlId="selectedMin">
                        <Form.Label>Risposte minime</Form.Label>
                        <Form.Control as="select" value={min} onChange={ev => setMin(ev.target.value)} >
                            {values.map(x => <option key={x} value={x}>{x}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="selectedMax">
                        <Form.Label>Risposte massime</Form.Label>
                        <Form.Control as="select" value={max} onChange={ev => setMax(ev.target.value)} >
                            {valuesMax.map(x => <option key={x} value={x}>{x}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Col>
                </>
                :
                <Col>
                    <Form.Group controlId="selectedOptional">
                        <Form.Check type="checkbox" label="Facoltativa" onChange={ev => setOptional(ev.target.checked ? true : false)} checked={optional} />
                    </Form.Group>
                </Col>
            }
            </Row>
            {type && answers.map( a => <Answer key={a.numberA} text={a.text} deleteAnswer={deleteAnswer} loggedIn={props.loggedIn}> </Answer>)}
            {type && <> <AnswerForm answers={answers} setAnswers={setAnswers} numberA={numberA} addNumberA={addNumberA}></AnswerForm> </>}
            <br></br>

            <Button onClick={handleSubmit}>Salva</Button>&nbsp; 
            <Button variant='secondary' onClick={clearAll}>Pulisci</Button>

    </Form>

    )

}

export {QuestionForm} 