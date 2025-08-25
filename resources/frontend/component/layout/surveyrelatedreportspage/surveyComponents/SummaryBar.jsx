import { useState } from 'react';
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    ResponsiveContainer,
    LabelList,
} from 'recharts';


const SummaryBar = ({ question }) => {

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const usersPerPage = 5;

    const pageCount = Math.ceil((selectedUsers?.length || 0) / usersPerPage);

    const offset = currentPage * usersPerPage;
    const currentPageData = selectedUsers
        ? selectedUsers.slice(offset, offset + usersPerPage)
        : [];

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const optionsArray = question?.options
        ? Object.entries(question.options)
            .map(([key, value]) => ({
                id: value.id,
                name: value.value,
                value: value.count,
                question_id: question.question_id,
            }))
            .sort((a, b) => b.value - a.value)
        : [];

    const barHeight = 16;
    const gapHeight = 43;
    const extraPadding = 40;
    const chartHeight = optionsArray.length * (barHeight + gapHeight) + extraPadding;
    const sortedOptionsArray = [...optionsArray].sort((a, b) => a.id - b.id);

    return (
        <div>
            <div className='flex flex-col gap-[16px] pt-[18px] px-[16px]'>
                <div className='p-[10.9px] border-b-[0.5px] border-[#3A3A3A]'>
                    <p className='montserrat-medium text-[18px] font-[#3A3A3A]'>{question?.question}</p>
                </div>
                <div>
                    <p>Acknowledgements: <span className='font-bold'>{question?.total_responses}</span></p>
                </div>
                <div className="w-full flex gap-[24px]">
                    {/* CHART */}
                    <div className="max-w-[600px] w-full h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={sortedOptionsArray}
                                margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
                                barCategoryGap={gapHeight}
                            >
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" hide />
                                <Bar
                                    dataKey="value"
                                    barSize={barHeight}
                                    radius={[0, 4, 4, 0]}
                                    fill="#429E1F" // fallback
                                >
                                    {sortedOptionsArray.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === sortedOptionsArray.length - 1 ? "#F46969" : "#429E1F"}
                                        />
                                    ))}

                                    {/* VALUE + BUTTON */}
                                    <LabelList
                                        dataKey="value"
                                        content={({ x = 0, y = 0, value, width = 0, index }) => {
                                            const isLast = index === sortedOptionsArray.length - 1;
                                            const barData = sortedOptionsArray[index];

                                            return (
                                                <>
                                                    {/* number value */}
                                                    <text
                                                        x={Number(x) + Number(width) + 8}
                                                        y={Number(y) + 10}
                                                        fill="#333"
                                                        fontSize={12}
                                                        fontWeight="bold"
                                                        textAnchor="start"
                                                        dominantBaseline="middle"
                                                    >
                                                        {value}
                                                    </text>

                                                    {/* View button */}
                                                    {isLast && question.very_dissatisfied_users?.length > 0 && (
                                                        <foreignObject
                                                            x={Number(x) + Number(width) + 30}
                                                            y={y - 5}
                                                            width={80}
                                                            height={30}
                                                        >
                                                            <button
                                                                className="text-[#429E1F] underline"
                                                                onClick={() => setSelectedUsers(question.very_dissatisfied_users)}
                                                            >
                                                                View
                                                            </button>
                                                        </foreignObject>
                                                    )}
                                                </>
                                            );
                                        }}
                                    />

                                    {/* NAME LABEL */}
                                    <LabelList
                                        dataKey="name"
                                        content={({ x = 0, y = 0, value }) => (
                                            <text
                                                x={x}
                                                y={y - 14}
                                                fill="#333"
                                                textAnchor="start"
                                                dominantBaseline="middle"
                                                fontSize={14}
                                                fontFamily="Montserrat"
                                            >
                                                {value}
                                            </text>
                                        )}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* TABLE (show only when a bar is clicked) */}
                    {selectedUsers && selectedUsers.length > 0 && (
                        <div className="flex flex-col gap-[15px]">
                            {/* Header with close button */}
                            <div className="flex justify-between items-center">
                                <p className="font-bold">
                                    {selectedUsers.length} Very Dissatisfied Users
                                </p>
                                <button
                                    onClick={() => setSelectedUsers(null)}
                                    className="text-red-500 hover:text-red-700 font-semibold"
                                >
                                    Close
                                </button>
                            </div>

                            {/* TABLE */}
                            <table className="border-collapse border border-gray-400">
                                <thead>
                                    <tr>
                                        <th className="border px-2 py-1 text-center">Date</th>
                                        <th className="border px-2 py-1 text-center">Email</th>
                                        <th className="border px-2 py-1 text-center">Ticket ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPageData.map((user, idx) => (
                                        <tr key={idx}>
                                            <td className="border px-2 py-1">
                                                {user.timestamp ? user.timestamp.split(" ")[0] : "N/A"}
                                            </td>
                                            <td className="border px-2 py-1">{user.email}</td>
                                            <td className="border px-2 py-1">{user.ticket_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* PAGINATION */}
                            <div className="flex justify-end">
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
                    )}

                </div>

            </div>
        </div>
    );
}

export default SummaryBar;
