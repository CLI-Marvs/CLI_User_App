import React from 'react'

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[400px] text-center">
                <div className="text-blue-500 mb-4">
                    <i className="fas fa-info-circle fa-2x"></i>
                </div>
                <h2 className="text-lg font-semibold mb-6">
                    Are you sure about sending this reply?
                </h2>
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="w-[120px] h-[40px] rounded-[5px] border border-custom-solidgreen text-custom-solidgreen hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-[120px] h-[40px] rounded-[5px] gradient-btn2 text-white"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal