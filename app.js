var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// In-memory store (to be replaced by DB later)
let nextClassId = 1
let nextPlanId = 1

const fitnessClasses = [
    { id: Date.now() + 1, name: 'Yoga Basics', time: '07:00', day: 'Monday', trainer: 'Jane Doe' },
    { id: Date.now() + 2, name: 'HIIT Workout', time: '18:00', day: 'Tuesday', trainer: 'John Smith' },
  ]
const memberPlans = [
  { id: Date.now() - 1, name: 'Basic Plan', duration: 1, price: 30 },
  { id: Date.now() - 2, name: 'Annual Plan', duration: 12, price: 300 },
]

// === Utility functions ===

function getAllClasses() {
  return fitnessClasses
}

function getClassById(id) {
  return fitnessClasses.find(cls => cls.id == id)
}

function createClass(cls) {
  cls.id = nextClassId++
  fitnessClasses.push(cls)
  return cls
}

function updateClass(id, cls) {
  const index = fitnessClasses.findIndex(c => c.id == id)
  if (index === -1) return null
  cls.id = id
  fitnessClasses[index] = cls
  return cls
}

function deleteClass(id) {
  const index = fitnessClasses.findIndex(c => c.id == id)
  if (index === -1) return false
  fitnessClasses.splice(index, 1)
  return true
}

function getAllPlans() {
  return memberPlans
}

function createPlan(plan) {
  plan.id = nextPlanId++
  memberPlans.push(plan)
  return plan
}

function updatePlan(id, plan) {
  const index = memberPlans.findIndex(p => p.id == id)
  if (index === -1) return null
  plan.id = id
  memberPlans[index] = plan
  return plan
}

function deletePlan(id) {
  const index = memberPlans.findIndex(p => p.id == id)
  if (index === -1) return false
  memberPlans.splice(index, 1)
  return true
}

// === API Endpoints ===

app.get('/', (req, res) => {
  res.send('Fitness Center Dashboard API is running')
})

// --- Fitness Classes ---
app.get('/api/classes', (req, res) => {
  res.json({ classes: getAllClasses() })
})

app.get('/api/classes/:id', (req, res) => {
  const cls = getClassById(req.params.id)
  if (!cls) return res.status(404).send()
  res.json(cls)
})

app.post('/api/classes', (req, res) => {
  const newClass = req.body
  const added = createClass(newClass)
  res.status(201).json(added)
})

app.put('/api/classes/:id', (req, res) => {
  const updated = updateClass(req.params.id, req.body)
  if (!updated) return res.status(404).send()
  res.json(updated)
})

app.delete('/api/classes/:id', (req, res) => {
  const success = deleteClass(req.params.id)
  if (!success) return res.status(404).json({ message: 'Not found' })
  res.status(204).send()
})

// --- Member Plans ---
app.get('/api/plans', (req, res) => {
  res.json({ plans: getAllPlans() })
})

app.post('/api/plan', (req, res) => {
  const newPlan = req.body
  const added = createPlan(newPlan)
  res.status(201).json(added)
})

app.put('/api/plan/:id', (req, res) => {
  const updated = updatePlan(req.params.id, req.body)
  if (!updated) return res.status(404).send()
  res.json(updated)
})

app.delete('/api/plan/:id', (req, res) => {
  const success = deletePlan(req.params.id)
  if (!success) return res.status(404).json({ message: 'Not found' })
  res.status(204).send()
})

module.exports = app;
