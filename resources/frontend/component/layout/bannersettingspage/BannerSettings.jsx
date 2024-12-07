import React, { useEffect, useState, useRef } from 'react'
import ImageSlideshow from './ImageSlideshow'
import { useStateContext } from '../../../context/contextprovider'
import apiService from '../../servicesApi/apiService'
import { showToast } from "../../../util/toastUtil"
import { CircularProgress } from '@mui/material'


const BannerSettings = () => {
    // ref initialization
    const fileInputRef = useRef(null);
    //useStateContext for getting data from context provider
    const { getBannerData, bannerLists } = useStateContext();

    //state initialization
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bannerId, setBannerId] = useState("");
    const [file, setFile] = useState(null);
    const [link, setLink] = useState("");
    const [indexFlag, setIndexFlag] = useState(null);


    //useEffect initialization for getting data from context
    useEffect(() => {
        getBannerData();
    }, []);
    //useState initialization for file upload
    const [fileName, setFileName] = useState('No file selected');

    //submitHandler for handling form submission
    const submitHandler = async (e) => {
        e.preventDefault();
        //setLoading for loading state
        setLoading(true);


        //check if only the file is null and return if it's true
        if ((file === null && link === "") || (file === null && link !== "")) {
            setLoading(false);
            return showToast("Please upload an image as it is required.", "error");
        } 
        

        //create form data
        const formData = new FormData();
       

        //if edit is true, append the id and file to the form data else append the file and link to create a new banner
        if (isEdit) {
            formData.append('id', bannerId);
            if (file) formData.append('banner_image', file);
            formData.append('banner_link', link);
        } else {
            formData.append('banner_image', file);
            formData.append('banner_link', link);
        }


        try {
            //if edit is true, call the update-banner endpoint else call the store-banner endpoint
            const endpoint = isEdit ? "update-banner" : "store-banner";
            const response = await apiService.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            getBannerData();
            removeData();
            showToast("Data updated successfully!", "success");
        } catch (error) {
            removeData();
            console.log("error", error);
        } finally {
            setLoading(false);
        }
    };
    //removeData for removing the data from the state after editing or submitting
    const removeData = () => {
        setIsEdit(false);
        setFileName('');
        setFile(null);
        setLink('');
        setLoading(false);
    }
    

    //deleteBanner for deleting the banner
    const deleteBanner = async (id) => {
        try {
            const response = await apiService.delete(`/banner/${id}`);
            removeData();
            getBannerData();
            showToast("Data deleted successfully!", "success");
        } catch (error) {
            removeData();
            console.log("error", error);
        }
    };

    //editForm for editing the form
    const editForm = (item) => {
        const {id, banner_link, banner_image, original_file_name } = item;
        setBannerId(id);
        setIsEdit(true);
        setLink(banner_link);
        setFile(banner_image);
        setFileName(original_file_name);
    }
    //handleFileChange for handling file change in the file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setFile(file);
        } else {
            setFileName('No file selected');
        }
    };

    return (
        <div className='h-screen max-w-full bg-custom-grayFA p-[20px]'>
            <div className='flex mb-[12px]'>
                <p className='font-semibold text-[32px]'>Live Preview</p>
            </div>
            <div className='flex flex-col gap-[20px] max-w-[787px] pb-[100px]'>
                {/* image slideshow */}
                <div className='w-full'>
                    <ImageSlideshow />
                </div>
                <div className='w-full border-t-[1px] border-custom-grayA5'></div>
                <div className='flex flex-col gap-[12px] w-full'>
                    <p className=''>Banners</p>
                    {/* should be dynamic below */}
                    {bannerLists && bannerLists.length > 0 && bannerLists.map((item, index) => (
                        <div key={index} className='w-full h-[112px] rounded-[10px] bg-custom-lightestgreen p-[20px]'>
                            <div className=' flex flex-col w-full h-full bg-white rounded-[10px] justify-center'>
                                <div className='flex h-[31px] px-[16px] items-center gap-[11px] text-sm'>
                                    <p className='montserrat-medium '>Image:</p>
                                    <div className='w-[345px] shrink-0 montserrat-light'>
                                        {item.original_file_name}
                                    </div>
                                    <div className='flex w-full justify-end items-center'>
                                        <div className='flex gap-[19px] text-sm'>
                                            {(!isEdit || indexFlag !== index) && (                                        
                                                <button onClick={() =>{
                                                    editForm(item);
                                                    setIndexFlag(index);
                                                }} className='montserrat-medium bg-gradient-to-r from-custom-bluegreen to-custom-solidgreen bg-clip-text text-transparent'>Edit</button>
                                            ) }
                                            <button onClick={() => deleteBanner(item.id)} className='montserrat-medium text-[#EB4444]'>Delete</button>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex h-[31px] px-[16px] items-center gap-[25px] text-sm'>
                                    <p className='montserrat-medium'>Link:</p>
                                    <a href={item.banner_link} target="_blank" rel="noreferrer" className='text-blue-500'>{item.banner_link}</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='w-full border-t-[1px] border-custom-grayA5'></div>
                <div className='flex flex-col gap-[10px] w-full bg-[#EBEBEB] p-[20px] rounded-[10px]'>
                    <div className='flex w-full rounded-[10px] relative bg-white overflow-hidden'>
                        <div className='flex w-[108px] justify-center items-center px-[15px] py-[6px] text-white bg-[#273B4A] rounded-l-[10px]'>
                            Image
                        </div>
                        <div className="flex w-[335px] justify-start items-center px-[15px] py-[6px] bg-white overflow-hidden">
                            <p className="truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                {fileName ? fileName : `No file selected`}
                            </p>
                        </div>
                        <div className='absolute right-4 top-2'>
                            <label className='w-[74px] h-[22px] flex justify-center items-center text-white bg-custom-lightgreen py-[6px] montserrat-medium text-xs rounded-[5px] cursor-pointer'>
                                Upload
                                <input
                                    type='file'
                                    className='hidden'
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>
                    <div className='flex w-full rounded-[10px] relative bg-white overflow-hidden'>
                        <div className='flex w-[108px] justify-center items-center px-[15px] py-[6px] text-white bg-[#273B4A] shrink-0 rounded-l-[10px]'>
                            Link
                        </div>
                        <input onChange={(e) => setLink(e.target.value)} value={link} name='banner-link' type="text" className='w-full px-[15px] outline-none' />
                    </div>
                    <div className='w-full flex justify-center items-center text-sm'>
                        {loading ? (
                            <CircularProgress className="spinnerSize2" />
                        ) : (
                            <>
                                {isEdit ? (
                                    <>
                                        <div className='flex gap-[10px]'>
                                            <button disabled={loading} onClick={submitHandler} className={`flex justify-center items-center gradient-btn2 w-[104px] h-[31px] text-white rounded-[5px] py-[10px] ${loading ? 'cursor-not-allowed' : ''}`}>
                                                Update
                                            </button>
                                            <button onClick={removeData} className='flex justify-center items-center gradient-btn2 w-[104px] h-[31px] text-white rounded-[5px] py-[10px]'>
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <button disabled={loading} onClick={submitHandler} className={`flex justify-center items-center gradient-btn2 w-[104px] h-[31px] text-white rounded-[5px] py-[10px] ${loading ? 'cursor-not-allowed' : ''}`}>
                                        Save
                                    </button>
                                )}
                            </>
                        )}  
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BannerSettings