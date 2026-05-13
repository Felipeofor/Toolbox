import React from 'react'
import { Nav, Container } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import { setActiveTab } from '../store/filesSlice.js'
import { selectActiveTab } from '../store/selectors.js'
import DashboardPanel from './DashboardPanel.jsx'
import FilesPanel from './FilesPanel.jsx'

export default function MainTabs () {
  const dispatch = useDispatch()
  const active = useSelector(selectActiveTab)

  function onSelect (tab) {
    if (!tab) return
    dispatch(setActiveTab(tab))
  }

  return (
    <>
      <div className='bg-white border-bottom'>
        <Container>
          <Nav
            variant='tabs'
            activeKey={active}
            onSelect={onSelect}
            aria-label='Main views'
            role='tablist'
          >
            <Nav.Item>
              <Nav.Link eventKey='dashboard' role='tab' aria-selected={active === 'dashboard'}>
                Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey='files' role='tab' aria-selected={active === 'files'}>
                Files
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>
      </div>
      <Container className='py-4'>
        {active === 'dashboard' ? <DashboardPanel /> : <FilesPanel />}
      </Container>
    </>
  )
}
