const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
//const firebaseConfig = require('../firebaseConfig.json')
const firebase = require('firebase');
var serviceAccount = require('./cred.json');
var request = require('request');
//var serviceAccount = require('../cred.json');

const firebaseConfig = {
  apiKey: 'AIzaSyBSrqaKsYqxKQF1Mb9UtB6E6WD5uSa1ja0',
  authDomain: 'test-e4f2e.firebaseapp.com',
  databaseURL: 'https://test-e4f2e.firebaseio.com',
  projectId: 'test-e4f2e',
  storageBucket: 'test-e4f2e.appspot.com',
  messagingSenderId: '1079025541346',
  appId: '1:1079025541346:web:6afc46492eb59a8e073ebb'
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://test-e4f2e.firebaseio.com'
});

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/basic', (req, res) => {
  db.collection('BasicAssembly')
    .orderBy('BANo', 'desc')
    .get()
    .then(data => {
      let ba = [];
      data.forEach(doc => {
        ba.push({
          BaId: doc.id,
          BANo: doc.data().BANo,
          Media: doc.data().Media
        });
      });
      return res.json(ba);
    })
    .catch(err => console.error(err));
});

app.post('/basic', (req, res) => {
  const newBA = {
    BANo: req.body.BANo,
    Media: req.body.Media,
    PeerCheck: req.body.PeerCheck
  };

  db.collection('BasicAssembly')
    .add(newBA)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
});

//Signup Route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPass: req.body.password,
    handle: req.body.handle
  };

  let errors = {};

  const isEmail = email => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
  };

  const isEmpty = string => {
    if (string.trim() === '') return true;
    else return false;
  };

  if (isEmpty(newUser.email)) {
    errors.email = 'Email must not be empty';
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address';
  }

  if (isEmpty(newUser.password)) errors.password = 'Must not be empty';

  //validation
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      return res.status(201).json({ error: err.code });
    });
});

app.post('/login', (req, res) => {
  const userdetails = {
    email: req.body.email,
    password: req.body.password
  };

  firebase
    .auth()
    .signInWithEmailAndPassword(userdetails.email, userdetails.password)
    .then(data => {
      return res.status(201).json({
        message: `user ${data.userdetails.email} successfully logged in`
      });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

app.post('/sendPeerCheck', (req, res) => {
  const trelloCard = {
    cardName: req.body.cardName
  };

  var options = {
    method: 'POST',
    url: 'https://api.trello.com/1/cards',
    qs: {
      idList: '5cdcf6fc7b25ca6ec724bb80',
      keepFromSource: 'all',
      key: 'b4f79f92a3958021105e65cc943507ef',
      token: '2b3a7fb42f73850718191a803b2d4ee2620e5100fe09470a63fc3e1ab8bbeddc',
      name: `${trelloCard.cardName}`
    }
  };

  request(options, function(error, response, body) {
    if (error) {
      throw new Error(error);
    } else {
      console.log(body);
      return res.status(201).json({
        message: `Trello card created`
      });
    }
  });
});

exports.api = functions.https.onRequest(app);
