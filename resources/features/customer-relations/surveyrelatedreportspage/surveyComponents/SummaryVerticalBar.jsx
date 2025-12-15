import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


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


    const CustomXAxisTick = ({ x, y, payload }) => {
        const words = payload.value.split(' ');
        const lines = [];
        let line = '';

        words.forEach((word) => {
            if ((line + word).length > 30) {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line += word + ' ';
            }
        });
        lines.push(line.trim());

        return (
            <g transform={`translate(${x}, ${y + 10})`}>
                <text textAnchor="middle" fontSize={12} fill="#333">
                    {lines.map((line, index) => (
                        <tspan key={index} x={0} dy={index === 0 ? 0 : 14}>
                            {line}
                        </tspan>
                    ))}
                </text>
            </g>
        );
    };

    const CustomBarLabel = ({ x, y, width, value }) => (
        <text
            x={x + width / 2}
            y={y - 6}
            fill="#333"
            fontSize={12}
            textAnchor="middle"
        >
            {value}
        </text>
    );


    return (
        <div>
            <div className='flex flex-col gap-[16px] pt-[18px] px-[16px]'>
                <div className='p-[10.9px] border-b-[0.5px] border-[#3A3A3A]'>
                    <p className='montserrat-medium text-[18px] font-[#3A3A3A]'>{question?.question}</p>
                </div>
                <div>
                    <p>Acknowledgements: <span className='font-bold'>{question?.total_responses}</span></p>
                </div>
                <div className=" w-full min-h-[360px] h-[250px]" >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            width={500}
                            height={chartHeight}
                            data={sortedOptionsArray}
                            margin={{
                                top: 16,
                                right: 20,
                                left: 20,
                                bottom: 80
                            }}
                            barSize={72}
                        >
                            <XAxis
                                dataKey="name"
                                tick={<CustomXAxisTick />}
                                interval={0}
                                padding={{ left: 40, right: 40 }}
                            />
                            <YAxis />
                            <CartesianGrid stroke="#ADC8F3" strokeDasharray="4 4" />
                            <Bar  label={{ position: 'top', fill: '#333', fontSize: 16}} dataKey="value" fill="#378017" background={{ fill: '#E2F2D7' }} radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default SummaryVerticalBar