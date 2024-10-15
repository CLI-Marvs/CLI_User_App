import React,{useState} from 'react'
import { MdOutlineArrowRight } from "react-icons/md";
import CreditCard from "../../../../../../public/Images/Credit-card.png"
import BankSample from "../../../../../../public/Images/banksample.png"
import errorRB from "../../../../../../public/Images/Info.svg"
const EWallet = () => {
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
                        <p 
                            className='h-[17px] montserrat-semibold text-sm bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent
                        '>
                            E-Wallet
                        </p>
                        <span className="montserrat-medium text-xs text-custom-gray81">Use your E-wallet balance to pay</span>
                    </div>
                    <MdOutlineArrowRight className={`transition-transform duration-300 text-custom-gray81 size-[19px] ${isOpen ? "rotate-90" : ""}`} />
                </button>
                <div
                    className={` grid overflow-hidden transition-all duration-300 ease-in-out
                        ${isOpen ? ' mb-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                    `}
                >
                {isOpen && (
                    <div className="">
                        <div className='w-full px-[35px] py-[10px] bg-[#F4F3F3]'>
                            <p className='montserrat-medium text-xs text-custom-gray81'>Select a wallet provider below, and you will be redirected to another page to authorize payment.</p>
                        </div>
                        <div className='h-[76px] w-full px-[35px] pl-[35px] flex justify-start items-center gap-[20px] border-b border-[#F4F3F3]'>
                            <input name='bank' type="radio" />
                            <img src={BankSample} alt="" />
                        </div>
                        <div className='h-[76px] w-full px-[35px] pl-[35px] flex justify-start items-center gap-[20px] border-b border-[#F4F3F3]'>
                            <input name='bank' type="radio" />
                            <img src={BankSample} alt="" />
                        </div>
                        <div className='h-[76px] w-full px-[35px] pl-[35px] flex justify-start items-center gap-[20px] border-b border-[#F4F3F3]'>
                            <input name='bank' type="radio" />
                            <img src={BankSample} alt="" />
                        </div>
                        <div className='relative h-[76px] w-full px-[35px] pl-[35px] flex justify-start items-center gap-[20px] border-b border-[#F4F3F3]'>
                            <p className='absolute right-0 top-0 w-[174px] h-[20px] py-[4px] px-[10px] rounded-bl-[6px] bg-[#818181] montserrat-medium text-white text-[10px]'>MINIMUM AMOUNT NOT MET</p>
                            {/* <input name='bank' type="radio" /> */} <img src={errorRB} alt="" />
                            <img src={BankSample} alt="" className='opacity-30' />
                        </div>
                        <div className='flex flex-col justify-between h-[122px] px-[18px] py-[17px] '>
                            <div className='flex gap-[10px] text-[#404B52] '>
                                <input type="checkbox" />
                                <div className='flex text-xs montserrat-regular space-x-1'>
                                    <p>I agree to the</p>
                                    <p className='text-custom-solidgreen'><a href="">Terms and Conditions.</a></p>
                                </div>
                                
                            </div>
                            <div className='w-full'>
                                <button className='w-full text-sm h-[45px] gradient-btn5 montserrat-semibold text-white rounded-[10px]'>
                                    PAY PHP 200.00
                                </button>
                            </div>
                        </div>
                        
                    </div>
                )}
                </div>        
            </div>
        </div>
    );
}

export default EWallets