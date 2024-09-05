import React from 'react'
import { Outlet } from 'react-router-dom'
import PropertyAndPricingSidebar from '../../layout/mainComponent/sidebars/PropertyAndPricingSidebar'

const PropertyAndPricingLayout = () => {
  return (
    <>
      <div className="flex bg-white relative h-screen">
        <div className="fixed h-full">
         <PropertyAndPricingSidebar/>
        </div>
        <div className="flex-1 overflow-y-auto ml-[230px] bg-custom-grayFA">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default PropertyAndPricingLayout