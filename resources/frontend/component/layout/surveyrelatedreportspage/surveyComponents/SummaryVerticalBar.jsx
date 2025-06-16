import React from 'react'
import { BarChart, Bar, ResponsiveContainer } from 'recharts';


const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];


const SummaryVerticalBar = ({ question }) => {

    const optionsArray = question?.options
        ? Object.entries(question.options)
            .map(([key, value]) => ({
                id: value.id,
                name: value.value,
                value: value.count,
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
                <div className="max-w-[600px] w-full" style={{ height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart width={150} height={40} data={sortedOptionsArray}>
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    )
}

export default SummaryVerticalBar