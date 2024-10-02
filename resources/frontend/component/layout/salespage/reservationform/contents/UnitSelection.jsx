import React, { useState,useRef,useEffect } from 'react'
import ProjectDetails from '../ProjectDetails';
import PropertyCard from '../components/PropertyCard'
import ProjectDescription from '../ProjectDescription';



const UnitSelection = () => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectProperty, setSelectProperty] = useState(false);
  const [selectUnit, setSelectUnit] = useState(false);
  const filterBoxRef = useRef(null);


    const toggleFilterBox = () => {
      setIsFilterVisible((prev) => !prev);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
        setIsFilterVisible(false);
    }
};
  const handleClickOutside = (event) => {
    if (
        filterBoxRef.current &&
        !filterBoxRef.current.contains(event.target)
    ) {
        setIsFilterVisible(false);
    }
};


  useEffect(() => {
    if (isFilterVisible) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
    } else {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
    };
}, [isFilterVisible]);
  return (
    <> {/* when the property card is selected*/}
      {selectProperty ? selectUnit ? (
        
        <div className='w-full -mx-[60px]'>
            <ProjectDescription/>
        </div>

      ) : (
        
        <div className='w-full -mx-[60px]'>
            <ProjectDetails/>
        </div>

      )
       : (

        <div className='flex flex-col'>
          <div className='flex justify-center mb-[20px] relative'>
            <div className="relative w-[604px] h-[59px] shadow-custom5 rounded-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4 absolute left-3 top-6 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                type="text"
                readOnly={true}
                /* onClick={toggleFilterBox} */
                className="h-[59px] w-[604px] rounded-[10px] pl-9 pr-6 text-sm"
                placeholder="Search"
              />
              <svg
                onClick={toggleFilterBox}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-[30px] absolute right-4 top-4 text-custom-bluegreen hover:bg-gray-200 cursor-pointer"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                />
              </svg>
            </div>
            {isFilterVisible && (
                            <div
                                ref={filterBoxRef}
                                className="absolute left-1/2 transform -translate-x-1/2 mt-[60px] p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[604px]"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                           Property Name
                                        </label>
                                        <input
                                            type="text"
                                            /* value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            } */
                                            className="w-full  border-b-1 outline-none"
                                        />
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Property Type
                                        </label>
                                        <input
                                            type="text"
                                            /* value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            } */
                                            className="w-full  border-b-1 outline-none"
                                        />
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Price Range
                                        </label>
                                        <input
                                            type="text"
                                            /* value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            } */
                                            className="w-full  border-b-1 outline-none"
                                        />
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            /* value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            } */
                                            className="w-full  border-b-1 outline-none"
                                        />
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            className="h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm"
                                            /* onClick={handleSearch} */
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
            </div>
          <div className='grid grid-cols-4 w-[1090px] px-[25px] py-[26px] gap-[33px]'>
            <PropertyCard />
            <PropertyCard />
            <PropertyCard />
            <PropertyCard />
            <PropertyCard />
            <PropertyCard />
            <PropertyCard />
          </div>
        </div>
      )}

    </>


  )
}

export default UnitSelection