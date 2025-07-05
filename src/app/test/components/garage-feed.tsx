"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import GaragePostCard from "./garage-card"
import { getGaragePosts } from "../getGaragePost"
import styles from "./garage.module.scss"

const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  caption: z.string().nullable(),
  externalUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  images: z.array(z.object({
    id: z.number(),
    url: z.string().url(),
    order: z.number().nullable(),
  })),
  makingOf: z.object({
    id: z.number(),
    playbackID: z.string(),
  }).nullable(),
})

const PostsArraySchema = z.array(PostSchema)

interface GarageFeedProps {
  userId: string
}

export default function GarageFeed({ userId }: GarageFeedProps) {
  const [posts, setPosts] = useState<z.infer<typeof PostsArraySchema>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getGaragePosts(userId)
        const parsed = PostsArraySchema.parse(data)
        setPosts(parsed)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [userId])

  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.placeholder} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No posts found</p>
        <span>Create your first garage post to get started!</span>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GaragePostCard post={post} userId={userId} />
        </motion.div>
      ))}
    </div>
  )
}
