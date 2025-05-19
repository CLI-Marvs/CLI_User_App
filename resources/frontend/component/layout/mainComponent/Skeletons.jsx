import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const Skeletons = ({ height = 20, width = "100%" }) => {
    return <Skeleton height={height} width={width} />;
    };


export default Skeletons
