import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function AdminPayrollManagement() {
    const [payrollRuns, setPayrollRuns] = useState([]);
    const [draftPayroll, setDraftPayroll] = useState(null);
    const [payPeriodStart, setPayPeriodStart] = useState('');
    const [payPeriodEnd, setPayPeriodEnd] = useState('');
    const [lastProcessed, setLastProcessed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [viewDetails, setViewDetails] = useState(false);
    const [selectedRun, setSelectedRun] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem('token');
    const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const fetchPayrollRuns = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/payroll/runs`, { headers: authHeaders });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.payPeriodEnd) - new Date(a.payPeriodEnd));
            setPayrollRuns(sortedData);
            if (sortedData.length > 0) {
                setLastProcessed(format(new Date(sortedData[0].processedAt), 'PPP HH:mm'));
            } else {
                setLastProcessed(null);
            }
        } catch (error) {
            console.error("Failed to fetch payroll runs:", error);
            toast.error("Failed to load payroll history.");
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, authHeaders]);

    useEffect(() => {
        fetchPayrollRuns();
    }, [fetchPayrollRuns]);

    const handlePreviewPayroll = async () => {
        if (!payPeriodStart || !payPeriodEnd) {
            toast.error("Please select both start and end dates for the payroll period.");
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/payroll/preview`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ payPeriodStart, payPeriodEnd }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Payroll preview failed with status: ${response.status}`);
            }

            const data = await response.json();
            setDraftPayroll(data);
            toast.info('Payroll preview generated successfully!');
        } catch (error) {
            console.error("Error previewing payroll:", error);
            toast.error(error.message || "An error occurred during payroll preview.");
        } finally {
            setProcessing(false);
        }
    };

    const handleFinalizePayroll = async () => {
        if (!draftPayroll) {
            toast.error("No payroll draft to finalize.");
            return;
        }

        const confirmFinalize = window.confirm("Are you sure you want to finalize and approve this payroll? This action is permanent.");
        if (!confirmFinalize) return;

        setProcessing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/payroll/finalize`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    payrollRunId: draftPayroll.id,
                }),
            });

            if (!response.ok) {
                if (response.status === 403) {
                    toast.error("You cannot approve a payroll you have drafted yourself due to the maker-checker rule.");
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.message || `Payroll finalization failed with status: ${response.status}`);
                }
                return;
            }

            toast.success('Payroll finalized and approved successfully!');
            setDraftPayroll(null);
            setPayPeriodStart('');
            setPayPeriodEnd('');
            fetchPayrollRuns();
        } catch (error) {
            console.error("Error finalizing payroll:", error);
            toast.error("An unexpected error occurred during payroll finalization.");
        } finally {
            setProcessing(false);
        }
    };

    const handleMarkAsPaid = async (runId) => {
        const confirmPaid = window.confirm("Are you sure you want to mark this payroll as PAID? This action is irreversible.");
        if (!confirmPaid) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/payroll/pay/${runId}`, {
                method: 'POST',
                headers: authHeaders,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to mark payroll as paid: ${response.status}`);
            }

            toast.success('Payroll marked as PAID successfully!');
            fetchPayrollRuns();
        } catch (error) {
            console.error("Error marking payroll as paid:", error);
            toast.error(error.message || "An error occurred while marking payroll as paid.");
        }
    };

    const handleViewDetails = async (runId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/payroll/run/${runId}`, { headers: authHeaders });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setSelectedRun(data);
            setViewDetails(true);
        } catch (error) {
            console.error("Failed to fetch payroll run details:", error);
            toast.error("Failed to load payroll run details.");
        }
    };

    const handleDeletePayrollRun = async (runId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this payroll run? This cannot be undone.");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/payroll/run/${runId}`, {
                method: 'DELETE',
                headers: authHeaders,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Payroll deletion failed with status: ${response.status}`);
            }

            toast.success("Payroll run deleted successfully!");
            fetchPayrollRuns();
        } catch (error) {
            console.error("Error deleting payroll run:", error);
            toast.error(error.message || "An error occurred during payroll deletion.");
        }
    };

    if (loading) {
        return <div className="page-container text-center p-8">Loading...</div>;
    }

    if (viewDetails) {
        return (
            <div className="page-container p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
                <button
                    onClick={() => setViewDetails(false)}
                    className="mb-6 btn bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md"
                >
                    &larr; Back to Payroll Runs
                </button>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Payroll Run Details for {format(new Date(selectedRun.payPeriodStart), 'PP')} to {format(new Date(selectedRun.payPeriodEnd), 'PP')}
                </h3>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Gross Pay</th>
                                <th>Commission</th>
                                <th>Tax Deduction</th>
                                <th>PF Deduction</th>
                                <th>Total Deductions</th>
                                <th>Net Pay</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedRun.paychecks.map(paycheck => (
                                <tr key={paycheck.id}>
                                    <td className="font-semibold text-gray-800">{paycheck.employeeUsername}</td>
                                    <td>{paycheck.grossPay ? `$${paycheck.grossPay.toFixed(2)}` : 'N/A'}</td>
                                    <td>{paycheck.commissionAmount ? `$${paycheck.commissionAmount.toFixed(2)}` : 'N/A'}</td>
                                    <td>{paycheck.taxDeduction ? `$${paycheck.taxDeduction.toFixed(2)}` : 'N/A'}</td>
                                    <td>{paycheck.providentFundDeduction ? `$${paycheck.providentFundDeduction.toFixed(2)}` : 'N/A'}</td>
                                    <td>{paycheck.totalDeductions ? `$${paycheck.totalDeductions.toFixed(2)}` : 'N/A'}</td>
                                    <td>{paycheck.netPay ? `$${paycheck.netPay.toFixed(2)}` : 'N/A'}</td>
                                    <td>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            paycheck.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            paycheck.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {paycheck.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Manage Payroll Processing</h2>

            {/* Payroll Actions Section */}
            <div className="text-center mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Payroll Preparation</h3>
                <p className="text-gray-600 mb-4">
                    Last Payroll Processed: {lastProcessed || 'Never'}
                </p>
                <div className="flex flex-col md:flex-row gap-4 mb-4 justify-center">
                    <div className="form-group flex-1">
                        <label htmlFor="payPeriodStart" className="block text-gray-700 text-sm font-bold mb-2">Pay Period Start Date</label>
                        <input
                            type="date"
                            id="payPeriodStart"
                            value={payPeriodStart}
                            onChange={(e) => setPayPeriodStart(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={processing}
                        />
                    </div>
                    <div className="form-group flex-1">
                        <label htmlFor="payPeriodEnd" className="block text-gray-700 text-sm font-bold mb-2">Pay Period End Date</label>
                        <input
                            type="date"
                            id="payPeriodEnd"
                            value={payPeriodEnd}
                            onChange={(e) => setPayPeriodEnd(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={processing}
                        />
                    </div>
                </div>
                <button
                    onClick={handlePreviewPayroll}
                    disabled={processing || !payPeriodStart || !payPeriodEnd}
                    className={`btn ${processing || !payPeriodStart || !payPeriodEnd ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}
                >
                    {processing ? 'Generating Preview...' : 'Preview Payroll'}
                </button>
            </div>

            {/* Draft Payroll Preview Section */}
            {draftPayroll && (
                <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-yellow-50">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Draft Payroll for {format(new Date(draftPayroll.payPeriodStart), 'PP')} to {format(new Date(draftPayroll.payPeriodEnd), 'PP')}</h3>
                    <p className="text-red-500 mb-4">This is a draft. The data below is not yet finalized. Please review carefully before approving.</p>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee Name</th>
                                    <th>Gross Pay</th>
                                    <th>Commission</th>
                                    <th>Tax Deduction</th>
                                    <th>PF Deduction</th>
                                    <th>Total Deductions</th>
                                    <th>Net Pay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {draftPayroll.paychecks.map(paycheck => (
                                    <tr key={paycheck.employeeId}>
                                        <td className="font-semibold">{paycheck.employeeUsername}</td>
                                        <td>{paycheck.grossPay ? `$${paycheck.grossPay.toFixed(2)}` : 'N/A'}</td>
                                        <td>{paycheck.commissionAmount ? `$${paycheck.commissionAmount.toFixed(2)}` : 'N/A'}</td>
                                        <td>{paycheck.taxDeduction ? `$${paycheck.taxDeduction.toFixed(2)}` : 'N/A'}</td>
                                        <td>{paycheck.providentFundDeduction ? `$${paycheck.providentFundDeduction.toFixed(2)}` : 'N/A'}</td>
                                        <td>{paycheck.totalDeductions ? `$${paycheck.totalDeductions.toFixed(2)}` : 'N/A'}</td>
                                        <td>{paycheck.netPay ? `$${paycheck.netPay.toFixed(2)}` : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleFinalizePayroll}
                            disabled={processing}
                            className={`btn ${processing ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary bg-green-600 hover:bg-green-700 text-white shadow-md'}`}
                        >
                            {processing ? 'Finalizing...' : 'Finalize & Approve Payroll'}
                        </button>
                    </div>
                </div>
            )}

            {/* Recent Payroll Runs Table */}
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Payroll Runs</h3>
            {payrollRuns.length === 0 ? (
                <p className="text-center text-gray-500">No payroll runs recorded yet.</p>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Pay Period</th>
                                <th>Total Net Pay</th>
                                <th>Processed On</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollRuns.map(run => (
                                <tr key={run.id}>
                                    <td>{format(new Date(run.payPeriodStart), 'PP')} - {format(new Date(run.payPeriodEnd), 'PP')}</td>
                                    <td>{run.totalNetPay ? `$${run.totalNetPay.toFixed(2)}` : 'N/A'}</td>
                                    <td>{format(new Date(run.processedAt), 'PPP')}</td>
                                    <td>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            run.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            run.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                            run.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {run.status}
                                        </span>
                                    </td>
                                    <td className="table-actions flex gap-2">
                                        <button
                                            onClick={() => handleViewDetails(run.id)}
                                            className="btn bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-1 px-3 rounded-md"
                                        >
                                            View Details
                                        </button>
                                        {run.status === 'APPROVED' && (
                                            <>
                                                <button
                                                    onClick={() => handleMarkAsPaid(run.id)}
                                                    className="btn bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-md"
                                                >
                                                    Mark as Paid
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePayrollRun(run.id)}
                                                    className="btn bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {run.status === 'DRAFT' && (
                                            <button
                                                onClick={() => handleDeletePayrollRun(run.id)}
                                                className="btn bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md"
                                            >
                                                Delete Draft
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminPayrollManagement;