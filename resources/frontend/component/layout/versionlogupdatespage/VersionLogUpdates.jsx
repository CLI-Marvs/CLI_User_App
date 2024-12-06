import React, { useState } from 'react'

import ReactPaginate from 'react-paginate'
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'
import Dec_2_24 from './logs/Dec_2_24'

const VersionLogUpdates = () => {

    const items = [
        { id: 1, content: <Dec_2_24 /> },
       
        // Add more items as needed...
    ];

    const itemsPerPage = 2; // Number of items to display per page
    const [currentPage, setCurrentPage] = useState(0); // Zero-based index

    const pageCount = Math.ceil(items.length / itemsPerPage);

    // Get items for the current page
    const startIndex = currentPage * itemsPerPage;
    const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected); // ReactPaginate provides `selected` (zero-based index)
    };


    return (
        <div className='h-screen max-w-full bg-custom-grayFA p-[20px]'>
            <div className='flex mb-[20px]'>
                <p className='font-semibold text-[32px]'>Version Log Updates</p>
            </div>
            <div className="flex flex-col items-start">
                {/* Render the paginated items */}
                <div className="w-[1033px] flex flex-col gap-4">
                    {currentItems.map((item) => (
                        <div key={item.id} >
                            {item.content}
                            <div className="w-full border border-t-[1px] border-[#EDEBE9]"></div>
                        </div>
                    ))}
                </div>

                {/* Pagination controls */}
                <div className='w-[1033px] flex justify-center pt-[40px] pb-[80px]'>
                    <ReactPaginate
                        previousLabel={<MdKeyboardArrowLeft className="text-[#404B52]" />}
                        nextLabel={<MdKeyboardArrowRight className="text-[#404B52]" />}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={1}
                        onPageChange={handlePageClick}
                        containerClassName={"flex gap-2 mt-4"}
                        previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                        nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                        pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                        activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-white rounded-[4px] text-[12px]"
                        pageLinkClassName="w-full h-full flex justify-center items-center"
                        activeLinkClassName="w-full h-full flex justify-center items-center"
                        disabledLinkClassName="text-gray-300 cursor-not-allowed"
                        forcePage={currentPage}
                    />
                </div>
                
            </div>
        </div>
    )
}

export default VersionLogUpdates