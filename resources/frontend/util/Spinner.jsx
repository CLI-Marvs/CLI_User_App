import { CircularProgress } from '@mui/material'
import React from 'react'

const Spinner = ({className}) => {
  return (
    <div>
      <CircularProgress className='spinnerSize' />
    </div>
  )
}

export default Spinner
