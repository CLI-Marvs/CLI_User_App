import { useState, useMemo } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Pagination } from "../component/Pagination";
import { AddBankForm } from "../component/AddBankForm";
import { AddUserForm } from "../component/AddUserForm";
import { AddPayToOrderForm } from "../component/AddPayToOrderForm";
import * as hooks from "../hooks/useTransactionQueries";
import { showToast } from "@/util/toastUtil";
import { ENTITY_CONFIG } from "../utils/adminEntityConfig";
import { InlineListManager } from "../component/InlineListManager";

export default function AdminSettings() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("banks");
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const entity = ENTITY_CONFIG[activeTab];
    const listHook = hooks[entity.useList];
    const createHook = hooks[entity.useCreate];
    const updateHook = hooks[entity.useUpdate];
    const deleteHook = hooks[entity.useDelete];

    const { data: items = [], isLoading } = listHook();
    const createMutation = createHook();
    const updateMutation = updateHook();
    const deleteMutation = deleteHook();

    const filteredItems = useMemo(() =>
        items.filter((item) => {
            const isSearchTerm = searchTerm.toLowerCase();
            return (
                item[entity.field]?.toLowerCase().includes(isSearchTerm) ||
                item.employee?.firstname?.toLowerCase().includes(isSearchTerm) ||
                item.employee?.employee_email?.toLowerCase().includes(isSearchTerm) ||
                item.employee?.lastname?.toLowerCase().includes(isSearchTerm)
            )
        }),
        [items, searchTerm]
    );

    const singularLabel = entity?.label.replace(/s$/i, "");

    const handleUpdate = (id, data) => {
        updateMutation.mutate(
            { id, data },
            {
                onSuccess: () =>
                    showToast(
                        `${singularLabel} updated successfully`,
                        "success"
                    ),
            }
        );
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id, {
            onSuccess: () =>
                showToast(`${singularLabel} deleted successfully`, "success"),
        });
    };

    const handleCreate = (data) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                showToast(`${singularLabel} created successfully`, "success");
                setShowForm(false);
            },
        });
    };
    const renderForm = () => {
        if (activeTab === "banks")
            return (
                <AddBankForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    banks={items}
                />
            );
        if (activeTab === "users")
            return (
                <AddUserForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    users={items}
                />
            );
        if (activeTab === "payorders")
            return (
                <AddPayToOrderForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    payToOrders={items}
                />
            );
        return null;
    };

    return (
        <div className="w-full mx-auto p-6 space-y-6">
            <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-end items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded w-64 focus:outline-none focus:ring focus:ring-custom-lightgreen"
                            />
                        </div>
                        <button className="px-3 py-2 text-sm border rounded text-gray-700 hover:bg-gray-100 flex items-center">
                            <Filter className="h-4 w-4 mr-1" /> Filter
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    {Object.keys(ENTITY_CONFIG).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setShowForm(false);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded ${activeTab === tab
                                    ? "bg-custom-lightgreen text-white font-semibold"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            {ENTITY_CONFIG[tab].label}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        {entity.label} Management
                    </h3>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-custom-lightgreen text-white rounded hover:bg-green-600 flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add {entity.label}
                    </button>
                </div>

                {showForm && renderForm()}

                <InlineListManager
                    data={filteredItems.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                    )}
                    field={entity.field}
                    iconComponent={entity.iconComponent}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                    renderItemContent={entity.renderItemContent}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
                    totalItems={filteredItems.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(n) => {
                        setItemsPerPage(n);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </div>
    );
}
