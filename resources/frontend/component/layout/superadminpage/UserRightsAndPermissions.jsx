import React, { useRef, useEffect } from 'react'
import AddDepartmentModal from './modals/DepartmentModal/AddDepartmentModal';
import AddUserModals from './modals/UserModal/AddUserModals';
import { useStateContext } from '../../../context/contextprovider';
import { PERMISSIONS } from '../../../constant/data/permissions';
import { HiPencil } from "react-icons/hi";
import { MdDelete } from "react-icons/md";

const UserRightsAndPermissions = () => {

  //State
  const { departmentsWithPermissions, getDepartmentsWithPermissions, getEmployeesWithPermissions,
    employeesWithPermissions, features } = useStateContext();
  const modalRef = useRef(null);
  const modalref2 = useRef(null);
  // 
  //Hookes
  useEffect(() => {
    getDepartmentsWithPermissions();
    getEmployeesWithPermissions();
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
  const handleAddUserModal = () => {
    if (modalref2.current) {
      modalref2.current.showModal();
    }
  };

  /**
   * Handle to delete department permission
   */
  const handleDeleteDepartmentPermission = (department) => {
    console.log("id", department);
    // try {
    //   const response = apiService.post("departments-assign-feature-permissions", {
    //     department_id: id,
    //     features: [],
    //   });
    //   if (response.statusCode === 200) {
    //     showToast("Data deleted successfully!", "Data deleted successfully!");
    //     getAllEmployeeDepartment();
    //   }
    // } catch (error) {
    //   console.log("error", error);
    // }
  };


  return (
    <div className='h-screen max-w-full bg-custom-grayFA p-[20px]'>
      {/* Specific Department */}
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
                {/* Display all features */}
                {features && features.map((feature, index) => (
                  <th
                    className="flex justify-center w-[200px] shrink-0 "
                    key={index}
                  >
                    {feature.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departmentsWithPermissions && departmentsWithPermissions.length > 0 ? (
                departmentsWithPermissions.map((department, index) => (
                  <div className='flex items-center gap-x-4'>
                    <tr
                      className="flex gap-[57px] mt-[6px] h-[64px] overflow-hidden px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm"
                      key={index}
                    >
                      <td className="w-[200px] flex flex-col items-start justify-center gap-2">
                        <div className="w-full h-[40px] flex items-center justify-center bg-white rounded-[5px]">
                          <p className="montserrat-regular text-sm text-center">{department.name}</p>
                        </div>
                      </td>

                      {/* Iterate over the features (columns) */}
                      {features.map((feature, featureIndex) => {
                        // Check if the department has this feature
                        const departmentFeature = department.features.find(
                          (f) => f.id === feature.id
                        );

                        return (
                          <td
                            className="w-[200px] flex flex-col items-start justify-center gap-2"
                            key={featureIndex}
                          >
                            <div className="w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]">
                              {departmentFeature ? (
                                PERMISSIONS.map((permission) => {
                                  // Access the permission status from the department's feature pivot
                                  const permissionValue = departmentFeature.pivot[permission.value];
                                  return (
                                    <div
                                      className="flex flex-col gap-[2.75px] items-center"
                                      key={permission.value}
                                    >
                                      <p className="montserrat-semibold text-[10px] leading-[12.19px]">
                                        {permission.name}
                                      </p>
                                      <input
                                        type="checkbox"
                                        className="h-[16px] w-[16px]"
                                        checked={permissionValue}
                                        disabled
                                      />
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-center text-custom-gray">No Permissions</p>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <div className='flex gap-x-3'>
                      <button
                        className="gradient-btn5 p-[1px] w-[80px] h-[31px] rounded-[10px]"
                      >
                        <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm gap-x-2">
                          <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                            Edit
                          </p>
                          <span>
                            <HiPencil className='w-5 h-5 text-custom-bluegreen' />
                          </span>
                        </div>
                      </button>
                      <button onClick={() => handleDeleteDepartmentPermission(department)}>
                        <MdDelete className='w-6 h-6 text-red-500' />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={features.length + 1 || 1}
                    className="text-center py-[16px] text-custom-bluegreen text-sm"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="w-[1260px] flex justify-end items-center h-[63px] px-6 gap-2 bg-white rounded-b-lg">

          </div>
        </div>

        {/* Specific User */}
        <div className='flex items-center gap-[37px] bg-white rounded-[5px] p-[10px] w-[288px] h-[51px]'>
          <div className='montserrat-regular text-sm'>
            Specific User
          </div>
          <button onClick={handleAddUserModal} className='h-[31px] w-[140px] py-[7px] px-[20px] gradient-btn5 text-white text-sm montserrat-medium rounded-[6px]'>
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

                {/* Feature */}
                {features && features.map((feature, index) => (
                  <th
                    className="flex justify-center w-[200px] shrink-0 "
                    key={index}
                  >
                    {feature.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeesWithPermissions && employeesWithPermissions.map((item, index) => {
                return (
                  <tr className='flex gap-[57px] mt-[6px] h-[64px] overflow-hidden px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm' key={index}>
                    <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                      <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                        <p className='montserrat-regular text-custom-lightgreen text-sm'>
                          {item?.firstname} {item?.lastname}
                        </p>
                      </div>
                    </td>
                    <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                      <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                        <p className='montserrat-regular text-sm'>{item?.department}</p>
                      </div>
                    </td>
                    {/* {item?.features?.map((feature) => {
                      return (
                        <td className="w-[200px] flex flex-col items-start justify-center gap-2" key={feature.id}>
                          <div className="w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]">

                          
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
                    })} */}
                    {/* Iterate over the features (columns) */}
                    {features.map((feature, featureIndex) => {
                      // Check if the department has this feature
                      const departmentFeature = item.features.find(
                        (f) => f.id === feature.id
                      );

                      return (
                        <td
                          className="w-[200px] flex flex-col items-start justify-center gap-2"
                          key={featureIndex}
                        >
                          <div className="w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]">
                            {departmentFeature ? (
                              PERMISSIONS.map((permission) => {
                                // Access the permission status from the department's feature pivot
                                const permissionValue = departmentFeature.pivot[permission.value];
                                return (
                                  <div
                                    className="flex flex-col gap-[2.75px] items-center"
                                    key={permission.value}
                                  >
                                    <p className="montserrat-semibold text-[10px] leading-[12.19px]">
                                      {permission.name}
                                    </p>
                                    <input
                                      type="checkbox"
                                      className="h-[16px] w-[16px]"
                                      checked={permissionValue}
                                      disabled
                                    />
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-center text-custom-gray">No Permissions</p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )
              })}

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