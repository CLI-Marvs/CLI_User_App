import React from 'react'

const SummaryTable = ({ groupedTables }) => {
    let questionCounter = 1;

    return (
        <div>
            {groupedTables.map((group, index) => {
                const firstQuestion = group.questions[0];

                // Determine if this group should have an Average column
                const showAverage =
                    firstQuestion.options.length === 5 &&
                    (
                        firstQuestion.options.every(opt =>
                            ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'].includes(opt.value)
                        ) ||
                        firstQuestion.options.every(opt =>
                            ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'].includes(opt.value)
                        ) ||
                        firstQuestion.options.every(opt => !isNaN(opt.value))
                    );

                return (
                    <div key={index} className="mb-8">
                        <h2 className="text-[20px] montserrat-semibold mb-2">
                            {group.questions.length > 1
                                ? `Table question ${questionCounter} to ${questionCounter + group.questions.length - 1} summary`
                                : `Table question ${questionCounter} summary`}
                        </h2>

                        <table className="w-full border-2">
                            <thead>
                                <tr>
                                    <th className="border-2 px-2 py-1 text-center w-[200px]">Question</th>
                                    {firstQuestion.options.map(opt => (
                                        <th key={opt.id} className="border-2 px-2 py-1 text-center">{opt.value}</th>
                                    ))}
                                    {showAverage && <th className="border-2 px-2 py-1 text-center">Average</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {group.questions.map((q, idx) => {
                                    let totalScore = 0;
                                    let totalCount = 0;
                                    const totalOptions = q.options.length;

                                    // Only calculate average for standard questions
                                    if (showAverage) {
                                        q.options.forEach((opt, i) => {
                                            const weight = totalOptions - i;
                                            const count = opt.count || 0;
                                            totalScore += weight * count;
                                            totalCount += count;
                                        });
                                    }

                                    const avg = showAverage && totalCount > 0
                                        ? (totalScore / totalCount).toFixed(2)
                                        : null;

                                    const questionNumber = questionCounter + idx;

                                    return (
                                        <tr key={q.question_id}>
                                            <td className="border-2 px-2 py-1 text-center">Question {questionNumber}</td>
                                            {q.options.map(opt => (
                                                <td key={opt.id} className="border-2 px-2 py-1 text-center">{opt.count}</td>
                                            ))}
                                            {showAverage && <td className="border-2 px-2 py-1 text-center font-semibold">{avg}</td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Increment questionCounter after rendering the group */}
                        {(() => {
                            questionCounter += group.questions.length;
                            return null;
                        })()}
                    </div>
                );
            })}
        </div>
    );
};




export default SummaryTable