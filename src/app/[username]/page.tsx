import { db } from "@/server/db"
import { getGaragePosts } from "./getGaragePostofUser"
import { notFound } from "next/navigation"
import GaragePostCard from "./usercapsule/usercapsule"
import { auth } from "@/auth"
import styles from "./username.module.scss"
import AvatarImage from "@/components/atoms/avatar/avatar"
import NavBar from "@/components/molecules/navbar/navbar"
import { GaragePostSchema } from "@/types/userposts"
import type { GaragePost } from "@/types/userposts"

interface UserPageProps {
  params: Promise<{ username: string }>
}

export default async function UserPage({ params }: UserPageProps) {
  const session = await auth()
  const loggedInUserId = session?.user?.id

  // Fix: Await the params since they're now a Promise in Next.js 15
  const { username } = await params

  // Fix: Select name field as well since you want to display it
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
    },
  })

  if (!user || user.id !== loggedInUserId) {
    return notFound()
  }

  try {
    const rawPosts = await getGaragePosts(user.id)

    // Fix: Better error handling for post validation with proper type narrowing
    const posts = rawPosts
      .map((post) => {
        try {
          const parsed = GaragePostSchema.safeParse(post)
          if (!parsed.success) {
            console.error("Post validation failed:", parsed.error, "for post:", post.id)
            return null
          }
          return parsed.data
        } catch (error) {
          console.error("Error parsing post:", error, "for post:", post.id)
          return null
        }
      })
      .filter((post): post is GaragePost => post !== null) // Fix: Proper type guard

    return (
      <div className={styles.wraper}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.userProfile}>
            {/* Fix: Pass user image to AvatarImage component */}
            <AvatarImage size={140} />
            <div className={styles.userInfo}>
              {user.name && <h1 className={styles.userName}>{user.name}</h1>}
              {user.username && <p className={styles.userUsername}>@{user.username}</p>}
            </div>
          </div>

          <div className={styles.postsSection}>
            <h2 className={styles.sectionTitle}>Garage Posts</h2>
            <div className={styles.gridpostlayout}>
              {posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No posts yet.</p>
                </div>
              ) : (
                posts.map((post) => <GaragePostCard key={post.id} post={post} />)
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading user page:", error)
    return (
      <div className={styles.wraper}>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.errorState}>
            <p>Something went wrong loading the posts.</p>
          </div>
        </div>
      </div>
    )
  }
}
