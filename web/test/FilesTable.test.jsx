import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import FilesTable from '../src/components/FilesTable.jsx'

describe('<FilesTable />', () => {
  it('shows empty state when no data', () => {
    render(<FilesTable data={[]} />)
    expect(screen.getByText(/no data to display/i)).toBeInTheDocument()
  })

  it('flattens lines and renders one row per line', () => {
    const HEX = '70ad29aacf0b690b0467fe2b2767f765'
    const data = [
      { file: 'a.csv', lines: [{ text: 'one', number: 1, hex: HEX }] },
      {
        file: 'b.csv',
        lines: [
          { text: 'two', number: 2, hex: HEX },
          { text: 'three', number: 3, hex: HEX }
        ]
      }
    ]
    render(<FilesTable data={data} />)

    expect(screen.getAllByRole('row')).toHaveLength(4) // header + 3
    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
    expect(screen.getByText('three')).toBeInTheDocument()
    expect(screen.getAllByText('a.csv')).toHaveLength(1)
    expect(screen.getAllByText('b.csv')).toHaveLength(2)
  })
})
