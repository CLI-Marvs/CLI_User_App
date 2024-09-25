import React, { useRef} from 'react'
import { FaEdit, FaTrash, FaTrashAlt } from 'react-icons/fa';
import AddSourceFundsModal from '../modals/AddSourceFundsModal';

const BuyersInformation = () => {

  const modalRef = useRef(null);

  const handleOpenModal = () => {
      if (modalRef.current) {
          modalRef.current.showModal();
      }
  };

  return (
    <div className="min-w-screen-xl px-[45px]">
      <div className="flex flex-col mt-[40px]">
        <div className="flex  justify-center items-center w-full h-[55px] text-[18px] bg-custom-grayFA text-custom-bluegreen font-semibold rounded-[10px]">
          Buyers's Information
        </div>
        <div className="flex flex-col w-full bg-custom-grayFA rounded-[10px] montserrat-medium mt-[11px] px-[24px] py-[41px]">
          <div className="flex w-full gap-x-[11px]">
            <div className="relative mb-[6px] w-full">
              <input
                type="text"
                id="fname"
                name="fname"
                placeholder=""
                className="input-floating-label w-[229px]  rounded-[5px]"
              /*  onChange={handlePersonalChange} */
              />
              <label
                htmlFor="fname"
                className="label-floating text-[12px] cursor-text"
              >
                First Name
              </label>
            </div>
            <div className="relative mb-[6px] w-full">
              <input
                type="text"
                id="lname"
                name="lname"
                placeholder=""
                className="input-floating-label w-auto rounded-[5px]"
              /* onChange={handlePersonalChange} */
              />
              <label
                htmlFor="lname"
                className="label-floating text-[12px] cursor-text"
              >
                Last Name
              </label>
            </div>
            <div className="relative mb-[6px] w-full">
              <input
                type="text"
                id="mname"
                name="mname"
                placeholder=""
                className="input-floating-label w-auto rounded-[5px]"
              /* onChange={handlePersonalChange} */
              />
              <label
                htmlFor="mname"
                className="label-floating text-[12px] cursor-text"
              >
                Middle Name
              </label>
            </div>
            <div className="relative mb-[6px] w-full">
              <input
                type="text"
                id="suffix"
                name="suffix"
                placeholder=""
                className="input-floating-label rounded-[5px]"
              /* onChange={handlePersonalChange} */
              />
              <label
                htmlFor="suffix"
                className="label-floating text-[12px] cursor-text"
              >
                Suffix
              </label>
            </div>
          </div>
          <div className="flex gap-x-[11px]">
            <div className="relative mb-[6px] w-full">
              <input
                type="email"
                id="buyer_email"
                name="email"
                placeholder=""
                className="input-floating-label w-auto rounded-[5px]"

              /* value={user ? user.email : ""} */
              />
              <label
                htmlFor="buyer_email"
                className="label-floating text-[12px] cursor-text"
              >
                Email
              </label>
            </div>
            <div className="relative mb-3 w-full">
              <input
                type="text"
                id="buyer_contact"
                name="contact_number"
                placeholder=""
                className="input-floating-label w-auto rounded-[5px]"
              /*  onChange={handlePersonalChange} */
              />
              <label
                htmlFor="buyer_contact"
                className="label-floating text-[12px] cursor-text"
              >
                Contact Number
              </label>
              <span className="text-[12px] montserrat-medium absolute left-1 cursor-default">
                Format: 09XXXXXXXXX
              </span>
            </div>
            <div className="relative mb-3 w-full">
              <input
                type="text"
                id="buyer_bdate"
                name="bdate"
                placeholder=""
                className="input-floating-label w-auto rounded-[5px]"
              /* onChange={handlePersonalChange} */
              />
              <label
                htmlFor="buyer_bdate"
                className="label-floating text-[12px] cursor-text"
              >
                Birthdate
              </label>
            </div>
            <div className="flex items-center justify-start mb-3 w-full bg-white  text-[12px] rounded-[5px] space-x-4">
              <p className="text-custom-bluegreen montserrat-medium  mx-2 cursor-default">
                Gender
              </p>
              <div className="flex gap-3">
                <span className="flex gap-1">
                  <input
                    type="radio"
                    name="gender"
                    /*  onChange={handlePersonalChange} */
                    className='accent-custom-bluegreen cursor-pointer'
                  />
                  <label className=" text-custom-bluegreen">
                    Male
                  </label>
                </span>
                <span className="flex gap-1">
                  <input
                    type="radio"
                    name="gender"
                    className='accent-custom-bluegreen cursor-pointer'
                  /*  onChange={handlePersonalChange} */
                  />
                  <label className=" text-custom-bluegreen ">
                    Female
                  </label>
                </span>
              </div>
            </div>
          </div>
          <div className="border-b mt-[27px] border-[#D9D9D9]"></div>
          <div className="mt-[17px]">
            <p className="text-[11px] text-custom-bluegreen font-semibold">
              Local Address:
            </p>
          </div>
          <div className="flex gap-x-[11px] mt-[7px]">
            <div className="relative w-full">
              <input
                type="text"
                id="country"
                name="country"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="country"
                className="label-floating text-[12px] cursor-pointer"
              >
                Country
              </label>
            </div>
            <div className="relative w-full">
              <input
                type="text"
                id="province"
                name="province"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="province"
                className="label-floating text-[12px] cursor-pointer"
              >
                Province
              </label>
            </div>
            <div className="relative mb-[6px] w-full">
              <input
                type="text"
                id="city"
                name="city"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="city"
                className="label-floating text-[12px] cursor-pointer"
              >
                City
              </label>
            </div>
            <div className="relative w-full">
              <input
                type="text"
                id="barangay"
                name="barangay"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="barangay"
                className="label-floating text-[12px] cursor-pointer"
              >
                Barangay
              </label>
            </div>
          </div>
          <div className="flex mb-[13px] gap-x-[11px]">
            <div className="relative w-full">
              <input
                type="text"
                id="zipcode"
                name="zipcode"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="zipcode"
                className="label-floating text-xs cursor-text"
              >
                Zipcode
              </label>
            </div>
            <div className="relative w-full">
              <input
                type="text"
                id="unit"
                name="unit_number"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="unit"
                className="label-floating text-xs cursor-text"
              >
                Unit Number
              </label>
            </div>
            <div className="relative w-full">
              <input
                type="text"
                id="bldg"
                name="building_name"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="bldg"
                className="label-floating text-xs cursor-text"
              >
                Building Name
              </label>
            </div>
            <div className="relative w-full">
              <input
                type="text"
                id="street"
                name="street_name"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="street"
                className="label-floating text-xs cursor-text"
              >
                Street Name
              </label>
            </div>
          </div>
          <div className="flex">
            <div className="relative w-full">
              <input
                type="text"
                id="foreign"
                name="foreign_address"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="foreign"
                className="label-floating text-xs cursor-text"
              >
                Foreign Address (Optional)
              </label>
            </div>
          </div>
          <div className="border-b mt-[25px] border-[#D9D9D9]"></div>
          <div className="flex gap-[27px] mb-[6px] mt-[19px]">
            <div className="relative  w-full">
              <input
                type="text"
                id="citizenship"
                name="citizenship"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="citizenship"
                className="label-floating text-xs cursor-pointer"
              >
                Citizenship
              </label>
            </div>
            <div className="relative w-full">
              <input
                type="text"
                id="region"
                name="region"
                placeholder=""
                /*  onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="region"
                className="label-floating text-xs cursor-pointer"
              >
                Region
              </label>
            </div>
          </div>
          <div className="flex gap-x-6">
            <div className="relative w-full">
              <input
                type="text"
                id="tin"
                name="tin"
                placeholder=""
                /* onChange={handlePersonalChange} */
                className="input-floating-label w-auto rounded-[5px]"
              />
              <label
                htmlFor="tin"
                className="label-floating text-xs cursor-text"
              >
                Philippine Tax Identification (TIN)
              </label>
            </div>
            <div className="flex items-center justify-start    mb-3 w-full bg-white h-12  rounded-[5px] space-x-10">
              <p className="text-custom-bluegreen ml-2 text-xs cursor-default">
                TIN Engage Business
              </p>
              <div className="flex gap-4">
                <span className="flex gap-1">
                  <input
                    type="radio"
                    name="buyer_tinEngage"
                    className='accent-custom-bluegreen  cursor-pointer'
                  />
                  <label className="text-xs  text-custom-bluegreen">
                    Yes
                  </label>
                </span>
                <span className="flex gap-1">
                  <input
                    type="radio"
                    name="buyer_tinEngage"
                    className='accent-custom-bluegreen cursor-pointer'
                  />
                  <label className="text-xs text-custom-bluegreen">
                    No
                  </label>
                </span>
              </div>
            </div>
          </div>
          <div className="border-b mt-[21px] mb-[19px] border-[#D9D9D9]"></div>
          <div className="flex items-center justify-start w-[462px] h-[40px] bg-white">
            <div className='w-[83px] h-full flex justify-center items-center'>
              <p className="text-custom-bluegreen montserrat-medium text-xs">Co - Buyer</p>
            </div>
            <div className="flex montserrat-medium text-xs p-[11px] gap-[19px]">
              <span className="flex gap-1">
                <input type="radio" name="buyer_cobuyer" className='accent-custom-bluegreen' />
                <label className="  text-custom-bluegreen">
                  None
                </label>
              </span>
              <span className="flex gap-1">
                <input type="radio" name="buyer_cobuyer" className='accent-custom-bluegreen' />
                <label className="  text-custom-bluegreen">
                  One
                </label>
              </span>
              <span className="flex gap-1">
                <input type="radio" name="buyer_cobuyer" className='accent-custom-bluegreen'/>
                <label className=" text-custom-bluegreen">
                  Two
                </label>
              </span>
              <span className="flex gap-1">
                <input type="radio" name="buyer_cobuyer" className='accent-custom-bluegreen' />
                <label className=" text-custom-bluegreen">
                  Three
                </label>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-start w-[487px] h-[40px] bg-white mt-[19px]">
            <div className='w-[83px] h-full flex justify-center items-center'>
              <p className="text-custom-bluegreen montserrat-medium text-xs">Civil Status</p>
            </div>
            <div className="flex montserrat-medium text-xs p-[11px] gap-[19px]">
              <span className="flex gap-1">
                <input type="radio" name="buyer_civilStatus" className='accent-custom-bluegreen'/>
                <label className="  text-custom-bluegreen">
                  Single
                </label>
              </span>
              <span className="flex gap-1">
                <input type="radio" name="buyer_civilStatus" className='accent-custom-bluegreen'/>
                <label className="  text-custom-bluegreen">
                  Married
                </label>
              </span>
              <span className="flex gap-1">
                <input type="radio" name="buyer_civilStatus" className='accent-custom-bluegreen'/>
                <label className=" text-custom-bluegreen">
                  Widowed
                </label>
              </span>
              <span className="flex gap-1">
                <input type="radio" name="buyer_civilStatus" className='accent-custom-bluegreen'/>
                <label className=" text-custom-bluegreen">
                  Legally Separated
                </label>
              </span>
            </div>
          </div>
        </div>
      </div>




      {/* ==========================    buyers spouse information ====================================== */}




      <div className="flex mt-[40px] h-[55px] justify-center items-center w-full bg-custom-grayFA text-custom-bluegreen font-semibold text-[18px] rounded-[10px]">
        Buyers's Spouse Information
      </div>
      <div className=" flex flex-col w-full px-[27px] py-[58px] bg-custom-grayFA montserrat-medium rounded-lg mt-[14px]">
        <div className="flex mb-[4px] gap-x-[11px]">
          <div className="relative w-full">
            <input
              type="text"
              id="spouse_fname"
              name="spouse_fname"
              placeholder=""
              /* onChange={handleSpouseChange} */
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_fname"
              className="label-floating text-xs"
            >
              First Name
            </label>
          </div>
          <div className="relative w-full">
            <input
              type="text"
              id="spouse_lname"
              name="spouse_lname"
              placeholder=""
              /* onChange={handleSpouseChange} */
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_lname"
              className="label-floating text-xs"
            >
              Last Name
            </label>
          </div>
          <div className="relative w-full">
            <input
              type="text"
              id="spouse_mname"
              name="spouse_mname"
              placeholder=""
              /* onChange={handleSpouseChange} */
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_mname"
              className="label-floating text-xs"
            >
              Middle Name
            </label>
          </div>
          <div className="relative  w-full">
            <input
              type="text"
              id="spouse_suffix"
              name="spouse_suffix"
              placeholder=""
              /* onChange={handleSpouseChange} */
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_suffix"
              className="label-floating text-xs"
            >
              Suffix
            </label>
          </div>
        </div>
        <div className="flex gap-x-[11px]">
          <div className="relative  w-full">
            <input
              type="email"
              id="spouse_email"
              name="spouse_email"
              /*  onChange={handleSpouseChange} */
              placeholder=""
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_email"
              className="label-floating text-xs"
            >
              Email
            </label>
          </div>
          <div className="relative  w-full">
            <input
              type="text"
              id="spouse_contact"
              name="spouse_contact"
              /* onChange={handleSpouseChange} */
              placeholder=""
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_contact"
              className="label-floating text-xs"
            >
              Contact Number
            </label>
            <span className="text-[11px] absolute left-1">
              Format: 09XXXXXXXXX
            </span>
          </div>
          <div className="relative mb-3 w-full">
            <input
              type="text"
              id="spouse_bdate"
              name="spouse_bdate"
              /* onChange={handleSpouseChange} */
              placeholder=""
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_bdate"
              className="label-floating text-xs"
            >
              Birthdate
            </label>
          </div>
          <div className="flex items-center justify-start mb-3 w-full bg-white h-12 text-xs rounded-[5px] space-x-6">
            <p className="text-custom-bluegreen ml-2  montserrat-medium">
              Gender
            </p>
            <div className="flex  gap-3">
              <span className="flex gap-1">
                <input
                  type="radio"
                  name="spouse_gender"
                  className='accent-custom-bluegreen'
                /*  onChange={handleSpouseChange} */
                />
                <label className="text-xs text-custom-bluegreen">
                  Male
                </label>
              </span>
              <span className="flex gap-1">
                <input
                  type="radio"
                  name="spouse_gender"
                  className='accent-custom-bluegreen'
                /* onChange={handleSpouseChange} */
                />
                <label className="text-xs text-custom-bluegreen">
                  Female
                </label>
              </span>
            </div>
          </div>
        </div>
        <div className="border-b mt-[27px] border-[#D9D9D9]"></div>
        <div className="flex mt-[32px] mb-[4px] gap-x-6">
          <div className="relative w-full">
            <input
              type="text"
              id="spouse_citizenship"
              name="spouse_citizenship"
              placeholder=""
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_citizenship"
              className="label-floating text-xs"
            >
              Citizenship
            </label>
          </div>
          <div className="relative  w-full">
            <input
              type="text"
              id="spouse_region"
              name="spouse_region"
              placeholder=""
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_region"
              className="label-floating text-xs"
            >
              Region
            </label>
          </div>
        </div>
        <div className="flex gap-x-6">
          <div className="relative w-full">
            <input
              type="text"
              id="spouse_tin"
              name="spouse_tin"
              placeholder=""
              className="input-floating-label w-auto rounded-[5px]"
            />
            <label
              htmlFor="spouse_tin"
              className="label-floating text-xs"
            >
              Philippine Tax Identification (TIN)
            </label>
          </div>
          <div className="flex items-center justify-start w-full bg-white h-12  rounded-lg space-x-10">
            <p className="text-custom-bluegreen ml-2 text-xs">
              TIN Engage Business
            </p>
            <div className="flex gap-6">
              <span className="flex gap-1">
                <input
                  type="radio"
                  name="spouse_tinEngage"
                  className='accent-custom-bluegreen'
                />
                <label className="text-xs text-custom-bluegreen">
                  Yes
                </label>
              </span>
              <span className="flex gap-1">
                <input
                  type="radio"
                  name="spouse_tinEngage"
                  className='accent-custom-bluegreen'
                />
                <label className="text-xs text-custom-bluegreen">
                  No
                </label>
              </span>
            </div>
          </div>

        </div>
      </div>
      <div className="flex flex-col mt-[40px]">
        <div className="flex  justify-center items-center w-full h-[55px] bg-custom-grayFA text-custom-bluegreen font-semibold text-[18px] rounded-[10px]">
          Source of Funds
        </div>
        <div className="flex flex-col w-full bg-custom-grayFA font-semibold rounded-lg mt-2 p-[30px]">
          <div className="flex gap-3">
            <select
              name="source"
              defaultValue="source 1"
              id="source"
              className="bg-white h-[50px] w-[194px] px-2 flex items-center border-none rounded-[5px] text-custom-bluegreen text-sm montserrat-regular"
            >
              <option value="source 1" selected>
                Select Source
              </option>
            </select>
            <button
              onClick={handleOpenModal}
              className="h-[50px] w-[64px] rounded-[10px] bg-transparent border border-custom-solidgreen montserrat-semibold text-custom-solidgreen"
            >
              Add
            </button>
          </div>
          <div className="w-[803px] bg-custom-tablebg p-[42px] mt-[15px]">
            <table className="table-fixed w-full bg-transparent">
              <thead>
                <tr className="h-9 custom-border text-sm text-custom-bluegreen montserrat-semibold">
                  <th className="w-[119px] text-left px-[15px]">Source</th>
                  <th className="w-[310px] text-left px-[15px]">Details</th>
                  <th className="w-[158px]">Monthly Income</th>
                  <th className="">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className="text-sm h-[74px] px-[59px] py-[15px] bg-white"
                >
                  <td className="w-[144px] px-[15px]  text-custom-bluegreen font-normal">
                    Employed
                  </td>
                  <td className="px-[15px] text-custom-bluegreen">
                    <div className="flex gap-1">
                      <span className="font-semibold">
                        region type
                      </span>
                      |
                      <span className="font-normal">
                        company name
                      </span>
                    </div>
                    <span className="font-normal">
                      job title
                    </span>
                  </td>
                  <td className="px-3 text-custom-bluegreen font-normal flex-col h-14">
                    <span className="flex justify-center items-center">
                      P80,000 - P99,999
                    </span>
                  </td>
                  <td className="px-3 text-custom-bluegreen font-normal flex h-14 justify-center items-center gap-4">
                    <span className="text-xl hover:text-blue-500">
                      <FaEdit />
                    </span>
                    |
                    <span className="text-xl hover:text-red-500">
                      <FaTrashAlt />
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex mt-[40px] justify-center items-center w-full h-[55px] text-[18px] bg-custom-grayFA text-custom-bluegreen font-semibold rounded-[10px]">
        Financing
      </div>
      <div className="flex flex-col w-full h-[225px] bg-custom-grayFA rounded-[10px] mt-[11px] p-[30px]">
        <div className='flex gap-[196px] text-sm'>
          {/* ==========================  column 1   ============================================*/}
          <div className='w-[167px] h-[165px] flex flex-col py-[15px] space-y-[10px]'>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                  name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen  cursor-default">
                  AUB
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  BDO
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  BOC
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  BPI / BPI MY BAHAY
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  CHINABACK
                </label>
              </span>
            </div>
          </div>
          {/* ==========================================================     column 2     ================================================*/}
          <div className='w-[167px] h-[165px] flex flex-col py-[15px] space-y-[10px]'>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  CHINA SAVINGS
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  MAYBANK
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  PNB
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  PSBANK
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  RCBC
                </label>
              </span>
            </div>
          </div>
          {/* ============================================================    column 3    =======================================*/}
          <div className='w-[234px] h-[165px] flex flex-col py-[15px] space-y-[10px]'>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                   name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  SECURITY BANK
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                  name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  STERLING BANK
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                  name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  UNION BANK
                </label>
              </span>
            </div>
            <div>
              <span className="flex gap-[10px]">
                <input
                  type="radio"
                  name="financing"
                  /*  onChange={handlePersonalChange} */
                  className='accent-custom-bluegreen cursor-pointer'
                />
                <label className=" text-custom-bluegreen cursor-default">
                  OTHERS
                </label>
                <label htmlFor="financingOthers" className='w-full border-b border-custom-bluegreen'>

                  <input id='financingOthers' name='financingOthers' type="text" className='pl-[3px] focus:outline-none bg-custom-grayFA' />
                </label>
              </span>
            </div>

          </div>
        </div>
      </div>
      <div>
        <AddSourceFundsModal modalRef={modalRef}/>
      </div>
    </div>
  );
}

export default BuyersInformation