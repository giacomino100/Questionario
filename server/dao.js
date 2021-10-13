'use strict';
/* Data Access Object (DAO)*/

const db = require('./db');
const bcrypt = require('bcrypt');

// get all surveys
exports.listSurveys = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM survey';
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const surveys = rows.map((e) => ({ id: e.id, name: e.name, description: e.description}));
        resolve(surveys);
      });
    });
  };


// get all surveys by User
exports.listSurveysByUser = (idUser) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM survey WHERE idUser=?';
      db.all(sql, [idUser], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const surveys = rows.map((e) => ({ id: e.id, name: e.name, description: e.description, viewers: e.viewers}));
        resolve(surveys);
      });
    });
  };


// add a new survey

/* L'idea iniziale era stata quella di andare a memorizzare in una colonna della tabella survey
il numero degli utilizzatori. Alla fine del progetto ho preferito andarli a contare alla tabella
result e ho dimenticato di andare a pulire la tabella e quindi anche di togliere da queste chiamate
al DB il campo viewer*/
exports.createSurvey = (survey) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO survey(idUser, name, description, viewers) VALUES(?, ?, ?, ?)';
    db.run(sql, [survey.idUser, survey.name, survey.description, 0], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};


// add a new question
exports.createQuestion = (q) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO question(numberQ, idSurvey, text, type, optional, min, max) VALUES(?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [q.numberQ, q.idSurvey, q.text, q.type, q.optional, q.min, q.max], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

// add a new result
exports.createResult = (r) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO result(client, idSurvey, numberQ, numberA, value) VALUES(?, ?, ?, ?, ?)';
    db.run(sql, [r.client, r.idSurvey, r.numberQ, r.numberA, r.value], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// get all questions by idSurvey
exports.listQuestionsBySurvey = (idSurvey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM question WHERE idSurvey = ?';
    db.all(sql, [idSurvey], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const questions = rows.map((e) => ({ id: e.id, numberQ: e.numberQ, text: e.text, type: e.type, optional: e.optional, min: e.min, max: e.max}));
      resolve(questions);
    });
  });
};


// get all answers by idQuestion
exports.listAnswersByQuestion = (idQuestion) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM answer WHERE idQuestion=?';
    db.all(sql, [idQuestion], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const answers = rows.map((e) => ({numberA: e.numberA, text: e.text}));
      resolve(answers);
    });
  });
};

// get all results by idSurvey
exports.listResultsByIdSurvey = (idSurvey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM result WHERE idSurvey=?';
    db.all(sql, [idSurvey], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const results = rows.map((e) => ({client: e.client, idSurvey: e.idSurvey, numberQ: e.numberQ, numberA: e.numberA, value: e.value}));
      resolve(results);
    });
  });
};

// get all client

/* Questa chiamata serve per andare a prendere tutti gli tulizzatori di un determinato questionario. In questo modo
posso contarli e li posso visualizzare a schermo nella modalita creatore   */
exports.listResultsByClient = (idSurvey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT DISTINCT(client) FROM result WHERE idSurvey=?';
    db.all(sql, [idSurvey], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const results = rows.map((e) => ({client: e.client}));
      resolve(results);
    });
  });
};



// add a new answer
exports.createAnswer = (a) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO answer(idQuestion, numberA, text) VALUES(?, ?, ?)';
    db.run(sql, [a.idQuestion, a.numberA, a.text], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};



