'use client'

import { useState, useTransition } from 'react'
import { searchGaragePosts } from './experiment' // updated path
import CapsuleCard from '@/components/molecules/capsules/capsule'
import { z } from 'zod'
import styles from './experiment.module.scss'

const SearchSchema = z.object({
  query: z.string().min(1).max(100),
})

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSearch = () => {
    const parse = SearchSchema.safeParse({ query })
    if (!parse.success) return

    startTransition(async () => {
      const { posts, hasMore, nextCursor } = await searchGaragePosts(query)
      setResults(posts)
      setNextCursor(hasMore ? nextCursor : null)
    })
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
        <div className={styles.inputBox}>
          <input
            type="text"
            placeholder="Search garage posts..."
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isPending}
          />
          <button
            onClick={handleSearch}
            disabled={isPending}
            className={styles.button}
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
        </div>

        {results.length === 0 && !isPending && (
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
