const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
//const firebaseConfig = require('../firebaseConfig.json')
const firebase = require('firebase');

const firebaseConfig = {
  apiKey: 'AIzaSyBSrqaKsYqxKQF1Mb9UtB6E6WD5uSa1ja0',
  authDomain: 'test-e4f2e.firebaseapp.com',
  databaseURL: 'https://test-e4f2e.firebaseio.com',
  projectId: 'test-e4f2e',
  storageBucket: 'test-e4f2e.appspot.com',
  messagingSenderId: '1079025541346',
  appId: '1:1079025541346:web:6afc46492eb59a8e073ebb'
};

admin.initializeApp();

firebase.initializeApp(firebaseConfig);

app.get('/basic', (req, res) => {
  admin
    .firestore()
    .collection('BasicAssembly')
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
    createdAt: new Date().toISOString()
  };
  admin
    .firestore()
    .collection('BasicAssembly')
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

  //validation
  let errors = {};

  let token, userrId;
  if (isEmpty(newUser.email)) {
    errors.email = 'Email must not be empty';
  }

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res
        .status(201)
        .json({ message: `user ${data.user.uid} signed up successfully` });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
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

exports.api = functions.https.onRequest(app);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
