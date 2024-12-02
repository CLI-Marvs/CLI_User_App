import React,{useEffect, useState, useRef} from 'react'
import ImageSlideshow from './ImageSlideshow'
import { useStateContext } from '../../../context/contextprovider'
import apiService from '../../servicesApi/apiService'
const BannerSettings = () => {
    const fileInputRef = useRef(null);

    const { getBannerData, bannerLists } = useStateContext();

    const [file, setFile] = useState(null);
    const [link, setLink] = useState("");
    useEffect(() => {
        getBannerData();
    }, []);
    

    const [fileName, setFileName] = useState('No file selected');

    
    const submitHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('banner_image', file);
        formData.append('banner_link', link);
        try {
            const response = await apiService.post("store-banner", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            getBannerData();
            setFileName('');
            setFile(null);                    
            setLink('');   
            console.log('Success:', response);
        } catch (error) {
            setFileName('');
            setFile(null);                     
            setLink('');   
            console.log("error", error);
        }
    };

    const deleteBanner = async (id) => {     
        try {
            const response = await apiService.delete(`/banner/${id}`);
            setFileName('');
            setFile(null);                     
            setLink('');   
            console.log('Success:', response);
        } catch (error) {
            setFileName('');
            setFile(null);                     
            setLink('');   
            console.log("error", error);
        }
    };

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
                <p className='montserrat-semibold text-[20px]'>Live Preview</p>
            </div>
            <div className='flex flex-col gap-[20px] max-w-[583px] pb-[100px]'>
                <div className='w-full'>
                    <ImageSlideshow />
                </div>
                <div className='w-full border-t-[1px] border-custom-grayA5'></div>
                <div className='flex flex-col gap-[12px] w-full'>
                    <p className='montserrat-medium'>Settings</p>
                    {/* should be dynamic below */}
                    {bannerLists && bannerLists.length > 0 && bannerLists.map((item, index) => (
                    <div key={index} className='w-full h-[112px] rounded-[10px] bg-custom-lightestgreen p-[20px]'>
                        <div className=' flex flex-col w-full h-full bg-white rounded-[10px] justify-center'>
                            <div className='flex h-[31px] px-[16px] items-center gap-[11px] text-sm'>
                                <p className='montserrat-medium '>Image:</p>
                                <div className='w-[345px] montserrat-light'>
                                    {item.original_file_name}
                                </div>
                                <div className='flex gap-[19px] text-sm'>
                                    <button className='montserrat-medium bg-gradient-to-r from-custom-bluegreen to-custom-solidgreen bg-clip-text text-transparent'>Edit</button>
                                    <button onClick={() => deleteBanner(item.id)} className='montserrat-medium text-[#EB4444]'>Delete</button>
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
                        <div className='flex w-[108px] justify-start items-center px-[15px] py-[6px] text-white bg-[#273B4A] rounded-l-[10px]'>
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
                        <div className='flex w-[108px] justify-start items-center px-[15px] py-[6px] text-white bg-[#273B4A] shrink-0 rounded-l-[10px]'>
                            Link
                        </div>
                        <input onChange={(e) => setLink(e.target.value)} value={link} name='banner-link' type="text" className='w-full px-[15px] outline-none' />
                    </div>
                    <div className='w-full flex justify-center items-center text-sm'>
                        <button onClick={submitHandler} className='flex justify-center items-center gradient-btn2 w-[104px] h-[31px] text-white rounded-[5px] py-[10px]'>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BannerSettings