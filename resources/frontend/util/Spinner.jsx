import { CircularProgress } from '@mui/material'
import React from 'react'

const Spinner = ({className}) => {
  return (
    <div>
      <CircularProgress className={className}/>
    </div>
  )
}

export default Spinner
