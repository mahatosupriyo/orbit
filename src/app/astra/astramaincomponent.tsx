'use client'

import { useState, useTransition, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { searchGaragePosts } from './astrasearch' // adjust path if needed
import CapsuleCard from '@/components/molecules/capsules/capsule'
import { z } from 'zod'
import styles from './astrasearch.module.scss'

const SearchSchema = z.object({
  query: z.string().min(1).max(100),
})

export default function AstraSearch() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const urlQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(urlQuery)
  const [results, setResults] = useState<any[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!urlQuery) {
      setResults([])
      setNextCursor(null)
      setQuery('')
      return
    }

    const parse = SearchSchema.safeParse({ query: urlQuery })
    if (!parse.success) return

    startTransition(async () => {
      const { posts, hasMore, nextCursor } = await searchGaragePosts(urlQuery)
      setResults(posts)
      setNextCursor(hasMore ? nextCursor : null)
      setQuery(urlQuery)
    })
  }, [urlQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    const parse = SearchSchema.safeParse({ query: trimmedQuery })
    if (!parse.success) return

    router.push(`/astra?q=${encodeURIComponent(trimmedQuery)}`)
  }

  const loadMore = () => {
    if (!nextCursor) return
    startTransition(async () => {
      const { posts, hasMore, nextCursor: newCursor } = await searchGaragePosts(query, undefined, nextCursor)
      setResults((prev) => [...prev, ...posts])
      setNextCursor(hasMore ? newCursor : null)
    })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.inputBox}>
          <input
            type="text"
            placeholder="Search garage posts..."
            className={styles.input}
            value={query}
            onChange={handleInputChange}
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className={styles.button}
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
        </form>

        {pathname === '/astra' && results.length === 0 && !isPending && (
          <p className={styles.nothing}>No posts found.</p>
        )}

        <div className={styles.results}>
          {results.map((post) => (
            <CapsuleCard key={post.id} post={post} />
          ))}
        </div>

        {nextCursor && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={loadMore}
              disabled={isPending}
              className={styles.button}
            >
              {isPending ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
