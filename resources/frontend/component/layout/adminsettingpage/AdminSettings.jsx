import React, { useState, useEffect, useCallback } from 'react';
import apiService from "../../../component/servicesApi/apiService";
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    XMarkIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

// Enhanced Modal Component with better UX
const CrudModal = ({ isOpen, onClose, onSave, item, fields, title, loading = false }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (isOpen) {
            const initialData = fields.reduce((acc, field) => {
                acc[field.name] = item?.[field.name] || '';
                return acc;
            }, {});
            setFormData(initialData);
            setErrors({});
            setTouched({});
        }
    }, [item, fields, isOpen]);

    const validateForm = () => {
        const newErrors = {};
        fields.forEach(field => {
            if (field.required && !formData[field.name]?.trim()) {
                newErrors[field.name] = `${field.label || field.name.replace('_', ' ')} is required`;
            }
            if (field.minLength && formData[field.name]?.length < field.minLength) {
                newErrors[field.name] = `Must be at least ${field.minLength} characters`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        if (field.required && !formData[field.name]?.trim()) {
            setErrors(prev => ({ ...prev, [field.name]: `${field.label || field.name.replace('_', ' ')} is required` }));
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">{title}</h3>
                        <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={onClose}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSave}>
                        <div className="px-6 py-4">
                            <div className="space-y-6">
                                {fields.map(field => (
                                    <div key={field.name} className="space-y-1">
                                        <label 
                                            htmlFor={field.name} 
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            {field.label || field.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                name={field.name}
                                                id={field.name}
                                                rows={3}
                                                value={formData[field.name] || ''}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur(field)}
                                                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                                                    errors[field.name] 
                                                        ? 'ring-red-300 focus:ring-red-500' 
                                                        : 'ring-gray-300 focus:ring-indigo-600'
                                                }`}
                                                placeholder={field.placeholder}
                                            />
                                        ) : (
                                            <input
                                                type={field.type || 'text'}
                                                name={field.name}
                                                id={field.name}
                                                value={formData[field.name] || ''}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur(field)}
                                                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                                                    errors[field.name] 
                                                        ? 'ring-red-300 focus:ring-red-500' 
                                                        : 'ring-gray-300 focus:ring-indigo-600'
                                                }`}
                                                placeholder={field.placeholder}
                                            />
                                        )}
                                        
                                        {errors[field.name] && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                                {errors[field.name]}
                                            </p>
                                        )}
                                        
                                        {field.helpText && (
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <InformationCircleIcon className="h-4 w-4 mr-1" />
                                                {field.helpText}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                                        {item ? 'Update' : 'Create'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            icon: ExclamationTriangleIcon,
            iconColor: 'text-red-600',
            buttonColor: 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600'
        }
    };

    const { icon: Icon, iconColor, buttonColor } = typeStyles[type];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10`}>
                                <Icon className={`h-6 w-6 ${iconColor}`} />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">{title}</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">{message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${buttonColor}`}
                            onClick={onConfirm}
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminSettings = () => {
    const [workOrderTypes, setWorkOrderTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({ 
        isOpen: false, 
        type: null, 
        mode: 'add', 
        item: null, 
        parentId: null,
        loading: false 
    });
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, 
        type: null, 
        id: null, 
        title: '', 
        message: '' 
    });
    
    // Collapsible state management
    const [expandedWorkOrderTypes, setExpandedWorkOrderTypes] = useState(new Set());
    const [expandedSubmilestones, setExpandedSubmilestones] = useState(new Set());
    const [expandAllWOT, setExpandAllWOT] = useState(false);

    // Toggle functions for collapsible sections
    const toggleWorkOrderType = (id) => {
        const newExpanded = new Set(expandedWorkOrderTypes);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedWorkOrderTypes(newExpanded);
    };

    const toggleSubmilestone = (id) => {
        const newExpanded = new Set(expandedSubmilestones);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedSubmilestones(newExpanded);
    };

    const toggleAllWorkOrderTypes = () => {
        if (expandAllWOT) {
            setExpandedWorkOrderTypes(new Set());
            setExpandedSubmilestones(new Set());
        } else {
            const allWOTIds = new Set(workOrderTypes.map(wot => wot.id));
            const allSubmilestoneIds = new Set();
            workOrderTypes.forEach(wot => {
                if (wot.submilestones) {
                    wot.submilestones.forEach(sub => allSubmilestoneIds.add(sub.id));
                }
            });
            setExpandedWorkOrderTypes(allWOTIds);
            setExpandedSubmilestones(allSubmilestoneIds);
        }
        setExpandAllWOT(!expandAllWOT);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiService.get('/admin/settings/work-order-types');
            setWorkOrderTypes(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch work order settings. Please try again.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openModal = (type, mode, item = null, parentId = null) => {
        setModalState({ 
            isOpen: true, 
            type, 
            mode, 
            item, 
            parentId, 
            loading: false 
        });
    };

    const closeModal = () => {
        setModalState({ 
            isOpen: false, 
            type: null, 
            mode: 'add', 
            item: null, 
            parentId: null, 
            loading: false 
        });
    };

    const handleSave = async (formData) => {
        const { type, mode, item, parentId } = modalState;
        setModalState(prev => ({ ...prev, loading: true }));

        let url, method, body;

        try {
            switch (type) {
                case 'wot':
                    url = mode === 'add' ? '/admin/settings/work-order-types' : `/admin/settings/work-order-types/${item.id}`;
                    method = mode === 'add' ? 'post' : 'put';
                    body = { type_name: formData.type_name, description: formData.description };
                    break;
                case 'submilestone':
                    url = mode === 'add' ? '/admin/settings/submilestones' : `/admin/settings/submilestones/${item.id}`;
                    method = mode === 'add' ? 'post' : 'put';
                    body = { name: formData.name, description: formData.description, work_order_type_id: parentId };
                    break;
                case 'checklist':
                    url = mode === 'add' ? '/admin/settings/checklists' : `/admin/settings/checklists/${item.id}`;
                    method = mode === 'add' ? 'post' : 'put';
                    body = { name: formData.name, submilestone_id: parentId };
                    break;
                default: 
                    throw new Error('Unknown operation type');
            }

            await apiService[method](url, body);
            await fetchData();
            closeModal();
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save. Please try again.');
        } finally {
            setModalState(prev => ({ ...prev, loading: false }));
        }
    };

    const openConfirmDialog = (type, id, itemName) => {
        const configs = {
            wot: {
                title: 'Delete Work Order Type',
                message: `Are you sure you want to delete "${itemName}"? This will also delete all associated sub-milestones and checklist items. This action cannot be undone.`
            },
            submilestone: {
                title: 'Delete Sub-milestone',
                message: `Are you sure you want to delete "${itemName}"? This will also delete all associated checklist items. This action cannot be undone.`
            },
            checklist: {
                title: 'Delete Checklist Item',
                message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
            }
        };

        const config = configs[type];
        setConfirmDialog({
            isOpen: true,
            type,
            id,
            title: config.title,
            message: config.message
        });
    };

    const handleDelete = async () => {
        const { type, id } = confirmDialog;
        let url;

        try {
            switch (type) {
                case 'wot': url = `/admin/settings/work-order-types/${id}`; break;
                case 'submilestone': url = `/admin/settings/submilestones/${id}`; break;
                case 'checklist': url = `/admin/settings/checklists/${id}`; break;
                default: throw new Error('Unknown delete type');
            }

            await apiService.delete(url);
            await fetchData();
            setConfirmDialog({ isOpen: false, type: null, id: null, title: '', message: '' });
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete. Please try again.');
        }
    };

    const getModalConfig = () => {
        const { type, mode } = modalState;
        const configs = {
            wot: {
                title: `${mode === 'add' ? 'Create New' : 'Edit'} Work Order Type`,
                fields: [
                    { 
                        name: 'type_name', 
                        label: 'Type Name',
                        required: true,
                        minLength: 2,
                        placeholder: 'Enter work order type name',
                        helpText: 'This will be displayed in work order creation forms'
                    },
                    { 
                        name: 'description', 
                        label: 'Description',
                        type: 'textarea',
                        placeholder: 'Describe the purpose and scope of this work order type',
                        helpText: 'Optional description to help users understand when to use this type'
                    }
                ]
            },
            submilestone: {
                title: `${mode === 'add' ? 'Create New' : 'Edit'} Sub-milestone`,
                fields: [
                    { 
                        name: 'name', 
                        label: 'Milestone Name',
                        required: true,
                        minLength: 2,
                        placeholder: 'Enter milestone name',
                        helpText: 'Clear, actionable milestone name'
                    },
                    { 
                        name: 'description', 
                        label: 'Description',
                        type: 'textarea',
                        placeholder: 'Describe what needs to be accomplished in this milestone',
                        helpText: 'Detailed description of milestone requirements and deliverables'
                    }
                ]
            },
            checklist: {
                title: `${mode === 'add' ? 'Create New' : 'Edit'} Checklist Item`,
                fields: [
                    { 
                        name: 'name', 
                        label: 'Checklist Item',
                        required: true,
                        minLength: 2,
                        placeholder: 'Enter checklist item description',
                        helpText: 'Specific, actionable task that can be checked off'
                    }
                ]
            }
        };

        return configs[type] || { title: '', fields: [] };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-600">Loading work order settings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
                    <p className="mt-4 text-sm text-red-600">{error}</p>
                    <button 
                        onClick={fetchData}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="border-b border-gray-200 pb-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold leading-tight text-gray-900">
                                Work Order Configuration
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                Manage work order types, milestones, and checklist items for your organization
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                            <button
                                onClick={toggleAllWorkOrderTypes}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {expandAllWOT ? (
                                    <>
                                        <ChevronDownIcon className="h-4 w-4 mr-2" />
                                        Collapse All
                                    </>
                                ) : (
                                    <>
                                        <ChevronRightIcon className="h-4 w-4 mr-2" />
                                        Expand All
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={() => openModal('wot', 'add')} 
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white gradient-btn5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                New Work Order Type
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {workOrderTypes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <InformationCircleIcon className="h-full w-full" />
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No work order types</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first work order type.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => openModal('wot', 'add')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Create Work Order Type
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {workOrderTypes.map(wot => {
                            const isWOTExpanded = expandedWorkOrderTypes.has(wot.id);
                            
                            return (
                                <div key={wot.id} className="bg-white shadow-sm rounded-lg border border-gray-200">
                                    {/* Work Order Type Header */}
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center flex-1">
                                                <button
                                                    onClick={() => toggleWorkOrderType(wot.id)}
                                                    className="flex items-center p-1 mr-3 text-gray-400 hover:text-gray-600 rounded"
                                                >
                                                    {isWOTExpanded ? (
                                                        <ChevronDownIcon className="h-5 w-5" />
                                                    ) : (
                                                        <ChevronRightIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <h2 className="text-xl font-semibold text-gray-900">{wot.type_name}</h2>
                                                        <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {wot.submilestones?.length || 0} sub-milestones
                                                        </span>
                                                    </div>
                                                    {wot.description && (
                                                        <p className="mt-1 text-sm text-gray-600">{wot.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => openModal('wot', 'edit', wot)}
                                                    className="inline-flex items-center p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                                                    title="Edit work order type"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => openConfirmDialog('wot', wot.id, wot.type_name)}
                                                    className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-md"
                                                    title="Delete work order type"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Collapsible Sub-milestones Section */}
                                    {isWOTExpanded && (
                                        <div className="px-6 py-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">Sub-milestones</h3>
                                                <button 
                                                    onClick={() => openModal('submilestone', 'add', null, wot.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <PlusIcon className="h-4 w-4 mr-1" />
                                                    Add Sub-milestone
                                                </button>
                                            </div>

                                            {(!wot.submilestones || wot.submilestones.length === 0) ? (
                                                <div className="text-center py-6 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-500">No sub-milestones defined</p>
                                                    <button
                                                        onClick={() => openModal('submilestone', 'add', null, wot.id)}
                                                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                                                    >
                                                        Add the first sub-milestone
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {wot.submilestones.map(sub => {
                                                        const isSubExpanded = expandedSubmilestones.has(sub.id);
                                                        
                                                        return (
                                                            <div key={sub.id} className="border border-gray-200 rounded-lg bg-gray-50">
                                                                {/* Sub-milestone Header */}
                                                                <div className="px-4 py-3 border-b border-gray-200 bg-white rounded-t-lg">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center flex-1">
                                                                            <button
                                                                                onClick={() => toggleSubmilestone(sub.id)}
                                                                                className="flex items-center p-1 mr-3 text-gray-400 hover:text-gray-600 rounded"
                                                                            >
                                                                                {isSubExpanded ? (
                                                                                    <ChevronDownIcon className="h-4 w-4" />
                                                                                ) : (
                                                                                    <ChevronRightIcon className="h-4 w-4" />
                                                                                )}
                                                                            </button>
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center">
                                                                                    <h4 className="text-base font-medium text-gray-900">{sub.name}</h4>
                                                                                    <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                                        {sub.checklists?.length || 0} items
                                                                                    </span>
                                                                                </div>
                                                                                {sub.description && (
                                                                                    <p className="mt-1 text-sm text-gray-600">{sub.description}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <button 
                                                                                onClick={() => openModal('submilestone', 'edit', sub, wot.id)}
                                                                                className="inline-flex items-center p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
                                                                                title="Edit sub-milestone"
                                                                            >
                                                                                <PencilIcon className="h-4 w-4" />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => openConfirmDialog('submilestone', sub.id, sub.name)}
                                                                                className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-md"
                                                                                title="Delete sub-milestone"
                                                                            >
                                                                                <TrashIcon className="h-4 w-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Collapsible Checklist Items */}
                                                                {isSubExpanded && (
                                                                    <div className="px-4 py-3">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <h5 className="text-sm font-medium text-gray-700">Checklist Items</h5>
                                                                            <button 
                                                                                onClick={() => openModal('checklist', 'add', null, sub.id)}
                                                                                className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                            >
                                                                                <PlusIcon className="h-3 w-3 mr-1" />
                                                                                Add Item
                                                                            </button>
                                                                        </div>

                                                                        {(!sub.checklists || sub.checklists.length === 0) ? (
                                                                            <div className="text-center py-4 bg-white rounded border-2 border-dashed border-gray-300">
                                                                                <p className="text-xs text-gray-500">No checklist items</p>
                                                                                <button
                                                                                    onClick={() => openModal('checklist', 'add', null, sub.id)}
                                                                                    className="mt-1 text-xs text-indigo-600 hover:text-indigo-500"
                                                                                >
                                                                                    Add the first item
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="space-y-2">
                                                                                {sub.checklists.map(chk => (
                                                                                    <div key={chk.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-md border border-gray-200">
                                                                                        <div className="flex items-center space-x-3">
                                                                                            <div className="h-4 w-4 border-2 border-gray-300 rounded"></div>
                                                                                            <span className="text-sm text-gray-700">{chk.name}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center space-x-1">
                                                                                            <button 
                                                                                                onClick={() => openModal('checklist', 'edit', chk, sub.id)}
                                                                                                className="inline-flex items-center p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded"
                                                                                                title="Edit checklist item"
                                                                                            >
                                                                                                <PencilIcon className="h-3 w-3" />
                                                                                            </button>
                                                                                            <button 
                                                                                                onClick={() => openConfirmDialog('checklist', chk.id, chk.name)}
                                                                                                className="inline-flex items-center p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                                                                                                title="Delete checklist item"
                                                                                            >
                                                                                                <TrashIcon className="h-3 w-3" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CrudModal 
                isOpen={modalState.isOpen} 
                onClose={closeModal} 
                onSave={handleSave} 
                item={modalState.item} 
                loading={modalState.loading}
                {...getModalConfig()} 
            />

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, type: null, id: null, title: '', message: '' })}
                onConfirm={handleDelete}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
        </div>
    );
};

export default AdminSettings;