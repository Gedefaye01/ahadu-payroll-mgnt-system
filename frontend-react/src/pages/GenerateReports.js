import React, { useState } from 'react';
import { toast } from 'react-toastify';

/**
 * GenerateReports Component
 * Allows administrators to select report types, generate reports by fetching structured data from the backend,
 * display them in a table, and download the generated report as a CSV file.
 */
function GenerateReports() {
  const [reportType, setReportType] = useState('payrollSummary');
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // <--- ADD THIS LINE

  // Get JWT token from localStorage for authenticated requests
  const token = localStorage.getItem('token');

  /**
   * Converts an array of objects into a CSV string.
   * @param {Array<Object>} data - The report data as an array of objects.
   * @returns {string} The CSV formatted string.
   */
  const convertToCsv = (data) => {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or newlines by quoting them
        return (typeof value === 'string' && (value.includes(',') || value.includes('\n')))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  /**
   * Handles the report generation process.
   * Fetches structured report data from the backend API based on the selected type.
   */
  const handleGenerateReport = async () => {
    setGenerating(true);
    setReportData(null);
    setDownloadLink(null);

    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, { // <--- MODIFIED
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ reportType: reportType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to generate ${reportType} report.`);
      }

      const data = await response.json();
      const fetchedReportData = data.reportData;

      if (!fetchedReportData || fetchedReportData.length === 0) {
        setReportData([]);
        toast.info("No data available for this report type.");
        return;
      }

      setReportData(fetchedReportData);

      const csvContent = convertToCsv(fetchedReportData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      setDownloadLink(url);

      toast.success('Report generated successfully!');
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error(err.message || "Failed to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Handles the download of the generated report.
   * Revokes the object URL after download to free up memory.
   */
  const handleDownloadReport = () => {
    if (downloadLink) {
      const link = document.createElement('a');
      link.href = downloadLink;
      link.setAttribute('download', `${reportType}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadLink);
      setDownloadLink(null);
    }
  };

  const tableHeaders = reportData && reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10 mb-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Generate Reports</h2>

      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Report Options</h3>
        <div className="form-group mb-4">
          <label htmlFor="reportType" className="block text-gray-700 text-sm font-bold mb-2">Select Report Type</label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="form-group select"
          >
            <option value="payrollSummary">Payroll Summary</option>
            <option value="attendanceOverview">Attendance Overview</option>
            <option value="employeeDetails">Employee Details</option>
          </select>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className={`btn btn-primary w-full ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {generating ? 'Generating Report...' : 'Generate Report'}
        </button>
      </div>

      {reportData && (
        <div className="table-container mt-8 p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Report Output</h3>
          {reportData.length > 0 ? (
            <div className="rounded-md border border-gray-300">
              <table className="data-table">
                <thead>
                  <tr>
                    {tableHeaders.map((header, index) => (
                      <th
                        key={index}
                        scope="col"
                        className=""
                      >
                        {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {tableHeaders.map((header, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className=""
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No data available for this report.</p>
          )}

          {downloadLink && (
            <button
              onClick={handleDownloadReport}
              className="btn btn-primary w-full mt-4 bg-green-600 hover:bg-green-700"
            >
              Download Report (CSV)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default GenerateReports;