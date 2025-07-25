import React from 'react';
import Card from '../components/Card';

function EmployeeList({ setRoute }) {
  const employees = [
    { id: 'AH001', name: 'Abebe Kebede', position: 'Software Engineer', salary: 'ETB 45,000' },
    { id: 'AH002', name: 'Fatuma Mohammed', position: 'Project Manager', salary: 'ETB 65,000' },
    { id: 'AH003', name: 'Yosef Alemu', position: 'UI/UX Designer', salary: 'ETB 38,000' },
    { id: 'AH004', name: 'Sara Tadesse', position: 'Accountant', salary: 'ETB 32,000' },
  ];

  return (
    <Card>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 className="page-header" style={{marginBottom: '0'}}>Employee List</h1>
        <button className="btn btn-primary" onClick={() => setRoute('add-employee')}>Add Employee</button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Position</th>
              <th>Monthly Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.position}</td>
                <td>{emp.salary}</td>
                <td className="table-actions">
                  <button className="btn btn-secondary" onClick={() => setRoute('payslip')}>Payslip</button>
                  <button className="btn btn-secondary">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default EmployeeList;