'use client'

import { useState, useTransition, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { searchGaragePosts } from './astrasearch' // adjust path if needed
import CapsuleCard from '@/components/molecules/capsules/capsule'
import { z } from 'zod'
import { motion } from 'framer-motion'
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
        <>
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.785, 0.135, 0.15, 0.86] }}
                onSubmit={handleSubmit} 
                className={styles.inputBox}
                >
                <input
                    type="text"
                    className={styles.input}
                    value={query}
                    placeholder='Search anything'
                    onChange={handleInputChange}
                    disabled={isPending}
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className={styles.astrabutton}
                >

                    <svg xmlns="http://www.w3.org/2000/svg" className={styles.searchicon} viewBox="0 0 39 39">
                        <path d="M25.8762 23.8695C27.1206 22.2102 27.8545 20.1538 27.8545 17.9273C27.8545 12.4531 23.4015 8 17.9273 8C12.4531 8 8 12.4531 8 17.9273C8 23.4015 12.4531 27.8545 17.9273 27.8545C20.1538 27.8545 22.2102 27.1171 23.8695 25.8762L28.2694 30.2761C28.5459 30.5526 28.9075 30.6909 29.2727 30.6909C29.6379 30.6909 29.9995 30.5526 30.2761 30.2761C30.8292 29.723 30.8292 28.826 30.2761 28.2694L25.8762 23.8695ZM17.9273 25.0182C14.0166 25.0182 10.8364 21.8379 10.8364 17.9273C10.8364 14.0166 14.0166 10.8364 17.9273 10.8364C21.8379 10.8364 25.0182 14.0166 25.0182 17.9273C25.0182 21.8379 21.8379 25.0182 17.9273 25.0182Z" />
                    </svg>
                    <span className={styles.key}>
                        ↵
                    </span>
                    {/* {isPending ? 'Searching...' : 'Search'} */}
                </button>
            </motion.form>

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
                        className={styles.morebutton}
                    >

                        <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 98 143" fill="#fff">
                            <path d="M39.6967 0.433594H58.9738V128.48H39.6967V0.433594Z" />
                            <path d="M0.433595 95.5824L0.433594 68.9272L62.1773 128.552L48.7725 142.434L0.433595 95.5824Z" />
                            <path d="M97.5672 95.5452V68.9273L35.9101 128.469L49.2961 142.331L97.5672 95.5452Z" />
                        </svg>
                        {/* {isPending ? 'Loading...' : 'Load More'} */}
                    </button>
                </div>
            )}
        </>
    )
}
