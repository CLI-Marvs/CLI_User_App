import React, {useState} from 'react'
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const Notification = () => {

    const [activeButton, setActiveButton] = useState('All');

    const handleClick = (button) => {
        setActiveButton((prev) => (prev === button ? null : button));
      };


    const buttonLabels = ['All', 'Unread', 'Read'];

  return (
    <div className='h-screen bg-custom-grayFA'>
        <div className='bg-custom-grayFA px-5'>
            <div className='h-[63px] bg-white rounded-t-[10px] px-4 flex justify-start items-center gap-4'>
                <div>
                    <p className='montserrat-medium text-custom-bluegreen'>Notifications</p>
                </div>
                <div className='flex space-x-2'>
                {buttonLabels.map((label) => (
                        <button
                        key={label}
                        onClick={() => handleClick(label)}
                        className={`flex items-center border montserrat-semibold border-custom-lightgreen h-[24px] px-3 rounded-[50px] text-[13px] ${
                            activeButton === label ? 'bg-custom-lightgreen text-white' : 'text-custom-lightgreen'
                        }`}
                        >
                        {label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <table className='flex flex-col gap-1 w-full'>
                    <tbody>
                        {/* UNREAD */}
                        <tr className='flex items-center h-[47px] cursor-pointer my-1 bg-white hover:shadow-custom4'>
                            <td className='w-[228px] shrink-0 h-full px-4'>
                                <div className='h-full flex flex-col justify-center'>
                                    <p className='montserrat-medium text-[13px] text-custom-bluegreen'>Kent Jeffrey Armelia</p>
                                    <p className='text-xs text-custom-grayA5'>Property Owner</p>
                                </div> 
                            </td>
                            <td className='w-[375px] h-full px-2 shrink-0'>
                                <div className='h-full flex flex-col justify-center'>
                                    <p className='montserrat-medium text-[13px] text-custom-bluegreen'>Property Transaction Failure</p>
                                    <p className='text-xs text-custom-grayA5 truncate'>Hello, I can’t seen to complete my action because I can’t click the porperty thank you</p>
                                </div> 
                            </td>
                            <td className='w-[320px] shrink-0 h-full px-10 flex items-center'>
                                <p className='flex space-x-4 text-xs text-custom-solidgreen'>
                                   <span>Transactions</span> 
                                    <span>&gt;</span>
                                    <span>Casa Mira</span>
                                    <span>&gt;</span>
                                    <span>Equity</span>
                                </p>
                            </td>
                            <td className='h-full shrink-0 flex justify-center items-center'>
                                <p className='text-xs montserrat-regular space-x-1 text-custom-bluegreen'>
                                    <span>7 / 26 /2024</span>
                                    <span>( 09:50 AM)</span>
                                </p>
                            </td>
                        </tr>
                        {/* READ */}
                        <tr className='flex items-center h-[47px] cursor-pointer my-1 bg-custom-grayF1 hover:shadow-custom4'>
                            <td className='w-[228px] shrink-0 h-full px-4 bg-custom-grayF1'>
                                <div className='h-full flex flex-col justify-center'>
                                    <p className='montserrat-medium text-[13px] '>Kent Jeffrey Armelia</p>
                                    <p className='text-xs text-custom-grayA5'>Property Owner</p>
                                </div> 
                            </td>
                            <td className='w-[375px] h-full px-2 shrink-0 bg-custom-grayF1'>
                                <div className='h-full flex flex-col justify-center'>
                                    <p className='montserrat-medium text-[13px] '>Property Transaction Failure</p>
                                    <p className='text-xs text-custom-grayA5 truncate'>Hello, I can’t seen to complete my action because I can’t click the porperty thank you</p>
                                </div> 
                            </td>
                            <td className='w-[320px] shrink-0 h-full px-10 flex items-center bg-custom-grayF1'>
                                <p className='flex space-x-4 text-xs text-custom-grayA5'>
                                   <span>Transactions</span> 
                                    <span>&gt;</span>
                                    <span>Casa Mira</span>
                                    <span>&gt;</span>
                                    <span>Equity</span>
                                </p>
                            </td>
                            <td className='h-full shrink-0 flex justify-center items-center bg-custom-grayF1'>
                                <p className='text-xs montserrat-regular space-x-1 text-custom-grayA5'>
                                    <span>7 / 26 /2024</span>
                                    <span>( 09:50 AM)</span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='h-[63px] bg-white rounded-b-[10px] px-4 flex justify-start items-center gap-4'> </div>
            <div className='flex w-full justify-end mt-3'>
                <ReactPaginate
                previousLabel={<MdKeyboardArrowLeft className='text-[#404B52]'/>}
                nextLabel={<MdKeyboardArrowRight className='text-[#404B52]'/>}
                breakLabel={"..."}
                pageCount={2}
                marginPagesDisplayed={2}
                pageRangeDisplayed={1}
                /* onPageChange={handlePageClick} */
                containerClassName={"flex gap-2"}
                previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                pageClassName=" border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                pageLinkClassName="w-full h-full flex justify-center items-center"
                activeLinkClassName="w-full h-full flex justify-center items-center"
                disabledLinkClassName={
                    "text-gray-300 cursor-not-allowed"
                }
                /* forcePage={currentPage} */
            />
            </div>
        </div>
    </div>
  )
}

export default Notification