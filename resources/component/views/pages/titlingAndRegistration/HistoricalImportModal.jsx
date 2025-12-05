import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Info, Download, Database } from "lucide-react";
import { toast } from "react-toastify";
import apiService from "@/servicesApi/apiService";

const HistoricalImportModal = ({ isOpen, onClose, onSuccess }) => {
    const [selectedImportType, setSelectedImportType] = useState("new");
    const [createWorkOrders, setCreateWorkOrders] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const [systemStructure, setSystemStructure] = useState(null);
    const [loadingStructure, setLoadingStructure] = useState(false);
    const fileInputRef = useRef(null);

    // Load system structure when modal opens
    useEffect(() => {
        if (isOpen && !systemStructure) {
            fetchSystemStructure();
        }
    }, [isOpen]);

    const fetchSystemStructure = async () => {
        setLoadingStructure(true);
        try {
            const response = await apiService.get("/system/structure");
            setSystemStructure(response.data);
        } catch (error) {
            console.error("Failed to load system structure:", error);
            toast.error("Failed to load system structure", { autoClose: 3000 });
        } finally {
            setLoadingStructure(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setImportResults(null);
        setSelectedImportType("new");
        setCreateWorkOrders(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
        onClose();
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split('.').pop();

        const allowedExtensions = ['xlsx', 'xls', 'csv'];
        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
            "application/csv",
            "text/plain",
            "application/vnd.ms-excel.sheet.macroenabled.12",
            "text/comma-separated-values",
            ""
        ];

        if (!allowedExtensions.includes(fileExtension) && !allowedTypes.includes(file.type)) {
            alert(`Please upload a valid Excel (.xlsx, .xls) or CSV file. Current file type: ${file.type}, extension: ${fileExtension}`);
            return;
        }

        setSelectedFile(file);
        setImportResults(null);
    };

    const downloadTemplate = async () => {
        try {
            const response = await apiService.get(`/system/download-template?import_type=${selectedImportType}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${selectedImportType}_accounts_template_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
            URL.revokeObjectURL(link.href);

            toast.success("Template downloaded successfully!", { autoClose: 3000 });
        } catch (error) {
            console.error("Failed to download template:", error);
            toast.error("Failed to download template", { autoClose: 3000 });
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("import_type", selectedImportType);
            formData.append("create_work_orders", createWorkOrders ? "1" : "0");

            const shouldAutoAssign = selectedImportType === 'ongoing' && createWorkOrders;
            formData.append("auto_assign", shouldAutoAssign ? "1" : "0");

            const response = await apiService.post("/accounts/import-historical", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Accept": "application/json"
                }
            });

            if (response.status === 200) {
                const { message, stats } = response.data;

                setImportResults({
                    imported: stats.imported || 0,
                    updated: stats.updated || 0,
                    errors: stats.errors || 0,
                    warnings: stats.warnings || 0,
                    importedAccounts: stats.imported_accounts || [],
                    updatedAccounts: stats.updated_accounts || []
                });

                toast.success(message, { autoClose: 5000 });

                if (onSuccess) onSuccess();
            }
        } catch (error) {
            let errorMessage = "Import failed";

            if (error.response?.data?.error) {
                if (typeof error.response.data.error === 'object') {
                    const validationErrors = Object.entries(error.response.data.error)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join('\n');
                    errorMessage = `Validation failed:\n${validationErrors}`;
                } else {
                    errorMessage = error.response.data.error;
                }
            }

            toast.error(errorMessage, { autoClose: 8000 });
            console.error("Import error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" style={{ zIndex: 999999 }}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Import Accounts
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Upload accounts with accurate submilestone tracking
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Import Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Import Type
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                {
                                    value: 'new',
                                    label: 'New Accounts',
                                    desc: 'Fresh accounts to process from the beginning',
                                    icon: '✨'
                                },
                                {
                                    value: 'ongoing',
                                    label: 'Ongoing Accounts',
                                    desc: 'In-progress accounts at specific step',
                                    icon: '🔄'
                                },
                                {
                                    value: 'completed',
                                    label: 'Completed Accounts',
                                    desc: 'Finished accounts (archived)',
                                    icon: '✅'
                                }
                            ].map(type => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedImportType(type.value)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${selectedImportType === type.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{type.icon}</div>
                                    <div className="font-medium text-gray-900">{type.label}</div>
                                    <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System Structure Info */}
                    {systemStructure && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <Database className="w-5 h-5 text-green-600 mt-0.5" />
                                <div className="text-sm text-green-900">
                                    <div className="font-medium mb-1">System Structure Loaded</div>
                                    <div className="text-green-700">
                                        {systemStructure.total_work_order_types} Work Order Types • {' '}
                                        {systemStructure.total_submilestones} Submilestones • {' '}
                                        {systemStructure.total_checklists} Checklists
                                    </div>
                                    <div className="text-xs text-green-600 mt-2">
                                        ✓ Professional Excel template with actual system IDs
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-3">Import Options</h3>

                        {selectedImportType === 'ongoing' && (
                            <label className="flex items-start space-x-3 mb-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={createWorkOrders}
                                    onChange={(e) => setCreateWorkOrders(e.target.checked)}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Create Work Orders</div>
                                    <div className="text-sm text-gray-600">
                                        Automatically create work orders and assign employees
                                    </div>
                                </div>
                            </label>
                        )}

                        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-900">
                                {selectedImportType === 'completed' && (
                                    <>Completed accounts will have all checklists marked as done and be archived from active workflows.</>
                                )}
                                {selectedImportType === 'ongoing' && (
                                    <>Ongoing accounts will have checklists marked complete up to their current submilestone. Completion percentage is auto-calculated.</>
                                )}
                                {selectedImportType === 'new' && (
                                    <>New accounts will start from the beginning with 0% progress.</>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload File
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer block">
                                {selectedFile ? (
                                    <div className="flex items-center justify-center space-x-3">
                                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                                        <div className="text-left">
                                            <div className="font-medium text-gray-900">{selectedFile.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {(selectedFile.size / 1024).toFixed(2)} KB
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <div className="text-gray-900 font-medium mb-1">
                                            Click to upload or drag and drop
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Excel (.xlsx, .xls) or CSV files
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Template Download */}
                    <div>
                        <button
                            onClick={downloadTemplate}
                            disabled={loadingStructure}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            <span>
                                {loadingStructure
                                    ? 'Loading...'
                                    : `Download Professional Template for ${selectedImportType} accounts`
                                }
                            </span>
                        </button>
                        <p className="text-xs text-gray-500 mt-1 ml-6">
                            Excel template with green headers and actual system IDs
                        </p>
                    </div>

                    {/* Results */}
                    {importResults && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Import Complete</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="text-2xl font-bold text-green-700">{importResults.imported}</div>
                                    <div className="text-sm text-green-600">Imported</div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="text-2xl font-bold text-blue-700">{importResults.updated}</div>
                                    <div className="text-sm text-blue-600">Updated</div>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="text-2xl font-bold text-yellow-700">{importResults.warnings}</div>
                                    <div className="text-sm text-yellow-600">Warnings</div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="text-2xl font-bold text-red-700">{importResults.errors}</div>
                                    <div className="text-sm text-red-600">Errors</div>
                                </div>
                            </div>

                            {/* Account Details */}
                            {(importResults.importedAccounts?.length > 0 || importResults.updatedAccounts?.length > 0) && (
                                <div className="mt-6 space-y-4">
                                    {importResults.importedAccounts?.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">New Accounts Created</h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {importResults.importedAccounts.map((account, index) => (
                                                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm">
                                                        <div className="font-medium text-green-900">{account.account_name}</div>
                                                        <div className="text-green-700">
                                                            {account.contract_no} • {account.property_name} • {account.status}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {importResults.updatedAccounts?.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Accounts Updated</h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {importResults.updatedAccounts.map((account, index) => (
                                                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                                                        <div className="font-medium text-blue-900">{account.account_name}</div>
                                                        <div className="text-blue-700">
                                                            {account.contract_no} • {account.old_status} → {account.new_status}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-3">📋 Quick Guide</h3>
                        <div className="text-sm text-blue-800 space-y-2">
                            <div><strong>Required:</strong> contract_no, account_name</div>
                            <div><strong>Important:</strong> current_submilestone_id (use actual ID from template)</div>
                            <div><strong>Dates:</strong> Format as M/D/YYYY (e.g., 3/15/2024)</div>
                            <div><strong>Status:</strong> New, Ongoing, or Completed</div>
                            <div className="pt-2 mt-2 border-t border-blue-300">
                                <strong>Note:</strong> Completion percentage is auto-calculated based on completed checklists
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex space-x-3 justify-end">
                    <button
                        onClick={handleClose}
                        disabled={isUploading}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleImport}
                        disabled={!selectedFile || isUploading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {isUploading && (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        <Upload className="w-5 h-5" />
                        <span>Import Accounts</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default HistoricalImportModal;