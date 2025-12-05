import React, { useEffect, useState } from 'react'
import apiService, { imgUrl } from '../servicesApi/apiService';

const DashboardCom = () => {

  const [propertyData, setPropertyData] = useState([]);
  const getData = async () => {
    const response = await apiService.get('get-property');
    setPropertyData(response.data);
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <div className='text-red-500'>
      {propertyData.map((item, index)  => {
        const {picture} = item;
        const img_url = `${imgUrl}/fileupload/property/${picture}`
        return (
          <div key={index}>
          <img src={img_url} alt={`Property ${index}`} />
        </div>
        )
      })}
      
    </div>
  )
}

export default DashboardCom
