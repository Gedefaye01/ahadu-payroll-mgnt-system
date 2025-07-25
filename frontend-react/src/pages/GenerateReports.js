import React, { useState } from 'react';
import { toast } from 'react-toastify';

/**
 * GenerateReports Component
 * Allows administrators to select report types, generate reports by fetching structured data from the backend,
 * display them in a table, and download the generated report as a CSV file.
 */
function GenerateReports() {
  const [reportType, setReportType] = useState('payrollSummary'); // State for selected report type
  const [reportData, setReportData] = useState(null); // State for the generated report structured data (array of objects)
  const [generating, setGenerating] = useState(false); // State to indicate if report is being generated
  const [downloadLink, setDownloadLink] = useState(null); // State for the download link URL

  // Get JWT token from localStorage for authenticated requests
  // FIX: Corrected localStorage access from localStorage.localStorage.getItem to localStorage.getItem
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
          ? `"${value.replace(/"/g, '""')}"` // Double quotes inside quoted string
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
    setGenerating(true); // Set generating state to true
    setReportData(null); // Clear any previous report data
    setDownloadLink(null); // Clear any previous download link

    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Include JWT token for authentication
      };

      // Make a POST request to the backend to generate the report
      const response = await fetch('http://localhost:8080/api/reports/generate', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ reportType: reportType }) // Send the selected report type
      });

      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json(); // Assuming backend sends JSON error
        throw new Error(errorData.message || `Failed to generate ${reportType} report.`);
      }

      // Assuming the backend returns JSON with a 'reportData' field (an array of objects)
      const data = await response.json();
      const fetchedReportData = data.reportData;

      if (!fetchedReportData || fetchedReportData.length === 0) {
        setReportData([]); // Set to empty array if no data
        toast.info("No data available for this report type.");
        return;
      }

      setReportData(fetchedReportData); // Set the generated report data

      // Convert the structured data to CSV for download
      const csvContent = convertToCsv(fetchedReportData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      setDownloadLink(url); // Set the URL for download

      toast.success('Report generated successfully!');
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error(err.message || "Failed to generate report. Please try again.");
    } finally {
      setGenerating(false); // Set generating state back to false
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
      link.setAttribute('download', `${reportType}_report.csv`); // Suggest a CSV filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadLink); // Clean up the object URL
      setDownloadLink(null); // Clear the download link state
    }
  };

  // Determine table headers from the first object in reportData
  const tableHeaders = reportData && reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10 mb-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Generate Reports</h2>

      {/* Report Options Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Report Options</h3>
        <div className="form-group mb-4">
          <label htmlFor="reportType" className="block text-gray-700 text-sm font-bold mb-2">Select Report Type</label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="payrollSummary">Payroll Summary</option>
            <option value="attendanceOverview">Attendance Overview</option>
            <option value="employeeDetails">Employee Details</option>
          </select>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out transform hover:scale-105 ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {generating ? 'Generating Report...' : 'Generate Report'}
        </button>
      </div>

      {/* Report Output Display (Table) */}
      {reportData && (
        <div className="mt-8 p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Report Output</h3>
          {reportData.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-gray-300">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    {tableHeaders.map((header, index) => (
                      <th
                        key={index}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} {/* Format camelCase to Title Case */}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {tableHeaders.map((header, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out transform hover:scale-105"
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
