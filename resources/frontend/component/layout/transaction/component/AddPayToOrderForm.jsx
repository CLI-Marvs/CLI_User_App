import { useState } from "react";
import { Check, X } from "lucide-react";
import { showToast } from "@/util/toastUtil";

export function AddPayToOrderForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    onSubmit({
      name: formData.name,
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 border-2 border-dashed border-custom-lightgreen rounded-lg bg-green-100/10">
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-3">
          <input
            placeholder="Recipient name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-lightgreen"
          />
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
