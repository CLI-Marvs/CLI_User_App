import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
const TableSkeleton = () => {
    return (
        <div>
            <div className="flex shrink-0 bg-gray-100 rounded-md mt-1">
                <Skeleton height={140} width="80%" />
            </div>
            <div className="flex shrink-0 bg-gray-100 rounded-md mt-2">
                <Skeleton height={140} width="80%" />
            </div>
            <div className="flex shrink-0 bg-gray-100 rounded-md mt-2">
                <Skeleton height={140} width="80%" />
            </div>
        </div>
    )
}

export default TableSkeleton
