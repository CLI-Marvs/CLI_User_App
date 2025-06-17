import PropertyFeatureForm from "@/component/layout/superadminpage/component/PropertyFeatureForm";

const EditPropertyFeature = ({ editPropertyFeatureRef, selectedProperty }) => {
    return (
        <dialog
            className="modal w-[550px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={editPropertyFeatureRef}
        >
            <PropertyFeatureForm
                modalRef={editPropertyFeatureRef}
                mode="edit"
                selectedProperty={selectedProperty}
            />
        </dialog>
    );
};

export default EditPropertyFeature;
