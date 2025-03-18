import React from "react";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const Pagination = () => {
    return (
        <div className="flex justify-end mt-4">
            <div className="flex w-full justify-end mt-3 mb-10">
                <ReactPaginate
                    previousLabel={
                        <MdKeyboardArrowLeft className="text-[#404B52]" />
                    }
                    nextLabel={
                        <MdKeyboardArrowRight className="text-[#404B52]" />
                    }
                    breakLabel={"..."}
                  /*   pageCount={totalPageTransaction} */
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={1}
                  /*   onPageChange={handlePageClick} */
                    containerClassName={"flex gap-2"}
                    previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                    nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                    pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                    activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                    pageLinkClassName="w-full h-full flex justify-center items-center"
                    activeLinkClassName="w-full h-full flex justify-center items-center"
                    disabledLinkClassName={"text-gray-300 cursor-not-allowed"}
                   /*  forcePage={currentPageTransaction} */
                />
            </div>
        </div>
    );
};

export default Pagination;
