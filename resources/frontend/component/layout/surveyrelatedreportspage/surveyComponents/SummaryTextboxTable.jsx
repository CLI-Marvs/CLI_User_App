import React, {useState} from 'react'
import ReactPaginate from 'react-paginate'
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'

const SummaryTextboxTable = ({ question }) => {


    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(0);

    const answers = question?.answers || [];
    const pageCount = Math.ceil(answers.length / itemsPerPage);

    const startIndex = currentPage * itemsPerPage;
    const currentAnswers = answers.slice(startIndex, startIndex + itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    return (
        <div>
            <div className='flex flex-col gap-[16px] pt-[18px] px-[16px]'>
                <div className='p-[10.9px] border-b-[0.5px] border-[#3A3A3A]'>
                    <p className='montserrat-medium text-[18px] font-[#3A3A3A]'>{question?.question}</p>
                </div>
                <div>
                    <p>Acknowledgements: <span className='font-bold'>{question?.total_responses}</span></p>
                </div>
                <div>
                    <table className='w-full'>
                        <thead>
                            <tr>
                                <th className="border-2 px-2 py-1 text-center shrink-0 w-[120px]">Ticket ID</th>
                                <th className="border-2 px-2 py-1 text-center shrink-0 ">Email</th>
                                <th className="border-2 px-2 py-1 text-center">Answer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAnswers.map((answer, index) => (
                                <tr key={index}>
                                    <td className="border-2 px-2 py-1 text-center">{answer.ticket_id}</td>
                                    <td className="border-2 px-2 py-1 text-center">{answer.email}</td>
                                    <td className="border-2 px-2 py-1 text-center">{answer.answer_value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    <div className='w-full flex justify-center pt-4 pb-6'>
                        <ReactPaginate
                            previousLabel={<MdKeyboardArrowLeft className="text-[#404B52]" />}
                            nextLabel={<MdKeyboardArrowRight className="text-[#404B52]" />}
                            breakLabel="..."
                            pageCount={pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={1}
                            onPageChange={handlePageClick}
                            forcePage={currentPage}
                            containerClassName="flex gap-2 mt-4"
                            previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                            nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                            pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                            activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-white rounded-[4px] text-[12px]"
                            pageLinkClassName="w-full h-full flex justify-center items-center"
                            activeLinkClassName="w-full h-full flex justify-center items-center"
                            disabledLinkClassName="text-gray-300 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SummaryTextboxTable