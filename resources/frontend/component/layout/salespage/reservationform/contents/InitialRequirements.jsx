import React, { useState,useEffect } from 'react'
import { LuUpload } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { IoCheckmarkSharp } from "react-icons/io5";
import AlertMessage from '../components/AlertMessage';


const InitialRequirements = () => {
  const [fileName, setFileName] = useState(null);
  const [fileName2, setFileName2] = useState(null);
  const [fileName3, setFileName3] = useState(null);
  const [fileName4, setFileName4] = useState(null);
  const [fileName5, setFileName5] = useState(null);
  const [fileName6, setFileName6] = useState(null);
  const [isUpload, setIsUpload] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleFileChange2 = (e) => {
    if (e.target.files.length > 0) {
      setFileName2(e.target.files[0].name);
    }
  };

  const handleFileChange3 = (e) => {
    if (e.target.files.length > 0) {
      setFileName3(e.target.files[0].name);
    }
  };

  const handleFileChange4 = (e) => {
    if (e.target.files.length > 0) {
      setFileName4(e.target.files[0].name);
    }
  };

  const handleFileChange5 = (e) => {
    if (e.target.files.length > 0) {
      setFileName5(e.target.files[0].name);
    }
  };

  const handleFileChange6 = (e) => {
    if (e.target.files.length > 0) {
      setFileName6(e.target.files[0].name);
    }
  };

  const handleDeleteFile = () => {
    setFileName(null);
  };

  const handleDeleteFile2 = () => {
    setFileName2(null);
  };

  const handleDeleteFile3 = () => {
    setFileName3(null);
  };

  const handleDeleteFile4 = () => {
    setFileName4(null);
  };

  const handleDeleteFile5 = () => {
    setFileName5(null);
  };

  const handleDeleteFile6 = () => {
    setFileName6(null);
  };
      /* USE THIS USEEFFECT AND PASS TO PARENT TO LOGIC ON BUTTONS*/
  useEffect(() => {
    const allFiles = [fileName, fileName2, fileName3, fileName4, fileName5, fileName6];
    setIsUpload(allFiles.every(file => file !== null)); 
  }, [fileName, fileName2, fileName3, fileName4, fileName5, fileName6]);

  return (
    <div className=" max-w-screen-xl px-[45px]">
      <div className="flex flex-col mt-[40px] w-[1000px]">
        <div className="flex  justify-center items-center w-full h-[55px] text-[18px] bg-custom-grayFA text-custom-bluegreen font-semibold rounded-[10px]">
          Buyers's Information
        </div>
        <div className="flex flex-col w-full bg-custom-grayFA rounded-[10px] gap-[15px] mt-[15px] p-[30px]">
          <div>
            <p className='montserrat-medium'>To Verify your account please upload the following requirements</p>
          </div>
          <div className='flex items-center h-[34px] gap-[15px] text-sm'>
            <p className='w-[263px]'>Buyer's Information Sheet</p>
            <button className='h-[34px] w-[68px] border border-custom-solidgreen montserrat-medium text-custom-solidgreen text-[15px] rounded-[4.5px] hover:shadow-custom4'>
              View
            </button>
            <button className='h-[34px] w-[111px] bg-custom-blue rounded-[4.5px] montserrat-medium text-[15px] text-white hover:shadow-custom4'>
              Download
            </button>
          </div>
          <div className='flex items-center h-[34px] gap-[15px] text-sm'>
            <p className='w-[346px]'>Birth Certificate if Single</p>
            {fileName ? (
              <div className='flex items-center justify-center gap-[4px]'>
                <div className='min-w-[65px] max-w-[160px] truncate'>
                  <span className='text-ellipsis overflow-hidden whitespace-nowrap underline text-[#1A73E8] cursor-pointer text-sm'>{fileName}</span>
                </div>
                <div className='flex items-center justify-center p-[8px] '>
                  {/* BEFORE SUBMIT FOR VERIFICATION  TODO: NEED TO COMPLETE ALL FILE UPLOAD*/}
                  <button className='text-custom-solidgreen size-[24px]'><MdEdit className='size-[18px] ' /></button>
                  <button className='text-red-500' onClick={handleDeleteFile}><MdCancel className=' size-[18px]' /></button>

                  {/* AFTER SUBMIT FOR VERIFICATION / ONGOING VERIFICATION */}
                  <p className='text-sm text-custom-solidgreen'>On-going verification</p>

                  {/* VERIFIED */}
                  <div className='flex gap-[8px]'>
                    <p className='flex montserrat-bold text-sm items-center text-custom-lightgreen'>Verified </p><span><IoCheckmarkSharp className='text-custom-lightgreen size-[18px]'/></span>
                  </div>
                  
                </div>
              </div>
            ) : (
              <>
                <label htmlFor='birthCertificate' className='flex items-center justify-center gap-[10px] h-[34px] w-[111px] border border-custom-blue rounded-[4.5px] montserrat-medium text-[15px] text-custom-blue hover:shadow-custom4 cursor-pointer'>
                  <span><LuUpload className='size-5' /></span> Upload
                  <input
                    id='birthCertificate'
                    name='birthCertificate'
                    type='file'
                    className='hidden'
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}
          </div>
          <div className='flex items-center h-[34px] gap-[15px] text-sm'>
            <p className='w-[346px]'>Marriage Certificate if Married</p>
            {fileName2 ? (
              <div className='flex items-center justify-center gap-[4px]'>
                <div className='min-w-[65px] max-w-[160px] truncate'>
                  <span className='text-ellipsis overflow-hidden whitespace-nowrap underline text-[#1A73E8] cursor-pointer text-sm'>{fileName2}</span>
                </div>
                <div className='flex items-center justify-center'>
                  <button className='text-custom-solidgreen size-[24px]'><MdEdit className='size-[18px] ' /></button>
                  <button className='text-red-500' onClick={handleDeleteFile2}><MdCancel className=' size-[18px]' /></button>
                </div>
              </div>
            ) : (
              <>
                <label htmlFor='marriedCertificate' className='flex items-center justify-center gap-[10px] h-[34px] w-[111px] border border-custom-blue rounded-[4.5px] montserrat-medium text-[15px] text-custom-blue hover:shadow-custom4 cursor-pointer'>
                  <span><LuUpload className='size-5' /></span> Upload
                  <input
                    id='marriedCertificate'
                    name='marriedCertificate'
                    type='file'
                    className='hidden'
                    onChange={handleFileChange2}
                  />
                </label>

              </>
            )}
          </div>
          <div className='flex items-center h-[34px] gap-[15px] text-sm'>
            <p className='w-[346px]'>2 Government Issued IDs</p>
            {fileName3 ? (
              <div className='flex items-center justify-center gap-[4px]'>
                <div className='min-w-[65px] max-w-[160px] truncate'>
                  <span className='text-ellipsis overflow-hidden whitespace-nowrap underline text-[#1A73E8] cursor-pointer text-sm'>{fileName3}</span>
                </div>
                <div className='flex items-center justify-center'>
                  <button className='text-custom-solidgreen size-[24px]'><MdEdit className='size-[18px] ' /></button>
                  <button className='text-red-500' onClick={handleDeleteFile3}><MdCancel className=' size-[18px]' /></button>
                </div>
              </div>
            ) : (
              <>
                <label htmlFor='govID' className='flex items-center justify-center gap-[10px] h-[34px] w-[111px] border border-custom-blue rounded-[4.5px] montserrat-medium text-[15px] text-custom-blue hover:shadow-custom4 cursor-pointer'>
                  <span><LuUpload className='size-5' /></span> Upload
                  <input
                    id='govID'
                    name='govID'
                    type='file'
                    className='hidden'
                    onChange={handleFileChange3}
                  />
                </label>

              </>
            )}
          </div>
          <div className='flex items-center h-[34px] gap-[15px] text-sm'>
            <p className='w-[346px]'>Photo Selfie with ID</p>
            {fileName4 ? (
              <div className='flex items-center justify-center gap-[4px]'>
                <div className='min-w-[65px] max-w-[160px] truncate'>
                  <span className='text-ellipsis overflow-hidden whitespace-nowrap underline text-[#1A73E8] cursor-pointer text-sm'>{fileName4}</span>
                </div>
                <div className='flex items-center justify-center'>
                  <button className='text-custom-solidgreen size-[24px]'><MdEdit className='size-[18px] ' /></button>
                  <button className='text-red-500' onClick={handleDeleteFile4}><MdCancel className=' size-[18px]' /></button>
                </div>
              </div>
            ) : (
              <>
                <label htmlFor='selfieID' className='flex items-center justify-center gap-[10px] h-[34px] w-[111px] border border-custom-blue rounded-[4.5px] montserrat-medium text-[15px] text-custom-blue hover:shadow-custom4 cursor-pointer'>
                  <span><LuUpload className='size-5' /></span> Upload
                  <input
                    id='selfieID'
                    name='selfieID'
                    type='file'
                    className='hidden'
                    onChange={handleFileChange4}
                  />
                </label>

              </>
            )}
          </div>
          <div className='flex items-center h-[34px] gap-[15px] text-sm'>
            <p className='w-[346px]'>Proof of Income</p>
            {fileName5 ? (
              <div className='flex items-center justify-center gap-[4px]'>
                <div className='min-w-[65px] max-w-[160px] truncate'>
                  <span className='text-ellipsis overflow-hidden whitespace-nowrap underline text-[#1A73E8] cursor-pointer text-sm'>{fileName5}</span>
                </div>
                <div className='flex items-center justify-center'>
                  <button className='text-custom-solidgreen size-[24px]'><MdEdit className='size-[18px] ' /></button>
                  <button className='text-red-500' onClick={handleDeleteFile5}><MdCancel className=' size-[18px]' /></button>
                </div>
              </div>
            ) : (
              <>
                <label htmlFor='proofIncome' className='flex items-center justify-center gap-[10px] h-[34px] w-[111px] border border-custom-blue rounded-[4.5px] montserrat-medium text-[15px] text-custom-blue hover:shadow-custom4 cursor-pointer'>
                  <span><LuUpload className='size-5' /></span> Upload
                  <input
                    id='proofIncome'
                    name='proofIncome'
                    type='file'
                    className='hidden'
                    onChange={handleFileChange5}
                  />
                </label>

              </>
            )}
          </div>
          <div className='flex items-center h-[34px] gap-[15px] text-sm'>
            <p className='w-[346px]'>Proof of Income</p>
            {fileName6 ? (
              <div className='flex items-center justify-center gap-[4px]'>
                <div className='min-w-[65px] max-w-[160px] truncate'>
                  <span className='text-ellipsis overflow-hidden whitespace-nowrap underline text-[#1A73E8] cursor-pointer text-sm'>{fileName6}</span>
                </div>
                <div className='flex items-center justify-center'>
                  <button className='text-custom-solidgreen size-[24px]'><MdEdit className='size-[18px] ' /></button>
                  <button className='text-red-500' onClick={handleDeleteFile6}><MdCancel className=' size-[18px]' /></button>
                </div>
              </div>
            ) : (
              <>
                <label htmlFor='verifiedTaxNum' className='flex items-center justify-center gap-[10px] h-[34px] w-[111px] border border-custom-blue rounded-[4.5px] montserrat-medium text-[15px] text-custom-blue hover:shadow-custom4 cursor-pointer'>
                  <span><LuUpload className='size-5' /></span> Upload
                  <input
                    id='verifiedTaxNum'
                    name='verifiedTaxNum'
                    type='file'
                    className='hidden'
                    onChange={handleFileChange6}
                  />
                </label>

              </>
            )}
          </div>
        </div>
      </div>
      {isAlertVisible && (
        <AlertMessage/>
      )}
    </div>
  )
}

export default InitialRequirements