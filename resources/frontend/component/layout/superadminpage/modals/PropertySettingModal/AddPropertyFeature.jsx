import React from 'react'

const AddPropertyFeature = () => {
    return (
        <div>
            <h2 className="text-lg font-semibold">Add New Property</h2>
            <form>
                <label className="block mb-2">Property Name:</label>
                <input type="text" className="border rounded p-2 mb-4" />

                <label className="block mb-2">Pricing:</label>
                <input type="number" className="border rounded p-2 mb-4" />

                <button
                    type="submit"
                    className="bg-blue-500 text-white rounded p-2"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default AddPropertyFeature
