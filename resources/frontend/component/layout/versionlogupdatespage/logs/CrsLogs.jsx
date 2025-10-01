import React from 'react'
import VersionLogUpdates from '../VersionLogUpdates'
import Sept_30_25 from './Sept_30_25';
import Jan_27_25 from './Jan_27_25';
import Dec_18_24 from './Dec_18_24';
import Dec_2_24 from './Dec_2_24';


const CrsLogs = () => {

    const items = [
        { id: 4, content: <Sept_30_25 /> },
        { id: 3, content: <Jan_27_25 /> },
        { id: 2, content: <Dec_18_24 /> },
        { id: 1, content: <Dec_2_24 /> },
    ];

   

    return (
        <VersionLogUpdates items={items} />
    )
}

export default CrsLogs