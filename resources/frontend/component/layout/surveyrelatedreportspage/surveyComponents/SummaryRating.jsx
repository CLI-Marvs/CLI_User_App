import React from 'react'

const SummaryRating = ({ratingCounts}) => {
    return (
        <div>
            <p className='text-[24px]'>Summary rating</p>
            <div className='flex flex-col gap-[10px]'>
                <div className='flex gap-[10px] text-[24px]'>
                    <p>😃</p>
                    <p>-</p>
                    <p>{ratingCounts?.find(c => c.rating === 5)?.total}</p>
                </div>
                <div className='flex gap-[10px] text-[24px]'>
                    <p>😊</p>
                    <p>-</p>
                    <p>{ratingCounts?.find(c => c.rating === 4)?.total}</p>
                </div>
                <div className='flex gap-[10px] text-[24px]'>
                    <p>😐</p>
                    <p>-</p>
                    <p>{ratingCounts?.find(c => c.rating === 3)?.total}</p>
                </div>
                <div className='flex gap-[10px] text-[24px]'>
                    <p>😒</p>
                    <p>-</p>
                    <p>{ratingCounts?.find(c => c.rating === 2)?.total}</p>
                </div>
                <div className='flex gap-[10px] text-[24px]'>
                    <p>😠</p>
                    <p>-</p>
                    <p>{ratingCounts?.find(c => c.rating === 1)?.total}</p>
                </div>
            </div>
        </div>
    )
}

export default SummaryRating