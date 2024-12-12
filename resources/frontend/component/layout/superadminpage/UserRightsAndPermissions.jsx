import React, { useRef, useEffect } from 'react'
import AddDepartmentModal from './modals/DepartmentModal/AddDepartmentModal';
import AddUserModals from './modals/UserModal/AddUserModals';
import { useStateContext } from '../../../context/contextprovider';
import { PERMISSIONS } from '../../../constant/data/permissions';


const UserRightsAndPermissions = () => {

  //State
  const { departmentsWithPermissions, getDepartmentsWithPermissions } = useStateContext();
  const modalRef = useRef(null);
  const modalref2 = useRef(null);
  // 
  //Hookes
  useEffect(() => {
    console.log("departmentsWithPermissions", JSON.stringify(departmentsWithPermissions));
    console.log("This is fetching")
    getDepartmentsWithPermissions();
  }, []);

  //Event Handler
  /* 
   * Handle the click event of the add department button
   */
  const handleAddDepartmentModal = () => {
    if (modalRef.current) {
      modalRef.current.showModal();
    }
  };

  /**
   * Handle the click event of the add user button
   */
  const handleUserModal = () => {
    if (modalref2.current) {
      modalref2.current.showModal();
    }
  };

  return (
    <div className='h-screen max-w-full bg-custom-grayFA p-[20px]'>
      <div className='flex flex-col gap-[30px]'>
        <div className='bg-white rounded-[5px] p-[10px] w-full h-[51px]'>
          <div className='flex flex-row  gap-[37px] items-center'>
            <div className='montserrat-regular text-sm'>
              Specific Department
            </div>
            <button onClick={handleAddDepartmentModal} className=' h-[31px] w-[140px] py-[7px] px-[20px] gradient-btn5 text-white text-sm montserrat-medium rounded-[6px]'>
              Add
            </button>
          </div>
          <div className='py-2 w-[343pxpx]'>
            <label htmlFor="" className='text-red-500 text-sm'>Note: Department not visible in the select tag is already below.</label>
          </div>
        </div>

        <div>
          <table className="overflow-x-auto bg-custom-grayFA mb-2">
            <thead>
              <tr className="flex gap-[57px] items-center h-[63px] montserrat-semibold text-custom-gray81 bg-white rounded-t-[10px] p-[16px]">
                <th className="flex justify-center w-[200px] shrink-0">
                  Department
                </th>
                <th className="flex justify-center w-[200px] shrink-0 ">
                  Notifications
                </th>
                <th className="flex justify-center w-[200px] shrink-0 ">
                  Inquiry Management
                </th>
                <th className="flex justify-center w-[200px] shrink-0">
                  Transaction Management
                </th>
              </tr>
            </thead>
            <tbody>

              {/* Display the departments with permissions */}
              {departmentsWithPermissions && departmentsWithPermissions.map((item, index) => (
                <tr className='flex gap-[57px] mt-[6px] h-[64px] overflow-hidden px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm' key={index}>
                  <td className='w-[250px] flex flex-col items-start justify-center gap-2'>
                    <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                      <p className='montserrat-regular text-sm'>{item.name}</p>
                    </div>
                  </td>
                  {item?.features?.map((feature) => {
                    return (
                      <td className="w-[200px] flex flex-col items-start justify-center gap-2" key={feature.id}>
                        <div className="w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]">

                          {/* Use PERMISSIONS array to render checkboxes */}
                          {PERMISSIONS && PERMISSIONS.map((permission) => (
                            <div className="flex flex-col gap-[2.75px] items-center" key={permission.value}>
                              <p className="montserrat-semibold text-[10px] leading-[12.19px]">{permission.name}</p>
                              <input
                                type="checkbox"
                                className="h-[16px] w-[16px]"
                                checked={feature.pivot[permission.value]} 
                                disabled
                              />
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}


                </tr>
              ))}
              {/* End */}
            </tbody>
          </table>
          <div className="w-[1260px] flex justify-end items-center h-[63px] px-6 gap-2 bg-white rounded-b-lg">

          </div>
        </div>
        <div className='flex items-center gap-[37px] bg-white rounded-[5px] p-[10px] w-[288px] h-[51px]'>
          <div className='montserrat-regular text-sm'>
            Specific User
          </div>
          <button onClick={handleUserModal} className='h-[31px] w-[140px] py-[7px] px-[20px] gradient-btn5 text-white text-sm montserrat-medium rounded-[6px]'>
            Add
          </button>
        </div>
        <div>
          <table className="overflow-x-auto bg-custom-grayFA mb-2">
            <thead>
              <tr className="flex gap-[57px] items-center h-[63px] montserrat-semibold text-custom-gray81 bg-white rounded-t-[10px] p-[16px]">
                <th className="flex justify-center w-[200px] shrink-0">
                  Name
                </th>
                <th className="flex justify-center w-[200px] shrink-0">
                  Department
                </th>
                {/* <th className="flex justify-center w-[200px] shrink-0 ">
                  Role
                </th> */}
                <th className="flex justify-center w-[200px] shrink-0 ">
                  Notification
                </th>
                <th className="flex justify-center w-[200px] shrink-0">
                  Inquiry Management
                </th>
              </tr>
            </thead>
            <tbody>
              {/*                                                      DRAFT                                                                      */}
              <tr className='flex gap-[57px] mt-[6px] h-[64px] overflow-hidden px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm'>
                <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                    <p className='montserrat-regular text-custom-lightgreen text-sm'>Jannet Doe</p>
                  </div>
                </td>
                <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                    <p className='montserrat-regular text-sm'>CRS</p>
                  </div>
                </td>
                {/* <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[31px] flex items-center justify-center'>
                    <p className='montserrat-semibold text-custom-solidgreen text-sm'>Web Data Associate I</p>
                  </div>
                </td> */}
                <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]'>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>R</p>
                      <input type="checkbox" className='h-[16px] w-[16px] ' checked={true} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>W</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={true} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>E</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={false} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>D</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={false} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>S</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={true} disabled />
                    </div>
                  </div>
                </td>
                <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]'>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>R</p>
                      <input type="checkbox" className='h-[16px] w-[16px] ' checked={true} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>W</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={true} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>E</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={false} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>D</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={false} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>S</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={true} disabled />
                    </div>
                  </div>
                </td>
              </tr>
              <tr className='flex gap-[57px] mt-[6px] h-[64px] overflow-hidden px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm'>
                <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                    <p className='montserrat-regular text-custom-lightgreen text-sm'>Joe Doe</p>
                  </div>
                </td>
                <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                    <p className='montserrat-regular text-sm'>Treasury</p>
                  </div>
                </td>
                {/* <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[31px] flex items-center justify-center'>
                    <p className='montserrat-semibold text-custom-solidgreen text-sm'>Role I</p>
                  </div>
                </td> */}
                <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]'>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>R</p>
                      <input type="checkbox" className='h-[16px] w-[16px] ' checked={true} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>W</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={true} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>E</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={false} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>D</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={false} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>S</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={true} disabled />
                    </div>
                  </div>
                </td>
                <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                  <div className='w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]'>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>R</p>
                      <input type="checkbox" className='h-[16px] w-[16px] ' checked={true} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>W</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={true} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>E</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={false} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>D</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={false} disabled />
                    </div>
                    <div className='flex flex-col gap-[2.75px] items-center'>
                      <p className='montserrat-semibold text-[10px] leading-[12.19px]'>S</p>
                      <input type="checkbox" className='h-[16px] w-[16px]' checked={true} disabled />
                    </div>
                  </div>
                </td>

              </tr>
              {/*                                                         END                                                     */}
            </tbody>
          </table>
          <div className="w-[1260px] flex justify-end items-center h-[63px] px-6 gap-2 bg-white rounded-b-lg">

          </div>
        </div>
      </div>
      <div>
        <AddDepartmentModal modalRef={modalRef} />
      </div>
      <div>
        <AddUserModals modalRef={modalref2} />
      </div>
    </div>
  )
}

export default UserRightsAndPermissions