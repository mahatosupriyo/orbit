'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import styles from './astrasearch.module.scss' // optional styling

export default function NavbarSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length === 0) return
    if (pathname === '/astra') {
      router.push(`/astra?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push(`/astra?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        placeholder="Search garage posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>Search</button>
    </form>
  )
}
