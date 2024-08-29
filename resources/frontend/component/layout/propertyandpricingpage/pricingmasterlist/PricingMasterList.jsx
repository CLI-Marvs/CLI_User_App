import React, {useState,useEffect, useRef} from 'react'
import './togglebtn.css';
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DateLogo from '../../../../../../public/Images/Date_range.svg'
import AddPricingModal from './AddPricingModal';
const PricingMasterList = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [toggled, setToggled] = useState(false);

  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const toggleFilterBox = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const modalRef = useRef(null);

  const handleOpenModal = () => {
      if (modalRef.current) {
          modalRef.current.showModal();
      }
  };

    return (
      <div className='h-screen bg-custom-grayFA px-4'>
          <div className=''>
            <button onClick={handleOpenModal} className='montserrat-semibold text-sm px-2 gradient-btn w-[214px] h-[37px] rounded-[10px] text-white'>Add Property and Pricing</button>
          </div>
          <div className="relative flex justify-start gap-3 mt-3">
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
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
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
              <thead>
                <tr className='flex gap-4 items-center h-[49px] montserrat-semibold text-sm text-[#A5A5A5] bg-white rounded-[10px] mb-4 -mx-1 px-4'>
                  <th className='flex justify-start w-[100px] shrink-0 pl-1'>Status</th>
                  <th className='flex justify-start w-[150px] shrink-0 pl-1'>Property</th>
                  <th className='flex justify-start w-[200px] shrink-0 pl-1'>Price Settings</th>
                  <th className='flex justify-start w-[150px] shrink-0 pl-1'>Price Version</th>
                  <th className='flex justify-start w-[150px] shrink-0 pl-1'>Sold Per Version</th>
                  <th className='flex justify-start w-[100px] shrink-0 pl-1'>Promos</th>
                  <th className='flex justify-start w-[150px] shrink-0 pl-1'>Payment Schemes</th>
                </tr>
              </thead>
              <tbody>
                {/*                                                      DRAFT                                                                      */}
                <tr className='flex gap-4 mt-2 h-[144px] shadow-custom5 rounded-[10px] overflow-hidden px-4 bg-white text-custom-bluegreen text-sm'>
                  <td className='w-[100px] flex flex-col items-start justify-center gap-2'>
                    <div>
                      <p className='font-bold text-custom-gray81'>Draft</p>
                      <span>8/10/2024</span>
                    </div>
                    <div>
                      <p className='underline text-blue-500 cursor-pointer'>Edit</p>
                    </div>
                  </td>
                  <td className='w-[150px] flex items-center justify-start'>
                    <div>
                      <p className='pr-1'>38 Park Avenue, Tower 2</p>
                    </div>
                  </td>
                  <td className='w-[200px] flex items-center justify-start'>
                    <div>
                      <p className='space-x-1'>
                        <span>Base Price (Sq.M.)</span>
                        <span>6,500</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Reservation</span>
                        <span>50,000</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Transfer Charge</span>
                        <span>8%</span>
                      </p>
                      <p className='space-x-1'>
                        <span>VAT</span>
                        <span>12%</span>
                      </p>
                      <p className='space-x-1'>
                        <span>VATable Threashold</span>
                        <span>3,600,000</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Effective Balcony Base</span>
                        <span>50%</span>
                      </p>
                    </div>
                  </td>
                  <td className='w-[150px] flex items-center justify-start'>
                    
                  </td>
                  <td className='w-[150px] flex items-center justify-start'>
                   
                  </td>
                  <td className='w-[100px] flex items-center justify-start'>

                  </td>
                  <td className='w-[150px] flex items-center justify-start rounded-r-lg text-sm'>
                    <div>
                      <p>Spot Cash</p>
                      <p>Spot 12%</p>
                      <p>Spot 2% + 10%</p>
                      <p>Installment</p>
                      <p>12% Installment</p>
                    </div>
                  </td>
                </tr>
                {/*                                                   END                                                  */}
                {/*                                            ONGOING APPROVAL                                                */}
                <tr className='flex gap-4 mt-2 h-[144px] shadow-custom5 rounded-[10px] overflow-hidden px-4 bg-[#EBF0F6] text-custom-bluegreen text-sm'>
                  <td className='w-[100px] flex flex-col items-start justify-center gap-2'>
                    <div>
                      <p className='font-bold text-[#5B9BD5]'>On-going Approval</p>
                      <span>8/10/2024</span>
                    </div>
                    <div>
                      <p className='underline text-blue-500 cursor-pointer'>Cancel</p>
                    </div>
                  </td>
                  <td className='w-[150px] flex items-center justify-start'>
                    <div>
                      <p className='pr-1'>38 Park Avenue Parking, Tower 2</p>
                    </div>
                  </td>
                  <td className='w-[200px] flex items-center justify-start'>
                    <div>
                      <p className='space-x-1'>
                        <span>Base Price (Sq.M.)</span>
                        <span>6,500</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Reservation</span>
                        <span>50,000</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Transfer Charge</span>
                        <span>8%</span>
                      </p>
                      <p className='space-x-1'>
                        <span>VAT</span>
                        <span>12%</span>
                      </p>
                      <p className='space-x-1'>
                        <span>VATable Threashold</span>
                        <span>3,600,000</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Effective Balcony Base</span>
                        <span>50%</span>
                      </p>
                    </div>
                  </td>
                  <td className='w-[150px] flex items-center justify-start'>
                    <div>
                        <p className='space-x-1'>
                          <span>Version 1 -</span>
                          <span>0%</span>
                          <span>(Active)</span>
                        </p>
                        <p className='space-x-1'>
                          <span>Version 2 -</span>
                          <span>5%</span>
                        </p>
                        <p className='space-x-1'>
                          <span>Version 3 -</span>
                          <span>5%</span>
                        </p>
                        <p className='space-x-1'>
                          <span>Version 4 -</span>
                          <span>5%</span>
                        </p>
                      </div>
                  </td>
                  <td className='w-[150px] flex items-center justify-start'>
                    <div>
                        <p className='space-x-1'>
                          <span>Version 1 -</span>
                          <span>0</span>
                        </p>
                        <p className='space-x-1'>
                          <span>Version 2 -</span>
                          <span>0</span>
                        </p>
                        <p className='space-x-1'>
                          <span>Version 3 -</span>
                          <span>0</span>
                        </p>
                        <p className='space-x-1'>
                          <span>Version 4 -</span>
                          <span>0</span>
                        </p>
                      </div>
                  </td>
                  <td className='w-[100px] flex items-center justify-start'>

                  </td>
                  <td className='w-[150px] flex items-center justify-start rounded-r-lg text-sm'>
                    <div>
                      <p>Spot Cash</p>
                      <p>Spot 12%</p>
                      <p>Spot 2% + 10%</p>
                      <p>Installment</p>
                      <p>12% Installment</p>
                    </div>
                  </td>
                </tr>
                {/*                                                         END                                                     */}
                {/*                                            APPROVED LIVE                                               */}
                <tr className='flex gap-4 mt-2 h-[144px] shadow-custom5 rounded-[10px] overflow-hidden px-4 bg-[#F0F3EE] text-custom-bluegreen text-sm'>
                  <td className='w-[100px] flex flex-col items-start justify-center gap-2'>
                    <div>
                      <p className='font-bold text-custom-solidgreen'>Approved</p>
                      <span>6/19/2024</span>
                    </div>
                    <div className='flex gap-2'>
                      <div>
                        <p className={`${toggled ?'text-[#FF0000]':'text-custom-gray81'} font-semibold`}>Live</p>
                      </div>
                      <div>
                        <button
                          className={`toggle-btn ${toggled ? "toggled" : ""}`}
                          onClick={() => setToggled(!toggled)}
                        >
                          <div className='thumb'></div>
                        </button>
                      </div>
                     
                    </div>
                  </td>
                  <td className='w-[150px] flex items-center justify-start'>
                    <div>
                      <p className='pr-1'>38 Park Avenue Parking, Tower 2</p>
                    </div>
                  </td>
                  <td className='w-[200px] flex items-center justify-start'>
                    <div>
                      <p className='space-x-1'>
                        <span>Base Price (Sq.M.)</span>
                        <span>6,500</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Reservation</span>
                        <span>50,000</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Transfer Charge</span>
                        <span>8%</span>
                      </p>
                      <p className='space-x-1'>
                        <span>VAT</span>
                        <span>12%</span>
                      </p>
                      <p className='space-x-1'>
                        <span>VATable Threashold</span>
                        <span>3,600,000</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Effective Balcony Base</span>
                        <span>50%</span>
                      </p>
                    </div>
                  </td>
                  <td className='w-[150px] flex items-center justify-start'>
                    <div>
                          <p className='space-x-1'>
                            <span>Version 1 -</span>
                            <span>0%</span>
                            <span>(Active)</span>
                          </p>
                          <p className='space-x-1'>
                            <span>Version 2 -</span>
                            <span>5%</span>
                          </p>
                          <p className='space-x-1'>
                            <span>Version 3 -</span>
                            <span>5%</span>
                          </p>
                          <p className='space-x-1'>
                            <span>Version 4 -</span>
                            <span>5%</span>
                          </p>
                        </div>
                  </td>
                  <td className='w-[150px] flex items-center justify-start'>
                   <div>
                      <p className='space-x-1'>
                        <span>Version 1 -</span>
                        <span>0</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Version 2 -</span>
                        <span>0</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Version 3 -</span>
                        <span>0</span>
                      </p>
                      <p className='space-x-1'>
                        <span>Version 4 -</span>
                        <span>0</span>
                      </p>
                    </div>
                  </td>
                  <td className='w-[100px] flex items-center justify-start'>
                    <div>
                      <p>8.8</p>
                      <p>First 10</p>
                      <p>12.12</p>
                    </div>
                  </td>
                  <td className='w-[150px] flex items-center justify-start rounded-r-lg text-sm'>
                    <div>
                      <p>Spot Cash</p>
                      <p>Spot 12%</p>
                      <p>Spot 2% + 10%</p>
                      <p>Installment</p>
                      <p>12% Installment</p>
                    </div>
                  </td>
                </tr>
                {/*                                                         END                                                     */}
              </tbody>
            </table>
          </div>
          <div className='flex w-full justify-start mt-3'>
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
              <AddPricingModal modalRef={modalRef}/>
            </div>
      </div>
    )
  }
  
  export default PricingMasterList