import { Suspense } from 'react'
import AstraSearch from '../astra/page'

export default function AstraPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AstraSearch />
    </Suspense>
  )
}
