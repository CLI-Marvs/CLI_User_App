import CheckmarkIcon from '../../../../../public/Images/round_check.svg';

const WorkOrderCreatedModal = ({ isOpen, workOrderId, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-600 bg-opacity-10">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden sm:max-w-md w-[554px] mx-4 p-8 flex flex-col items-center">
                <div className="flex items-center justify-center mb-4">
                    <span className="flex items-center justify-center">
                        <img src={CheckmarkIcon} alt="Checkmark" className="h-10 w-10" />

                    </span>
                </div>
                <div className="text-center rounded-3xl mb-2 px-8 py-1 bg-[#067AC5]">
                    <div className="text-s font-thin text-white">
                        Work Order No. {workOrderId}
                    </div>
                </div>
                <div className="text-center mb-6">
                    <p className="text-xl font-medium text-black">
                        Work order has been created.
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default WorkOrderCreatedModal;