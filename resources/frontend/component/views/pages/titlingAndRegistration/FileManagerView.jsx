import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardBody,
    Typography,
    Input,
    Select,
    Option,
    Button,
    Collapse,
    IconButton,
} from "@material-tailwind/react";
import {
    MagnifyingGlassIcon,
    FolderIcon,
    DocumentIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    Squares2X2Icon,
    ListBulletIcon,
} from "@heroicons/react/24/outline";

// File type configuration - same as AccountFilesModal
const getFileType = (extension) => {
    const fileTypes = {
        jpg: {
            color: "text-purple-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        jpeg: {
            color: "text-purple-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        png: {
            color: "text-purple-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        gif: {
            color: "text-pink-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        webp: {
            color: "text-purple-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        svg: {
            color: "text-orange-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        pdf: {
            color: "text-red-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/9496/9496432.png"
                    alt="PDF file"
                />
            ),
        },
        docx: {
            color: "text-blue-500",
            icon: (
                <svg
                    className="w-full h-full"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                    <path d="M10 9H8v2h2V9zm4 0h-2v2h2V9zm-4 4H8v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
            ),
        },
        doc: {
            color: "text-blue-500",
            icon: (
                <svg
                    className="w-full h-full"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                    <path d="M10 9H8v2h2V9zm4 0h-2v2h2V9zm-4 4H8v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
            ),
        },
        xlsx: {
            color: "text-green-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
                    alt="Excel file"
                />
            ),
        },
        xls: {
            color: "text-green-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
                    alt="Excel file"
                />
            ),
        },
        csv: {
            color: "text-green-600",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
                    alt="CSV file"
                />
            ),
        },
        default: {
            color: "text-gray-500",
            icon: (
                <svg
                    className="w-full h-full"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                </svg>
            ),
        },
    };
    return fileTypes[extension] || fileTypes.default;
};

// File Card Component - same as AccountFilesModal
const FileCard = ({ file, onClick }) => {
    const displayName =
        file.file_title || file.file_name || file.name || "Unknown File";
    const sourceFileName = file.file_name || file.name || displayName;
    const extension = sourceFileName.split(".").pop()?.toLowerCase();
    const { color, icon } = getFileType(extension);
    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
        extension
    );

    const uploadedBy =
        file.uploaded_by?.fullname ||
        file.uploaded_by?.name ||
        file.uploaded_by ||
        file.uploaded_by_name ||
        file.user_name ||
        "User Name";

    const uploadDate = file.created_at
        ? new Date(file.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "Unknown Date";

    return (
        <div
            className="w-[200px] h-[200px] rounded-xl border-2 border-gray-200 bg-white shadow-md p-2 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onClick(file)}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center min-w-0">
                    <div
                        className={`w-6 h-6 flex items-center justify-center shrink-0 ${color}`}
                    >
                        {icon}
                    </div>
                    <span className="ml-2 text-xs font-medium text-gray-800 truncate">
                        {displayName}
                    </span>
                </div>
                <button
                    className="text-gray-400 hover:text-gray-600 text-sm shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    ⋮
                </button>
            </div>

            <div className="h-[140px] flex items-center justify-center border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
                {isImage ? (
                    <img
                        src={file.file_path}
                        alt={displayName}
                        className="w-full h-full object-cover"
                    />
                ) : extension === "pdf" ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <embed
                            src={file.file_path}
                            type="application/pdf"
                            className="w-full h-full"
                        />
                        <div
                            className={`hidden items-center justify-center w-full h-full text-4xl ${color}`}
                        >
                            {icon}
                        </div>
                    </div>
                ) : extension === "csv" ||
                  extension === "xlsx" ||
                  extension === "xls" ? (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                        <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                file.file_path
                            )}`}
                            className="w-full h-full border-0"
                        />
                        <div
                            className={`hidden items-center justify-center w-full h-full text-4xl ${color}`}
                        >
                            {icon}
                        </div>
                    </div>
                ) : (
                    <div className={`text-4xl ${color}`}>{icon}</div>
                )}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-600 mt-2 px-1">
                <span className="truncate">{uploadedBy}</span>
                <span>{uploadDate}</span>
            </div>
        </div>
    );
};

// Sidebar Step Component
const SidebarStep = ({
    step,
    isSelected,
    onClick,
    isExpanded,
    onToggle,
    selectedMilestone,
}) => {
    console.log(
        "SidebarStep render:",
        step.id,
        step.name,
        "Milestones:",
        step.milestones?.length || 0
    ); // Debug log

    return (
        <div className="mb-1">
            <div
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                }`}
                onClick={onClick}
            >
                <div className="flex items-center">
                    <FolderIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium truncate">
                        {step.name || "Unnamed Step"}
                    </span>
                </div>
                {step.milestones && step.milestones.length > 0 && (
                    <IconButton
                        variant="text"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                    >
                        {isExpanded ? (
                            <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                            <ChevronRightIcon className="w-4 h-4" />
                        )}
                    </IconButton>
                )}
            </div>

            {step.milestones && step.milestones.length > 0 && (
                <Collapse open={isExpanded}>
                    <div className="ml-4 mt-1">
                        {step.milestones.map((milestone) => {
                            console.log(
                                "Rendering milestone:",
                                milestone.id,
                                milestone.name
                            ); // Debug log
                            return (
                                <SidebarMilestone
                                    key={`milestone-${step.id}-${milestone.id}`}
                                    milestone={milestone}
                                    isSelected={
                                        selectedMilestone?.id === milestone.id
                                    }
                                    onClick={() => onClick(step, milestone)}
                                />
                            );
                        })}
                    </div>
                </Collapse>
            )}
        </div>
    );
};

// Sidebar Milestone Component
const SidebarMilestone = ({ milestone, isSelected, onClick }) => {
    const fileCount = milestone.files ? milestone.files.length : 0;
    console.log(
        "SidebarMilestone render:",
        milestone.id,
        milestone.name,
        "Files:",
        fileCount
    ); // Debug log

    return (
        <div
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                isSelected ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
            }`}
            onClick={onClick}
        >
            <div className="flex items-center">
                <DocumentIcon className="w-4 h-4 mr-2" />
                <span className="text-sm truncate">
                    {milestone.name || "Unnamed Milestone"}
                </span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {fileCount}
            </span>
        </div>
    );
};

const FileManagerView = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedStep, setSelectedStep] = useState(null);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [viewType, setViewType] = useState("grid");
    const [sortBy, setSortBy] = useState("name");
    const [expandedSteps, setExpandedSteps] = useState({});
    const [accounts, setAccounts] = useState([]);
    const [workOrderGroups, setWorkOrderGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all accounts with their files structure
    const fetchAllAccounts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/file-manager/accounts", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Remove Authorization header since we moved the routes outside auth middleware
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch accounts");
            }

            const data = await response.json();
            console.log("API Response:", data); // Debug log
            if (data.success) {
                // Ensure each account has proper structure
                const normalizedAccounts = data.data.map((account) => ({
                    ...account,
                    steps: account.steps || [],
                    milestones: account.milestones || [],
                }));
                console.log("Normalized accounts:", normalizedAccounts); // Debug log
                setAccounts(normalizedAccounts);
            } else {
                throw new Error(data.message || "Failed to fetch accounts");
            }
        } catch (err) {
            setError(err.message);
            console.error("Error fetching accounts:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Search accounts
    const searchAccounts = async (searchQuery) => {
        if (!searchQuery.trim()) {
            fetchAllAccounts();
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/file-manager/accounts/search?search=${encodeURIComponent(
                    searchQuery
                )}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to search accounts");
            }

            const data = await response.json();
            console.log("Search API Response:", data); // Debug log
            if (data.success) {
                // Ensure each account has proper structure
                const normalizedAccounts = data.data.map((account) => ({
                    ...account,
                    steps: account.steps || [],
                    milestones: account.milestones || [],
                }));
                console.log("Normalized search accounts:", normalizedAccounts); // Debug log
                setAccounts(normalizedAccounts);
            } else {
                throw new Error(data.message || "Failed to search accounts");
            }
        } catch (err) {
            setError(err.message);
            console.error("Error searching accounts:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch files for a specific account and step
    const fetchStepFiles = async (accountId, workOrderTypeId) => {
        try {
            const response = await fetch(
                `/api/file-manager/accounts/${accountId}/work-order-type/${workOrderTypeId}/files`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // Remove Authorization header since we moved the routes outside auth middleware
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch step files");
            }

            const data = await response.json();
            return data.success ? data.data.files : [];
        } catch (err) {
            console.error("Error fetching step files:", err);
            return [];
        }
    };

    // Fetch files for a specific milestone
    const fetchMilestoneFiles = async (accountId, submilestoneId) => {
        try {
            const response = await fetch(
                `/api/file-manager/accounts/${accountId}/submilestone/${submilestoneId}/files`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // Remove Authorization header since we moved the routes outside auth middleware
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch milestone files");
            }

            const data = await response.json();
            return data.success ? data.data.files : [];
        } catch (err) {
            console.error("Error fetching milestone files:", err);
            return [];
        }
    };

    // Initialize component
    useEffect(() => {
        fetchAllAccounts();
    }, []);

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                searchAccounts(searchTerm);
            } else {
                fetchAllAccounts();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Reset selections when search term changes
    useEffect(() => {
        console.log("Search term changed, resetting selections"); // Debug log
        setSelectedAccount(null);
        setSelectedStep(null);
        setSelectedMilestone(null);
        setExpandedSteps({});
    }, [searchTerm]);

    // Get files for current selection
    const currentFiles = useMemo(() => {
        console.log("Computing currentFiles for:", {
            selectedAccount: selectedAccount?.id,
            selectedStep: selectedStep?.id,
            selectedMilestone: selectedMilestone?.id,
        }); // Debug log

        if (!selectedAccount) return [];

        let files = [];

        if (selectedMilestone) {
            // Show files for specific milestone
            files = selectedMilestone.files ? [...selectedMilestone.files] : [];
            console.log("Files from milestone:", files.length); // Debug log
        } else if (selectedStep) {
            // Show files for all milestones in the step
            if (selectedStep.milestones) {
                selectedStep.milestones.forEach((milestone) => {
                    if (milestone.files) {
                        files = files.concat([...milestone.files]);
                    }
                });
            }
            console.log("Files from step:", files.length); // Debug log
        } else {
            // Show all files for the account
            if (selectedAccount.steps && selectedAccount.steps.length > 0) {
                selectedAccount.steps.forEach((step) => {
                    if (step.milestones && step.milestones.length > 0) {
                        step.milestones.forEach((milestone) => {
                            if (milestone.files) {
                                files = files.concat([...milestone.files]);
                            }
                        });
                    }
                });
            }
            console.log("Files from account:", files.length); // Debug log
        }

        // Remove duplicates by document_id
        const uniqueFiles = files.filter(
            (file, index, self) =>
                index ===
                self.findIndex((f) => f.document_id === file.document_id)
        );

        console.log("Unique files:", uniqueFiles.length); // Debug log

        return uniqueFiles.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return (a.file_title || a.file_name).localeCompare(
                        b.file_title || b.file_name
                    );
                case "date":
                    return new Date(b.created_at) - new Date(a.created_at);
                case "type":
                    const aExt = (a.file_name || "").split(".").pop();
                    const bExt = (b.file_name || "").split(".").pop();
                    return aExt.localeCompare(bExt);
                default:
                    return 0;
            }
        });
    }, [selectedAccount, selectedStep, selectedMilestone, sortBy]);

    const handleAccountSelect = async (account) => {
        console.log("Selected account:", account); // Debug log
        console.log("Account steps:", account.steps); // Debug log

        // Reset all selections and state when switching accounts
        setSelectedStep(null);
        setSelectedMilestone(null);
        setExpandedSteps({});

        // Check if the account has full structure (steps with milestones)
        const hasFullStructure =
            account.steps &&
            account.steps.length > 0 &&
            account.steps.some(
                (step) => step.milestones && step.milestones.length > 0
            );

        if (!hasFullStructure) {
            console.log(
                "Account lacks full structure - fetching from structure API"
            ); // Debug log
            try {
                const response = await fetch(
                    `/api/file-manager/accounts/${account.id}/structure`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        console.log("Fresh account structure:", data.data); // Debug log
                        setSelectedAccount(data.data);
                        return;
                    }
                }
            } catch (err) {
                console.error("Error fetching account structure:", err);
            }
        }

        // Normalize the account structure to ensure consistency
        const normalizedAccount = {
            ...account,
            steps: (account.steps || []).map((step) => ({
                ...step,
                milestones: (step.milestones || []).map((milestone) => ({
                    ...milestone,
                    files: milestone.files || [],
                })),
            })),
        };

        console.log("Normalized selected account:", normalizedAccount); // Debug log

        // Set the selected account with normalized data
        setSelectedAccount(normalizedAccount);
    };

    const handleStepSelect = async (step, milestone = null) => {
        console.log("Step selected:", step, "Milestone:", milestone); // Debug log

        // Reset milestone selection when selecting a new step
        if (!milestone) {
            setSelectedMilestone(null);
        }

        setSelectedStep(step);
        setSelectedMilestone(milestone);

        // If selecting a milestone, fetch its files
        if (milestone && selectedAccount) {
            try {
                const files = await fetchMilestoneFiles(
                    selectedAccount.id,
                    milestone.id
                );
                // Update the milestone with fresh files
                setSelectedMilestone({
                    ...milestone,
                    files: files,
                });
            } catch (err) {
                console.error("Error fetching milestone files:", err);
            }
        }
        // If selecting a step, fetch its files
        else if (step && selectedAccount && !milestone) {
            try {
                const files = await fetchStepFiles(selectedAccount.id, step.id);
                // Update the step with fresh files
                setSelectedStep({
                    ...step,
                    files: files,
                });
            } catch (err) {
                console.error("Error fetching step files:", err);
            }
        }
    };

    const toggleStepExpansion = (stepId) => {
        setExpandedSteps((prev) => ({
            ...prev,
            [stepId]: !prev[stepId],
        }));
    };

    const handleFileClick = (file) => {
        // Handle file click - open file viewer
        window.open(file.file_path, "_blank");
    };

    const getHeaderTitle = () => {
        if (selectedMilestone) {
            return `${selectedAccount.account_name} > ${selectedStep.name} > ${selectedMilestone.name}`;
        } else if (selectedStep) {
            return `${selectedAccount.account_name} > ${selectedStep.name}`;
        } else if (selectedAccount) {
            return `${selectedAccount.account_name} - All Files`;
        }
        return "File Manager";
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Top Header */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Typography
                            variant="h4"
                            className="text-gray-800 font-semibold"
                        >
                            File Manager
                        </Typography>
                        <Typography variant="small" className="text-gray-600">
                            Browse and manage account files
                        </Typography>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-80">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search accounts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                                size="lg"
                            />
                        </div>

                        {selectedAccount && (
                            <div className="flex items-center gap-3">
                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <Typography
                                        variant="small"
                                        className="text-gray-600 font-medium"
                                    >
                                        Sort by:
                                    </Typography>
                                    <Select
                                        value={sortBy}
                                        onChange={(value) => setSortBy(value)}
                                        className="w-28"
                                        size="sm"
                                    >
                                        <Option value="name">Name</Option>
                                        <Option value="date">Date</Option>
                                        <Option value="type">Type</Option>
                                    </Select>
                                </div>

                                {/* View Type Toggle */}
                                <div className="flex items-center gap-2">
                                    <Typography
                                        variant="small"
                                        className="text-gray-600 font-medium"
                                    >
                                        View:
                                    </Typography>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <Button
                                            variant={
                                                viewType === "grid"
                                                    ? "filled"
                                                    : "text"
                                            }
                                            size="sm"
                                            className={`px-3 py-1.5 rounded-md transition-all ${
                                                viewType === "grid"
                                                    ? "bg-white shadow-sm text-blue-600"
                                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                            }`}
                                            onClick={() => setViewType("grid")}
                                        >
                                            <Squares2X2Icon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant={
                                                viewType === "list"
                                                    ? "filled"
                                                    : "text"
                                            }
                                            size="sm"
                                            className={`px-3 py-1.5 rounded-md transition-all ${
                                                viewType === "list"
                                                    ? "bg-white shadow-sm text-blue-600"
                                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                            }`}
                                            onClick={() => setViewType("list")}
                                        >
                                            <ListBulletIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - File Tree */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    {/* Accounts Section */}
                    <div className="border-b border-gray-200 p-4 max-h-60 overflow-y-auto">
                        <Typography
                            variant="h6"
                            className="mb-3 text-gray-800 font-semibold"
                        >
                            Accounts
                        </Typography>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <Typography
                                    variant="small"
                                    className="text-red-600 mb-2"
                                >
                                    {error}
                                </Typography>
                                <Button
                                    size="sm"
                                    onClick={fetchAllAccounts}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="text-center py-8">
                                <Typography
                                    variant="small"
                                    className="text-gray-600"
                                >
                                    No accounts found
                                </Typography>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {accounts.map((account) => (
                                    <div
                                        key={`account-${account.id}`}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                                            selectedAccount?.id === account.id
                                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                                : "hover:bg-gray-50 border-transparent"
                                        }`}
                                        onClick={() =>
                                            handleAccountSelect(account)
                                        }
                                    >
                                        <div className="flex items-center">
                                            <FolderIcon className="w-5 h-5 mr-3 text-gray-500" />
                                            <div className="flex-1 min-w-0">
                                                <Typography
                                                    variant="small"
                                                    className="font-semibold truncate"
                                                >
                                                    {account.account_name}
                                                </Typography>
                                                <Typography
                                                    variant="small"
                                                    className="text-gray-500 truncate"
                                                >
                                                    {account.property_name ||
                                                        "No property name"}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Steps and Milestones Tree */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <Typography
                            variant="h6"
                            className="mb-3 text-gray-800 font-semibold"
                        >
                            File Structure
                        </Typography>

                        {!selectedAccount ? (
                            <div className="text-center py-8">
                                <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <Typography
                                    variant="small"
                                    className="text-gray-500"
                                >
                                    Select an account to view its file structure
                                </Typography>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {/* Account Root */}
                                <div
                                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                                        !selectedStep && !selectedMilestone
                                            ? "bg-blue-100 text-blue-700"
                                            : "hover:bg-gray-100"
                                    }`}
                                    onClick={() => {
                                        setSelectedStep(null);
                                        setSelectedMilestone(null);
                                    }}
                                >
                                    <FolderIcon className="w-4 h-4 mr-2" />
                                    <Typography
                                        variant="small"
                                        className="font-medium"
                                    >
                                        {selectedAccount.account_name}
                                    </Typography>
                                </div>

                                {/* Steps Tree */}
                                {(() => {
                                    console.log(
                                        "Rendering steps for account:",
                                        selectedAccount.id,
                                        "Steps:",
                                        selectedAccount.steps
                                    );

                                    if (
                                        !selectedAccount.steps ||
                                        selectedAccount.steps.length === 0
                                    ) {
                                        return (
                                            <div className="ml-6 py-4">
                                                <Typography
                                                    variant="small"
                                                    className="text-gray-500"
                                                >
                                                    No steps available for this
                                                    account
                                                </Typography>
                                            </div>
                                        );
                                    }

                                    return selectedAccount.steps.map((step) => {
                                        console.log(
                                            "Rendering step:",
                                            step.id,
                                            step.name
                                        );
                                        return (
                                            <div
                                                key={`step-${selectedAccount.id}-${step.id}`}
                                                className="ml-4"
                                            >
                                                <SidebarStep
                                                    step={step}
                                                    isSelected={
                                                        selectedStep?.id ===
                                                        step.id
                                                    }
                                                    onClick={() =>
                                                        handleStepSelect(step)
                                                    }
                                                    isExpanded={
                                                        expandedSteps[step.id]
                                                    }
                                                    onToggle={() =>
                                                        toggleStepExpansion(
                                                            step.id
                                                        )
                                                    }
                                                    selectedMilestone={
                                                        selectedMilestone
                                                    }
                                                />
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - File Display */}
                <div className="flex-1 flex flex-col">
                    {/* Breadcrumb Header */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Typography
                                    variant="small"
                                    className="font-medium"
                                >
                                    {getHeaderTitle()}
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="text-gray-500"
                                >
                                    • {currentFiles.length} files
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Files Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {!selectedAccount ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <Typography
                                        variant="h6"
                                        className="text-gray-600 mb-2"
                                    >
                                        Select an Account
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="text-gray-500"
                                    >
                                        Choose an account from the left panel to
                                        view its files
                                    </Typography>
                                </div>
                            </div>
                        ) : currentFiles.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <Typography
                                        variant="h6"
                                        className="text-gray-600 mb-2"
                                    >
                                        No Files Found
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="text-gray-500"
                                    >
                                        No files have been uploaded for this
                                        selection
                                    </Typography>
                                </div>
                            </div>
                        ) : viewType === "grid" ? (
                            <div className="flex flex-wrap gap-4">
                                {currentFiles.map((file, index) => (
                                    <FileCard
                                        key={`file-${selectedAccount?.id}-${file.document_id}-${index}`}
                                        file={file}
                                        onClick={handleFileClick}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {currentFiles.map((file, index) => (
                                    <div
                                        key={`file-list-${selectedAccount?.id}-${file.document_id}-${index}`}
                                        className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleFileClick(file)}
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center mr-3">
                                            {
                                                getFileType(
                                                    (file.file_name || "")
                                                        .split(".")
                                                        .pop()
                                                        ?.toLowerCase()
                                                ).icon
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <Typography
                                                variant="small"
                                                className="font-medium"
                                            >
                                                {file.file_title ||
                                                    file.file_name}
                                            </Typography>
                                            <Typography
                                                variant="small"
                                                className="text-gray-500"
                                            >
                                                {file.uploaded_by?.fullname ||
                                                    file.uploaded_by ||
                                                    "Unknown User"}
                                            </Typography>
                                        </div>
                                        <div className="text-right">
                                            <Typography
                                                variant="small"
                                                className="text-gray-500"
                                            >
                                                {file.created_at
                                                    ? new Date(
                                                          file.created_at
                                                      ).toLocaleDateString()
                                                    : "Unknown Date"}
                                            </Typography>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileManagerView;
