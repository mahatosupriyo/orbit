'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'


export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = searchTerm.trim()
    if (!trimmed) return
    router.push(`/astra?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <nav>

      <form onSubmit={onSubmit} style={{ display: 'inline-flex', gap: '0.5rem' }}>
        <input
          type="search"
          placeholder="Search garage posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search garage posts"
        />
        <button type="submit">Search</button>
      </form>
    </nav>
  )
}
