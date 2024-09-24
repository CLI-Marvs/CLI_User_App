import React from 'react'
import ProjectDesc from './components/ProjectDesc'

const ProjectDescription = () => {
    return (
        <div>
            <div>
                <ProjectDesc/>
            </div>
            <div className="px-12">
                <div className="flex gap-3 justify-start items-center py-5">
                    <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA montserrat-semibold flex w-[148px] pl-3 py-1 text-sm">
                            Include Parking?
                        </span>
                        <input
                            name="propertyName"
                            type="text"
                            className="w-[160px] px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                </div>
                <div>
                    <button className='gradient-btn5 p-[1px] rounded-[10px] w-[205px] h-[37px] hover:shadow-custom4'>
                        <div className='flex justify-center items-center bg-white w-full h-full rounded-[9px]'>
                            <div className=' montserrat-medium text-sm  bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent'>
                                Change Parking Selection
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProjectDescription