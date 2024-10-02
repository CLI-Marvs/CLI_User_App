import React from 'react'
import ProjectBackground from './components/ProjectBackground'
import GoogleMapApi from './components/GoogleMapApi'
import UnitDetails from './components/UnitDetails'

const ProjectDetails = () => {
    return (
        <div className="w-auto relative -mx-[60px]">
            <div className='absolute inset-0'>
                <ProjectBackground/>
            </div>3
            <div className='relative'>
                <div>
                    <GoogleMapApi/>
                </div>
                <div>
                    <UnitDetails/>
                </div>
            </div>
        </div>
    )
}

export default ProjectDetails