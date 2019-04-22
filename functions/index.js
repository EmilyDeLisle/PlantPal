// const firebase = require("firebase");
const admin = require('firebase-admin');
const functions = require("firebase-functions");
const express = require("express");
const app = express();
const fs = require("fs");
const { JSDOM } = require('jsdom');
const PORT = process.env.PORT || 5000
const serviceAccount = require("./node-client-app/plantpal-service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://plant-pal-ae41e.firebaseio.com/"
});

var ref = admin.app().database().ref().child("users");

app.use("/js", express.static("public/js"));
app.use("/lib", express.static("public/lib"));
app.use("/css", express.static("public/css"));
app.use("/imgs", express.static("public/imgs"));

app.get("/", function (req, res) {
    let doc = fs.readFileSync("public/index.html");
    let dom = new JSDOM(doc);
    res.send(dom.serialize());
});

app.get("/plants", function (req, res) {
    let doc = fs.readFileSync("public/plants.html");
    let dom = new JSDOM(doc);
    res.send(dom.serialize());
});

app.get("/addPlant", function (req, res) {
    let userID = req["query"]["user"];
    let name = req["query"]["plantName"];
    let watered = req["query"]["lastWatered"];
    let days = req["query"]["daysWatered"];
    let plant = { plantName: name, lastWatered: watered, daysWatered: days };

    let userRef = ref.child(userID);
    let plantsRef = userRef.child("plants");

    plantsRef.push(plant);
    res.send("Plant added to database.");
});

app.get("/getPlants", function(req, res) {
    let userID = req["query"]["user"];
    let userRef = ref.child(userID);
    let plantsRef = userRef.child("plants");

    plantsRef.once("value", function(snap) {
        res.send(snap.val());
    });
});

app.get("/waterPlant", function(req, res) {
    let userID = req["query"]["user"];
    let today = req["query"]["date"];
    let plant = req["query"]["plantID"];

    let userRef = ref.child(userID);
    let plantsRef = userRef.child("plants");

    let plantRef = plantsRef.child(plant);
    plantRef.child("lastWatered").set(today);
    plantRef.child("daysWatered").once("value", function(snap) {
        currentWateredDays = snap.val();
        if (currentWateredDays.indexOf(today) === -1) {
            currentWateredDays.push(today);
            plantRef.child("daysWatered").set(currentWateredDays);
        }
    });
});

app.get("/editPlant", function(req, res) {
    let userID = req["query"]["user"];
    let plant = req["query"]["plantID"];
    let plantName = req["query"]["name"];

    let userRef = ref.child(userID);
    let plantsRef = userRef.child("plants");

    let plantRef = plantsRef.child(plant);
    plantRef.child("plantName").set(plantName);
    res.send("Plant successfully updated.");
});

app.get("/deletePlant", function(req, res) {
    let userID = req["query"]["user"];
    let plant = req["query"]["plantID"];

    let userRef = ref.child(userID);
    let plantsRef = userRef.child("plants");

    let plantRef = plantsRef.child(plant);
    plantRef.child("deleted").set(true);
    res.send("Plant deleted from database.");
});

exports.app = functions.https.onRequest(app);

app.listen(PORT, function() {
    console.log("App listening on port " + PORT);
});