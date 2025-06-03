import React, { useState, useEffect } from 'react';

function NotesAndUpdatesModal({ selectedAccountId, onClose, onAddNote }) {
  const [logs, setLogs] = useState([]);
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (selectedAccountId) {
      setLogs([]);
      setAccountInfo(null);
      setError(null);
      fetchAccountAndLogData();
    } else {
      setLogs([]);
      setAccountInfo(null);
      setError(null);
      setLoading(false);
    }
  }, [selectedAccountId]);

const fetchAccountAndLogData = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`/api/get-account-logs/${selectedAccountId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`);
    }

    const data = await response.json();

    const logsArray = data.log_data || [];

    setLogs(logsArray);
    setAccountInfo(null);

  } catch (err) {
    console.error('Error fetching account and log data:', err);
    setError(`Failed to load notes and updates: ${err.message}`);
    setLogs([]);
    setAccountInfo(null);
  } finally {
    setLoading(false);
  }
};

  console.log('Fetched API response data:', logs); 
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatHeaderDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateWithTime = (dateStr) => {
    const date = new Date(dateStr);
    const dateOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    return `${formattedDate} | ${formattedTime}`;
  };

  const getDisplayLogs = () => {
    if (showAll) return logs;
    return logs.slice(0, 2);
  };

  const latestLogDate = logs.length > 0 ? logs[0].created_at : new Date().toISOString();

  if (loading && !error) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-8 w-auto min-w-[200px]">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div
        className="bg-white rounded-lg w-1/2 max-w-2xl max-h-[80vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-teal-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-medium">
                Notes and Updates: <span className="text-green-300">{logs[0]?.log_type || 'Loading...'}</span>
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm bg-white text-teal-600 px-3 py-1 rounded">
                <span>{formatHeaderDate(latestLogDate)}</span>
                <span>📅</span>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {error && (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
              <p>Please try again later.</p>
            </div>
          )}
          {!error && !loading && logs.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No notes or updates found for this account.
            </div>
          )}
          {!error && logs.length > 0 && (
            <div className="space-y-6">
              {getDisplayLogs().map((log) => (
                <div key={log.id} className="space-y-1">
                  <div className="text-teal-700 font-medium text-sm">
                    {formatDateWithTime(log.created_at)}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {log.log_message?.includes('created') ? (
                      <>
                        Work Order Created by: <span className="text-blue-600 font-medium">{log?.fullname || 'Unknown User'}</span>
                      </>
                    ) : log.log_message?.includes('assigned') || log.log_message?.includes('Assigned') ? (
                      <>
                        Work Order Assigned to: <span className="text-blue-600 font-medium">{log.assigned_to?.fullname || log.assignee?.fullname || 'Unknown User'}</span>
                        <span className="text-gray-500 text-xs ml-2">by {log.created_by?.fullname || 'Unknown User'}</span>
                      </>
                    ) : log.log_message?.includes('reassigned') || log.log_message?.includes('Reassigned') ? (
                      <>
                        Work Order Reassigned to: <span className="text-blue-600 font-medium">{log.assigned_to?.fullname || log.assignee?.fullname || 'Unknown User'}</span>
                        {log.previous_assignee && (
                          <span className="text-gray-500 text-xs ml-2">(Previously: {log.previous_assignee?.fullname || log.previous_assignee})</span>
                        )}
                        <span className="text-gray-500 text-xs ml-2">by {log.created_by?.fullname || 'Unknown User'}</span>
                      </>
                    ) : log.note_type ? (
                      <>
                        {log.note_type.replace('_', ' ')} by: <span className="text-blue-600 font-medium">{log.created_by?.fullname || 'Unknown User'}</span>
                      </>
                    ) : (
                      <>
                        {log.log_message || 'Update'} by: <span className="text-blue-600 font-medium">{log.created_by?.fullname || 'Unknown User'}</span>
                      </>
                    )}
                    {log.is_new && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        New
                      </span>
                    )}
                  </div>
                  {log.note_content && (
                    <div className="text-gray-700 text-sm mt-2 pl-4 border-l-2 border-gray-200">
                      {log.note_content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
          <div className="flex justify-between items-center">
            <div>
              {logs.length > 2 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors border border-teal-600 px-4 py-2 rounded"
                >
                  {showAll ? 'Show Less' : 'See More'}
                </button>
              )}
            </div>
            <button
              onClick={() => onAddNote && onAddNote(selectedAccountId)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded flex items-center space-x-2 transition-colors"
            >
              <span>+</span>
              <span>Add Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesAndUpdatesModal;