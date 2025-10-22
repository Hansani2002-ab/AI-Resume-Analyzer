import React from 'react'
import { useParams } from 'react-router'

const resume = () => {

    const { id } = useParams();
  return (
    <div>
      <div>Resume {id}</div>
    </div>
  )
}

export default resume
