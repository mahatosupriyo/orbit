import React, { Suspense } from 'react'
import AstraSearch from './astramaincomponent' 

export default function AstraPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <AstraSearch />
    </Suspense>
  )
}
