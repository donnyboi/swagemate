const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.helloworld = functions.https.onRequest((request, response) => {
  response.send('API Running');
});

exports.getBasicAssembly = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection('BasicAssembly')
    .get()
    .then(data => {
      let ba = [];
      data.forEach(doc => {
        ba.push(doc.data());
      });
      return res.json(ba);
    })
    .catch(err => console.error(err));
});

exports.createBasicAssembly = functions.https.onRequest((req, res) => {
  const newBA = {
    body: req.body.body,
    BANo: req.body.BANo
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
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions