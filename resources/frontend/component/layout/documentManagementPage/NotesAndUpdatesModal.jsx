import React from 'react';
import { useStateContext } from "../../../context/contextprovider";

function NotesAndUpdatesModal({ children, workOrderData, selectedAccountId, onClose }) {
  const { user } = useStateContext();
  console.log("Work Order Data:", workOrderData);
  console.log("Selected Account ID:", selectedAccountId);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div
        className="bg-white rounded-lg p-4 w-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
}

export default NotesAndUpdatesModal;