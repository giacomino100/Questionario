'use strict';


const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB
const dao = require('./dao');

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;


// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 's:Gd-SaTPP-alMfOFLXX44ntYygdF1UbbR.ObmstaTyxjG8j3q1FXoiDOjfH2Ju73sMBwx7bquDOV4',
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


// POST

app.post('/api/survey', isLoggedIn, [
  check('name').isString().notEmpty(),
  check('description').isString()
] , async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  const survey = {
    idUser: req.body.idUser,
    name: req.body.name,
    description: req.body.description,
  };

  try {
    const idSurvey = await dao.createSurvey(survey);
    res.json({idSurvey: idSurvey}).end();
   } catch(err) {
    res.status(503).json({error: `Database error during the creation of survey ${survey.name}.`});
  }
});

app.post('/api/question', isLoggedIn, [
  check('text').isString().notEmpty(),
  check('numberQ').isInt(),
  check('type').isBoolean(),
  check('optional').isBoolean(),
  check('min').isInt(),
  check('max').isInt(),

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  const question = {
    numberQ: req.body.numberQ,
    idSurvey: req.body.idSurvey,
    text: req.body.text,
    type: req.body.type,
    optional: req.body.optional,
    min: req.body.min,
    max: req.body.max
  }

  try {
    const idQuestion = await dao.createQuestion(question);
    res.json({idQuestion: idQuestion}).end();
  } catch (error) {
      res.status(503).json({error: `Database error during the creation of question ${question.text}.`});
    }
})

app.post('/api/answer', isLoggedIn, [
  check('idQuestion').isInt(),
  check('numberA').isInt(),
  check('text').isString().notEmpty()
], async (req, res) => {

  const answer = {
    idQuestion: req.body.idQuestion,
    numberA: req.body.numberA,
    text: req.body.text
  }

  try {
    await dao.createAnswer(answer);
    res.status(201).end();
  } catch (error) {
    res.status(503).json({error: `Database error during the creation of answer ${answer.text} of question ${answer.idQuestion}.`});
  }
})


app.post('/api/result', [
  check('client').isString().notEmpty(),
  check('idSurvey').isInt(),
  check('numberQ').isInt(),
  check('numberA').isInt(),
  check('numberA').isString(),
], async (req, res) => {

  const result = {
    client: req.body.client,
    idSurvey: req.body.idSurvey,
    numberQ: req.body.numberQ,
    numberA: req.body.numberA,
    value: req.body.value
  }

  try {
    await dao.createResult(result);
    res.status(201).end();
  } catch (error) {
    res.status(503).json({error: `Database error during the creation of result of ${result.client}'s survey`});
  }
})

// GET
app.get('/api/surveys', (req, res) => {
  dao.listSurveys()
    .then(surveys => res.json(surveys))
    .catch(() => res.status(500).end());
});


app.get('/api/surveys/:idUser', [isLoggedIn],  (req, res) => {
  dao.listSurveysByUser(req.params.idUser)
    .then(surveys => res.json(surveys))
    .catch(() => res.status(500).end());
});

app.get('/api/questions/:idSurvey', (req, res) => {
  dao.listQuestionsBySurvey(req.params.idSurvey)
    .then(questions => res.json(questions))
    .catch(() => res.status(500).end());
});
app.get('/api/answers/:idQuestion', (req, res) => {
  dao.listAnswersByQuestion(req.params.idQuestion)
    .then(answers => res.json(answers))
    .catch(() => res.status(500).end());
});

app.get('/api/results/:idSurvey', [isLoggedIn], (req, res) => {
  dao.listResultsByIdSurvey(req.params.idSurvey)
    .then(results => res.json(results))
    .catch(() => res.status(500).end());
});

app.get('/api/clients/:idSurvey', [isLoggedIn], (req, res) => {
  dao.listResultsByClient(req.params.idSurvey)
    .then(client => res.json(client))
    .catch(() => res.status(500).end());
});

/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser()
        return res.json(req.user);
      });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});