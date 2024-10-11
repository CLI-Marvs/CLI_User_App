import React from 'react'

const GoogleMapApi = () => {
    return (
        <div className='flex w-auto items-center h-full px-16'>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15700.493119854838!2d123.89797261738279!3d10.332018100000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a9991f7e51dc85%3A0x640d1b923fd9ba79!2s38%20Park%20Avenue%20Condominium!5e0!3m2!1sen!2sph!4v1720780862791!5m2!1sen!2sph" 
              class="w-[398px] h-[338px] m-12 mr-8 rounded-3xl shadow-2xl focus:outline-none" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
          </iframe>
          <div className='h-[338px] w-[256px] bg-white rounded-[30px] p-[22px]'>
            <p className='text-[25px] text-custom-solidgreen leading-none montserrat-medium'>Urban Oasis</p>
            <p className='text-[18px] text-custom-solidgreen leading-none montserrat-light'>Where park meets the vibrant cityscape.</p>
            <p className='mt-[24px] text-sm leading-[19px] font-light'>Imagine a place where park meets the city. And where East and West are one in panoramic view.</p>
            <p className='mt-5 text-sm leading-[19px] font-light'>Standing high in an avenue, over an address that never sleeps. A New York inspired masterpiece in our very own Cebu IT Park.</p>
          </div>
        </div>
      )
}

export default GoogleMapApi