import { useState } from "react";
import { Check, X } from "lucide-react";
import { useStateContext } from "frontend/context/contextprovider";
import SelectInput from "frontend/component/shared/components/SelectInput";
import { showToast } from "frontend/util/toastUtil";

export function AddUserForm({ onSubmit, onCancel, users }) {
    const { allEmployees } = useStateContext();
    const [formData, setFormData] = useState({
        employee_id: null,
        role: "",
    });

    const employeeOptions = allEmployees.map((emp) => ({
        id: emp.id,
        label: emp.employee_email,
    }));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (users.map((user) => user.employee_id).includes(formData.employee_id)) {
            showToast("User already exists", "error");
            return;
        }

        if (!formData.employee_id || !formData.role) return;

        onSubmit({
            employee_id: formData.employee_id,
            role: formData.role,
        });
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-4 border-2 border-dashed border-custom-lightgreen rounded-lg bg-green-100/10">
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-12 gap-3 items-end"
            >
                <div className="col-span-3 relative">
                    <SelectInput
                        options={employeeOptions}
                        value={formData.employee_id}
                        onChange={(val) => handleChange("employee_id", val.id)}
                        valueKey="id"
                        labelKey="label"
                        placeholder="Select Employee"
                    />

                    <select
                        value={formData.employee_id || ""}
                        required
                        onChange={() => { }}
                        tabIndex="-1"
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            opacity: 0.01,
                            pointerEvents: "none",
                            width: "100%",
                            height: "1px",
                            zIndex: -1,
                        }}
                    >
                        <option value="" disabled>
                            Select Employee
                        </option>
                        {employeeOptions.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2">
                    <select
                        value={formData.role}
                        onChange={(e) => handleChange("role", e.target.value)}
                        required
                        className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-lightgreen"
                    >
                        <option value="" disabled>
                            Role
                        </option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>

                <div className="col-span-3 flex space-x-2">
                    <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-custom-lightgreen text-white rounded-md hover:bg-green-700 transition h-9"
                    >
                        <Check className="h-4 w-4 mr-1" /> Add
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition h-9"
                    >
                        <X className="h-4 w-4 mr-1" /> Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
