import PropertyFeatureForm from "@/component/layout/superadminpage/component/PropertyFeatureForm";

const AddPropertyFeature = ({ addPropertyFeatureRef }) => {
    return (
        <dialog
            className="modal w-[550px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={addPropertyFeatureRef}
            style={{ zIndex: 9000 }}
        >
            <PropertyFeatureForm
                modalRef={addPropertyFeatureRef}
                mode="add"
            />
        </dialog>
    );
};

export default AddPropertyFeature;
