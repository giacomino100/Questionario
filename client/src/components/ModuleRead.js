
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../API';
import { Question } from './Questions&Answers.js'
import { iconNext, iconBack } from './icons.js';
import { Row } from 'react-bootstrap';

function ModuleRead(props){
    const location = useLocation();
    const [idSurvey, setIdSurvey] = useState(location.state ? location.state.idSurvey : '');
    const [name, setName] = useState(location.state ? location.state.name : '');
    const [description, setDescription] = useState(location.state ? location.state.description : '');
    const [client, setClient] = useState('');

    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingResults, setLoadingResults] = useState(true);
    const [loading, setLoading] = useState(true);

    const [questions, setQuestions] = useState([])
    const [results, setResults] = useState([]);
    const [dirty, setDirty] = useState(true); //inutile

    const [i, setI] = useState(0);

    const [clients, setClients] = useState([])


    useEffect(()=>{ //inutile
        if(dirty){
            setDirty(false);
        }
    }, [dirty])

        /**Attenzione particolare a questa useEffect
     * catena ideale: carico gli utilizzatori, carico i risultati di un utilizzatore e carico le domande settando i risultati
     *                ongi volta che cambio utilizzatore ripeto la catena partendo dal secondo punto
     * catena realizzata: segue la stessa logica elencata sopra ma poichè le dipendenze nelle useEffect non sono precise 
     *                    
     */

    useEffect ( () => {
        const getAllQuestionsById = async(id) => {
            try {
              const questions = await API.getAllQuestionsById(id);
              setQuestions(questions);
            } catch (err) {
              console.error(err.error);        
            }
          }
        if(!loadingResults){
            getAllQuestionsById(idSurvey).then( () => {
            setLoading(false);
            })
        }
      }, [idSurvey, loadingResults, i]);

      useEffect ( () => {
        const getResultsByIdSurvey = async(id) => {
            try {
              const results = await API.getResultsByIdSurvey(id);
              setResults(results.filter(x => x.client == client));
            } catch (err) {
              console.error(err.error);        
            }
          }
          if(!loadingClients){
            getResultsByIdSurvey(idSurvey).then( () => {
                setLoadingResults(false);
           })
          }

      }, [loadingClients, i, client, idSurvey]);

      useEffect ( () => {
        const getClientsByIdSurvey = async(id) => {
            try {
              const clients = await API.getClientsByIdSurvey(id);
              setClient(clients[i].client)
              setClients(clients);
            } catch (err) {
              console.error(err.error);        
            }
          }
          getClientsByIdSurvey(idSurvey).then( () => {
          setLoadingClients(false);
        })
      }, [idSurvey, i]); // qui si poteva anche omettere la dipendenza di i


    const next = () => {
        const index = i + 1;
        if(index < clients.length){
            setClient(clients[index].client)
            setI(index);
            setLoading(true);
            setLoadingClients(false);
        }
    }

    const back = () => {
        const index = i - 1;
        if(index >=0){
            setClient(clients[index].client)
            setI(index);
            setLoading(true);
            setLoadingClients(false);
        }
    }

    return ( <>
        <Row className='d-flex justify-content-center' style={{padding:'5px'}}>
            <span style={{cursor:'pointer'}} onClick={back}>{iconBack}&nbsp;Precedente&nbsp;&nbsp;</span>
            <span style={{cursor:'pointer'}} onClick={next}>Successivo&nbsp;{iconNext}</span>          
        </Row>


        {loadingClients ? <p> sto caricando il nome</p> :  <h1>Questionario di {client}&nbsp; &nbsp;</h1>} 

        {loadingResults ? <h5>Sto caricando le risposte di {client}&nbsp; &nbsp;</h5> : ''} 


        <h1>Titolo: {name}</h1>
        <h3>Descrizione: {description}</h3>
        {loading ? <span>🕗 Please wait, loading all questions... 🕗</span> :
        <>
        {questions.map( q => <Question 
          key={q.numberQ} 
          idQuestion={q.id} 
          numberQ={q.numberQ} 
          text={q.text}
          type={q.type} 
          max={q.max}
          min={q.min}
          results={results}
          readOnly={props.readOnly}
          loggedIn={props.loggedIn}>
          </Question>)}
          
        </>}</>
    );
}

export default ModuleRead;