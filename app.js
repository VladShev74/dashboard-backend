var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, ReturnDocument } = require('mongodb');
require('dotenv').config();

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


const db_connection_string = `mongodb+srv://admin:${process.env.DB_CONNECTION_PASS}@cluster0.4w4dva7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const client = new MongoClient(db_connection_string, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  },
  tls: true,
  tlsAllowInvalidCertificates: true
})

async function connectDB() {
  try {
    await client.connect()
    await client.db("fitness_dashboard").command({ping : 1})
    console.log("Connection to DB successful")
  } catch (err) {
    console.error("Error during DB connection: " + err)
  }
}

connectDB();

// In-memory store (to be replaced by DB later)
let nextClassId = 1
let nextPlanId = 1

// === Utility functions ===

// =================================
//              Classes            =
// =================================
function classesFromDB() {
  return client.db("fitness-dashboard").collection("fitnessClasses")
}

async function getAllClasses() {
  try {
    const data = await classesFromDB().find({}).toArray()
    return data
  } catch (err) {
    console.error("Something went wrong querying all classes from DB: " + err)
  }
}

async function getClassById(objectId) {
  try {
    if(!ObjectId.isValid(objectId)) {
      console.error(" ObjectId is not valid for getClassById")
      return null
    }

    const oID = new ObjectId(objectId)
    const data = await classesFromDB().findOne({ _id: oID })
    return data
  } catch (err) {
    console.error("Something went wrong querying class with id " + objectId + "from DB: " + err)
  }
}

async function createClass(classData) {
  const newClass = {
    ...classData,
    lastModified: new Date() // Add a timestamp
  };
  const result = await classesFromDB().insertOne(newClass);
  console.log(result)
  newClass._id = result.insertedId
  return newClass;
}

async function updateClass(id, classData) {
  if(!ObjectId.isValid(id)) {
    console.error(" ObjectId is not valid for updateClass")
    return null
  }

  const oID = new ObjectId(id)

  const updateDocument = {
    $set: {
      ...classData,
      lastModified: new Date()
    }
  }

  const options = { returnDocument: "after" }

  const updatedClass = await classesFromDB().findOneAndUpdate(
    { _id: oID },
    updateDocument,
    options
  )
  return updatedClass
}

async function deleteClass(id) {
  if(!ObjectId.isValid(id)) {
    console.error(" ObjectId is not valid for deleteClass")
    return null
  }

  const oID = new ObjectId(id)

  const result = await classesFromDB().deleteOne({ _id: oID })

  return result.deletedCount > 0
}

// =================================
//        Membership Plans         =
// =================================
function plansFromDB() {
  return client.db("fitness-dashboard").collection("memberPlans")
}

async function getAllPlans() {
  // return memberPlans
  try {
    const data = await plansFromDB().find({}).toArray()
    return data
  } catch (err) {
    console.error("Something went wrong querying all plans from DB: " + err)
  }
}

async function createPlan(planData) {
  const newPlan = {
    ...planData,
    lastModified: new Date() // Add a timestamp
  };
  const result = await plansFromDB().insertOne(newPlan);
  console.log(result)
  newPlan._id = result.insertedId
  return newPlan;
}

async function updatePlan(id, planData) {
  if(!ObjectId.isValid(id)) {
    console.error(" ObjectId is not valid for updatePlan")
    return null
  }

  const oID = new ObjectId(id)

  const updateDocument = {
    $set: {
      ...planData,
      lastModified: new Date()
    }
  }

  const options = { returnDocument: "after" }

  const updatedPlan = await plansFromDB().findOneAndUpdate(
    { _id: oID },
    updateDocument,
    options
  )
  return updatedPlan
}

async function deletePlan(id) {
  if(!ObjectId.isValid(id)) {
    console.error(" ObjectId is not valid for deletePlan")
    return null
  }

  const oID = new ObjectId(id)

  const result = await plansFromDB().deleteOne({ _id: oID })

  return result.deletedCount > 0
}

// === API Endpoints ===

app.get('/', (req, res) => {
  res.send('Fitness Center Dashboard API is running')
})

// =================================
//              Classes            =
// =================================
function mapClass(doc) {
  if (!doc || !doc._id) return {};
  return {
    id: doc._id.toString(),
    name: doc.name,
    time: doc.time,
    day: doc.day,
    trainer: doc.trainer,
    lastModified: doc.lastModified
  }
}

app.get('/api/classes', async (req, res) => {
  const data = await getAllClasses()
  res.json({ classes: data.map(mapClass) })
})

app.get('/api/classes/:id', async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "Request must contain an id query parameter" });
  }

  const fitness_class = await getClassById(id)
  if (!fitness_class) return res.status(404).json({ error: "Fitnes Class not found" });
  res.json(mapClass(fitness_class))
})

app.post('/api/classes', async (req, res) => {
  const newClass = req.body
  if (!newClass.name || !newClass.time === undefined || !newClass.day || !newClass.trainer) {
    return res.status(400).json({ error: "Missing required fitness class fields (name, time, day, trainer)"})
  }
  const createdClassWithId = await createClass(newClass)
  res.status(201).json(mapClass(createdClassWithId))
})

app.put('/api/classes/:id', async (req, res) => {
  const classData = req.body;
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "Request must contain an id query parameter" });
  }
  if (!classData.name || !classData.time === undefined || !classData.day || !classData.trainer) {
    return res.status(400).json({ error: "Missing required fitness class fields (name, time, day, trainer)"})
  }
  const updatedClassResult = await updateClass(id, classData)
  if (!updatedClassResult) return res.status(404).json({ error: "Fitnes Class not found for update" });
  res.json(mapClass(updatedClassResult.value))
})

app.delete('/api/classes/:id', async (req, res) => {
  const id = req.params.id;
  const success = await deleteClass(id)
  if (!success) return res.status(404).json({ kind: "Error", message: "Deletion Not Successful, class not found", id: id})
  res.status(200).json({ kind: "Confirmation", message: "Deletion Successful", id: id})
})

// =================================
//        Membership Plans         =
// =================================
function mapPlan(doc) {
  if (!doc || !doc._id) return {};
  return {
    id: doc._id.toString(),
    name: doc.name,
    duration: doc.duration,
    price: doc.price,
    lastModified: doc.lastModified
  }
}

app.get('/api/plans', async (req, res) => {
  const data = await getAllPlans()
  res.json({ plans: data.map(mapPlan) })
})

app.post('/api/plan', async (req, res) => {
  const newPlan = req.body
  if (!newPlan.name || !newPlan.price === undefined || !newPlan.duration === undefined) {
    return res.status(400).json({ error: "Missing required membership plan fields (name, duration, price)"})
  }
  const createdPlanWithId = await createPlan(newPlan)
  res.status(201).json(mapPlan(createdPlanWithId))
})

app.put('/api/plan/:id', async (req, res) => {
  const planData = req.body;
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "Request must contain an id query parameter" });
  }
  if (!planData.name || !planData.price === undefined || !planData.duration === undefined) {
    return res.status(400).json({ error: "Missing required membership plan fields (name, duration, price)"})
  }
  const updatedPlanResult = await updatePlan(id, planData)
  if (!updatedPlanResult) return res.status(404).json({ error: "Membership plan not found for update" });
  res.json(mapPlan(updatedPlanResult.value))
})

app.delete('/api/plan/:id', async (req, res) => {
  const id = req.params.id;
  const success = await deletePlan(id)
  if (!success) return res.status(404).json({ kind: "Error", message: "Deletion Not Successful, membership plan not found", id: id})
  res.status(200).json({ kind: "Confirmation", message: "Deletion Successful", id: id})
})

module.exports = app;
