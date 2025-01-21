import React, { useState, useRef, useEffect } from 'react'
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DateLogo from '../../../../../../public/Images/Date_range.svg'
import AddPriceVersionModal from './AddPriceVersionModal';
import {priceVersionService} from '@/component/servicesApi/apiCalls/propertyPricing/priceVersion/priceVersionService';
const PriceVersioning = () => {

  const [startDate, setStartDate] = useState(new Date());
  const [toggled, setToggled] = useState(false);
  const [priceVersions, setPriceVersions] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const toggleFilterBox = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const modalRef = useRef(null);

  //Hooks
  useEffect(() => {
    fetchPricerVersions();
  }, []);

  //Event Handler
  const fetchPricerVersions = async () => {
    try {
      const response = await priceVersionService.getPriceVersions();
      console.log("response 31", response);
      if (response.status === 200) {
        setPriceVersions(response.data.price_versions);
        
      }
    } catch (error) {
      console.log("Error", error);
    }
  };
  //Handle open the Add Price Version modal
  const handleOpenModal = () => {
      if (modalRef.current) {
          modalRef.current.showModal();
      }
  };

  return (
    <div className='h-screen max-w-[1800px] bg-custom-grayFA px-4'>
      <div className=''>
        <button onClick={handleOpenModal} className='montserrat-semibold text-sm px-2 gradient-btn w-[158px] h-[37px] rounded-[10px] text-white'>Add Price Version</button>
      </div>
      <div className="relative flex justify-start gap-3 mt-[20px]">
        <div className="relative w-[582px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4 absolute left-3 top-3 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            className="h-10 w-full rounded-lg pl-9 pr-6 text-sm"
            placeholder="Search"
          />
          <svg
            onClick={toggleFilterBox}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 absolute right-3 top-3 text-custom-bluegreen hover:size-[17px]"
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
            className="absolute left-0 mt-12 p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[582px]"
          >
            <div className="flex flex-col gap-2">
              <div className='flex'>
                <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Property</label>
                <input type="text" className='w-full  border-b-1 outline-none' />
              </div>
              <div className='flex'>
                <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Payment Scheme</label>
                <input type="text" className='w-full  border-b-1 outline-none' />
              </div>
              <div className='flex'>
                <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Promo</label>
                <input type="text" className='w-full  border-b-1 outline-none' />
              </div>
              <div className='flex gap-3'>
                <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'>Date</label>
                <div className="relative">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    className=" border-b-1 outline-none w-[176px]"
                    calendarClassName="custom-calendar"
                  />

                  <img src={DateLogo} alt="date" className='absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6' />

                </div>
                <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Status</label>
                <select className='w-full border-b-1 outline-none'>
                  <option value="">Select Status</option>
                  <option value="draft">Draft</option>
                  <option value="ongoing">On-going approval</option>
                  <option value="approvenotlive">Approved not Live</option>
                  <option value="approveandlive">Approve and Live</option>
                </select>
              </div>
              <div className='mt-3 flex justify-end'>
                <button className='h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm'>Search</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='mt-3 overflow-y-hidden'>
      <table className='overflow-x-auto bg-custom-grayFA mb-2 mx-1'>
              <thead className='h-[103px]'>
                <tr className='flex gap-[30px] items-center h-[83px] montserrat-semibold text-sm text-[#A5A5A5] bg-white rounded-[10px] p-[16px]'>
                  <th className='flex justify-start w-[148px] shrink-0 pl-1'>Property</th>
                  <th className='flex justify-start w-[150px] shrink-0 pl-1'>Version</th>
                  <th className='w-[100px] shrink-0 pl-1'>
                    <div className='flex justify-start text-left break-words'>Percent Increase</div>
                  </th>
                  <th className=' w-[100px] shrink-0 pl-1'>
                    <div className='flex justify-start text-left'>No. of allowed buyers</div>
                    </th>
                  <th className='flex justify-start w-[100px] shrink-0 pl-1'>Expiry Date</th>
                </tr>
              </thead>
              <tbody className='flex flex-col gap-[20px]'>
                {/*                                                      example 1                                                                     */}
                <div className='border-b border-custom-lightestgreen pb-[20px]'>
                  <tr className='flex  gap-[10px]  overflow-hidden bg-white p-1'>
                    <td className='flex flex-col gap-[10px] justify-center w-[169px] p-[20px] rounded-[10px] shadow-custom5'>
                      <p className='montserrat-semibold text-sm leading-[17px]'>38 Park Avenue Parking, Tower 2</p>
                      <p className='underline text-blue-500 cursor-pointer text-sm'>Edit</p>
                    </td>
                    <td className='rounded-[10px] shadow-custom5 text-sm w-[572px] overflow-hidden'>
                      <table className='w-full border-separate'>
                        <tr className='flex items-center bg-white gap-[30px] '>
                          <td className=' w-[150px] p-[15px]'>
                            Version 1
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            0%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                        <tr className='flex  bg-custom-grayFA gap-[30px]'>
                          <td className='w-[150px] p-[15px]'>
                            Version 2
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            5%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                        <tr className='flex bg-custom-white gap-[30px]'>
                          <td className='w-[150px] p-[15px]'>
                            Version 3
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            5%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                        <tr className='flex bg-custom-grayFA gap-[30px]'>
                          <td className='w-[150px] p-[15px]'>
                            Version 4
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            5%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </div>
                {/*                                                   END                                                  */}
                 {/*                                                      example 2                                                                    */}
                 <div className='border-b border-custom-lightestgreen pb-[20px]'>
                  <tr className='flex  gap-[10px]  overflow-hidden bg-white p-1'>
                    <td className='flex flex-col gap-[10px] justify-center w-[169px] p-[20px] rounded-[10px] shadow-custom5'>
                      <p className='montserrat-semibold text-sm leading-[17px]'>38 Park Avenue, Tower 2</p>
                      <p className='underline text-blue-500 cursor-pointer text-sm'>Edit</p>
                    </td>
                    <td className='rounded-[10px] shadow-custom5 text-sm w-[572px] overflow-hidden'>
                      <table className='w-full border-separate'>
                        <tr className='flex items-center bg-white gap-[30px]'>
                          <td className=' w-[150px] p-[15px]'>
                            Version 1
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            0%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                        <tr className='flex  bg-custom-grayFA gap-[30px]'>
                          <td className='w-[150px] p-[15px]'>
                            Version 2
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            5%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                        <tr className='flex bg-custom-white gap-[30px]'>
                          <td className='w-[150px] p-[15px]'>
                            Version 3
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            5%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                        <tr className='flex bg-custom-grayFA gap-[30px]'>
                          <td className='w-[150px] p-[15px]'>
                            Version 4
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            5%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </div>
                {/*                                                   END                                                  */}
                 {/*                                                      example 2                                                                    */}
                 <div className='border-b border-custom-lightestgreen pb-[20px]'>
                  <tr className='flex  gap-[10px]  overflow-hidden bg-white p-1'>
                    <td className='flex flex-col gap-[10px] justify-center w-[169px] p-[20px] rounded-[10px] shadow-custom5'>
                      <p className='montserrat-semibold text-sm leading-[17px]'>38 Park Avenue, Tower 2</p>
                      <p className='underline text-blue-500 cursor-pointer text-sm'>Edit</p>
                    </td>
                    <td className='rounded-[10px] shadow-custom5 text-sm w-[572px] overflow-hidden'>
                      <table className='w-full border-separate'>
                        <tr className='flex items-center bg-white gap-[30px]'>
                          <td className=' w-[150px] p-[15px]'>
                            Version 1
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            0%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                        <tr className='flex items-center bg-custom-grayFA gap-[30px]'>
                          <td className='flex flex-col gap-[10px] w-[150px] p-[15px]'>
                            <p>Version 2</p>
                            <p className='font-bold text-[#E06464] flex items-center'>
                              Active 
                              <span className='ml-1.5 w-[10px] h-[10px] bg-[#E06464] rounded-full inline-block'></span>
                            </p>
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            5%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                        <tr className='flex bg-custom-white gap-[30px]'>
                          <td className='w-[150px] p-[15px]'>
                            Version 3
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            5%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                        <tr className='flex bg-custom-grayFA gap-[30px]'>
                          <td className='w-[150px] p-[15px]'>
                            Version 4
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            5%
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            100
                          </td>
                          <td className='w-[100px] p-[15px]'>
                            NA
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </div>
                {/*                                                   END                                                  */}
              </tbody>
            </table>
      </div>
      <div className='flex w-full justify-start mt-[20px] pb-[150px] bg-custom-grayFA'>
                <ReactPaginate
                previousLabel={<MdKeyboardArrowLeft className='text-[#404B52]'/>}
                nextLabel={<MdKeyboardArrowRight className='text-[#404B52]'/>}
                breakLabel={"..."}
                pageCount={2}
                marginPagesDisplayed={2}
                pageRangeDisplayed={1}
                /* onPageChange={handlePageClick} */
                containerClassName={"flex gap-2"}
                previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                pageClassName=" border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                pageLinkClassName="w-full h-full flex justify-center items-center"
                activeLinkClassName="w-full h-full flex justify-center items-center"
                disabledLinkClassName={
                    "text-gray-300 cursor-not-allowed"
                }
                /* forcePage={currentPage} */
            />
            </div>
            <div>
              <AddPriceVersionModal modalRef={modalRef}/>
            </div>
    </div>
  )
}

export default PriceVersioning