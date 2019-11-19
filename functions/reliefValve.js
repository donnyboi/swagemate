const functions = require("firebase-functions");
const app = require("express")();
const firebase = require("firebase");

const db = admin.firestore();

app.get("/relief", (req, res) => {
  db.collection("reliefValves")
    .orderBy("RVNo", "desc")
    .get()
    .then(data => {
      let rv = [];
      data.forEach(doc => {
        rv.push({
          RvId: doc.id,
          RVNo: doc.data().RVNo,
          Media: doc.data().Media,
          Pressure: doc.data().Pressure,
          Status: doc.data().Status
        });
      });
      return res.json(ba);
    })
    .catch(err => console.error(err));
});
