export const getFilteredEmployeeOptions = (
    allEmployees,
    employeesWithPermissions,
    search
) => {
    // Extract IDs with permissions
    const idsWithPermissions = employeesWithPermissions.map((emp) => emp.id);

    // Filter out employees already in employeesWithPermissions
    const employeeOptions = allEmployees
        .filter((employee) => !idsWithPermissions.includes(employee.id)) // Exclude matched IDs
        .map((employee) => ({
            id: employee?.id,
            name: `${employee.firstname} ${employee.lastname}`,
            email: employee.employee_email,
            firstname: employee.firstname,
            department:
                employee.department === "Customer Relations - Services"
                    ? "Customer Relations - Services"
                    : employee.department,
            abbreviationDep: employee.department,
        }));

    // Apply search filter
    const filteredOptions = employeeOptions.filter(
        (option) =>
            (option.name &&
                option.name.toLowerCase().includes(search.toLowerCase())) ||
            (option.email &&
                option.email.toLowerCase().includes(search.toLowerCase())) ||
            (option.department &&
                option.department.toLowerCase().includes(search.toLowerCase()))
    );

    return filteredOptions;
};
