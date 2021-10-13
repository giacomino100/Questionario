import { Form, Button, Card, Row, Alert} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { QuestionForm } from './QuestionsForm.js'
import { Question } from './Questions&Answers.js'

function SurveyForm(props){
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [dirty, setDirty] = useState(true);
    const [numberQ, setNumberQ] = useState(1);
    const [errorMessageNoName, setErrorMessageNoName] = useState('') ;
    const [errorMessageLengthNull, setErrorMessageLengthNull] = useState('') ;

    useEffect( () => {
        if(!dirty){
            setDirty(true);
        }
    }, [dirty])

    const deleteQuestion = (textToDelete) => {
        const element = questions.map( x => x.text == textToDelete);
        const index = questions.indexOf(element);
        questions.splice(index, 1);
        for(let i = index; i<questions.lenght; i++){
            questions[i].numberQ--;
        }
        setNumberQ(numberQ-1);
        setDirty(false);
    }

    const moveUp = (numberQ) => {
        let element = '';
        for(let i = 1; i<questions.length; i++){
            if(questions[i].numberQ == numberQ){
                element = questions[i-1];
                questions[i-1] = questions[i];
                questions[i-1].numberQ--;
                element.numberQ++;
                questions[i] = element;
                setDirty(false);
                break;
            }
        }
    }

    const moveDown = (id) => {
        let element = '';
        for(let i = questions.length-2; i >= 0; i--){
            if(questions[i].numberQ == id){
                element = questions[i+1];
                questions[i+1] = questions[i];
                questions[i+1].numberQ++;
                element.numberQ--;
                questions[i] = element;
                setDirty(false);
                break;
            }
        }
    }

    const submit = (event) => {
        event.preventDefault();
        const survey = {name: name, description: description, questions: questions};

        let valid = true;
        let noName = false;
        let lengthNull = false;

        if(survey.name == ''){
            valid=false;
            noName = true;
        }

        if(questions.length == 0){
            valid = false;
            lengthNull = true;
        }

        if(valid == true){
            props.setSurveys([...props.surveys, survey]);
            props.addSurvey(survey);
            setSubmitted(true);
        }
        else {
            if(noName)
                setErrorMessageNoName('Inserisci il nome del questionario');
            if(lengthNull)
                setErrorMessageLengthNull('Inserisci almeno una domanda');

        }

    };

    const addNumberQ = () => {
        setNumberQ(numberQ +1) //errore
    }
  
    return (
        <> {submitted ? <Redirect to="/"/> : <>
        <Form onSubmit={submit}>
        <h1>Creazione nuovo questionario</h1>

        <Card style={{padding:"20px", margin:"10px"}}>
            <h2>Inserisci il titolo e una breve descrizione</h2>
            <Form.Group controlId='selectedName'>
                <Form.Label>Nome</Form.Label>
                <Form.Control type='name' onChange={ev => setName(ev.target.value)}/>
            </Form.Group>
            <Form.Group controlId='selectedDescription'>
                <Form.Label>Descrizione</Form.Label>
                <Form.Control type='description'  onChange={ev => setDescription(ev.target.value)} />
            </Form.Group>
        </Card>

        <br></br>
        {questions.map( q => <Question key={q.numberQ} 
                                    numberQ={q.numberQ} 
                                    text={q.text} 
                                    type={q.type} 
                                    optional={q.optional} 
                                    max={q.max} 
                                    min={q.min} 
                                    answers={q.answers} 
                                    moveUp={moveUp} 
                                    moveDown={moveDown} 
                                    deleteQuestion={deleteQuestion} 
                                    loggedIn={props.loggedIn}>
                                    </Question>)}
        
        <Card style={{padding:"20px", margin:"10px"}}>
            <QuestionForm addNumberQ={addNumberQ} numberQ={numberQ} questions={questions} setQuestions={setQuestions} loggedIn={props.loggedIn}> </QuestionForm>
        </Card>

        {errorMessageNoName ? <Alert variant='danger' onClose={() => setErrorMessageNoName('')} dismissible>{errorMessageNoName}</Alert> : ''}
        {errorMessageLengthNull ? <Alert variant='danger' onClose={() => setErrorMessageLengthNull('')} dismissible>{errorMessageLengthNull}</Alert> : ''}
        <Row className='d-flex justify-content-center'>
            <Button variant='primary' type="submit">Salva questionario</Button>&nbsp;
            <Link to="/"><Button variant='secondary' onClick={() => props.setUpdated(true)}>Torna ai questionari</Button></Link>
        </Row>
        
    </Form>
    </>}
    </>

    )
}

export default SurveyForm;
