import React, { useRef, useEffect, useState } from 'react'
import AddDepartmentModal from './modals/DepartmentModal/AddDepartmentModal';
import AddUserModals from './modals/UserModal/AddUserModals';
import EditDepartmentModal from './modals/DepartmentModal/EditDepartmentModal';
import EditEmployeeModal from './modals/UserModal/EditUserModal';
import { useStateContext } from '../../../context/contextprovider';
import { PERMISSIONS } from '../../../constant/data/permissions';
import { HiPencil } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import apiService from "../../servicesApi/apiService";

const UserRightsAndPermissions = () => {

  //State
  const { departmentsWithPermissions, getDepartmentsWithPermissions, getEmployeesWithPermissions,
    employeesWithPermissions, features } = useStateContext();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const modalRef = useRef(null);
  const modalref2 = useRef(null);
  const editDepartmentModalRef = useRef(null);
  const editEmployeeModalRef = useRef(null);
  //Hooks 
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
   * Handle the click event of the edit department button
   */
  const handleEditDepartmentModal = (department) => {
    setSelectedDepartment(department);
    if (editDepartmentModalRef.current) {
      editDepartmentModalRef.current.showModal();
    }
  };

  /**
    * Handle the click event of the edit employee button
    */
  const handleEditEmployeeModal = (employee) => {
    console.log('item', employee)
    setSelectedEmployee(employee);
    if (editEmployeeModalRef.current) {
      editEmployeeModalRef.current.showModal();
    }
  };
  /**
   * Handle to delete department permission
   */
  const handleUpdateDepartmentPermissionStatus = (department) => {
    const payload = {
      department_id: department?.id,
      status: "InActive",
    };
    try {
      const response = apiService.patch("update-departments-status", payload);
      if (response.statusCode === 200) {
        showToast("Data deleted successfully!", "Data deleted successfully!");
        getDepartmentsWithPermissions();
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleUpdateEmployeePermissionStatus = (employee) => {
    const payload = {
      employee_id: employee?.id,
      status: "InActive",
    };
    try {
      const response = apiService.patch("update-employee-status", payload);
      if (response.statusCode === 200) {
        showToast("Data deleted successfully!", "Data deleted successfully!");
        getEmployeesWithPermissions();
      }
    } catch (error) {
      console.log("error", error);
    }
  }

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
                <table className="w-full">
                  <tbody>
                    {departmentsWithPermissions.map((department, index) => (
                      <tr
                        key={index}
                        className="flex items-center gap-x-4 mb-2"
                      >
                        <td
                          className="flex gap-[57px] mt-[6px] h-[64px] overflow-hidden px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm"
                        >
                          <div className="w-[200px] flex flex-col items-start justify-center gap-2">
                            <div className="w-full h-[40px] flex items-center justify-center bg-white rounded-[5px]">
                              <p className="montserrat-regular text-sm text-center">{department.name}</p>
                            </div>
                          </div>

                          {features.map((feature, featureIndex) => {
                            // Check if the department has this feature
                            const departmentFeature = department.features.find(
                              (f) => f.id === feature.id
                            );

                            return (
                              <div
                                key={featureIndex}
                                className="w-[200px] flex flex-col items-start justify-center gap-2"
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
                              </div>
                            );
                          })}
                        </td>

                        <td className="flex gap-x-3">
                          <button
                            className="gradient-btn5 p-[1px] w-[80px] h-[31px] rounded-[10px]"
                            onClick={() => handleEditDepartmentModal(department)}
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
                          <button onClick={() => handleUpdateDepartmentPermissionStatus(department)}>
                            <MdDelete className='w-6 h-6 text-red-500' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td
                        colSpan={features.length + 1 || 1}
                        className="text-center py-[16px] text-custom-bluegreen text-sm"
                      >
                        No data found
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </tbody>
          </table>
        </div>

        {/* Specific User */}
        <div className='flex items-center gap-[37px] bg-white rounded-[5px] p-[10px] w-full h-[51px]'>
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
              {employeesWithPermissions && employeesWithPermissions.map((employee, index) => {
                return (
                  <div className='flex items-center gap-x-4' key={index}>
                    <tr className='flex gap-[57px] mt-[6px] h-[64px] overflow-hidden px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm' key={index}>
                      <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                        <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                          <p className='montserrat-regular text-custom-lightgreen text-sm'>
                            {employee?.firstname} {employee?.lastname}
                          </p>
                        </div>
                      </td>
                      <td className='w-[200px] flex flex-col items-start justify-center gap-2'>
                        <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                          <p className='montserrat-regular text-sm'>{employee?.department}</p>
                        </div>
                      </td>

                      {/* Iterate over the features (columns) */}
                      {features.map((feature, featureIndex) => {
                        // Check if the department has this feature
                        const departmentFeature = employee.features.find(
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
                        onClick={() => handleEditEmployeeModal(employee)}
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
                      <button onClick={() => handleUpdateEmployeePermissionStatus(employee)}>
                        <MdDelete className='w-6 h-6 text-red-500' />
                      </button>
                    </div>
                  </div>
                )
              })}

            </tbody>
          </table>
          {/* <div className="w-[1260px] flex justify-end items-center h-[63px] px-6 gap-2  rounded-b-lg">

          </div> */}
        </div>
      </div>
      <div>
        <AddDepartmentModal modalRef={modalRef} />
      </div>
      <div>
        <AddUserModals modalRef={modalref2} />
      </div>
      <div>
        <EditDepartmentModal
          editDepartmentModalRef={editDepartmentModalRef}
          selectedDepartment={selectedDepartment}
        />
      </div>
      <div>
        <EditEmployeeModal
          editEmployeeModalRef={editEmployeeModalRef}
          selectedEmployee={selectedEmployee} />
      </div>
    </div>
  )
}

export default UserRightsAndPermissions