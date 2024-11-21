import React from 'react'

const DepartmentModal = ({ modalRef }) => {
  return (
    <dialog
            id="Department"
            className="modal w-[557px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={modalRef}
        >
           <div className='relative px-[50px] mb-5 rounded-lg'>
                <div className=''>
                    <form method="dialog" className="pt-3 flex justify-end -mr-[40px]">
                        <button className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className='mt-[6px] flex justify-start items-center mb-5'>
                    <p className='montserrat-bold'>Add Property Details</p>
                </div>
           </div>
    </dialog>
  )
}

export default DepartmentModal