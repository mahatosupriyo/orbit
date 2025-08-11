'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import styles from './astrasearch.module.scss' // optional styling

export default function AstraSearchBox() {
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
        <form onSubmit={handleSubmit} className={styles.astraform}>
            <input
                type="text"
                // placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.astrainput}
            />
            <button type="submit" className={styles.astrabutton}>

                <svg xmlns="http://www.w3.org/2000/svg" className={styles.searchicon} viewBox="0 0 39 39">
                    <path d="M25.8762 23.8695C27.1206 22.2102 27.8545 20.1538 27.8545 17.9273C27.8545 12.4531 23.4015 8 17.9273 8C12.4531 8 8 12.4531 8 17.9273C8 23.4015 12.4531 27.8545 17.9273 27.8545C20.1538 27.8545 22.2102 27.1171 23.8695 25.8762L28.2694 30.2761C28.5459 30.5526 28.9075 30.6909 29.2727 30.6909C29.6379 30.6909 29.9995 30.5526 30.2761 30.2761C30.8292 29.723 30.8292 28.826 30.2761 28.2694L25.8762 23.8695ZM17.9273 25.0182C14.0166 25.0182 10.8364 21.8379 10.8364 17.9273C10.8364 14.0166 14.0166 10.8364 17.9273 10.8364C21.8379 10.8364 25.0182 14.0166 25.0182 17.9273C25.0182 21.8379 21.8379 25.0182 17.9273 25.0182Z" />
                </svg>

                <span className={styles.key}>
                    ↵
                </span>
            </button>
        </form>
    )
}
