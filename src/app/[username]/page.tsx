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
import AvatarImageForUser from "@/components/atoms/avatar/useravatar"
import Icon from "@/components/atoms/icons"
import BackBtn from "@/components/atoms/(buttons)/backbtn/backbtn"

interface UserPageProps {
  params: Promise<{ username: string }>
}

export default async function UserPage({ params }: UserPageProps) {
  const session = await auth()

  // Fix: Check if user is logged in (any logged-in user can view profiles)
  if (!session?.user?.id) {
    return notFound()
  }

  const loggedInUserId = session.user.id
  const { username } = await params

  // Find the profile user
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
    },
  })

  // Only check if user exists, not if it's the logged-in user
  if (!user) {
    return notFound()
  }

  // Check if viewing own profile
  const isOwnProfile = user.id === loggedInUserId

  try {
    const rawPosts = await getGaragePosts(user.id)

    // Better error handling for post validation with proper type narrowing
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
      .filter((post): post is GaragePost => post !== null)

    return (
      <div className={styles.wraper}>
        <NavBar />
        <div className={styles.container}>
          <BackBtn />
          <div className={styles.userProfile}>
            <AvatarImageForUser userId={user.id} size={100} />
            <div className={styles.userInfo}>
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.orbitoriginal} viewBox="0 0 138 231" fill="none">
                <path d="M0 0H138V231L69 208.5L0 231V0Z" fill="#1414FF" />
                <path fillRule="evenodd" clipRule="evenodd" d="M69.1426 135.861C73.1293 135.861 76.3611 132.629 76.3611 128.643C76.3611 124.656 73.1293 121.424 69.1426 121.424C65.1559 121.424 61.924 124.656 61.924 128.643C61.924 132.629 65.1559 135.861 69.1426 135.861ZM69.1426 176.285C95.4548 176.285 116.785 154.955 116.785 128.643C116.785 102.33 95.4548 81 69.1426 81C42.8303 81 21.5 102.33 21.5 128.643C21.5 154.955 42.8303 176.285 69.1426 176.285Z" fill="white" />
              </svg>
              {user.username && <p className={styles.userUsername}>
                {user.username}
                <Icon name="verified" size={11.6} />
              </p>}
              {user.name && (
                <h1 className={styles.userName}>
                  {user.name}
                  {isOwnProfile && <span className={styles.ownProfileBadge}></span>}
                </h1>
              )}
            </div>
          </div>

          <div className={styles.postsSection}>
            <h2 className={styles.sectionTitle}>
              {/* {isOwnProfile ? "Your Garage Posts" : `${user.name || user.username}'s Garage Posts`} */}
            </h2>
            <div className={styles.gridpostlayout}>
              {posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>{isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}</p>
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
