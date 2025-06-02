import React, { useState, useEffect } from 'react';

function NotesAndUpdatesModal({ selectedAccountId, onClose, onAddNote }) {
  const [logs, setLogs] = useState([]);
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(false); // Start as false, true when fetching
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (selectedAccountId) {
      // Clear previous data and error, set loading true
      setLogs([]);
      setAccountInfo(null);
      setError(null);
      fetchAccountAndLogData();
    } else {
      // If no account is selected, clear data and ensure loading is false
      setLogs([]);
      setAccountInfo(null);
      setError(null);
      setLoading(false);
    }
  }, [selectedAccountId]);

  const fetchAccountAndLogData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // This single API call is expected to return both account info and logs
      const response = await fetch(`/api/get-account-logs/${selectedAccountId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`);
      }
      const data = await response.json();

      // Assuming 'data' itself contains account information (e.g., data.account_name)
      setAccountInfo(data);

      // Assuming 'data' has a property (e.g., 'work_logs', 'logs', 'entries') that is an array of logs.
      // *** Please verify and change 'work_logs' to the actual property name from your API response. ***
      setLogs(data.work_logs || []);

    } catch (err) {
      console.error('Error fetching account and log data:', err);
      setError(`Failed to load notes and updates: ${err.message}`);
      setAccountInfo(null); // Clear data on error
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

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

  const getDisplayLogs = () => {
    if (showAll) return logs;
    return logs.slice(0, 2);
  };

  const latestLogDate = logs.length > 0 ? logs[0].created_at : new Date().toISOString();

  if (loading && !error) { // Show loading only if not in error state (or handle error display within loading too)
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
                Notes and Updates: <span className="text-green-300">{accountInfo?.account_name || 'Loading...'}</span>
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                {/* <Calendar className="w-4 h-4" /> */}
                <span>{formatHeaderDate(latestLogDate)}</span>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                X{/* <X className="w-5 h-5" /> */}
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
          {!error && loading && logs.length === 0 && ( // Still loading initial data
             <div className="text-center text-gray-500 py-8">Loading notes...</div>
          )}
          {!error && !loading && logs.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No notes or updates found for this account.
            </div>
          )}
          {!error && logs.length > 0 && (
            <div className="space-y-4">
              {getDisplayLogs().map((log) => (
                <div key={log.id} className="border-l-2 border-gray-200 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-teal-700 mb-1">
                        {formatDate(log.created_at)}
                      </div>
                      <div className="text-gray-700 text-sm">
                        {log.log_message}
                        {log.is_new && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            New
                          </span>
                        )}
                      </div>
                      {log.note_type && (
                        <div className="text-xs text-gray-500 mt-1">
                          Type: {log.note_type.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div>
              {logs.length > 2 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
                >
                  {showAll ? 'Show Less' : 'See More'}
                </button>
              )}
            </div>
            <button
              onClick={() => onAddNote && onAddNote(selectedAccountId)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              +{/* <Plus className="w-4 h-4" /> */}
              <span>Add Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesAndUpdatesModal;