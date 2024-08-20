import React, { PureComponent } from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList, Label } from 'recharts';

const data = [
    { name: "01", Resolved: 30, Unresolved: 10 },
    { name: "02", Resolved: 30, Unresolved: 10 },
    { name: "03", Resolved: 30, Unresolved: 10 },
    { name: "04", Resolved: 30, Unresolved: 10 },
    { name: "05", Resolved: 30, Unresolved: 10 },
    { name: "06", Resolved: 30, Unresolved: 10 },
    { name: "07", Resolved: 30, Unresolved: 10 },
    { name: "08", Resolved: 30, Unresolved: 10 },
    { name: "09", Resolved: 30, Unresolved: 10 },
    { name: "10", Resolved: 30, Unresolved: 10 },
    { name: "11", Resolved: 30, Unresolved: 10 },
    { name: "12", Resolved: 30, Unresolved: 10 },
    { name: "13", Resolved: 30, Unresolved: 10 },
    
];

const data2 = [
    { name: "Group A", value: 40 },
    { name: "Group B", value: 60 },

];

const data3 = [
    { name: '38 Park Ave.', value1: 44, value2: 123 },
    { name: 'Casa Mira', value1: 136, value2: 220 },
    { name: 'Mivessa', value1: 275, value2: 44 },
  
    
    


];

const barHeight = 20; // Height per bar, adjust as needed
const chartHeight = data3.length * (barHeight + 60)

const COLORS = ['#5B9BD5', '#348017'];


const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 shadow-lg rounded">
                <p>{`${payload[0].name}`}</p>
                <p>{`Value 1: ${payload[0].value}`}</p>
                <p>{`Value 2: ${payload[1].value}`}</p>
            </div>
        );
    }

    return null;
};



const ReportPage = () => {
    return (
        <div className='h-screen bg-custombg p-4 '>
            <div className='bg-white p-4 rounded-xl '>
                <div className='w-72 mb-2'>
                    <p className='text-lg montserrat-bold'>Resolved vs. Unresolved Chart</p>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-28 -mr-3 pl-3 py-1">Month</span>
                        <div className="relative w-full">
                            <select name="concern" className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0">
                                <option value="">Select</option>
                                <option value="january">January</option>
                                <option value="February">February</option>
                                <option value="March">March</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-custom-gray81" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
                <div className='overflow-x-auto'>
                    <BarChart
                        width={1000}
                        height={180}
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: -25,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis ticks={[10, 20, 30]} />
                        <Tooltip />
                        <Bar dataKey="Resolved" fill="#348017" barSize={12} radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Unresolved" fill="#D6E4D1" barSize={12} radius={[3, 3, 0, 0]} />
                    </BarChart>
                </div>
                <div className='flex gap-6'>
                    <div className='flex items-center px-3 py-2 gap-3'>
                        <span className='flex items-center text-custom-solidgreen text-2xl'>●</span>
                        <span className='text-custom-gray12'>Resolved</span>
                    </div>
                    <div className='flex items-center px-3 py-2 gap-3'>
                        <span className='flex items-center text-custom-lightestgreen text-2xl'>●</span>
                        <span className='text-custom-gray12'>Unresolved</span>
                    </div>
                </div>
            </div>
            <div className='flex gap-3 mt-4 bg-custombg '>
                <div className='w-[430px]  pb-7 max-h-[400px] flex-shrink-0 flex-grow-0 bg-white rounded-lg'>
                    <p className='p-4 text-base montserrat-bold'>Inquiries per category</p>
                    <div className='border border-t-1'></div>
                    <div className='mt-4 pl-4 pr-28'>
                        <div className="flex items-center border rounded-md overflow-hidden w-full">
                            <span className="text-custom-gray81 bg-custombg flex w-34 pl-2 py-1">For the month of</span>
                            <input name='contact' type="text" className="w-36 pl-2 focus:outline-none" placeholder="" />
                        </div>
                    </div>
                    <div className='flex'>
                        <div>
                            <PieChart width={230} height={260}>
                                <Pie
                                    data={data2}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={0}
                                    paddingAngle={1}
                                    strokeWidth={5}
                                    cornerRadius={0}
                                    fill="#8884d8"
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={450}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </div>
                        <div className='w-full flex justify-start items-center'>
                            <div className='flex flex-col'>
                                <div className='flex gap-10 '>
                                    <div className='flex gap-1 items-center'>
                                        <span className='text-xl mb-1 text-custom-lightblue'>●</span>
                                        <span className='text-sm text-gray-500'>Transactions</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <span className='text-gray-700 font-semibold text-lg'>40</span>
                                        <span className='text-custom-gray81'>%</span>
                                    </div>
                                </div>
                                <div className='flex gap-10 justify-between'>
                                    <div className='flex gap-1 items-center'>
                                        <span className='text-xl mb-1 text-custom-solidgreen'>●</span>
                                        <span className='text-sm text-gray-500'>Property</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <span className='text-gray-700 font-semibold text-lg'>60</span>
                                        <span className='text-custom-gray81'>%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=' h-auto flex-grow-0 flex-shrink-0 bg-white rounded-lg'>
                    <p className='p-4 text-base montserrat-bold'>Inquiries per property</p>
                    <div className='border border-t-1'></div>
                    <div className='mt-4 pl-4 pr-48'>
                        <div className="flex items-center border rounded-md overflow-hidden w-full">
                            <span className="text-custom-gray81 bg-custombg flex w-34 pl-2 py-1">For the month of</span>
                            <input name='contact' type="text" className="w-36 pl-2 focus:outline-none" placeholder="" />
                        </div>
                    </div>
                    <div>
                        <BarChart
                            width={400}
                            height={chartHeight}
                            data={data3}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >

                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" hide tick={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="value1"
                                fill="#348017"

                                barSize={15}
                                radius={[0, 4, 4, 0]} // Rounded top corners
                            >
                                <LabelList dataKey="value1" position="right" fill="#4a5568" />
                                <LabelList
                                    dataKey="name"
                                    position="top"
                                    content={({ x, y, value }) => (
                                        <text
                                            x={x}
                                            y={y - 13}
                                            fill="#00000"
                                            textAnchor="start"
                                            dominantBaseline="central"
                                        >
                                            {value}
                                        </text>
                                    )}
                                />
                            </Bar>
                            <Bar
                                dataKey="value2"
                                fill="#D3F1D8"
                                barSize={15}
                                radius={[0, 4, 4, 0]} // Rounded top corners
                            >
                                <LabelList dataKey="value2" position="right" fill="#4a5568" />
                            </Bar>
                        </BarChart>
                        <div className='flex justify-end'>
                            <div className='flex items-center px-3 py-2 gap-3'>
                                <span className='flex items-center text-custom-lightestgreen text-2xl'>●</span>
                                <span className='text-custom-gray12'>Unresolved</span>
                            </div>
                            <div className='flex items-center px-3 py-2 gap-3'>
                                <span className='flex items-center text-custom-solidgreen text-2xl'>●</span>
                                <span className='text-custom-gray12'>Resolved</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>


        </div>

    )
}

export default ReportPage