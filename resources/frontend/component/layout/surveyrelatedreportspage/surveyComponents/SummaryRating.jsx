import React from 'react'

const SummaryRating = ({ ratingCounts }) => {
    return (
        <div>
            <p className='text-[20px] montserrat-semibold'>Initial rating summary</p>
            <div className='flex flex-col gap-[10px]'>
                {[5, 4, 3, 2, 1].map((rating, index) => {
                    const emojis = ['😃', '😊', '😐', '😒', '😠'];
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
        </div>
    )
}

export default SummaryRating