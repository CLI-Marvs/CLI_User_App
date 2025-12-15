import Alert from "@/component/Alert";
import { showToast } from "@/util/toastUtil";
import { useState } from "react";
import { IoMdCreate } from "react-icons/io";
import { MdDelete } from "react-icons/md";

export function InlineListManager({
    data,
    iconComponent: IconComponent,
    field,
    onUpdate,
    onDelete,
    isLoading = false,
    renderItemContent,
}) {
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditingValue(item[field]);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingValue("");
    };

    const saveEdit = (id) => {
        if (!editingValue.trim()) return;

        const originalItem = data.find((item) => item.id === id);
        if (originalItem && originalItem[field] === editingValue.trim()) {
            showToast("No changes have been made", "info");
            cancelEditing();
            return;
        }

        onUpdate(id, { [field]: editingValue.trim() });
        cancelEditing();
    };

    const handleCancel = () => {
        setShowAlert(false);
        setItemToDelete(null);
    };

    const handleConfirm = () => {
        if (itemToDelete) {
            onDelete(itemToDelete.id);
        }
        setShowAlert(false);
        setItemToDelete(null);
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                    <div
                        key={index}
                        className="p-4 border rounded-lg flex justify-between items-center animate-pulse"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-300 rounded-lg w-10 h-10" />
                            <div className="h-4 bg-gray-300 rounded w-64" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-300 rounded" />
                            <div className="w-6 h-6 bg-gray-300 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data.map((item) => (
                <div
                    key={item.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-solidgreen rounded-lg">
                            {IconComponent && (
                                <IconComponent className="h-6 w-6 text-custom-lightgreen" />
                            )}
                        </div>

                        {editingId === item.id ? (
                            <input
                                className="border px-2 py-1 rounded w-64"
                                value={editingValue}
                                onChange={(e) =>
                                    setEditingValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        saveEdit(editingId);
                                    }
                                }}
                                autoFocus
                            />
                        ) : renderItemContent ? (
                            renderItemContent(item)
                        ) : (
                            <h4 className="font-semibold">{item[field]}</h4>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {editingId === item.id ? (
                            <>
                                <button
                                    onClick={() => saveEdit(item.id)}
                                    className="text-green-600 text-sm"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="text-gray-500 text-sm"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <IoMdCreate
                                    className="text-custom-lightgreen hover:text-custom-lightgreen cursor-pointer text-center"
                                    size={18}
                                    onClick={() => startEditing(item)}
                                />
                                <MdDelete
                                    className="w-6 h-6 text-red-500 cursor-pointer"
                                    onClick={() => {
                                        setItemToDelete(item);
                                        setShowAlert(true);
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
            ))}

            <Alert
                title="Are you sure you want to delete this data?"
                show={showAlert}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                isLoading={isLoading}
            />
        </div>
    );
}
