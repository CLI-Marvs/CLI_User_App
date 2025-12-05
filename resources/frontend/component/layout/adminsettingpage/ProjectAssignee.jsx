import React, { useState, useEffect, useMemo, useCallback } from "react";
import apiService from "../../../component/servicesApi/apiService";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const ProjectAssigneeComponent = () => {
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [projectSubmilestones, setProjectSubmilestones] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [selectedSubmilestones, setSelectedSubmilestones] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [loadingStates, setLoadingStates] = useState({
        list: true,
        assign: false,
        remove: null,
        submilestones: false,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [projectSearchTerm, setProjectSearchTerm] = useState("");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [milestoneSearchTerm, setMilestoneSearchTerm] = useState("");
    const [isMilestoneDropdownOpen, setIsMilestoneDropdownOpen] =
        useState(false);
    const [expandedProjects, setExpandedProjects] = useState({}); // Tracks expanded project rows
    const [expandedMilestones, setExpandedMilestones] = useState({}); // Tracks expanded milestone rows
    const [projectMilestones, setProjectMilestones] = useState({});
    const [assignees, setAssignees] = useState({});
    const [assignmentMode, setAssignmentMode] = useState("replace"); // "replace" or "add"

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Show 10 projects per page

    const fetchProjects = useCallback(() => {
        setLoadingStates((s) => ({ ...s, list: true }));
        apiService
            .get("/projects-with-assignees")
            .then((res) => {
                // Ensure the response is an array before setting state
                if (Array.isArray(res.data)) {
                    setProjects(res.data);
                } else {
                    console.error(
                        "Data received for projects is not an array:",
                        res.data
                    );
                    setProjects([]); // Set to empty array to prevent crash
                }
            })
            .catch((err) => {
                console.error("Failed to fetch projects", err);
                setProjects([]); // Also set to empty on error
            })
            .finally(() => setLoadingStates((s) => ({ ...s, list: false })));
    }, []);

    const fetchEmployees = useCallback(() => {
        apiService
            .get("/employees")
            .then((res) => {
                const employeesWithFullname = res.data.map((emp) => ({
                    ...emp,
                    fullname:
                        emp.fullname ||
                        `${emp.firstname || ""} ${emp.lastname || ""}`.trim(),
                }));
                setEmployees(employeesWithFullname);
            })
            .catch((err) => console.error("Failed to fetch employees", err));
    }, []);

    useEffect(() => {
        fetchProjects();
        fetchEmployees();
    }, [fetchProjects, fetchEmployees]);

    // Reset to first page when projects data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [projects.length]);

    const fetchSubmilestonesForProjects = useCallback(async (projectNames) => {
        if (!projectNames || projectNames.length === 0) {
            setProjectSubmilestones([]);
            return;
        }
        setLoadingStates((s) => ({ ...s, submilestones: true }));

        try {
            // Fetch submilestones for all projects
            const promises = projectNames.map((projectName) =>
                apiService.get(
                    `/projects/${encodeURIComponent(projectName)}/submilestones`
                )
            );

            const results = await Promise.all(promises);

            // Combine all submilestones from different projects
            const allSubmilestones = results.reduce((acc, res) => {
                return acc.concat(res.data || []);
            }, []);

            // Remove duplicates based on milestone id
            const uniqueSubmilestones = allSubmilestones.reduce(
                (acc, milestone) => {
                    if (!acc.some((m) => m.id === milestone.id)) {
                        acc.push(milestone);
                    }
                    return acc;
                },
                []
            );

            setProjectSubmilestones(uniqueSubmilestones);
        } catch (err) {
            console.error("Failed to fetch submilestones for projects:", err);
            setProjectSubmilestones([]);
        } finally {
            setLoadingStates((s) => ({ ...s, submilestones: false }));
        }
    }, []);

    useEffect(() => {
        // Fetch submilestones for all selected projects
        fetchSubmilestonesForProjects(selectedProjects);
        setSelectedSubmilestones([]);
        setSelectedEmployees([]);
    }, [selectedProjects, fetchSubmilestonesForProjects]);

    const fetchAssignees = useCallback(async (projectName, submilestoneId) => {
        const key = `${projectName}-${submilestoneId}`;
        try {
            const response = await apiService.get(
                `/projects/${encodeURIComponent(
                    projectName
                )}/milestones/${submilestoneId}/assignees`
            );
            setAssignees((prev) => ({
                ...prev,
                [key]: response.data,
            }));
        } catch (err) {
            console.error("Failed to fetch assignees", err);
            setAssignees((prev) => ({ ...prev, [key]: [] }));
        }
    }, []);

    const handleProjectRowClick = useCallback(
        (projectName) => {
            setExpandedProjects((prev) => {
                const isExpanded = !prev[projectName];
                if (isExpanded && !projectMilestones[projectName]) {
                    apiService
                        .get(
                            `/projects/${encodeURIComponent(
                                projectName
                            )}/submilestones`
                        )
                        .then((res) => {
                            setProjectMilestones((prev) => ({
                                ...prev,
                                [projectName]: res.data,
                            }));
                        })
                        .catch((err) => {
                            console.error(
                                `Failed to fetch milestones for project row ${projectName}`,
                                err
                            );
                            setProjectMilestones((prev) => ({
                                ...prev,
                                [projectName]: [],
                            }));
                        });
                }
                return { ...prev, [projectName]: isExpanded };
            });
        },
        [projectMilestones]
    );

    const handleMilestoneRowClick = useCallback(
        (projectName, milestoneId) => {
            const key = `${projectName}-${milestoneId}`;
            setExpandedMilestones((prev) => {
                const isExpanded = !prev[key];
                // If expanding and data isn't loaded yet, fetch it
                if (isExpanded && !assignees[key]) {
                    fetchAssignees(projectName, milestoneId);
                }
                return { ...prev, [key]: isExpanded };
            });
        },
        [assignees, fetchAssignees]
    );

    const handleRemoveAssignee = useCallback(
        async (projectName, submilestoneId, employeeId) => {
            const loadingKey = `${projectName}-${submilestoneId}-${employeeId}`;
            setLoadingStates((s) => ({ ...s, remove: loadingKey }));
            try {
                await apiService.delete(
                    `/projects/${encodeURIComponent(
                        projectName
                    )}/milestones/${submilestoneId}/assignees/${employeeId}`
                );
                fetchAssignees(projectName, submilestoneId); // Refresh assignees list
            } catch (err) {
                console.error("Failed to remove assignee", err);
            } finally {
                setLoadingStates((s) => ({ ...s, remove: null }));
            }
        },
        [fetchAssignees]
    );

    const handleEmployeeToggle = useCallback((employeeId) => {
        const employeeIdStr = employeeId.toString();
        setSelectedEmployees((prev) => {
            if (prev.includes(employeeIdStr)) {
                // Remove if already selected
                return prev.filter((id) => id !== employeeIdStr);
            } else {
                // Add to selection
                return [...prev, employeeIdStr];
            }
        });
        // Clear search term when selecting an employee, but keep dropdown open for multiple selection
        setSearchTerm("");
    }, []);

    const handleAssign = useCallback(async () => {
        if (
            selectedProjects.length === 0 ||
            selectedSubmilestones.length === 0 ||
            selectedEmployees.length === 0
        )
            return;

        setLoadingStates((s) => ({ ...s, assign: true }));

        try {
            // Create assignment promises for all combinations of projects, milestones, and employees
            const assignmentPromises = [];

            for (const projectName of selectedProjects) {
                for (const milestoneId of selectedSubmilestones) {
                    let employeeIdsToAssign = [...selectedEmployees];

                    // If in "add" mode, fetch existing assignees first
                    if (assignmentMode === "add") {
                        try {
                            const existingResponse = await apiService.get(
                                `/projects/${encodeURIComponent(
                                    projectName
                                )}/milestones/${milestoneId}/assignees`
                            );
                            const existingEmployeeIds =
                                existingResponse.data.map((assignee) =>
                                    assignee.id.toString()
                                );

                            // Merge existing and new employee IDs, removing duplicates
                            employeeIdsToAssign = [
                                ...new Set([
                                    ...existingEmployeeIds,
                                    ...selectedEmployees,
                                ]),
                            ];
                        } catch (err) {
                            console.warn(
                                `Could not fetch existing assignees for ${projectName}-${milestoneId}, proceeding with new assignees only:`,
                                err
                            );
                        }
                    }

                    assignmentPromises.push(
                        apiService
                            .put(
                                `/projects/${encodeURIComponent(
                                    projectName
                                )}/milestones/${milestoneId}/assignees`,
                                {
                                    employee_ids: employeeIdsToAssign,
                                }
                            )
                            .then((res) => ({
                                projectName,
                                milestoneId,
                                response: res,
                            }))
                    );
                }
            }

            // Execute all assignments
            const results = await Promise.all(assignmentPromises);

            // Update state for each successful assignment
            results.forEach(({ projectName, milestoneId, response }) => {
                const key = `${projectName}-${milestoneId}`;
                const newAssignees = response.data.assignees;

                // Update the detailed assignee list for the expanded milestone view
                setAssignees((prev) => ({
                    ...prev,
                    [key]: newAssignees,
                }));

                // Update the specific milestone's count within the projectMilestones state
                setProjectMilestones((prev) => {
                    const currentMilestones = prev[projectName] || [];
                    const updatedMilestones = currentMilestones.map((m) =>
                        m.id.toString() === milestoneId
                            ? { ...m, assignees_count: newAssignees.length }
                            : m
                    );
                    return { ...prev, [projectName]: updatedMilestones };
                });
            });

            // Clear selections after successful assignment
            setSelectedEmployees([]);
            setSelectedProjects([]);
            setSelectedSubmilestones([]);
            setSearchTerm("");
            setProjectSearchTerm("");
            setMilestoneSearchTerm("");
            setIsDropdownOpen(false);
            setIsProjectDropdownOpen(false);
            setIsMilestoneDropdownOpen(false);

            fetchProjects(); // Refetch projects to update the total assignee count for the project row
        } catch (err) {
            console.error("Failed to assign employees", err);
        } finally {
            setLoadingStates((s) => ({ ...s, assign: false }));
        }
    }, [
        selectedProjects,
        selectedSubmilestones,
        selectedEmployees,
        assignmentMode,
        fetchProjects,
    ]);

    const employeeMap = useMemo(() => {
        return employees.reduce((acc, emp) => {
            acc[emp.id] = emp;
            return acc;
        }, {});
    }, [employees]);

    const selectedEmployeeDetails = useMemo(() => {
        return selectedEmployees
            .map((empId) => employeeMap[empId])
            .filter(Boolean);
    }, [selectedEmployees, employeeMap]);

    const filteredEmployees = employees.filter((employee) =>
        employee.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedProjectDetails = useMemo(() => {
        return projects.filter((p) =>
            selectedProjects.includes(p.property_name)
        );
    }, [selectedProjects, projects]);

    const filteredProjects = projects.filter((project) =>
        project.property_name
            .toLowerCase()
            .includes(projectSearchTerm.toLowerCase())
    );

    const handleProjectToggle = useCallback((projectName) => {
        setSelectedProjects((prev) => {
            if (prev.includes(projectName)) {
                // Remove if already selected
                return prev.filter((name) => name !== projectName);
            } else {
                // Add to selection
                return [...prev, projectName];
            }
        });
        // Keep dropdown open for multiple selection
        setProjectSearchTerm("");
    }, []);

    const selectedMilestoneDetails = useMemo(() => {
        return projectSubmilestones.filter((sm) =>
            selectedSubmilestones.includes(sm.id.toString())
        );
    }, [selectedSubmilestones, projectSubmilestones]);

    const filteredMilestones = projectSubmilestones.filter(
        (milestone) =>
            milestone.name
                .toLowerCase()
                .includes(milestoneSearchTerm.toLowerCase()) ||
            milestone.work_order_type?.type_name
                .toLowerCase()
                .includes(milestoneSearchTerm.toLowerCase())
    );

    const handleMilestoneToggle = useCallback((milestoneId) => {
        const milestoneIdStr = milestoneId.toString();
        setSelectedSubmilestones((prev) => {
            if (prev.includes(milestoneIdStr)) {
                // Remove if already selected
                return prev.filter((id) => id !== milestoneIdStr);
            } else {
                // Add to selection
                return [...prev, milestoneIdStr];
            }
        });
        // Keep dropdown open for multiple selection
        setMilestoneSearchTerm("");
    }, []);

    // Pagination calculations
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProjects = projects.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Close all expanded rows when changing pages
        setExpandedProjects({});
        setExpandedMilestones({});
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl px-4 sm:px-6 lg:px-0 py-8 h-full">
                {/* Header Section */}
                <div className=" border-b border-gray-50 rounded-lg mb-8">
                    <div className="py-6 border-b border-gray-200">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Project Assignee Management
                        </h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Assign employees to specific milestones within a
                            project.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    {/* Assignment Section */}
                    <div className="lg:col-span-1 bg-white shadow-sm border border-gray-200 rounded-lg h-fit">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Assign Employees
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Project Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Target Projects{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <div className="flex flex-wrap items-center min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 bg-white shadow-sm">
                                        {/* Search Icon */}
                                        <div className="flex-shrink-0 mr-2">
                                            <svg
                                                className="h-4 w-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>

                                        {/* Selected Projects Chips */}
                                        {selectedProjectDetails.map(
                                            (project) => (
                                                <div
                                                    key={project.property_name}
                                                    className="inline-flex items-center px-2 py-1 mr-2 mb-1 mt-1 rounded-full text-xs font-medium bg-custom-lightestgreen border text-custom-solidgreen shadow-sm"
                                                >
                                                    <span className="mr-1">
                                                        {project.property_name}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleProjectToggle(
                                                                project.property_name
                                                            )
                                                        }
                                                        className="text-custom-solidgreen hover:text-red-600 transition-colors duration-200"
                                                        disabled={
                                                            loadingStates.assign
                                                        }
                                                    >
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        {/* Input Field */}
                                        <input
                                            type="text"
                                            placeholder={
                                                selectedProjectDetails.length >
                                                0
                                                    ? ""
                                                    : "Search for projects..."
                                            }
                                            value={projectSearchTerm}
                                            onChange={(e) =>
                                                setProjectSearchTerm(
                                                    e.target.value
                                                )
                                            }
                                            onFocus={() =>
                                                setIsProjectDropdownOpen(true)
                                            }
                                            className="flex-1 min-w-[120px] border-0 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                                            disabled={loadingStates.assign}
                                        />
                                    </div>
                                    {projectSearchTerm && (
                                        <button
                                            onClick={() => {
                                                setProjectSearchTerm("");
                                                setIsProjectDropdownOpen(false);
                                            }}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {isProjectDropdownOpen && (
                                    <div className="relative">
                                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                            <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                                                <p className="text-sm font-medium text-gray-700">
                                                    Select Project (
                                                    {filteredProjects.length}{" "}
                                                    available)
                                                </p>
                                            </div>
                                            <div className="overflow-y-auto max-h-48">
                                                {filteredProjects.length ===
                                                0 ? (
                                                    <div className="px-4 py-6 text-center text-gray-500">
                                                        <svg
                                                            className="w-8 h-8 mx-auto mb-2 text-gray-300"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                            />
                                                        </svg>
                                                        <p className="text-sm">
                                                            No projects found
                                                        </p>
                                                    </div>
                                                ) : (
                                                    filteredProjects.map(
                                                        (project) => (
                                                            <label
                                                                key={
                                                                    project.property_name
                                                                }
                                                                className="group px-4 py-3 cursor-pointer hover:bg-blue-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-all duration-200"
                                                            >
                                                                <div className="flex-shrink-0">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedProjects.includes(
                                                                            project.property_name
                                                                        )}
                                                                        onChange={() =>
                                                                            handleProjectToggle(
                                                                                project.property_name
                                                                            )
                                                                        }
                                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="select-none font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                                                        {
                                                                            project.property_name
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {selectedProjects.includes(
                                                                    project.property_name
                                                                ) && (
                                                                    <div className="flex-shrink-0">
                                                                        <svg
                                                                            className="w-4 h-4 text-green-500"
                                                                            fill="currentColor"
                                                                            viewBox="0 0 20 20"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </label>
                                                        )
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {isProjectDropdownOpen && (
                                    <div
                                        className="fixed inset-0 z-5"
                                        onClick={() =>
                                            setIsProjectDropdownOpen(false)
                                        }
                                    />
                                )}
                            </div>

                            {/* Submilestone Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Target Milestones{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <div className="flex flex-wrap items-center min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 bg-white shadow-sm">
                                        {/* Search Icon */}
                                        <div className="flex-shrink-0 mr-2">
                                            <svg
                                                className="h-4 w-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>

                                        {/* Selected Milestones Chips */}
                                        {selectedMilestoneDetails.map(
                                            (milestone) => (
                                                <div
                                                    key={milestone.id}
                                                    className="inline-flex items-center px-2 py-1 mr-2 mb-1 mt-1 rounded-full text-xs font-medium bg-custom-lightestgreen border text-custom-solidgreen shadow-sm max-w-48"
                                                >
                                                    <span className="mr-1 truncate">
                                                        {
                                                            milestone
                                                                .work_order_type
                                                                ?.type_name
                                                        }{" "}
                                                        - {milestone.name}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleMilestoneToggle(
                                                                milestone.id
                                                            )
                                                        }
                                                        className="text-custom-solidgreen hover:text-red-600 transition-colors duration-200 flex-shrink-0"
                                                        disabled={
                                                            loadingStates.assign
                                                        }
                                                    >
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        {/* Input Field */}
                                        <input
                                            type="text"
                                            placeholder={
                                                selectedMilestoneDetails.length >
                                                0
                                                    ? ""
                                                    : loadingStates.submilestones
                                                    ? "Loading milestones..."
                                                    : "Search for milestones..."
                                            }
                                            value={milestoneSearchTerm}
                                            onChange={(e) =>
                                                setMilestoneSearchTerm(
                                                    e.target.value
                                                )
                                            }
                                            onFocus={() =>
                                                !loadingStates.submilestones &&
                                                selectedProjects.length > 0 &&
                                                setIsMilestoneDropdownOpen(true)
                                            }
                                            className="flex-1 min-w-[120px] border-0 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                                            disabled={
                                                selectedProjects.length === 0 ||
                                                loadingStates.submilestones ||
                                                loadingStates.assign
                                            }
                                        />
                                    </div>
                                    {milestoneSearchTerm && (
                                        <button
                                            onClick={() => {
                                                setMilestoneSearchTerm("");
                                                setIsMilestoneDropdownOpen(
                                                    false
                                                );
                                            }}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {isMilestoneDropdownOpen &&
                                    selectedProjects.length > 0 &&
                                    !loadingStates.submilestones && (
                                        <div className="relative">
                                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                                <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Select Milestone (
                                                        {
                                                            filteredMilestones.length
                                                        }{" "}
                                                        available)
                                                    </p>
                                                </div>
                                                <div className="overflow-y-auto max-h-48">
                                                    {filteredMilestones.length ===
                                                    0 ? (
                                                        <div className="px-4 py-6 text-center text-gray-500">
                                                            <svg
                                                                className="w-8 h-8 mx-auto mb-2 text-gray-300"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                                                />
                                                            </svg>
                                                            <p className="text-sm">
                                                                No milestones
                                                                found
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        filteredMilestones.map(
                                                            (milestone) => (
                                                                <label
                                                                    key={
                                                                        milestone.id
                                                                    }
                                                                    className="group px-4 py-3 cursor-pointer hover:bg-blue-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-all duration-200"
                                                                >
                                                                    <div className="flex-shrink-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedSubmilestones.includes(
                                                                                milestone.id.toString()
                                                                            )}
                                                                            onChange={() =>
                                                                                handleMilestoneToggle(
                                                                                    milestone.id
                                                                                )
                                                                            }
                                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="select-none font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                                                            {
                                                                                milestone
                                                                                    .work_order_type
                                                                                    ?.type_name
                                                                            }{" "}
                                                                            -{" "}
                                                                            {
                                                                                milestone.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {selectedSubmilestones.includes(
                                                                        milestone.id.toString()
                                                                    ) && (
                                                                        <div className="flex-shrink-0">
                                                                            <svg
                                                                                className="w-4 h-4 text-green-500"
                                                                                fill="currentColor"
                                                                                viewBox="0 0 20 20"
                                                                            >
                                                                                <path
                                                                                    fillRule="evenodd"
                                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                    clipRule="evenodd"
                                                                                />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </label>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                {isMilestoneDropdownOpen && (
                                    <div
                                        className="fixed inset-0 z-5"
                                        onClick={() =>
                                            setIsMilestoneDropdownOpen(false)
                                        }
                                    />
                                )}
                            </div>

                            {/* Employee Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Employees{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <div className="flex flex-wrap items-center min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 bg-white shadow-sm">
                                        {/* Search Icon */}
                                        <div className="flex-shrink-0 mr-2">
                                            <svg
                                                className="h-4 w-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>

                                        {/* Selected Employees Chips */}
                                        {selectedEmployeeDetails.map(
                                            (employee) => (
                                                <div
                                                    key={employee.id}
                                                    className="inline-flex items-center px-2 py-1 mr-2 mb-1 mt-1 rounded-full text-xs font-medium bg-custom-lightestgreen border text-custom-solidgreen shadow-sm"
                                                >
                                                    <span className="mr-1">
                                                        {employee.fullname}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleEmployeeToggle(
                                                                employee.id
                                                            )
                                                        }
                                                        className="text-custom-solidgreen hover:text-red-600 transition-colors duration-200"
                                                        disabled={
                                                            loadingStates.assign
                                                        }
                                                    >
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        {/* Input Field */}
                                        <input
                                            type="text"
                                            placeholder={
                                                selectedEmployeeDetails.length >
                                                0
                                                    ? ""
                                                    : "Search for employees..."
                                            }
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            onFocus={() =>
                                                setIsDropdownOpen(true)
                                            }
                                            className="flex-1 min-w-[120px] border-0 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                                            disabled={loadingStates.assign}
                                        />
                                    </div>
                                    {searchTerm && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setIsDropdownOpen(false);
                                            }}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {isDropdownOpen && (
                                    <div className="relative">
                                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                            <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                                                <p className="text-sm font-medium text-gray-700">
                                                    Select Employee (
                                                    {filteredEmployees.length}{" "}
                                                    available)
                                                </p>
                                            </div>
                                            <div className="overflow-y-auto max-h-48">
                                                {filteredEmployees.length ===
                                                0 ? (
                                                    <div className="px-4 py-6 text-center text-gray-500">
                                                        <svg
                                                            className="w-8 h-8 mx-auto mb-2 text-gray-300"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                            />
                                                        </svg>
                                                        <p className="text-sm">
                                                            No employees found
                                                        </p>
                                                    </div>
                                                ) : (
                                                    filteredEmployees.map(
                                                        (emp) => (
                                                            <label
                                                                key={emp.id}
                                                                className="group px-4 py-3 cursor-pointer hover:bg-blue-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-all duration-200"
                                                            >
                                                                <div className="flex-shrink-0">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedEmployees.includes(
                                                                            emp.id.toString()
                                                                        )}
                                                                        onChange={() =>
                                                                            handleEmployeeToggle(
                                                                                emp.id
                                                                            )
                                                                        }
                                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="select-none font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                                                        {
                                                                            emp.fullname
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {selectedEmployees.includes(
                                                                    emp.id.toString()
                                                                ) && (
                                                                    <div className="flex-shrink-0">
                                                                        <svg
                                                                            className="w-4 h-4 text-green-500"
                                                                            fill="currentColor"
                                                                            viewBox="0 0 20 20"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </label>
                                                        )
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {isDropdownOpen && (
                                    <div
                                        className="fixed inset-0 z-5"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                )}
                            </div>

                            {/* Assignment Mode Selection */}
                            <div className="pt-4 border-t space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Assignment Mode
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="assignment-mode"
                                            value="replace"
                                            checked={
                                                assignmentMode === "replace"
                                            }
                                            onChange={(e) =>
                                                setAssignmentMode(
                                                    e.target.value
                                                )
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            disabled={loadingStates.assign}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Replace existing assignees
                                        </span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="assignment-mode"
                                            value="add"
                                            checked={assignmentMode === "add"}
                                            onChange={(e) =>
                                                setAssignmentMode(
                                                    e.target.value
                                                )
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            disabled={loadingStates.assign}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Add to existing assignees
                                        </span>
                                    </label>
                                </div>
                                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                    {assignmentMode === "replace"
                                        ? "⚠️ This will replace all current assignees with the selected employees."
                                        : "✅ This will add the selected employees to existing assignees without removing anyone."}
                                </div>
                            </div>

                            {/* Assign Button */}
                            <div className="pt-4">
                                <button
                                    onClick={handleAssign}
                                    disabled={
                                        selectedProjects.length === 0 ||
                                        selectedSubmilestones.length === 0 ||
                                        selectedEmployees.length === 0 ||
                                        loadingStates.assign
                                    }
                                    className="w-full px-4 py-2 gradient-btn5 text-white font-medium rounded-md disabled:bg-gray-400"
                                >
                                    {loadingStates.assign
                                        ? "Assigning..."
                                        : assignmentMode === "replace"
                                        ? "Replace Assignees"
                                        : "Add Assignees"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Projects Table */}
                    <div
                        className="lg:col-span-2 bg-white shadow-sm border rounded-lg flex flex-col h-full"
                        style={{ minHeight: "600px" }}
                    >
                        <div className="px-6 py-4 border-b">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Current Project Assignments
                                    </h3>
                                    <button
                                        onClick={fetchProjects}
                                        disabled={loadingStates.list}
                                        className="inline-flex items-center p-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        title={
                                            loadingStates.list
                                                ? "Refreshing..."
                                                : "Refresh table data"
                                        }
                                    >
                                        <svg
                                            className={`w-4 h-4 ${
                                                loadingStates.list
                                                    ? "animate-spin"
                                                    : ""
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                {projects.length > 0 && (
                                    <div className="text-sm text-gray-500">
                                        Showing {startIndex + 1}-
                                        {Math.min(endIndex, projects.length)} of{" "}
                                        {projects.length} projects
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col h-full overflow-hidden">
                            {loadingStates.list ? (
                                <div className="flex-1 flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <svg
                                            className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        <p className="text-gray-600">
                                            Loading projects...
                                        </p>
                                    </div>
                                </div>
                            ) : projects.length > 0 ? (
                                <>
                                    <div
                                        className="flex-1 overflow-x-auto overflow-y-auto"
                                        style={{
                                            maxHeight: "calc(100vh - 400px)",
                                            minHeight: "400px",
                                        }}
                                    >
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Project Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Assignees
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentProjects.map((p) => (
                                                    <React.Fragment
                                                        key={p.property_name}
                                                    >
                                                        <tr
                                                            className="hover:bg-gray-50 cursor-pointer"
                                                            onClick={() =>
                                                                handleProjectRowClick(
                                                                    p.property_name
                                                                )
                                                            }
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                                {
                                                                    p.property_name
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                {assignees[
                                                                    p
                                                                        .property_name
                                                                ] !== undefined
                                                                    ? `${
                                                                          assignees[
                                                                              p
                                                                                  .property_name
                                                                          ]
                                                                              .length
                                                                      } assignee(s)`
                                                                    : `${
                                                                          p.assignees_count ??
                                                                          0
                                                                      } assignee(s)`}
                                                            </td>
                                                        </tr>
                                                        {expandedProjects[
                                                            p.property_name
                                                        ] && (
                                                            <tr>
                                                                <td
                                                                    colSpan="2"
                                                                    className="p-0 bg-slate-50"
                                                                >
                                                                    <div className="p-4">
                                                                        <h4 className="text-md font-semibold text-gray-800 mb-2">
                                                                            Milestones
                                                                            for{" "}
                                                                            {
                                                                                p.property_name
                                                                            }
                                                                        </h4>
                                                                        {!projectMilestones[
                                                                            p
                                                                                .property_name
                                                                        ] ? (
                                                                            <div className="text-sm text-gray-500">
                                                                                Loading
                                                                                milestones...
                                                                            </div>
                                                                        ) : projectMilestones[
                                                                              p
                                                                                  .property_name
                                                                          ]
                                                                              .length ===
                                                                          0 ? (
                                                                            <div className="text-sm text-gray-500">
                                                                                No
                                                                                milestones
                                                                                found
                                                                                for
                                                                                this
                                                                                project.
                                                                            </div>
                                                                        ) : (
                                                                            <ul className="space-y-2">
                                                                                {projectMilestones[
                                                                                    p
                                                                                        .property_name
                                                                                ].map(
                                                                                    (
                                                                                        milestone
                                                                                    ) => {
                                                                                        const assigneeKey = `${p.property_name}-${milestone.id}`;
                                                                                        const isMilestoneExpanded =
                                                                                            !!expandedMilestones[
                                                                                                assigneeKey
                                                                                            ];
                                                                                        const milestoneAssignees =
                                                                                            assignees[
                                                                                                assigneeKey
                                                                                            ];

                                                                                        return (
                                                                                            <li
                                                                                                key={
                                                                                                    milestone.id
                                                                                                }
                                                                                                className="bg-white p-3 rounded-md border"
                                                                                            >
                                                                                                <div
                                                                                                    className="flex justify-between items-center cursor-pointer hover:bg-gray-50 -m-3 p-3"
                                                                                                    onClick={() =>
                                                                                                        handleMilestoneRowClick(
                                                                                                            p.property_name,
                                                                                                            milestone.id
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    <div className="flex items-center">
                                                                                                        {isMilestoneExpanded ? (
                                                                                                            <ChevronDownIcon className="h-4 w-4 mr-2 text-gray-600" />
                                                                                                        ) : (
                                                                                                            <ChevronRightIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                                                                        )}
                                                                                                        <span className="font-medium text-gray-800">
                                                                                                            {
                                                                                                                milestone.name
                                                                                                            }
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                                                                        {
                                                                                                            milestone.assignees_count
                                                                                                        }{" "}
                                                                                                        assignee(s)
                                                                                                    </span>
                                                                                                </div>
                                                                                                {isMilestoneExpanded && (
                                                                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                                                                        {!milestoneAssignees ? (
                                                                                                            <p className="text-sm text-gray-500">
                                                                                                                Loading
                                                                                                                assignees...
                                                                                                            </p>
                                                                                                        ) : milestoneAssignees.length >
                                                                                                          0 ? (
                                                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                                                {milestoneAssignees.map(
                                                                                                                    (
                                                                                                                        assignee
                                                                                                                    ) => (
                                                                                                                        <div
                                                                                                                            key={
                                                                                                                                assignee.id
                                                                                                                            }
                                                                                                                            className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded"
                                                                                                                        >
                                                                                                                            <p className="text-sm">
                                                                                                                                {
                                                                                                                                    assignee.fullname
                                                                                                                                }
                                                                                                                            </p>
                                                                                                                            <button
                                                                                                                                onClick={() =>
                                                                                                                                    handleRemoveAssignee(
                                                                                                                                        p.property_name,
                                                                                                                                        milestone.id,
                                                                                                                                        assignee.id
                                                                                                                                    )
                                                                                                                                }
                                                                                                                                disabled={
                                                                                                                                    loadingStates.remove ===
                                                                                                                                    `${p.property_name}-${milestone.id}-${assignee.id}`
                                                                                                                                }
                                                                                                                                className="text-red-500 hover:text-red-700 text-xs disabled:text-gray-300"
                                                                                                                            >
                                                                                                                                {loadingStates.remove ===
                                                                                                                                `${p.property_name}-${milestone.id}-${assignee.id}`
                                                                                                                                    ? "..."
                                                                                                                                    : "Remove"}
                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                )}
                                                                                                            </div>
                                                                                                        ) : (
                                                                                                            <p className="text-sm text-gray-500">
                                                                                                                No
                                                                                                                assignees
                                                                                                                for
                                                                                                                this
                                                                                                                milestone.
                                                                                                            </p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                            </li>
                                                                                        );
                                                                                    }
                                                                                )}
                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-700">
                                                    Page {currentPage} of{" "}
                                                    {totalPages}
                                                </div>
                                                <ReactPaginate
                                                    previousLabel={
                                                        <MdKeyboardArrowLeft className="text-[#404B52]" />
                                                    }
                                                    nextLabel={
                                                        <MdKeyboardArrowRight className="text-[#404B52]" />
                                                    }
                                                    breakLabel={"..."}
                                                    pageCount={totalPages}
                                                    marginPagesDisplayed={2}
                                                    pageRangeDisplayed={2}
                                                    onPageChange={(data) =>
                                                        handlePageChange(
                                                            data.selected + 1
                                                        )
                                                    }
                                                    containerClassName={
                                                        "flex gap-2"
                                                    }
                                                    previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                                                    nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                                                    pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                                                    activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-white rounded-[4px] text-[12px]"
                                                    pageLinkClassName="w-full h-full flex justify-center items-center"
                                                    activeLinkClassName="w-full h-full flex justify-center items-center"
                                                    disabledLinkClassName="text-gray-300 cursor-not-allowed"
                                                    forcePage={currentPage - 1}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No Projects Found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Projects are derived from the 'Taken Out
                                        Accounts' table.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectAssigneeComponent;
