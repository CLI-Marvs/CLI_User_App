import React from 'react'
import { Outlet } from 'react-router-dom'
import SalesSidebar from '../../layout/mainComponent/sidebars/SalesSidebar'

const SalesManagementLayout = () => {
  return (
    <div className="flex bg-white relative h-full">
      <div className="fixed h-full z-50">
        <SalesSidebar/>
      </div>
      <div className="relative flex-1 ml-[230px] z-10">
        <Outlet />
      </div>
    </div>
  )
}

export default SalesManagementLayout