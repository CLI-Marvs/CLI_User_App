import React from 'react'

const SummaryRating = ({ ratingCounts }) => {
    const emojis = ['😃', '😊', '😐', '😒', '😠'];

    // Calculate average
    const totalScore = [5, 4, 3, 2, 1].reduce((acc, rating) => {
        const count = ratingCounts?.find(c => c.rating === rating)?.total ?? 0;
        return acc + rating * count;
    }, 0);

    const totalCount = ratingCounts?.reduce((acc, curr) => acc + curr.total, 0) ?? 0;

    const average = totalCount > 0 ? (totalScore / totalCount).toFixed(2) : "0.00";

    return (
        <div>
            <p className='text-[20px] montserrat-semibold'>Initial rating summary</p>
            <div className='flex flex-col gap-[10px]'>
                {[5, 4, 3, 2, 1].map((rating, index) => {
                    const count = ratingCounts?.find(c => c.rating === rating)?.total ?? 0;
                    return (
                        <div key={rating} className='flex gap-[10px] text-[24px]'>
                            <p>{emojis[index]}</p>
                            <p>-</p>
                            <p>{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Average Row */}
            <div className='flex flex-col mt-4 text-[18px] montserrat-semibold'>
                <div>
                    Total: <span className="text-[20px]">{totalCount}</span>
                </div>
                <div>
                    Average: <span className="text-[20px]">{average}</span>
                </div>
            </div>
        </div>
    );
};


export default SummaryRating