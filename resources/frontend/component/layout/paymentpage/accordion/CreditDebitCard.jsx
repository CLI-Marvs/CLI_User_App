import React,{useState} from 'react'
import { MdOutlineArrowRight } from "react-icons/md";
import CreditCard from "../../../../../../public/Images/Credit-card.png"
import MasterCard from '../../../../../../public/Images/mastercard.png'


const CreditDebitCard = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full max-w-md mx-auto">
            <div className={` transition-all duration-300`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex justify-between items-center h-[45px] w-full border-b bg-white pl-[11px]`}
                >
                    <div>
                        <img src={CreditCard} alt="creditcard" />
                    </div>
                    <div className='flex flex-col w-[345px] items-start'>
                        <p className='h-[17px] montserrat-semibold text-sm bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent'>Credit / Debit Card</p>
                        <span className="montserrat-medium text-xs text-custom-gray81">Use your mastercard, jcb, visa, or amex to pay</span>
                    </div>
                    <MdOutlineArrowRight className={`transition-transform duration-300 text-custom-gray81 size-[19px] ${isOpen ? "rotate-90" : ""}`} />
                </button>
                <div
                    className={` grid overflow-hidden transition-all duration-300 ease-in-out
                        ${isOpen ? 'mt-2 mb-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                    `}
                >
                {isOpen && (
                    <div className="py-[17px] px-[18px] flex flex-col gap-[22px]">
                        <div className='flex gap-[12px]'>
                            <img src={MasterCard} alt="sample" className='h-[18px] w-[30px]' />
                            <img src={MasterCard} alt="sample" className='h-[18px] w-[30px]' />
                            <img src={MasterCard} alt="sample" className='h-[18px] w-[30px]' />
                        </div>
                        <div className='flex gap-[10px] montserrat-regular text-xs text-[#404B52]'>
                            <p>k**t@gmail.com</p>
                            <p className='underline cursor-pointer'>Not you?</p>
                        </div>
                        <div className='montserrat-semibold text-xs'>
                            Access your Click to Pay cards
                        </div>
                        <div className='flex w-[205px]'>
                            <p className='montserrat-regular text-xs text-[#404B52]'>
                                Enter the code Mastercard sent to +63(***) ***-*567 to confirm it's you.
                            </p>
                        </div>
                        <div className='flex justify-center space-x-[16px]'>
                            <input className='pl-[10px] h-[40px] w-[31px] border border-[#D9D9D9] rounded-[6px]' maxLength={1} type="text" />
                            <input className='pl-[10px] h-[40px] w-[31px] border border-[#D9D9D9] rounded-[6px]' maxLength={1}  type="text" />
                            <input className='pl-[10px] h-[40px] w-[31px] border border-[#D9D9D9] rounded-[6px]' maxLength={1}  type="text" />
                            <input className='pl-[10px] h-[40px] w-[31px] border border-[#D9D9D9] rounded-[6px]' maxLength={1}  type="text" />
                            <input className='pl-[10px] h-[40px] w-[31px] border border-[#D9D9D9] rounded-[6px]' maxLength={1}  type="text" />
                            <input className='pl-[10px] h-[40px] w-[31px] border border-[#D9D9D9] rounded-[6px]' maxLength={1}  type="text" />
                        </div>
                        <div>
                            <p className='flex gap-[10px] montserrat-regular text-xs text-[#404B52]'>
                                Resend code:
                                <span className='underline cursor-pointer'>Mobile</span>
                                <span className='text-[#D9D9D9]'>|</span>
                                <span className='underline cursor-pointer'>Email</span>
                            </p>
                        </div>
                        <div className='flex gap-[10px] text-[#404B52]'>
                            <input type="checkbox" />
                            <p>Remember me in this browser</p>
                        </div>
                        <div className='w-full'>
                            <button className='w-full h-[45px] gradient-btn5 montserrat-semibold text-white rounded-[10px]'>
                                CONTINUE
                            </button>
                        </div>
                    </div>
                )}
                </div>        
            </div>
        </div>
    );
}

export default CreditDebitCard