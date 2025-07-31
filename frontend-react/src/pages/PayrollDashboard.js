import React from 'react';
import Card from '../components/Card'; // Assuming this component exists and is correctly imported

function PayrollDashboard() {
  const stats = [
    { label: 'Total Employees', value: '125' },
    { label: 'Last Payroll Run', value: 'June 2024' },
    { label: 'Total Paid Last Month', value: 'ETB 2,543,120.50' },
    { label: 'Next Payroll Date', value: 'July 30, 2024' },
  ];

  return (
    <div>
      <h1 className="page-header">Payroll Dashboard</h1>
      <div className="features-grid">
        {stats.map(stat => (
            <Card key={stat.label}>
                <h4>{stat.label}</h4>
                <p style={{fontSize: '1.5rem', color: '#004a99', margin: '0'}}>{stat.value}</p>
            </Card>
        ))}
      </div>
      <Card title="Recent Payroll Runs">
          <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>Status</th>
                        <th>Total Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>June 2024</td>
                        <td>Completed</td>
                        <td>ETB 2,543,120.50</td>
                        <td><button className="btn btn-secondary">View Details</button></td>
                    </tr>
                     <tr>
                        <td>May 2024</td>
                        <td>Completed</td>
                        <td>ETB 2,510,800.00</td>
                        <td><button className="btn btn-secondary">View Details</button></td>
                    </tr>
                </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
}

export default PayrollDashboard;
