import React from 'react'

const SummaryTextboxTable = ({ question }) => {



    console.log(question);

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
                    <table>
                        <thead>
                            <tr>
                                <th className="border-2 px-2 py-1 text-center">Ticket ID</th>
                                <th className="border-2 px-2 py-1 text-center">Email</th>
                                <th className="border-2 px-2 py-1 text-center">Answer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {question?.answers?.map((answer, index) => (
                                <tr key={index}>
                                    <td className="border-2 px-2 py-1 text-center">{answer.ticket_id}</td>
                                    <td className="border-2 px-2 py-1 text-center">{answer.email}</td>
                                    <td className="border-2 px-2 py-1 text-center">{answer.answer_value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                   </div>
                   
               </div>
           </div>
  )
}

export default SummaryTextboxTable