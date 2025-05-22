import React from 'react'

const SummaryTable = ({ groupedTables }) => {
    return (
        <div>
            {groupedTables.map((group, index) => (
                <div key={index} className="mb-8">
                    <h2 className="text-[20px] montserrat-semibold mb-2">
                        {group.questions.length > 1
                            ? `Table question ${group.questions[0].question.charAt(0)} to ${group.questions[group.questions.length - 1].question.charAt(0)} summary`
                            : `Table question ${group.questions[0].question.charAt(0)} summary`}
                    </h2>
                    <table className="w-full  border-2">
                        <thead>
                            <tr>
                                <th className=" border-2 px-2 py-1 text-center"></th>
                                {group.questions[0].options.map(opt => (
                                    <th key={opt.id} className=" border px-2 py-1 text-center"> {opt.value}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {group.questions.map((q) => (
                                <tr key={q.question_id}>
                                    <td className="w-[150px] border-2 px-2 py-1 text-center">Question {q.question.charAt(0)}</td>
                                    {q.options.map(opt => (
                                        <td key={opt.id} className=" border-2 px-2 py-1 text-center">{opt.count}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    )
}

export default SummaryTable