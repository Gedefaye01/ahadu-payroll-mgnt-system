const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json()); // Parse JSON request bodies

// In-memory data store (for demonstration purposes)
let companyInfo = { companyName: "Innovate Solutions Inc." };
let payrollData =;
let employees =;
let nextEmployeeId = 3;

// API Endpoints
app.get('/api/company-info', (req, res) => {
    res.json(companyInfo);
});

app.get('/api/payroll-data', (req, res) => {
    res.json(payrollData);
});

app.get('/api/employees', (req, res) => {
    res.json(employees);
});

app.post('/api/employees', (req, res) => {
    const newEmployee = { id: nextEmployeeId++,...req.body };
    employees.push(newEmployee);
    res.status(201).json(newEmployee);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});