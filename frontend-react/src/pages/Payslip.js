import React from 'react';
import Card from '../components/Card';

function PaySlip() {
    return (
        <Card title="Payslip for June 2025">
            <h3>Employee Details</h3>
            <p><strong>Name:</strong> Abebe Kebede</p>
            <p><strong>Position:</strong> Software Engineer</p>
            <hr />
            <h3>Earnings</h3>
            <p><strong>Basic Salary:</strong> ETB 45,000.00</p>
            <p><strong>Transport Allowance:</strong> ETB 2,000.00</p>
            <p><strong>Total Earnings:</strong> ETB 47,000.00</p>
            <hr />
            <h3>Deductions</h3>
            <p><strong>Income Tax:</strong> ETB 8,500.00</p>
            <p><strong>Pension (7%):</strong> ETB 3,150.00</p>
            <p><strong>Total Deductions:</strong> ETB 11,650.00</p>
            <hr />
            <h3><strong>Net Pay: ETB 35,350.00</strong></h3>
        </Card>
    );
}

export default PaySlip;