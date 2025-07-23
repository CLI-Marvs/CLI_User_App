import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    LabelList,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
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



const SummaryLine = ({ question }) => {

    const chartData = question?.options?.map(option => ({
        name: option.value,
        value: option.count
    }));

    const CustomLabel = (props) => {
        const { x, y, value } = props;
        return (
            <foreignObject x={x - 15} y={y - 35} width={30} height={24}>
                <div className="bg-white border border-gray-300 rounded-xl px-1 py-0.5 text-[12px] text-center">
                    {value}
                </div>
            </foreignObject>
        );
    };

    return (
        <div>
            <div className='flex flex-col gap-[16px] pt-[18px] px-[16px]'>
                <div className='p-[10.9px] border-b-[0.5px] border-[#3A3A3A]'>
                    <p className='montserrat-medium text-[18px] text-[#3A3A3A]'>{question?.question}</p>
                </div>
                <div>
                    <p>Acknowledgements: <span className='font-bold'>{question?.total_responses}</span></p>
                </div>
                <div className=" w-full h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 40, right: 40, left: 0, bottom: 20 }}>
                            <CartesianGrid stroke="#ADC8F3" strokeDasharray="0" />
                            <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
                            <YAxis allowDecimals={false} />
                            <Line type="linear" dataKey="value" stroke="#429E1F" strokeWidth={2} dot={{ r: 4 }}>
                                <LabelList content={<CustomLabel />} />
                            </Line>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default SummaryLine