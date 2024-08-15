import React from 'react'
import { Outlet } from 'react-router-dom'
import InquirySidebar from '../../layout/mainComponent/sidebars/InquirySidebar'

const InquiryManagementLayout = () => {
  return (
    <>
        <div className="flex bg-white relative h-screen">
        <div className="fixed h-full">
            <InquirySidebar/>
        </div>
        <div className="flex-1 overflow-y-auto ml-52">
            <Outlet />
        </div>
        </div>
    </>
  )
}

export default InquiryManagementLayout