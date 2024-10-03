import React from 'react'

const AddInfoModal = ({modalRef}) => {
  return (
    <dialog id="Resolved" className="modal w-[587px] rounded-[10px] shadow-custom5 backdrop:bg-black/50" ref={modalRef}>
            <div className=" px-[50px] py-[77px] rounded-[10px]">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-3 flex justify-end -mr-4"
                    >
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
  )
}

export default AddInfoModal