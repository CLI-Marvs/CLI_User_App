import React from 'react'

const FilterWrapper = ({showFiltersFunc, isShow}) => {
  return (
    <div className={`flex justify-end absolute bottom-10 right-0 left-0 bg-black h-[577px] w-full p-5 rounded-xl`}>
      <span  className="cursor-pointer text-white" onClick={showFiltersFunc}>close</span>
    </div>
  )
}

export default FilterWrapper
