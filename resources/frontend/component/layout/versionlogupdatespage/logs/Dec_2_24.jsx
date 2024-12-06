import React from 'react'

const Dec_2_24 = () => {
  return (
    <div className='flex gap-[24px] w-[1033px] min-h-[100px] p-[30px] '>
    <div className='flex w-[150px] shrink-0'>
        <p className='text-[#717171]'>December 2, 2024</p>
    </div>
    <div className='flex flex-col gap-[24px]'>
        <div className='w-full flex flex-col gap-[12px]'>
            <div>
                <p className='text-[#2A2A2A]'>Feature Updates:</p>
            </div>
            <div className='flex flex-col text-[#717171] '>
                <div className='flex'>
                    <div className='flex w-[30px] shrink-0 justify-center'>
                        •
                    </div>
                    <div>
                        Inquiry notifications now send a default reply to customers/senders using ask@cebulandmasters.com, and recipients can reply directly to the email notification.
                    </div>
                </div>
                <div className='flex'>
                    <div className='flex w-[30px] shrink-0 justify-center'>
                        •
                    </div>
                    <div>
                        The pop-up form for creating new tickets after a ticket is closed/resolved is now editable, except for the details and attachments fields, which come directly the sender.
                    </div>
                </div>
                <div className='flex'>
                    <div className='flex w-[30px] shrink-0 justify-center'>
                        •
                    </div>
                    <div>
                        Updated the role of CRS team members: they can now assign tickets but cannot remove assignees or mark tickets as resolved/closed.
                    </div>
                </div>
                <div className='flex'>
                    <div className='flex w-[30px] shrink-0 justify-center'>
                        •
                    </div>
                    <div>
                        Added a download feature for attachments.
                    </div>
                </div>
            </div>
        </div>
        <div className='w-full flex flex-col gap-[12px]'>
            <div>
                <p className='text-[#2A2A2A]'>Bug Fixes:</p>
            </div>
            <div className='flex flex-col text-[#717171] '>
                <div className='flex'>
                    <div className='flex w-[30px] shrink-0 justify-center'>
                        •
                    </div>
                    <div>
                        Added users who are not on the list of employees (more may need to be added in the future, but a permanent solution is being worked on).
                    </div>
                </div>
                <div className='flex'>
                    <div className='flex w-[30px] shrink-0 justify-center'>
                        •
                    </div>
                    <div>
                        Fixed an issue where assignees were missing when selection multiple assignees.
                    </div>
                </div>
                <div className='flex'>
                    <div className='flex w-[30px] shrink-0 justify-center'>
                        •
                    </div>
                    <div>
                        Fixed an issue where capital letters in the property list were automatically converted to lowercase.
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
  )
}

export default Dec_2_24