import React, { useEffect } from "react";
import UnitTableComponent from "@/component/layout/propertyandpricingpage/component/UnitTableComponent";
const ExpandableDataTable = ({
    expandUnitTableViewRef,
    computedUnitPrices,
    staticHeaders,
    hasPricingHeaders,
    subHeaders,
    headers,
    units,
}) => {

    //Evend handler
    const handleCloseExpandableDataTable = () => {
        if (expandUnitTableViewRef.current) {
            expandUnitTableViewRef.current.close();
        }
    };
    
    return (
        <dialog
            className="modal min-w-[400px] max-w-[90vw] rounded-lg  overflow-auto backdrop:bg-black/50 backdrop-blur-md"
            ref={expandUnitTableViewRef}
        >
            <div className="px-14 rounded-[10px] h-full">
                <div
                    method="dialog"
                    className="pt-2 flex justify-end -mr-[50px] "
                >
                    <button
                        className="flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg"
                        onClick={handleCloseExpandableDataTable}
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div className="py-2 mb-4 px-4 overflow-x-auto   max-h-[80vh] w-full">
                <div className=" ">
                    <UnitTableComponent
                        computedUnitPrices={computedUnitPrices}
                        units={units}
                        headers={headers}
                        staticHeaders={staticHeaders}
                        // hasVersionHeaders={hasVersionHeaders}
                        hasPricingHeaders={hasPricingHeaders}
                        subHeaders={subHeaders}
                    />
                </div>
            </div>
        </dialog>
    );
};

export default ExpandableDataTable;
