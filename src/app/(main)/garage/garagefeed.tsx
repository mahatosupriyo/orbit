"use client"

import useSWRInfinite from "swr/infinite"
import { useEffect, useState } from "react"
import styles from "./garage.module.scss"
import NavBar from "@/components/molecules/navbar/navbar"
import CapsuleCard from "@/components/molecules/capsules/capsule"
import { motion, type Variants, cubicBezier } from "framer-motion"
import Link from "next/link"
import Icon from "@/components/atoms/icons"
import OrbitLoader from "@/components/atoms/lotties/loader"

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  if (res.status === 429) {
    const retryAfterHeader = res.headers.get("retry-after")
    const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : Number.NaN
    const err: any = new Error("Rate limited. Please try again later.")
    err.status = 429
    err.retryAfter = Number.isFinite(retryAfter) ? retryAfter : 60 // default to 60s
    throw err
  }

  if (!res.ok) {
    let message = "Request failed"
    try {
      // Try to parse server-provided error
      const text = await res.text()
      message = text || message
    } catch {
      // ignore
    }
    const err: any = new Error(message)
    err.status = res.status
    throw err
  }

  return res.json()
}

const containerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.2 } },
}

const itemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: cubicBezier(0.785, 0.135, 0.15, 0.86) },
  },
}

export default function GarageFeed() {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [nowTick, setNowTick] = useState<number>(Date.now())

  useEffect(() => {
    if (!rateLimitedUntil) return
    const t = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(t)
  }, [rateLimitedUntil])

  const getKey = (pageIndex: number, previousPageData: any) => {
    // Stop fetching if rate-limited
    if (rateLimitedUntil && Date.now() < rateLimitedUntil) return null

    // Stop fetching if no more data or free user has reached limit
    if (previousPageData && !previousPageData.hasMore) return null
    if (pageIndex === 0) return `/api/garage`
    return `/api/garage?cursor=${previousPageData.nextCursor}`
  }

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000,
    shouldRetryOnError: false,
    errorRetryCount: 0,
    onError: (err: any) => {
      if (err?.status === 429) {
        const until = Date.now() + (err?.retryAfter ?? 60) * 1000
        setRateLimitedUntil(until)
        setErrorMsg("You're making requests too quickly. Please wait and try again.")
      } else {
        setErrorMsg(err?.message || "Something went wrong fetching the feed.")
      }
    },
  })

  const posts = data ? data.flatMap((page) => page.posts) : []

  // Determine if we should keep fetching more
  const hasMore = data ? data[data.length - 1].hasMore : true

  useEffect(() => {
    async function fetchSubStatus() {
      try {
        const res = await fetch("/api/subscription/status")
        const json = await res.json()
        setHasSubscription(json.active)
      } catch (e) {
        setHasSubscription(false)
      }
    }
    fetchSubStatus()
  }, [])

  // Infinite scroll
  useEffect(() => {
    if (!hasMore) return // stop listening if no more posts
    if (rateLimitedUntil && Date.now() < rateLimitedUntil) return // stop while blocked

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !isValidating &&
        hasMore &&
        !(rateLimitedUntil && Date.now() < rateLimitedUntil)
      ) {
        setSize(size + 1)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [size, setSize, isValidating, hasMore, rateLimitedUntil])

  const remainingSeconds = rateLimitedUntil ? Math.max(0, Math.ceil((rateLimitedUntil - nowTick) / 1000)) : 0

  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>
        {/* Rate limit banner */}
        {rateLimitedUntil && remainingSeconds > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm"
          >
            You are temporarily rate-limited. Try again in {remainingSeconds}s.
          </div>
        )}

        {/* Error banner (hidden while rate-limited) */}
        {!rateLimitedUntil && errorMsg && (
          <div role="alert" className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        <div className={styles.capsulegrid}>
          <div className={styles.gridhead}>
            <Link draggable="false" className={styles.linkwraper} href="/colorextractor" aria-label="Color">
              <div className={styles.gridcapsule}>
                <Icon name="colorextractor" size={46} fill="#fff" />
              </div>
            </Link>
          </div>

          <div className={styles.deengineering}>
            <motion.div className={styles.drops} variants={containerVariants} initial="initial" animate="animate">
              {posts.map((post: any, index: number) => (
                <motion.div
                  key={post.id}
                  className={styles.dropcard}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <CapsuleCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {isValidating && hasMore && !(rateLimitedUntil && remainingSeconds > 0) && (
          <div
            className={styles.drops}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}
          >
            <OrbitLoader />
          </div>
        )}
      </div>
    </div>
  )
}
