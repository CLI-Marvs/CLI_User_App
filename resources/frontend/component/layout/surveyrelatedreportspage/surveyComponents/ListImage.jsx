import React from 'react'
import AskCli from '../../../../../../public/Images/AskCLI_BGFAQs.webp'
import AskCliLogo from '../../../../../../public/Images/AskCli_Logo3.png'

const ListImage = () => {
    return (
        <div className='w-full h-full overflow-hidden rounded-[10px]'>
            <div className='relative'>
                <img src={AskCli} alt="AskCLI" className="w-full h-full object-cover object-top" />
                <img src={AskCliLogo} alt="AskCLI Logo"
                    className="absolute w-[160px] h-[80px] top-[85px] left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    )
}

export default ListImage