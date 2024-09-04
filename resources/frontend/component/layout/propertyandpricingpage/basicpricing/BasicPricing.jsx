import React,{useRef} from 'react'
import ProjectDetails from './ProjectDetails'
import PriceListSettings from './accordion/PriceListSettings'
import AdditionalPremiums from './accordion/AdditionalPremiums'
import PriceVersions from './accordion/PriceVersions'
import PaymentSchemes from './accordion/PaymentSchemes'
import ReviewsandApprovalRouting from './accordion/ReviewsandApprovalRouting'
import FloorPremiums from './accordion/FloorPremiums'
import AddPropertyModal from './modals/AddPropertyModal'



const BasicPricing = () => {

  const modalRef = useRef(null);

  const handleOpenModal = () => {
      if (modalRef.current) {
          modalRef.current.showModal();
      }
  };
  return (
    <div className='h-screen max-w-[957px] min-w-[897px] bg-custom-grayFA px-[30px] '>
      {/* button ra if walay pa property */}
      <div className='px-5 mb-7'>
          <button onClick={handleOpenModal} className='montserrat-semibold text-sm px-2 gradient-btn2 w-[214px] h-[37px] rounded-[10px] text-white hover:shadow-custom4'>Add Property and Pricing</button>
      </div>
      {/* kung naa nay property */}
      <ProjectDetails/>
      {/* ------------------------- */}
      <div className='flex flex-col gap-1 w-full border-t-1 border-custom-lightestgreen py-4'>
          <PriceListSettings/>
          <FloorPremiums/>
          <AdditionalPremiums/>
          <PriceVersions/>
          <PaymentSchemes/>
          <ReviewsandApprovalRouting/>
      </div>
      <div>
        <AddPropertyModal modalRef={modalRef}/>
      </div>
    </div>
  )
}

export default BasicPricing