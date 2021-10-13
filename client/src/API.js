const BASEURL = '/api';


async function getAllSurveys() {
    // call: GET /api/surveys
    const response = await fetch(BASEURL + '/surveys');
    const surveysJson = await response.json();
    if (response.ok) {
      return surveysJson;
    } else {
      throw surveysJson;  // an object with the error coming from the server
    }
}

async function getAllSurveysByUser(idUser) {
  // call: GET /api/surveys/:idUser
  const response = await fetch(BASEURL + '/surveys/' + idUser);
  const surveysJson = await response.json();
  if (response.ok) {
    return surveysJson;
  } else {
    throw surveysJson;  // an object with the error coming from the server
  }
}

/* Questo metodo è stato creato per poter pubblicare un questionario. Non è perfetto, nel senso che per questioni di tempo
non sono riuscito a poter mettere un controllo ogni qualvolta viene creato un elemento che instaura la creazione di un elemento
successivo 

LOGICA: creo un questionario -> prendo l'id e creo una domanda associando l'ide del quetionario appena creato -> creo le risposte e 
per ciascuna risposta (multipla) associo l'id della domanda appena creata. Ovviamente per le domande a risposta aperta non viene 
creato nessun tipo di risposte nella tabella answer*/
async function publishSurvey(survey, idUser){
  const idSurvey = await addSurvey(survey, idUser);
  survey.questions.forEach( async q => {
    const idQuestion = await addQuestion(q, idSurvey);
    q.answers.forEach( async a => await addAnswer(a, idQuestion))
  })
}

async function addSurvey(survey, idUser) {
  // call: POST /api/survey
  return new Promise((resolve, reject) => {
    fetch(BASEURL + '/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({idUser: idUser, name: survey.name, description: survey.description}),
      }).then((response) => {
        if (response.ok) {
          response.json().then(data => resolve(data.idSurvey))
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}


async function addQuestion(question, idSurvey) {
  // call: POST /api/survey
  return new Promise((resolve, reject) => {
    fetch(BASEURL + '/question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({numberQ: question.numberQ, idSurvey: idSurvey, text: question.text, type: question.type, optional: question.optional, min: question.min, max: question.max}),
      }).then((response) => {
        if (response.ok) {
          response.json().then(data => resolve(data.idQuestion))
        } else {
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

async function addAnswer(answer, idQuestion) {
  // call: POST /api/answer
  return new Promise((resolve, reject) => {
    fetch(BASEURL + '/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({idQuestion: idQuestion, numberA: answer.numberA, text: answer.text}),
      }).then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

async function getAllQuestionsById(idSurvey) {
  // call: GET /api/questions/:idSurvey
  const response = await fetch(BASEURL + '/questions/' + idSurvey);
  const questionsJson = await response.json();
  if (response.ok) {
    return questionsJson;
  } else {
    throw questionsJson;  // an object with the error coming from the server
  }
}

async function getAllAnswersById(idQuestion) {
  // call: GET /api/answers/:idQuestion
  const response = await fetch(BASEURL + '/answers/' + idQuestion);
  const answersJson = await response.json();
  if (response.ok) {
    return answersJson;
  } else {
    throw answersJson;  // an object with the error coming from the server
  }
}

async function getResultsByIdSurvey(idSurvey) {
  // call: GET /api/results/:idSurvey
  const response = await fetch(BASEURL + '/results/' + idSurvey);
  const results = await response.json();
  if (response.ok) {
    return results;
  } else {
    throw results;  // an object with the error coming from the server
  }
}

async function getClientsByIdSurvey(idSurvey) {
  // call: GET /api/clients/:key
  const response = await fetch(BASEURL + '/clients/' + idSurvey);
  const clients = await response.json();
  if (response.ok) {
    return clients;
  } else {
    throw clients;  // an object with the error coming from the server
  }
}
async function logIn(credentials) {
    let response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if(response.ok) {
      const user = await response.json();
      return user.name;
    }
    else {
      try {
        const errDetail = await response.json();
        throw errDetail.message;
      }
      catch(err) {
        throw err;
      }
    }
  }


  async function publishResult(result) {
    // call: POST /api/results
    return new Promise((resolve, reject) => {
      fetch(BASEURL + '/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({client: result.client, idSurvey: result.idSurvey, numberQ: result.numberQ, numberA: result.numberA, value: result.value}),
        }).then((response) => {
          if (response.ok) {
            resolve(null);
          } else {
            // analyze the cause of error
            response.json()
              .then((message) => { reject(message); }) // error message in the response body
              .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
          }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
  }

  
  async function logOut() {
    await fetch('/api/sessions/current', { method: 'DELETE' });
  }
  
  async function getUserInfo() {
    const response = await fetch(BASEURL + '/sessions/current');
    const userInfo = await response.json();
    if (response.ok) {
      return userInfo;
    } else {
      throw userInfo;  // an object with the error coming from the server
    }
  }
  
  const API = {getClientsByIdSurvey, getResultsByIdSurvey, publishResult, publishSurvey, addSurvey, getAllSurveysByUser, getAllSurveys, getAllQuestionsById, getAllAnswersById, logIn, logOut, getUserInfo};
  export default API;