import React from 'react'
import AdminSettings from '../../../layout/adminsettingpage/AdminSettings'
import TeamAssigneeComponent from '../../../layout/adminsettingpage/TeamAssignee'

const AdminSettingView = () => {
  return (
    <div>
        <AdminSettings/>
         <TeamAssigneeComponent />
    </div>
  )
}

export default AdminSettingView