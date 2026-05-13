import React from 'react'
import { Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import { selectViewMode } from '../store/selectors.js'
import { setViewMode } from '../store/filesSlice.js'

export default function ViewModeSwitch () {
  const dispatch = useDispatch()
  const mode = useSelector(selectViewMode)
  const isBaseline = mode === 'baseline'

  function onChange (e) {
    dispatch(setViewMode(e.target.checked ? 'baseline' : 'full'))
  }

  return (
    <Form.Check
      type='switch'
      id='view-mode-switch'
      label='Baseline view'
      checked={isBaseline}
      onChange={onChange}
      title='Hide KPIs, Data Quality and search for the wireframe-only layout'
      className='text-white view-mode-switch'
    />
  )
}
