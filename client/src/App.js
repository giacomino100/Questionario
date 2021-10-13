import './App.css';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import HeaderNav from './components/HeaderNav.js';
import { Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.js';
import API from './API';
import LoginPage from './components/LoginPage.js';
import SurveyForm from './components/SurveyForm.js';
import SurveyList from './components/SurveyList.js';
import { Module } from './components/Module.js';
import ModuleRead from './components/ModuleRead.js';

function App() {
	const [loggedIn, setLoggedIn] = useState(false);
	const [user, setUser] = useState('');
  const [surveys, setSurveys] = useState([]);
  const [updated, setUpdated] = useState(true);
  const [message, setMessage] = useState('');

  /* Questi due stati sono stati creati per gestire le funzionalità che devono essere abilitate
   in base all'utente */
  const [loading, setLoading] = useState(true);
  const [readOnly, setReadOnly] = useState(false);


  useEffect(()=> {
    const checkAuth = async() => {
      try {
        const user = await API.getUserInfo();
        setUser(user);
        setLoggedIn(true);
        setReadOnly(true);
      } catch(err) {
        console.error(err.error);
      }
    };

    if(loggedIn){
      checkAuth();
    }

  }, [loggedIn]);


/* Al primo rendering e ogni qualvolta si aggiorna la lista di questionari caricati 
viene renderizzato tutto facendo attenzione al loggin. Se l'utente è loggato occorre quindi 
andare a prendere solo i propri questionari che saranno visualizzati nell'area personale
Se nessuno ha loggato bisogna visualizzare tutti questionari disponibili per la compilazione */
  useEffect ( () => {
    const getAllSurveys = async() => {
      try {
        const surveys = await API.getAllSurveys();
        setSurveys(surveys);
      } catch (err) {
        console.error(err.error);
      }
    }
    const getAllSurveysByUser = async(id) => {
      try {
        const surveys = await API.getAllSurveysByUser(id);
        setSurveys(surveys);
      } catch (err) {
        console.error(err.error);      
      }
    }
      if(loggedIn){
        getAllSurveysByUser(user.id).then( () =>{
          setLoading(false);
        }).catch(err => {
          setMessage({msg: "Impossible to load your surveys! Please, try again later...", type: 'danger'});
        });
      }else{
        getAllSurveys().then( () =>{
          setLoading(false);
        }).catch(err => {
          setMessage({msg: "Impossible to load surveys! Please, try again later...", type: 'danger'});
        });
      }

  }, [surveys.length, loggedIn, user]);

  
/** In caso di problemi con l' AddSurvey il metodo handle errors gestisce gli errori */
  const handleErrors = (err) => {
    if(err.errors)
      setMessage({msg: err.errors[0].msg + ': ' + err.errors[0].param, type: 'danger'});
    else
      setMessage({msg: err.error, type: 'danger'});
    
  }

/** Qui c'è un refuso. Dentro survey form vado ad aggiungere con props.setSurveys gia i questionari
 * e qui ripeto questa operazione. Tuttavia tutto funziona.
 */
  const addSurvey = (survey) => {
    survey.status = 'added';
    setSurveys([...surveys, survey]);
    API.publishSurvey(survey, user.id)
    .then(() => {
      setUpdated(true);
    }).catch(err => {
      handleErrors(err)
    });

  }

  /** componente SurveyList: 
   *    - modalita visualizzatore: sono stati inutilizzati lo stato updated la setUpdated
   */


  return (
    <Router>      
      <Container fluid className='noPad'>
        <Row>
          <Col>
              <HeaderNav updated={updated} setUpdated={setUpdated} setLoggedIn={setLoggedIn} loggedIn={loggedIn} user={user.name} setUser={setUser}/>
          </Col>
        </Row>
        { loggedIn ?

        //MODALITA CREATORE
        <Row>
          <Col md={3} >
              <Sidebar setUpdated={setUpdated}/>
          </Col> 

          <Col md={9}>

              <Switch>
                <Route exact path='/' render={() => <>{loading ? <span>🕗 Please wait, loading your surveys... 🕗</span> : <SurveyList message={message} setMessage={setMessage} loggedIn={loggedIn} surveys={surveys} setSurveys={setSurveys} updated={updated} setUpdated={setUpdated} idUser={user.id} readOnly={readOnly} user={user.name}></SurveyList>}</>}/>
                <Route exact path='/new' render={() => <SurveyForm surveys={surveys} setSurveys={setSurveys} updated={updated} setUpdated={setUpdated} addSurvey={addSurvey} loggedIn={loggedIn}/> }/>
                <Route exact path='/result' render={() =><ModuleRead loggedIn={loggedIn} readOnly={readOnly}></ModuleRead> }/>
                <Route><Redirect to='/' /></Route>
              </Switch>
          </Col>
        
        </Row>

        :
        
        <Row className="justify-content-md-center">
        <Col md={8}>
            <Switch>
              <Route exact path='/' render={() => <>{loading ? <span>🕗 Please wait, loading your surveys... 🕗</span> : <SurveyList loggedIn={loggedIn} surveys={surveys} setSurveys={setSurveys} updated={updated} setUpdated={setUpdated} readOnly={readOnly}></SurveyList>}</>}/>
              <Route exact path='/compile' render={() =><Module loggedIn={loggedIn} setUpdated={setUpdated}></Module> }/>
              <Route exact path='/login' render={() => <>{loggedIn ? <Redirect to="/" /> : <LoginPage setLoggedIn={setLoggedIn} setUpdated={setUpdated} setUser={setUser}/> }</>}/> 
              <Route><Redirect to='/' /></Route>
            </Switch>
        </Col>
      
      </Row>

        }
      </Container>
   </Router>
  );
}

export default App;
