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
import { showToast } from "../../../util/toastUtil"
import Alert from "../mainComponent/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const UserRightsAndPermissions = () => {

  //States
  const { departmentsWithPermissions, getDepartmentsWithPermissions, getEmployeesWithPermissions,
    employeesWithPermissions, features, getAllEmployeeDepartment, isUserAccessDataFetching } = useStateContext();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [alertType, setAlertType] = useState("");
  const departmentModalRef = useRef(null);
  const userModalRef = useRef(null);
  const editDepartmentModalRef = useRef(null);
  const editEmployeeModalRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isEmployeeLoadingState, setIsEmployeeLoadingState] = useState({});
  const [isDepartmentLoadingState, setIsDepartmentLoadingState] = useState({});


  //Hooks 
  useEffect(() => {
    getDepartmentsWithPermissions();
    getEmployeesWithPermissions();
  }, []);

  //Event Handler
  //Handle the click event of the add department button
  const handleAddDepartmentModal = () => {
    if (departmentModalRef.current) {
      departmentModalRef.current.showModal();
    }
  };

  //Handle the click event of the add user button
  const handleAddUserModal = () => {
    if (userModalRef.current) {
      userModalRef.current.showModal();
    }
  };

  //Handle the click event of the edit department button
  const handleEditDepartmentModal = (department) => {
    setSelectedDepartment(department);
    if (editDepartmentModalRef.current) {
      editDepartmentModalRef.current.showModal();
    }
  };

  //Handle the click event of the edit employee button
  const handleEditEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    if (editEmployeeModalRef.current) {
      editEmployeeModalRef.current.showModal();
    }
  };

  //To Update 'Active or InActive" department permission
  const updateDepartmentPermissionStatus = async (department) => {
    const payload = {
      department_id: department?.id,
      status: "InActive",
    };
    try {
      setIsDepartmentLoadingState((prev) => ({ ...prev, [department.id]: true }));
      const response = await apiService.patch("update-departments-status", payload);
      if (response.data?.statusCode === 200) {
        showToast("Data deleted successfully!", "success");
        getDepartmentsWithPermissions();
        getAllEmployeeDepartment();
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsDepartmentLoadingState((prev) => ({ ...prev, [department.id]: false }));
    }
  };

  //To Update 'Active or InActive" employee permission
  const updateEmployeePermissionStatus = async (employee) => {
    const payload = {
      employee_id: employee?.id,
      status: "InActive",
    };
    try {
      setIsEmployeeLoadingState((prev) => ({ ...prev, [employee.id]: true }));
      const response = await apiService.patch("update-employee-status", payload);
      if (response.data?.statusCode === 200) {
        showToast("Data deleted successfully!", "success");
        getEmployeesWithPermissions();
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsEmployeeLoadingState((prev) => ({ ...prev, [employee.id]: false }));
    }
  }

  //Handle click event to show the department alert 
  const handleShowUpdateDepartmentAlert = (department, alertType) => {
    setAlertType(alertType); //department type
    setSelectedDepartment(department);
    setShowAlert(true);
  };

  //Handle click to cancel the department alert
  const handleCancel = () => {
    setShowAlert(false);
    setSelectedDepartment(null);
    setSelectedEmployee(null);
  };

  //Handle click to confirm the department/employee alert
  const handleConfirm = () => {
    if (alertType === "department") {
      if (selectedDepartment) {
        updateDepartmentPermissionStatus(selectedDepartment); //Call the function
      }
    } else if (alertType === "employee") {
      if (selectedEmployee) {
        updateEmployeePermissionStatus(selectedEmployee); //Call the function
      }
    }
    setShowAlert(false);
  };

  //Handle click event to show the department/employee alert  
  const handleShowUpdateEmployeeAlert = (employee, alertType) => {
    setAlertType(alertType); //employee type
    setSelectedEmployee(employee);
    setShowAlert(true);
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
        </div>
        <div>
          <table className="overflow-x-auto bg-custom-grayFA mb-2">
            <thead>
              <tr className="flex gap-[57px] items-center h-[63px] montserrat-semibold text-custom-gray81 bg-white rounded-t-[10px] p-[16px]">
                <th className="flex justify-center w-[200px] shrink-0">
                  Department
                </th>
                {/* Display all features */}
                {isUserAccessDataFetching ? (
                  <>
                    <th className="flex  justify-start w-[200px] shrink-0 bg-gray-100 rounded-md">
                      <Skeleton height={40} width="80%" />
                    </th>
                    <th className="flex justify-center w-[200px] shrink-0 bg-gray-100 rounded-md">
                      <Skeleton height={40} width="80%" />
                    </th>
                    <th className="flex justify-center w-[200px] shrink-0 bg-gray-100 rounded-md">
                      <Skeleton height={40} width="80%" />
                    </th>
                  </>
                ) : features && features.length > 0 ? features.map((feature, index) => (
                  <th
                    className="flex justify-center w-[200px] shrink-0 "
                    key={index}
                  >
                    {feature.name}
                  </th>
                )) : null}
              </tr>
            </thead>
            <tbody>
              {isUserAccessDataFetching ? (
                <tr className="w-full flex gap-x-2">
                  <th className="flex justify-start w-[200px] shrink-0 bg-gray-100 rounded-md">
                    <Skeleton height={40} width="80%" />
                  </th>
                  <th className="flex justify-center w-[200px] shrink-0 bg-gray-100 rounded-md">
                    <Skeleton height={40} width="80%" />
                  </th>
                  <th className="flex justify-center w-[200px] shrink-0 bg-gray-100 rounded-md">
                    <Skeleton height={40} width="80%" />
                  </th>
                </tr>
              ) : departmentsWithPermissions && departmentsWithPermissions.length > 0 ? (
                departmentsWithPermissions.map((department, index) => (
                  <tr
                    key={index}
                    className="flex items-center gap-x-4 mb-2"
                  >
                    <td className="flex gap-[57px] mt-[6px] h-[64px] overflow-hidden px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm">
                      <div className="w-[200px] flex flex-col items-start justify-center gap-2">
                        <div className="w-full h-[40px] flex items-center justify-center bg-white rounded-[5px]">
                          <p className="montserrat-regular text-sm text-center">
                            {department.name}
                          </p>
                        </div>
                      </div>
                      {features.map((feature, featureIndex) => {
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
                      <button
                        onClick={() => handleShowUpdateDepartmentAlert(department, 'department')}
                        disabled={isDepartmentLoadingState[department.id]}
                        className={`${isDepartmentLoadingState[department.id]
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                        type='submit'
                      >
                        {isDepartmentLoadingState[department.id] ? (
                          <CircularProgress className="spinnerSize" />
                        ) : (
                          <MdDelete className='w-6 h-6 text-red-500' />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={features.length + 1 || 1}
                    className="text-center py-[16px] text-custom-bluegreen"
                  >
                    No data found
                  </td>
                </tr>
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
                {isUserAccessDataFetching ? (
                  <>
                    <th className="flex  justify-start w-[200px] shrink-0 bg-gray-100 rounded-md">
                      <Skeleton height={40} width="80%" />
                    </th>
                    <th className="flex justify-center w-[200px] shrink-0 bg-gray-100 rounded-md">
                      <Skeleton height={40} width="80%" />
                    </th>
                    <th className="flex justify-center w-[200px] shrink-0 bg-gray-100 rounded-md">
                      <Skeleton height={40} width="80%" />
                    </th>
                  </>
                ) :
                  features && features.map((feature, index) => (
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
              {isUserAccessDataFetching ? (
                <tr>
                  <td className='w-full mt-1'>
                    <div className="flex shrink-0 bg-gray-100 rounded-md mt-1">
                      <Skeleton height={40} width="80%" />
                    </div>
                    <div className="flex shrink-0 bg-gray-100 rounded-md mt-2">
                      <Skeleton height={40} width="80%" />
                    </div>
                    <div className="flex shrink-0 bg-gray-100 rounded-md mt-2">
                      <Skeleton height={40} width="80%" />
                    </div>
                  </td>
                </tr>
              ) : employeesWithPermissions && employeesWithPermissions.length > 0 ? (
                employeesWithPermissions.map((employee, index) => (
                  <tr key={index} className='flex items-center gap-x-4'>
                    <td className='flex gap-[57px] mt-[6px] h-[64px] overflow-hidden px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm'>
                      {/* Employee Name */}
                      <div className='w-[200px] flex flex-col items-start justify-center gap-2'>
                        <div className='w-full h-[31px] flex items-center justify-center bg-white rounded-[5px]'>
                          <p className='montserrat-regular text-custom-lightgreen text-sm'>
                            {employee?.firstname} {employee?.lastname}
                          </p>
                        </div>
                      </div>

                      {/* Department */}
                      <div className='w-[200px] flex flex-col items-start justify-center gap-2'>
                        <div className='w-full h-[35px] flex items-center justify-center bg-white rounded-[5px] py-1'>
                          <p className='montserrat-regular text-sm text-center'>{employee?.department}</p>
                        </div>
                      </div>

                      {/* Features */}
                      {features.map((feature, featureIndex) => {
                        const departmentFeature = employee.features.find(
                          (f) => f.id === feature.id
                        );

                        return (
                          <div
                            className="w-[200px] flex flex-col items-start justify-center gap-2"
                            key={featureIndex}
                          >
                            <div className="w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]">
                              {departmentFeature ? (
                                PERMISSIONS.map((permission) => {
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

                    {/* Actions */}
                    <td className='flex gap-x-3'>
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
                      <button
                        onClick={() => handleShowUpdateEmployeeAlert(employee, 'employee')}
                        disabled={isEmployeeLoadingState[employee.id]}
                        className={`${isEmployeeLoadingState[employee.id]
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                        type='submit'
                      >
                        {isEmployeeLoadingState[employee.id] ? (
                          <CircularProgress className="spinnerSize" />
                        ) : (
                          <MdDelete className='w-6 h-6 text-red-500' />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={features.length + 2} className="text-center py-4 text-custom-bluegreen">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <AddDepartmentModal departmentModalRef={departmentModalRef} />
      </div>
      <div>
        <AddUserModals userModalRef={userModalRef} />
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
      <div className="">
        <Alert
          title="Are you sure you want to delete this data?"
          show={showAlert}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  )
}

export default UserRightsAndPermissions