import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import AddDepartmentModal from "./modals/DepartmentModal/AddDepartmentModal";
import AddUserModals from "./modals/UserModal/AddUserModals";
import EditDepartmentModal from "./modals/DepartmentModal/EditDepartmentModal";
import EditEmployeeModal from "./modals/UserModal/EditUserModal";
import { PERMISSIONS } from "@/constant/data/permissions";
import { HiPencil } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { showToast } from "@/util/toastUtil";
import Alert from "@/component/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useFeature from "@/context/RoleManagement/FeatureContext";
import {
    departmentPermissionService,
    employeePermissionService,
} from "@/component/servicesApi/apiCalls/roleManagement";
import useDepartmentPermission from "@/context/RoleManagement/DepartmentPermissionContext";
import useEmployeePermission from "@/context/RoleManagement/EmployeePermissionContext";
import useDepartment from "@/context/RoleManagement/DepartmentContext";
import CustomToolTip from "@/component/CustomToolTip";
import { debounce } from "lodash";
import highlightText from "@/util/hightlightText";

const UserRightsAndPermissions = () => {
    //States
    const { features, isFeatureFetching, fetchFeatures } = useFeature();
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const {
        departmentsWithPermissions,
        fetchDepartmentPermissions,
        isDepartmentPermissionsLoading,
    } = useDepartmentPermission();
    const { departments, fetchEmployeeDepartments } = useDepartment();
    const {
        employeesWithPermissions,
        fetchEmployeeWithPermissions,
        isEmployeePermissionLoading,
    } = useEmployeePermission();
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [alertType, setAlertType] = useState("");
    const departmentModalRef = useRef(null);
    const userModalRef = useRef(null);
    const editDepartmentModalRef = useRef(null);
    const editEmployeeModalRef = useRef(null);
    const [showAlert, setShowAlert] = useState(false);
    const [isEmployeeLoadingState, setIsEmployeeLoadingState] = useState({});
    const [isDepartmentLoadingState, setIsDepartmentLoadingState] = useState(
        {}
    );
    const [searchByDepartmentOrByEmployee, setSearchByDepartmentOrByEmployee] =
        useState("");

    //Hooks
    //Debounced function to optimize search input performance
    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchByDepartmentOrByEmployee(value);
        }, 300),
        []
    );

    //Memoized filtered departments list based on search input
    const filteredDepartments = useMemo(() => {
        if (departmentsWithPermissions) {
            return departmentsWithPermissions.filter((department) =>
                department.name
                    .toLowerCase()
                    .includes(searchByDepartmentOrByEmployee.toLowerCase())
            );
        }
    }, [searchByDepartmentOrByEmployee, departmentsWithPermissions]);

    //Memoized filtered employees/user list based on search input
    const filteredEmployees = useMemo(() => {
        if (employeesWithPermissions) {
            return (
                employeesWithPermissions?.filter((employee) => {
                    const firstName = employee?.firstname?.toLowerCase() || "";
                    const lastName = employee?.lastname?.toLowerCase() || "";
                    const employeeDepartment =
                        employee?.department.toLowerCase() || "";
                    const searchTerm =
                        searchByDepartmentOrByEmployee.toLowerCase();

                    return (
                        firstName.includes(searchTerm) ||
                        lastName.includes(searchTerm) ||
                        employeeDepartment.includes(searchTerm)
                    );
                }) || []
            );
        }
    }, [searchByDepartmentOrByEmployee, employeesWithPermissions]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsInitialLoading(true);
            try {
                // Fetch data in parallel using Promise.all
                await Promise.all([
                    !features && fetchFeatures(),
                    !departmentsWithPermissions &&
                        fetchDepartmentPermissions(true, false),
                    !employeesWithPermissions &&
                        fetchEmployeeWithPermissions(true, false),
                    !departments && fetchEmployeeDepartments(),
                ]);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchAllData();
    }, []);
 

    //Event Handler
    //Handle the change event of the search input
    const handleSearchOnChange = (value) => {
        debouncedSearch(value);
    };

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
            setIsDepartmentLoadingState((prev) => ({
                ...prev,
                [department.id]: true,
            }));
            const response =
                await departmentPermissionService.editDepartmentPermissionsStatus(
                    payload
                );
            if (response.data?.statusCode === 200) {
                showToast("Data deleted successfully!", "success");
                await fetchDepartmentPermissions(true, false);
                await fetchEmployeeDepartments(true);
            }
        } catch (error) {
            console.log("error", error);
        } finally {
            setIsDepartmentLoadingState((prev) => ({
                ...prev,
                [department.id]: false,
            }));
        }
    };

    //To Update 'Active or InActive" employee permission
    const updateEmployeePermissionStatus = async (employee) => {
        const payload = {
            employee_id: employee?.id,
            status: "InActive",
        };
        try {
            setIsEmployeeLoadingState((prev) => ({
                ...prev,
                [employee.id]: true,
            }));
            const response =
                await employeePermissionService.editEmployeesPermissionsStatus(
                    payload
                );
            if (response.data?.statusCode === 200) {
                showToast("Data deleted successfully!", "success");
                await fetchEmployeeWithPermissions(true, false);
            }
        } catch (error) {
            console.log("error", error);
        } finally {
            setIsEmployeeLoadingState((prev) => ({
                ...prev,
                [employee.id]: false,
            }));
        }
    };

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
        <div className="h-screen max-w-full bg-custom-grayFA p-[20px]">
            {/* Specific Department */}
            <div className="flex flex-col gap-[30px]">
                <div className="relative flex justify-start gap-3 ">
                    <div className="relative w-[582px] ">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-4 absolute left-3 top-4 text-gray-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            />
                        </svg>
                        <input
                            type="text"
                            onChange={(e) =>
                                handleSearchOnChange(e.target.value)
                            }
                            className="h-[47px] w-full rounded-lg pl-9 pr-6 text-sm bg-custom-grayF1"
                            placeholder="Search"
                        />
                    </div>
                </div>
                <div className="rounded-[5px] p-[10px] w-full h-[51px]">
                    <div className="flex flex-row  gap-[37px] items-center">
                        <div className="montserrat-regular text-sm">
                            Add Specific Department
                        </div>
                        <button
                            onClick={handleAddDepartmentModal}
                            className=" h-[31px] w-[140px] py-[7px] px-[20px] gradient-btn5 text-white text-sm montserrat-medium rounded-[6px] flex items-center justify-center gap-x-2"
                        >
                            <span className="text-[18px]">+</span>
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
                                {isFeatureFetching ? (
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
                                ) : features && features.length > 0 ? (
                                    features.map((feature, index) => (
                                        <th
                                            className="flex justify-center w-[200px] shrink-0 "
                                            key={index}
                                        >
                                            {feature.name}
                                        </th>
                                    ))
                                ) : null}
                            </tr>
                        </thead>
                        <tbody>
                            {isDepartmentPermissionsLoading ? (
                                <tr className="w-full flex flex-col gap-x-2">
                                    <th className="flex justify-start  shrink-0 bg-gray-100 rounded-md mt-1">
                                        <Skeleton height={40} width="80%" />
                                    </th>
                                    <th className="flex justify-center shrink-0 bg-gray-100 rounded-md mt-2">
                                        <Skeleton height={40} width="80%" />
                                    </th>
                                    <th className="flex justify-center  shrink-0 bg-gray-100 rounded-md mt-2">
                                        <Skeleton height={40} width="80%" />
                                    </th>
                                </tr>
                            ) : filteredDepartments &&
                              filteredDepartments.length > 0 ? (
                                filteredDepartments.map((department, index) => (
                                    <tr
                                        key={index}
                                        className="flex items-center gap-x-4 mb-2"
                                    >
                                        <td className="flex gap-[57px] mt-[6px] h-[75px] overflow-visible px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm">
                                            <div className="w-[200px] flex flex-col items-start justify-center gap-2">
                                                <div className="w-full h-[50px] flex items-center justify-center bg-white rounded-[5px]">
                                                    <p className="montserrat-regular text-sm text-center">
                                                        {highlightText(
                                                            department.name,
                                                            searchByDepartmentOrByEmployee
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {features &&
                                                features.map(
                                                    (feature, featureIndex) => {
                                                        const departmentFeature =
                                                            department.features.find(
                                                                (f) =>
                                                                    f.id ===
                                                                    feature.id
                                                            );

                                                        return (
                                                            <div
                                                                key={
                                                                    featureIndex
                                                                }
                                                                className="w-[200px] flex flex-col items-start justify-center gap-2"
                                                            >
                                                                <div className="w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]">
                                                                    {departmentFeature ? (
                                                                        PERMISSIONS.map(
                                                                            (
                                                                                permission
                                                                            ) => {
                                                                                const permissionValue =
                                                                                    departmentFeature
                                                                                        .pivot[
                                                                                        permission
                                                                                            .value
                                                                                    ];
                                                                                return (
                                                                                    <div
                                                                                        className="flex flex-col gap-[2.75px] items-center"
                                                                                        key={
                                                                                            permission.value
                                                                                        }
                                                                                    >
                                                                                        <CustomToolTip
                                                                                            text={
                                                                                                permission.name ===
                                                                                                "R"
                                                                                                    ? "Read"
                                                                                                    : "" ||
                                                                                                      permission.name ===
                                                                                                          "W"
                                                                                                    ? "Write"
                                                                                                    : "" ||
                                                                                                      permission.name ===
                                                                                                          "D"
                                                                                                    ? "Delete"
                                                                                                    : "" ||
                                                                                                      permission.name ===
                                                                                                          "E"
                                                                                                    ? "Execute"
                                                                                                    : "" ||
                                                                                                      permission.name ===
                                                                                                          "S"
                                                                                                    ? "Save"
                                                                                                    : ""
                                                                                            }
                                                                                        >
                                                                                            <p className="montserrat-semibold text-[10px] leading-[12.19px]">
                                                                                                {
                                                                                                    permission.name
                                                                                                }
                                                                                            </p>
                                                                                        </CustomToolTip>

                                                                                        <input
                                                                                            type="checkbox"
                                                                                            className="h-[16px] w-[16px] custom-checkbox-permission"
                                                                                            checked={
                                                                                                permissionValue
                                                                                            }
                                                                                            disabled
                                                                                        />
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )
                                                                    ) : (
                                                                        <p className="text-center text-custom-gray">
                                                                            No
                                                                            Permissions
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                        </td>

                                        <td className="flex gap-x-3">
                                            <CustomToolTip
                                                text="Edit"
                                                height="h-[32px]"
                                                position="left"
                                            >
                                                <HiPencil
                                                    onClick={() =>
                                                        handleEditDepartmentModal(
                                                            department
                                                        )
                                                    }
                                                    className="w-5 h-5 text-custom-bluegreen cursor-pointer"
                                                />
                                            </CustomToolTip>

                                            <CustomToolTip
                                                text="Delete"
                                                height="h-[34px]"
                                                position="left"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleShowUpdateDepartmentAlert(
                                                            department,
                                                            "department"
                                                        )
                                                    }
                                                    disabled={
                                                        isDepartmentLoadingState[
                                                            department.id
                                                        ]
                                                    }
                                                    className={`${
                                                        isDepartmentLoadingState[
                                                            department.id
                                                        ]
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                    type="submit"
                                                >
                                                    {isDepartmentLoadingState[
                                                        department.id
                                                    ] ? (
                                                        <CircularProgress className="spinnerSize" />
                                                    ) : (
                                                        <MdDelete className="w-6 h-6 text-red-500" />
                                                    )}
                                                </button>
                                            </CustomToolTip>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={(features?.length || 0) + 2}
                                        className="text-center py-4 text-custom-bluegreen"
                                    >
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Specific User */}
                <div className="flex items-center gap-[37px] rounded-[5px] p-[10px] w-full h-[51px]">
                    <div className="montserrat-regular text-sm ">
                        Add Specific User
                    </div>
                    <button
                        onClick={handleAddUserModal}
                        className="h-[31px] w-[140px] py-[7px] px-[20px] gradient-btn5 text-white text-sm montserrat-medium rounded-[6px] flex justify-center items-center gap-x-2"
                    >
                        <span className="text-[18px]">+</span>
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
                                {isFeatureFetching ? (
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
                                ) : (
                                    features &&
                                    features.map((feature, index) => (
                                        <th
                                            className="flex justify-center w-[200px] shrink-0 "
                                            key={index}
                                        >
                                            {feature.name}
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {isEmployeePermissionLoading ? (
                                <tr>
                                    <td className="w-full mt-1">
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
                            ) : filteredEmployees &&
                              filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee, index) => (
                                    <tr
                                        key={index}
                                        className="flex items-center gap-x-4"
                                    >
                                        <td className="flex gap-[57px] mt-[6px] h-[64px] overflow-visible px-[16px] py-[10px] bg-custom-lightestgreen text-custom-bluegreen text-sm">
                                            <div className="w-[200px] flex flex-col items-start justify-center gap-2">
                                                <div className="w-full h-[50px] flex items-center justify-center bg-white rounded-[5px] py-1">
                                                    <p className="montserrat-regular text-custom-lightgreen text-sm text-center">
                                                        {highlightText(
                                                            employee?.firstname,
                                                            searchByDepartmentOrByEmployee
                                                        )}{" "}
                                                        {highlightText(
                                                            employee?.lastname,
                                                            searchByDepartmentOrByEmployee
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="w-[200px] flex flex-col items-start justify-center gap-2">
                                                <div className="w-full h-[50px] flex items-center justify-center bg-white rounded-[5px] py-1">
                                                    <p className="montserrat-regular text-sm text-center">
                                                        {highlightText(
                                                            employee?.department,
                                                            searchByDepartmentOrByEmployee
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {features &&
                                                features.length > 0 &&
                                                features.map(
                                                    (feature, featureIndex) => {
                                                        const departmentFeature =
                                                            employee.features.find(
                                                                (f) =>
                                                                    f.id ===
                                                                    feature.id
                                                            );

                                                        return (
                                                            <div
                                                                className="w-[200px] flex flex-col items-start justify-center gap-2"
                                                                key={
                                                                    featureIndex
                                                                }
                                                            >
                                                                <div className="w-full h-[44px] gap-[20px] flex items-center justify-center bg-white rounded-[5px]">
                                                                    {departmentFeature ? (
                                                                        PERMISSIONS.map(
                                                                            (
                                                                                permission
                                                                            ) => {
                                                                                const permissionValue =
                                                                                    departmentFeature
                                                                                        .pivot[
                                                                                        permission
                                                                                            .value
                                                                                    ];
                                                                                return (
                                                                                    <div
                                                                                        className="flex flex-col gap-[2.75px] items-center"
                                                                                        key={
                                                                                            permission.value
                                                                                        }
                                                                                    >
                                                                                        <CustomToolTip
                                                                                            text={
                                                                                                permission.name ===
                                                                                                "R"
                                                                                                    ? "Read"
                                                                                                    : "" ||
                                                                                                      permission.name ===
                                                                                                          "W"
                                                                                                    ? "Write"
                                                                                                    : "" ||
                                                                                                      permission.name ===
                                                                                                          "D"
                                                                                                    ? "Delete"
                                                                                                    : "" ||
                                                                                                      permission.name ===
                                                                                                          "E"
                                                                                                    ? "Execute"
                                                                                                    : "" ||
                                                                                                      permission.name ===
                                                                                                          "S"
                                                                                                    ? "Save"
                                                                                                    : ""
                                                                                            }
                                                                                        >
                                                                                            <p className="montserrat-semibold text-[10px] leading-[12.19px]">
                                                                                                {
                                                                                                    permission.name
                                                                                                }
                                                                                            </p>
                                                                                        </CustomToolTip>

                                                                                        <input
                                                                                            type="checkbox"
                                                                                            className="h-[16px] w-[16px] custom-checkbox-permission"
                                                                                            checked={
                                                                                                permissionValue
                                                                                            }
                                                                                            disabled
                                                                                        />
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )
                                                                    ) : (
                                                                        <p className="text-center text-custom-gray">
                                                                            No
                                                                            Permissions
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                        </td>

                                        <td className="flex gap-x-3">
                                            <CustomToolTip
                                                text="Edit"
                                                height="h-[32px]"
                                                position="left"
                                            >
                                                <HiPencil
                                                    onClick={() =>
                                                        handleEditEmployeeModal(
                                                            employee
                                                        )
                                                    }
                                                    className="w-5 h-5 text-custom-bluegreen cursor-pointer"
                                                />
                                            </CustomToolTip>
                                            <CustomToolTip
                                                text="Delete"
                                                height="h-[34px]"
                                                position="left"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleShowUpdateEmployeeAlert(
                                                            employee,
                                                            "employee"
                                                        )
                                                    }
                                                    disabled={
                                                        isEmployeeLoadingState[
                                                            employee.id
                                                        ]
                                                    }
                                                    className={`${
                                                        isEmployeeLoadingState[
                                                            employee.id
                                                        ]
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                    type="submit"
                                                >
                                                    {isEmployeeLoadingState[
                                                        employee.id
                                                    ] ? (
                                                        <CircularProgress className="spinnerSize" />
                                                    ) : (
                                                        <MdDelete className="w-6 h-6 text-red-500" />
                                                    )}
                                                </button>
                                            </CustomToolTip>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={(features?.length || 0) + 2}
                                        className="text-center py-4 text-custom-bluegreen"
                                    >
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                <AddDepartmentModal
                    departmentModalRef={departmentModalRef}
                    employeeDepartments={departments}
                />
            </div>
            <div>
                <AddUserModals
                    employeesWithPermissions={employeesWithPermissions}
                    userModalRef={userModalRef}
                />
            </div>
            <div>
                <EditDepartmentModal
                    editDepartmentModalRef={editDepartmentModalRef}
                    onSubmitSuccess={fetchDepartmentPermissions}
                    selectedDepartment={selectedDepartment}
                />
            </div>
            <div>
                <EditEmployeeModal
                    editEmployeeModalRef={editEmployeeModalRef}
                    selectedEmployee={selectedEmployee}
                />
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
    );
};

export default UserRightsAndPermissions;
