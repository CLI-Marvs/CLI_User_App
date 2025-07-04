import React, { useState, useEffect, useMemo, useCallback } from "react";
import apiService from "../../../component/servicesApi/apiService";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const ProjectAssigneeComponent = () => {
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [projectSubmilestones, setProjectSubmilestones] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedSubmilestone, setSelectedSubmilestone] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [loadingStates, setLoadingStates] = useState({
        list: true,
        assign: false,
        remove: null, 
        submilestones: false,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [expandedProjects, setExpandedProjects] = useState({}); // Tracks expanded project rows
    const [expandedMilestones, setExpandedMilestones] = useState({}); // Tracks expanded milestone rows
    const [projectMilestones, setProjectMilestones] = useState({});
    const [assignees, setAssignees] = useState({});

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

    const fetchSubmilestonesForProject = useCallback((projectName) => {
        if (!projectName) {
            setProjectSubmilestones([]);
            return;
        }
        setLoadingStates((s) => ({ ...s, submilestones: true }));
        apiService
            .get(`/projects/${encodeURIComponent(projectName)}/submilestones`)
            .then((res) => {
                setProjectSubmilestones(res.data);
            })
            .catch((err) => {
                console.error(`Failed to fetch submilestones for ${projectName}`, err);
                setProjectSubmilestones([]);
            })
            .finally(() => {
                setLoadingStates((s) => ({ ...s, submilestones: false }));
            });
    }, []);

    useEffect(() => {
        fetchSubmilestonesForProject(selectedProject);
        setSelectedSubmilestone("");
        setSelectedEmployees([]);
    }, [selectedProject, fetchSubmilestonesForProject]);

    const fetchAssignees = useCallback(async (projectName, submilestoneId) => {
        const key = `${projectName}-${submilestoneId}`;
        try {
            const response = await apiService.get(
                `/projects/${encodeURIComponent(projectName)}/milestones/${submilestoneId}/assignees`
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
                        .get(`/projects/${encodeURIComponent(projectName)}/submilestones`)
                        .then((res) => {
                            setProjectMilestones((prev) => ({ ...prev, [projectName]: res.data }));
                        })
                        .catch((err) => {
                            console.error(`Failed to fetch milestones for project row ${projectName}`, err);
                            setProjectMilestones((prev) => ({ ...prev, [projectName]: [] }));
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
        setSelectedEmployees((prev) => {
            const employeeIdStr = employeeId.toString();
            return prev.includes(employeeIdStr)
                ? prev.filter((id) => id !== employeeIdStr)
                : [...prev, employeeIdStr];
        });
    }, []);

    const handleAssign = useCallback(() => {
        if (!selectedProject || !selectedSubmilestone || selectedEmployees.length === 0) return;

        setLoadingStates((s) => ({ ...s, assign: true }));
        apiService
            .put(
                `/projects/${encodeURIComponent(selectedProject)}/milestones/${selectedSubmilestone}/assignees`,
                {
                    employee_ids: selectedEmployees,
                }
            )
            .then((res) => {
                setSelectedEmployees([]);
                setSearchTerm("");
                setIsDropdownOpen(false);
 
                const key = `${selectedProject}-${selectedSubmilestone}`;
                const newAssignees = res.data.assignees;
 
                // Update the detailed assignee list for the expanded milestone view
                setAssignees((prev) => ({
                    ...prev,
                    [key]: newAssignees,
                }));
 
                // Update the specific milestone's count within the projectMilestones state
                // This will make the count update in the UI without a full refresh.
                setProjectMilestones((prev) => {
                    const currentMilestones = prev[selectedProject] || [];
                    const updatedMilestones = currentMilestones.map((m) => (m.id.toString() === selectedSubmilestone ? { ...m, assignees_count: newAssignees.length } : m));
                    return { ...prev, [selectedProject]: updatedMilestones };
                });
 
                fetchProjects(); // Refetch projects to update the total assignee count for the project row
            })
            .catch((err) => {
                console.error("Failed to assign employees", err);
            })
            .finally(() => setLoadingStates((s) => ({ ...s, assign: false })));
    }, [selectedProject, selectedSubmilestone, selectedEmployees, fetchProjects]);

    const employeeMap = useMemo(() => {
        return employees.reduce((acc, emp) => {
            acc[emp.id] = emp;
            return acc;
        }, {});
    }, [employees]);

    const selectedEmployeeDetails = useMemo(() => {
        return selectedEmployees
            .map((id) => employeeMap[id])
            .filter(Boolean);
    }, [selectedEmployees, employeeMap]);

    const filteredEmployees = employees.filter((employee) =>
        employee.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl px-4 sm:px-6 lg:px-0 py-8">
                {/* Header Section */}
                <div className="bg-white border-b border-gray-50 rounded-lg mb-8">
                    <div className="py-6 border-b border-gray-200">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Project Assignee Management
                        </h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Assign employees to specific milestones within a project.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Assignment Section */}
                    <div className="lg:col-span-1 bg-white shadow-sm border border-gray-200 rounded-lg self-start">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Assign Employees
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Project Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Target Project{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedProject}
                                    onChange={(e) =>
                                        setSelectedProject(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    disabled={loadingStates.assign}
                                >
                                    <option value="">Select a project...</option>
                                    {projects.map((p) => (
                                        <option
                                            key={p.property_name}
                                            value={p.property_name}
                                        >
                                            {p.property_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Submilestone Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Target Milestone{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedSubmilestone}
                                    onChange={(e) =>
                                        setSelectedSubmilestone(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    disabled={!selectedProject || loadingStates.submilestones || loadingStates.assign}
                                >
                                    <option value="">
                                        {loadingStates.submilestones ? "Loading milestones..." : "Select a milestone..."}
                                    </option>
                                    {projectSubmilestones.map((sm) => (
                                        <option
                                            key={sm.id}
                                            value={sm.id}
                                        >
                                            {sm.work_order_type?.type_name} - {sm.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            {/* Employee Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Employees{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        onFocus={() => setIsDropdownOpen(true)}
                                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md"
                                        disabled={loadingStates.assign}
                                    />
                                </div>
                                {isDropdownOpen && (
                                    <div className="relative">
                                        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {filteredEmployees.map((emp) => (
                                                <label
                                                    key={emp.id}
                                                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center space-x-2"
                                                >
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
                                                        className="h-4 w-4 text-blue-600 rounded"
                                                    />
                                                    <span className="flex-1 select-none">
                                                        {emp.fullname}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {isDropdownOpen && (
                                    <div
                                        className="fixed inset-0 z-5"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                )}
                                {selectedEmployeeDetails.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEmployeeDetails.map(
                                                (emp) => (
                                                    <span
                                                        key={emp.id}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {emp.fullname}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Assign Button */}
                            <div className="pt-4 border-t">
                                <button
                                    onClick={handleAssign}
                                    disabled={
                                        !selectedProject ||
                                        !selectedSubmilestone ||
                                        selectedEmployees.length === 0 ||
                                        loadingStates.assign
                                    }
                                    className="w-full px-4 py-2 gradient-btn5 text-white font-medium rounded-md disabled:bg-gray-400"
                                >
                                    {loadingStates.assign
                                        ? "Assigning..."
                                        : "Assign Employees"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Projects Table */}
                    <div className="lg:col-span-2 bg-white shadow-sm border rounded-lg">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Current Project Assignments
                            </h3>
                        </div>
                        <div className="overflow-hidden">
                            {loadingStates.list ? (
                                <div className="text-center py-12">
                                    Loading projects...
                                </div>
                            ) : projects.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
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
                                            {projects.map((p) => (
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
                                                            {p.property_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {assignees[
                                                                p.property_name
                                                            ] !== undefined
                                                                ? `${
                                                                      assignees[
                                                                          p
                                                                              .property_name
                                                                      ].length
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
                                                                    <h4 className="text-md font-semibold text-gray-800 mb-2">Milestones for {p.property_name}</h4>
                                                                    {!projectMilestones[p.property_name] ? (
                                                                        <div className="text-sm text-gray-500">Loading milestones...</div>
                                                                    ) : projectMilestones[p.property_name].length === 0 ? (
                                                                        <div className="text-sm text-gray-500">No milestones found for this project.</div>
                                                                    ) : (
                                                                        <ul className="space-y-2">
                                                                            {projectMilestones[p.property_name].map((milestone) => {
                                                                                const assigneeKey = `${p.property_name}-${milestone.id}`;
                                                                                const isMilestoneExpanded = !!expandedMilestones[assigneeKey];
                                                                                const milestoneAssignees = assignees[assigneeKey];

                                                                                return (
                                                                                    <li key={milestone.id} className="bg-white p-3 rounded-md border">
                                                                                        <div
                                                                                            className="flex justify-between items-center cursor-pointer hover:bg-gray-50 -m-3 p-3"
                                                                                            onClick={() => handleMilestoneRowClick(p.property_name, milestone.id)}
                                                                                        >
                                                                                            <div className="flex items-center">
                                                                                                {isMilestoneExpanded ? <ChevronDownIcon className="h-4 w-4 mr-2 text-gray-600" /> : <ChevronRightIcon className="h-4 w-4 mr-2 text-gray-500" />}
                                                                                                <span className="font-medium text-gray-800">{milestone.name}</span>
                                                                                            </div>
                                                                                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                                                                {milestone.assignees_count} assignee(s)
                                                                                            </span>
                                                                                        </div>
                                                                                        {isMilestoneExpanded && (
                                                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                                                {!milestoneAssignees ? (
                                                                                                    <p className="text-sm text-gray-500">Loading assignees...</p>
                                                                                                ) : milestoneAssignees.length > 0 ? (
                                                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                                        {milestoneAssignees.map((assignee) => (
                                                                                                            <div key={assignee.id} className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded">
                                                                                                                <p className="text-sm">{assignee.fullname}</p>
                                                                                                                <button
                                                                                                                    onClick={() => handleRemoveAssignee(p.property_name, milestone.id, assignee.id)}
                                                                                                                    disabled={loadingStates.remove === `${p.property_name}-${milestone.id}-${assignee.id}`}
                                                                                                                    className="text-red-500 hover:text-red-700 text-xs disabled:text-gray-300"
                                                                                                                >
                                                                                                                    {loadingStates.remove === `${p.property_name}-${milestone.id}-${assignee.id}` ? "..." : "Remove"}
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <p className="text-sm text-gray-500">No assignees for this milestone.</p>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </li>
                                                                                );
                                                                            })}
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
                            ) : (
                                <div className="text-center py-12">
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No Projects Found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Projects are derived from the 'Taken
                                        Out Accounts' table.
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
