import React from 'react'
import { FaArrowDown } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { FaRegCalendar } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { MdCancel } from "react-icons/md";
const Confirmation = () => {

  const handleIconClick = () => {
    const dateInput = document.getElementById('date-input');
    dateInput.showPicker(); // Triggers the native date picker
  };

  return (
    <div className='w-[1000px] bg-custom-grayFA py-[30px] px-[20px] flex flex-col gap-[15px]'>
      <div className='w-full h-auto bg-white rounded-[10px] py-[10px] px-[18px] flex flex-col gap-[15px]'>
        <div className='w-full flex justify-center montserrat-semibold'>
          RESERVATION AGREEMENT
        </div>
        <div className='w-full text-sm'>
          I hereby manifest my intention and offer to purchase from (the "Seller") the following property (the "Property") and request that the same be reserved for my purchase:
        </div>
        <div className='w-full flex gap-[15px]'>
          <div className='w-[453px] font-bold text-sm'>
            <p>UNIT NUMBER : <span className='font-normal'>1A15.011</span></p>
          </div>
          <div className='w-[452px] font-bold text-sm'>
            <p>UNIT TYPE : <span className='font-normal'>TOWNHOUSE A</span></p>
          </div>
        </div>
        <div className='w-full flex gap-[15px]'>
          <div className='w-[453px] font-bold text-sm'>
            <p>PROJECT : <span className='font-normal'>CASA MIRA SOUTH</span></p>
          </div>
          <div className='w-[452px] font-bold text-sm'>
            <p>UNIT TYPE : <span className='font-normal'>36.16 SQM</span></p>
          </div>
        </div>
        <div className='w-full text-sm'>
          For a purchase price of <span className='font-bold'>ONE MILLION FIVE HUNDRED SIXTY-EIGHT THOUSAND THREE HUNDRED THIRTY-NINE PESOS & 97/100</span>, Philippine
          currency (Php <span className='font-bold'>1,568,339.97</span> ), (the "Purchase Price") inclusive of VAT (if applicable), reservation fee, transfer and registration charges, and all
          other charges as hereinafter specified,to be paid by me in the manner chosen by me as indicated in the Term Sheet, which is attached hereto and made integral
          hereof as Annex "A", I hereby request that the Property be reserved for me and for this purpose I enclose herewith the amount of : Php <span className='font-bold'>10,000.00</span> as
          reservation fee (the "Reservation Fee"). I understand that the Purchase Price is valid only for the preferred payment scheme and for the manner of payment stated in Annex "A" and should I decide
          to change the same, such change shall be effective only upon written approval of the Seller and shall result in the change of the Purchase Price with a
          re-documentation fee of Php 100,000.00, such being an amendment of Annex "A". I further understand and agree that my reservation for the Property is subject
          to the following:
        </div>
        <div className='w-full flex justify-center montserrat-semibold'>
          TERMS AND CONDITIONS
        </div>
        <div className='w-full text-sm'>
          1. The reservation for the Property is good only for a period of thirty (30) calendar days from payment of the Reservation Fee or up to <span className='font-bold'>01/30/2018 </span>
          (the "Reservation Period"). Should I decide to cancel my reservation or If I proceed with the sale and I fail or be unable to pay any of the amounts
          due on their respective due dates, as stipulated in Annex "A", whether such failure or inability is due to my decision not to proceed with my purchase
          or due to a delay in the release of the loan proceeds to be used to finance my purchase of the Property, or for any other reason, I agree that my reservation
          shall lapse and my Reservation Fee shall be forfeited in favor of the Seller. I likewise agree that if I request changes or adjustments in the payment
          schedule, I will pay all associated costs therefor, including costs for changing or pull-out of checks;
        </div>
        <div className='w-full text-sm'>
          2. If I decide to proceed with the purchase of the Property, I agree to abide by the terms and conditions provided in Clause 3 to 13 hereof;
        </div>
        <div className='w-full text-sm'>
          3. In the event I avail myself of bank financing for the Purchase Price or any portion thereof, I shall be solely responsible for filing the requisite loan
          application form prescribed by the bank together with all the necessary supporting documentary requirements therefor, but the processing and actual release
          of the loan proceeds must be within the payment period and scheme indicated in Annex "A"; otherwise the Seller shall be entitled to 2% interest on any outstanding
          balance following the lapse of the payment period, computed every month until fully paid. For the avoidance of doubt, the Seller shall assume that I will pay
          in cash any outstanding balance at the date of turnover;
        </div>
        <div className='w-full text-sm'>
          4. In case of my failure to pay any of the amounts due or comply with my undertakings hereunder, or execute the Contract to Sell and/or Deed of Absolute
          Sale for the Property, or submit the necessary documents as specified herein, or comply with the terms of my purchase, the Seller shall have the option
          to cancel this sale. If I have paid at least twenty-four (24) months of installments, any refund due shall be equivalent to the cash surrender value as
          provided for under R.A. 6552 (Maceda Law); otherwise, I expressly agree that any refund due shall be less the following deductions:
        </div>
        <div className='w-full text-sm'>
          <p>(a) an amount equivalent to fifty percent (50%) of the total amount paid as liquidated damages; </p>
          <p>(b) penalties accrued as of the date of cancellation; </p>
          <p>(c) real estate broker's commission and incentives, if any; </p>
          <p>(d) taxes paid; and </p>
          <p>(e) any unpaid charges on the unit; </p>
        </div>
        <div className='w-full text-sm'>
          5. I hereby undertake to supply the Seller with all the documents necessary for the drafting of my Contract to Sell, as listed under "OTHER REQUIREMENTS"
          below, and to execute the same upon my payment of the down payment, and the Deed of Absolute Sale upon my full payment of the Purchase Price and all amounts
          due on my purchase of the Property, such contract and deed being in the form and under the terms prescribed by the Seller;
        </div>
        <div className='w-full text-sm'>
          6. I understand and agree that this Agreement only gives me the right to purchase the Property, subject to the fulfillment of the conditions stated herein,
          and no other right, title, or ownership over the Property is vested upon me by the execution of this Agreement; thus, the Seller retains title and ownership
          of the Property until I shall have fully paid all amounts due to the Seller under the terms hereof;
        </div>
        <div className='w-full text-sm'>
          7. Documentary stamp taxes, registration fees, transfer taxes, costs, other incidental but necessary expenses, and any other tax imposed, whether presently
          or in the future, in connection with the sale of the Property, the execution, notarization, and registration of the Contract to Sell and the Deed of Absolute
          Sale, and the transfer, conveyance and issuance of the TCT or CCT and Tax Declaration covering the Property in my name shall be for my account. Real property
          taxes, association dues, rates and assessments which shall be imposed on or which shall accrue in relation to the ownership of the Property shall be pro-rated
          between the Seller and me for the purpose of making me liable only for the portion of such taxes or assessments that correspond to the period from the date of
          turnover of the Property to me or the date of execution of the Deed of Absolute Sale, whichever is earlier. From such date, all real property taxes, association
          dues, fees, and assessments which shall be due on the Property, if any, shall be for my sole account;
        </div>
        <div className='w-full text-sm'>
          8. I understand and agree that my purchase of the Property is subject to the covenants and restrictions specified in the Project's Master Deed with Declaration
          of Restrictions, which will be annotated on the corresponding certificate of title of the Property as a lien thereon, and which covenants and restrictions I
          undertake to faithfully and strictly comply with. My undertaking and confirmation herein constitutes an essential consideration of the sale by the Seller of
          the Property to me and all other agreements executed in connection therewith;
        </div>
        <div className='w-full text-sm'>
          9. I also hereby authorize the Seller to organize the governing condominium corporation and to automatically make me a member thereof upon my full payment of
          the Purchase Price, and I undertake to abide by its rules and regulations and comply with its membership requirements;
        </div>
        <div className='w-full text-sm'>
          10. I understand and agree that the Seller may, at its discretion following my submission of a request in writing, allow me to make significant changes to
          my payment terms and/or personal information, subject to the fulfillment of the following conditions: (a) I am not in default in the performance of my
          obligations hereof, (b) I shall pay the administrative or processing fees prescribed by the Seller of Php 100,000.00, and or any other costs that might
          or have been incurred; (c) I shall submit and/or execute such amendatory and other documents as may be necessary or required to effect the transfer or
          change in payment terms; and (d) I agree that any and all taxes, costs, and government assessments (if any), arising or resulting from any such changes,
          shall be for my sole account and for which I hereby undertake to indemnify the Seller. I further undertake not to hold the Seller liable and waive any claim
          or right that I may be entitled to, under law or equity, to be compensated for such as but not limited to damages, costs, and expenses which I may incur
          in connection with any delay in the processing of the certificate of title to the Property subject of this reservation by reason of the implementation
          of this paragraph;
        </div>
        <div className='w-full text-sm'>
          11. I understand and agree that the terms and conditions in the Contract to Sell and Deed of Absolute Sale shall govern the sale of the Property,
          and that I cannot assign or otherwise transfer my rights and obligations therein without prior written consent of the Seller. Any attempted
          assignment without the required prior written consent shall be void and of no force and effect;
        </div>
        <div className='w-full text-sm'>
          12. I warrant that the information which I provided herein, whether personal or corporate, is true and correct as of the date hereof and agree to
          directly and personally inform the Seller in writing of any changes in my personal data such as but not limited to name, address, and/or status.
          It is understood that the Seller shall have the right to rely solely on the information provided by me and shall not be held responsible for any
          error, non-communication or miscommunication in the personal information given by me. I also warrant that the funds used and to be used in purchasing
          the Property is, has been, and will be obtained through legitimate means and do not and will not constitute all or part of the proceeds of any
          unlawful activity. I hereby hold the Seller free and harmless from any incident, claim, action, or liability arising from the breach of my warranties
          herein, and hereby authorize the Seller to provide to any government body or agency any information pertaining to this sale and purchase transaction
          if so warranted and required under existing laws;
        </div>
        <div className='w-full text-sm'>
          13. In case of dispute arising out of or relating to this Agreement, I agree to finally settle the same with the Seller by arbitration conducted in Cebu,
          Philippines, in accordance with the Philippine Arbitration Law (Republic Act No. 876), by an arbitrator mutually agreed by me and the Seller,
          and we shall bear equally the cost of arbitration (exclusive of legal fees and expenses I personally incurred, which I shall bear separately).
          The decision of the arbitrator shall be final and binding upon me and the Seller and enforceable in any court of competent jurisdiction located
          in Cebu, Philippines. Notwithstanding the foregoing, in the event of breach by a party of its obligations hereunder, the non-breaching party may
          seek injunctive relief in any court of competent jurisdiction located in Cebu, Philippines and the parties hereby consent to the jurisdiction and
          venue of such courts. If any provision of this Agreement is determined by an arbitrator or any court of competent jurisdiction to be invalid or
          unenforceable, then the remaining provisions of this Agreement shall nevertheless be given full force and effect and be interpreted as broadly as
          possible to give full effect to the intentions of the parties in entering into this Agreement.
        </div>
      </div>
      <div className='w-full h-auto bg-white rounded-[10px] py-[10px] px-[18px] flex gap-[6px] justify-center'>
        <button className='w-[226px] h-[34px] flex justify-center items-center gap-[10px] text-[15px] text-white montserrat-medium bg-[#1A73E8] rounded-[5px]'>
          <div className=''>
            <FaArrowDown />
          </div>
          <p>Download Term Sheet</p>
        </button>
        <button className='w-[257px] h-[34px] flex justify-center items-center gap-[10px] text-[15px] text-white montserrat-medium bg-[#1A73E8] rounded-[5px]'>
          <div>
            <FaArrowDown />
          </div>
          <p>Download Broker Consent</p>
        </button>
        <button className='w-[320px] h-[34px] flex justify-center items-center gap-[10px] text-[15px] text-white montserrat-medium bg-[#1A73E8] rounded-[5px]'>
          <div>
            <FaArrowDown />
          </div>
          <p>Download Reservation Agreement</p>
        </button>
      </div>
      <div className='w-full h-auto bg-white rounded-[10px] py-[10px] px-[18px] flex gap-[6px] justify-center'>
        <button className='w-[203px] h-[34px] flex justify-center items-center gap-[10px] text-[15px] text-[#1A73E8] montserrat-medium border border-[#1A73E8] rounded-[5px]'>
          <div className=''>
            <FiUpload />
          </div>
          <p>Upload Term Sheet</p>
        </button>
        <button className='w-[234px] h-[34px] flex justify-center items-center gap-[10px] text-[15px] text-[#1A73E8] montserrat-medium border border-[#1A73E8] rounded-[5px]'>
              <div className='min-w-[65px] max-w-[160px] truncate'>
                  <span className='text-ellipsis overflow-hidden whitespace-nowrap underline text-[#1A73E8] cursor-pointer text-sm'>example-filename.pdf</span>
                </div>
                <div className='flex items-center justify-center'>
                  <button className='text-custom-solidgreen size-[24px]'><MdEdit className='size-[18px] ' /></button>
                  <button className='text-red-500' ><MdCancel className=' size-[18px]' /></button>
                </div>
        </button>
        <button className='w-[297px] h-[34px] flex justify-center items-center gap-[10px] text-[15px] text-[#1A73E8] montserrat-medium border border-[#1A73E8] rounded-[5px]'>
          <div className=''>
            <FiUpload />
          </div>
          <p>Upload Reservation Agreement</p>
        </button>
      </div>
      <div className='w-full h-auto bg-white rounded-[10px] py-[10px] px-[18px] flex gap-[6px] justify-center'>
        <div className='flex gap-[15px]'>
          <div className='flex w-[370px] h-[36px] gap-[14px] items-center'>
            <input className='size-[15px] ' type="radio" name='submitHardcopies' />
            <div className='flex gap-[10px] h-[36px] w-[341px] bg-custom-grayFA text-sm pl-[15px] relative border border-custom-grayF1 rounded-[5px]'>
              <p className='flex items-center text-custom-bluegreen'>Submit Hardcopies on:</p>
              <input id='date-input' className='pl-[8px] w-[130px]' type="date" />
              <div
                className='absolute right-0 h-[36px] w-[44px] flex justify-center items-center cursor-pointer '
                onClick={handleIconClick}
              >
                <FaRegCalendar className='size-[20px] text-custom-solidgreen' />
              </div>
            </div>
          </div>
          <div className='flex w-[449px] h-[36px] gap-[14px] items-center'>
            <input className='size-[15px] ' type="radio" name='submitHardcopies' />
            <div className='flex gap-[10px] h-[36px] w-[420px] bg-custom-grayFA text-sm pl-[15px] relative border border-custom-grayF1 rounded-[5px]'>
              <p className='flex items-center  text-custom-bluegreen'>Submit Hardcopies together with all the requirements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Confirmation