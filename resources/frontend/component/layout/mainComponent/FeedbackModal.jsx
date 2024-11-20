import React from 'react'
import { AiFillInfoCircle } from 'react-icons/ai';

const FeedbackModal = ({ modalRef }) => {

    const maxCharacters = 500;
    const [remarks, setRemarks] = React.useState("");




    return (
        <dialog
            id="Resolved"
            className="modal w-[469px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className=" px-[25px] rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-3 flex justify-end -mr-4"
                    >
                        <button className="absolute justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className="flex justify-center items-center mt-[14px] ">
                    <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                </div>
                <div className="flex justify-center mt-[30px] mb-[26px]">
                    <p className="montserrat-medium text-sm">
                        This message will be sent to CLI Digital Innovation Team.
                    </p>
                </div>
                <div className=" bg-[#EDEDED] border border-[#D9D9D9]">
                    <div className="flex items-center justify-between">
                        <p className="text-custom-gray81 pl-3 text-sm flex-grow">
                            Message
                        </p>
                        <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border border-custom-grayFA pl-2 pr-12 ml-auto">
                            {remarks.length}/500 characters
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            id="message"
                            rows="4"
                            maxLength={maxCharacters}
                            className="block border-t-1 h-[86px] p-2.5 w-full text-sm text-gray-900 bg-white outline-none"
                        ></textarea>
                    </div>
                </div>
                <div className='mt-[14px]'>
                    <button
                        /*  onClick={() =>
                             setIsConfirmModalOpen(false)
                         } */
                        className="gradient-btn5 p-[1px] w-[155px] h-[35px] rounded-[6px] "
                    >
                        <div className="w-full h-full rounded-[5px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                            <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                               Attachments
                            </p>
                        </div>
                    </button>
                </div>
                <div className="mt-5 mb-[25px]">
                    <form
                        method="dialog"
                        className="flex justify-end gap-[19px]"
                    >

                        <button
                            /* onClick={updateStatus} */
                            className="min-h-[29px] w-[77px] px-[20px] py-[6px] text-sm font-semibold text-white rounded-[6px] gradient-btn2 hover:shadow-custom4"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
}

export default FeedbackModal