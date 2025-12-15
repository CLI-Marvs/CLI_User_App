import React from 'react'

const SurveyDeleteModal = ({ modalRef, handleDelete }) => {
    return (
        <dialog
            id="SurveyDelete"
            className="modal w-[469px] rounded-[10px] shadow-custom5 backdrop:bg-black/20"
            ref={modalRef}
        >
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="flex flex-col justify-center bg-white rounded-lg shadow-lg p-6 w-[400px] h-[200px] text-center">
                    <h2 className="text-lg montserrat-semibold mb-4">Confirm Delete</h2>
                    <p className="text-sm mb-6 montserrat-medium">Are you sure you want to delete this item?</p>
                    <div className="flex justify-center gap-4">
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-[10px]"
                            onClick={handleDelete}
                        >
                            Yes, Delete
                        </button>
                        <form 
                         method="dialog"
                        >
                            <button
                                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-[10px]"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default SurveyDeleteModal