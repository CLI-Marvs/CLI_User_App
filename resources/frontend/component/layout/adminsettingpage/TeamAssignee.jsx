import React, { useState, useEffect } from "react";
import apiService from "../../../component/servicesApi/apiService";

const TeamAssigneeComponent = () => {
    const [teams, setTeams] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamDesc, setNewTeamDesc] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [expandedTeams, setExpandedTeams] = useState({});
    const [teamMembers, setTeamMembers] = useState({});

    useEffect(() => {
        fetchTeams();
        fetchEmployees();
    }, []);

    const fetchTeams = () => {
        setIsLoading(true);
        apiService
            .get("/teams")
            .then((res) => setTeams(res.data))
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
    };

    const fetchEmployees = () => {
        apiService
            .get("/employees")
            .then((res) => setEmployees(res.data))
            .catch((err) => console.error(err));
    };

    const fetchTeamMembers = async (teamId) => {
        try {
            const response = await apiService.get(`/teams/${teamId}/get-members`);
            setTeamMembers((prev) => ({
                ...prev,
                [teamId]: response.data,
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleTeamChange = (e) => {
        setSelectedTeam(e.target.value);
    };

    const handleTeamRowClick = (teamId) => {
        setExpandedTeams((prev) => {
            const isExpanded = prev[teamId];
            if (!isExpanded && !teamMembers[teamId]) {
                fetchTeamMembers(teamId);
            }
            return {
                ...prev,
                [teamId]: !isExpanded,
            };
        });
    };

    const handleRemoveMember = async (teamId, memberId) => {
        if (
            window.confirm(
                "Are you sure you want to remove this member from the team?"
            )
        ) {
            try {
                setIsLoading(true);
                await apiService.delete(`/teams/${teamId}/members/${memberId}`);
                // Refresh team members
                fetchTeamMembers(teamId);
                alert("Member removed successfully.");
            } catch (err) {
                console.error(err);
                alert("Error removing member. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredEmployees = employees.filter((employee) =>
        employee.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEmployeeToggle = (employeeId) => {
        setSelectedEmployees((prev) => {
            const employeeIdStr = employeeId.toString();
            if (prev.includes(employeeIdStr)) {
                return prev.filter((id) => id !== employeeIdStr);
            } else {
                return [...prev, employeeIdStr];
            }
        });
    };

    const handleRemoveEmployee = (employeeId) => {
        setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
    };

    const getSelectedEmployeeNames = () => {
        return selectedEmployees
            .map((id) => {
                const employee = employees.find(
                    (emp) => emp.id.toString() === id
                );
                return employee ? employee.fullname : "";
            })
            .filter((name) => name);
    };

    const handleAssign = () => {
        if (selectedTeam && selectedEmployees.length > 0) {
            setIsLoading(true);
            apiService
                .put(`/teams/${selectedTeam}/members`, {
                    employee_ids: selectedEmployees,
                })
                .then((res) => {
                    alert("Employees successfully assigned to team.");
                    setSelectedEmployees([]);
                    // Refresh team members if the team is expanded
                    if (expandedTeams[selectedTeam]) {
                        fetchTeamMembers(selectedTeam);
                    }
                })
                .catch((err) => console.error(err))
                .finally(() => setIsLoading(false));
        }
    };

    const handleAddTeam = () => {
        if (newTeamName.trim()) {
            setIsLoading(true);
            apiService
                .post("/teams", {
                    name: newTeamName,
                    description: newTeamDesc,
                })
                .then(() => {
                    alert("Team created successfully.");
                    setNewTeamName("");
                    setNewTeamDesc("");
                    fetchTeams();
                })
                .catch((err) => console.error(err))
                .finally(() => setIsLoading(false));
        }
    };

    const selectedTeamName = teams.find(
        (team) => team.id.toString() === selectedTeam
    )?.name;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl px-4 sm:px-6 lg:px-0 py-8">
                {/* Header Section */}
                <div className="bg-white border-b border-gray-50 rounded-lg mb-8">
                    <div className=" py-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div>
                                <h1 className="text-3xl font-bold leading-tight text-gray-900">
                                    Team Management
                                </h1>
                                <p className="mt-2 text-sm text-gray-700">
                                    Assign employees to teams and manage team
                                    structure
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Employee Assignment Section */}
                    <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="h-5 w-5 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Assign Employees
                                </h2>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Select a team and assign employees to it
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Team Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Target Team{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedTeam}
                                    onChange={handleTeamChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                    disabled={isLoading}
                                >
                                    <option value="">Select a team...</option>
                                    {teams.map((team) => (
                                        <option key={team.id} value={team.id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedTeamName && (
                                    <p className="text-xs text-gray-500">
                                        Selected:{" "}
                                        <span className="font-medium">
                                            {selectedTeamName}
                                        </span>
                                    </p>
                                )}
                            </div>

                            {/* Employee Selection with Search */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Employees{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                {/* Search Bar */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        onFocus={() => setIsDropdownOpen(true)}
                                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        disabled={isLoading}
                                    />
                                    <svg
                                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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

                                {/* Dropdown with filtered employees */}
                                {isDropdownOpen && (
                                    <div className="relative">
                                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {filteredEmployees.length > 0 ? (
                                                filteredEmployees.map(
                                                    (employee) => (
                                                        <div
                                                            key={employee.id}
                                                            onClick={() =>
                                                                handleEmployeeToggle(
                                                                    employee.id
                                                                )
                                                            }
                                                            className={`px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center space-x-2 ${
                                                                selectedEmployees.includes(
                                                                    employee.id.toString()
                                                                )
                                                                    ? "bg-blue-100 text-blue-900"
                                                                    : "text-gray-900"
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedEmployees.includes(
                                                                    employee.id.toString()
                                                                )}
                                                                onChange={() => {}} // Handled by parent onClick
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <span className="flex-1">
                                                                {
                                                                    employee.fullname
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <div className="px-3 py-2 text-gray-500">
                                                    No employees found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Close dropdown when clicking outside */}
                                {isDropdownOpen && (
                                    <div
                                        className="fixed inset-0 z-5"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                )}

                                {/* Selected employees tags */}
                                {selectedEmployees.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <p className="text-sm font-medium text-gray-700">
                                            Selected Employees (
                                            {selectedEmployees.length}):
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {getSelectedEmployeeNames().map(
                                                (name, index) => (
                                                    <span
                                                        key={
                                                            selectedEmployees[
                                                                index
                                                            ]
                                                        }
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {name}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveEmployee(
                                                                    selectedEmployees[
                                                                        index
                                                                    ]
                                                                )
                                                            }
                                                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800"
                                                        >
                                                            <svg
                                                                className="h-2 w-2"
                                                                stroke="currentColor"
                                                                fill="none"
                                                                viewBox="0 0 8 8"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="1.5"
                                                                    d="M1 1l6 6m0-6L1 7"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500">
                                    Click on employees to select/deselect them.{" "}
                                    {selectedEmployees.length} employee(s)
                                    selected.
                                </p>
                            </div>

                            {/* Assignment Button */}
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleAssign}
                                    disabled={
                                        !selectedTeam ||
                                        selectedEmployees.length === 0 ||
                                        isLoading
                                    }
                                    className="w-full px-4 py-2 gradient-btn5 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {isLoading
                                        ? "Processing..."
                                        : "Assign Employees"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Team Creation Section */}
                    <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="h-5 w-5 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Create New Team
                                </h2>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Add a new team to the organization
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Team Name Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Team Name{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) =>
                                        setNewTeamName(e.target.value)
                                    }
                                    placeholder="Enter team name..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Team Description Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Team Description
                                </label>
                                <textarea
                                    value={newTeamDesc}
                                    onChange={(e) =>
                                        setNewTeamDesc(e.target.value)
                                    }
                                    placeholder="Enter team description (optional)..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 resize-none"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Create Button */}
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleAddTeam}
                                    disabled={!newTeamName.trim() || isLoading}
                                    className="w-full px-4 py-2 gradient-btn5 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    <span>
                                        {isLoading
                                            ? "Creating..."
                                            : "Create Team"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Teams Table */}
                <div className="mt-8 bg-white shadow-sm border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Current Teams
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Click on any team to view and manage team members
                        </p>
                    </div>
                    <div className="overflow-hidden">
                        {teams.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Team Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Members
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teams.map((team) => (
                                            <React.Fragment key={team.id}>
                                                <tr
                                                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                    onClick={() =>
                                                        handleTeamRowClick(
                                                            team.id
                                                        )
                                                    }
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-5 w-5 mr-3">
                                                                <svg
                                                                    className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                                                                        expandedTeams[
                                                                            team
                                                                                .id
                                                                        ]
                                                                            ? "rotate-90"
                                                                            : ""
                                                                    }`}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M9 5l7 7-7 7"
                                                                    />
                                                                </svg>
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {team.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600 max-w-xs truncate">
                                                            {team.description ||
                                                                "No description available"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {teamMembers[
                                                                team.id
                                                            ]
                                                                ? `${
                                                                      teamMembers[
                                                                          team
                                                                              .id
                                                                      ].length
                                                                  } member(s)`
                                                                : "Click to load"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleTeamRowClick(
                                                                        team.id
                                                                    );
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                            >
                                                                {expandedTeams[
                                                                    team.id
                                                                ]
                                                                    ? "Hide Members"
                                                                    : "View Members"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {/* Expanded row for team members */}
                                                {expandedTeams[team.id] && (
                                                    <tr>
                                                        <td
                                                            colSpan="4"
                                                            className="px-6 py-0"
                                                        >
                                                            <div className="bg-gray-50 border-l-4 border-blue-400 py-4">
                                                                <div className="px-4">
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <h4 className="text-sm font-medium text-gray-900">
                                                                            Team
                                                                            Members
                                                                        </h4>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleTeamRowClick(
                                                                                    team.id
                                                                                )
                                                                            }
                                                                            className="text-gray-500 hover:text-gray-700 text-sm"
                                                                        >
                                                                            <svg
                                                                                className="h-4 w-4"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M6 18L18 6M6 6l12 12"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                    {teamMembers[
                                                                        team.id
                                                                    ] &&
                                                                    Array.isArray(
                                                                        teamMembers[
                                                                            team
                                                                                .id
                                                                        ]
                                                                    ) ? (
                                                                        teamMembers[
                                                                            team
                                                                                .id
                                                                        ]
                                                                            .length >
                                                                        0 ? (
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {teamMembers[
                                                                                    team
                                                                                        .id
                                                                                ].map(
                                                                                    (
                                                                                        member
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                member.id
                                                                                            }
                                                                                            className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-gray-200"
                                                                                        >
                                                                                            <div className="flex items-center space-x-3">
                                                                                                <div className="flex-shrink-0">
                                                                                                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                                                                        <span className="text-xs font-medium text-white">
                                                                                                            {member.fullname
                                                                                                                ? member.fullname
                                                                                                                      .charAt(
                                                                                                                          0
                                                                                                                      )
                                                                                                                      .toUpperCase()
                                                                                                                : "U"}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div>
                                                                                                    <p className="text-sm font-medium text-gray-900">
                                                                                                        {member.fullname ||
                                                                                                            "Unknown"}
                                                                                                    </p>
                                                                                                    {member.email && (
                                                                                                        <p className="text-xs text-gray-500">
                                                                                                            {
                                                                                                                member.email
                                                                                                            }
                                                                                                        </p>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    handleRemoveMember(
                                                                                                        team.id,
                                                                                                        member.id
                                                                                                    )
                                                                                                }
                                                                                                disabled={
                                                                                                    isLoading
                                                                                                }
                                                                                                className="text-red-600 hover:text-red-800 disabled:text-gray-400 p-1 rounded-full hover:bg-red-50 transition-colors duration-150"
                                                                                                title="Remove member from team"
                                                                                            >
                                                                                                <svg
                                                                                                    className="h-4 w-4"
                                                                                                    fill="none"
                                                                                                    stroke="currentColor"
                                                                                                    viewBox="0 0 24 24"
                                                                                                >
                                                                                                    <path
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        strokeWidth={
                                                                                                            2
                                                                                                        }
                                                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                                                    />
                                                                                                </svg>
                                                                                            </button>
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center py-4">
                                                                                <svg
                                                                                    className="mx-auto h-8 w-8 text-gray-400"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={
                                                                                            2
                                                                                        }
                                                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                                                    />
                                                                                </svg>
                                                                                <p className="mt-2 text-sm text-gray-500">
                                                                                    No
                                                                                    members
                                                                                    in
                                                                                    this
                                                                                    team
                                                                                    yet
                                                                                </p>
                                                                                <p className="text-xs text-gray-400 mt-1">
                                                                                    Use
                                                                                    the
                                                                                    assignment
                                                                                    section
                                                                                    above
                                                                                    to
                                                                                    add
                                                                                    members.
                                                                                </p>
                                                                            </div>
                                                                        )
                                                                    ) : (
                                                                        <div className="text-center py-4">
                                                                            <svg
                                                                                className="animate-spin h-5 w-5 text-blue-500 mx-auto"
                                                                                xmlns="http://www.w3.org/2000/svg"
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
                                                                                ></circle>
                                                                                <path
                                                                                    className="opacity-75"
                                                                                    fill="currentColor"
                                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                                ></path>
                                                                            </svg>
                                                                            <p className="mt-2 text-sm text-gray-500">
                                                                                Loading
                                                                                team
                                                                                members...
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
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
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No teams
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating a new team.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    "create-team-section"
                                                )
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                })
                                        }
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg
                                            className="-ml-1 mr-2 h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>
                                        New Team
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamAssigneeComponent;
