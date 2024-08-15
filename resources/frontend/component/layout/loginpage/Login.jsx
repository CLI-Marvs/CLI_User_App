import React from 'react'
import CLILogo from '../../../../../public/Images/CLI20-Logo.png';
import GoogleLogo from "../../../../../public/Images/googleLogo.svg";



const Login = () => {
  return (
    <>
     <div className="flex h-screen w-full relative overflow-hidden">
        <div className="bg-left-side flex h-full w-1/2 "></div>
        <div className="w-1/2 flex flex-col items-center justify-center p-4 z-2">
        <div className=''>
            <img className='h-40' src={CLILogo} alt="cli logo" />
        </div>
        <div className='bg-white px-12 pb-8 pt-12 rounded-xl shadow-custom w-108'>
        <button
                    
                    className="relative flex justify-center items-center w-full text-sm border rounded-lg border-custom-lightgreen hover:shadow-custom3 text-custom-lightgreen h-11 mb-2"
                >
                    <img src={GoogleLogo} className="h-5 w-5 mr-6" />
                    <span className="relative right-3 text-base">
                        Login with Google
                    </span>
                </button>
        </div>
        </div>
    </div>
    </>

  )
}

export default Login