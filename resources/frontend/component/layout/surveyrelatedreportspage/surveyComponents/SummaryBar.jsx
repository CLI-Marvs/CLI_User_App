import React from 'react'
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

const data = [
    {
        name: 'Page A',
        uv: 40,
        
    },
    {
        name: 'Page B',
        uv: 30,
        
    },
    {
        name: 'Page C',
        uv: 20,
       
    },
    {
        name: 'Page D',
        uv: 27,
        
    },
    {
        name: 'Page E',
        uv: 18,
        
    },
    {
        name: 'Page F',
        uv: 23,
       
    },
    {
        name: 'Page G',
        uv: 34,
       
    },
];

const SummaryBar = ({ question }) => {

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
                <div className="max-w-[600px] w-full h-[340px]" >
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
                                        fill={index === sortedOptionsArray.length - 1 ? '#F46969' : '#429E1F'}
                                    />
                                ))}
                                <LabelList
                                    dataKey="value"
                                    content={({ x = 0, y = 0, value, width = 0 }) => (
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
                                    )}
                                />
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
                                            fontFamily='Montserrat'
                                        >
                                            {value}
                                        </text>
                                    )}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
            </div>
        </div>
    );
}

export default SummaryBar;
