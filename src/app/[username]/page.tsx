import { db } from "@/server/db";
import { getGaragePosts } from "./getGaragePostofUser";
import { notFound } from "next/navigation";
import GaragePostCard from "./usercapsule/usercapsule";
import { auth } from "@/auth"; // your auth helper
import styles from './username.module.scss';
import AvatarImage from "@/components/atoms/avatar/avatar";
import NavBar from "@/components/molecules/navbar/navbar";

interface UserPageProps {
    params: { username: string };
}

export default async function UserPage({ params }: UserPageProps) {
    const session = await auth();
    const loggedInUserId = session?.user?.id;

    const { username } = params;

    const user = await db.user.findUnique({
        where: { username },
        select: { id: true, username: true, image: true },
    });

    if (!user || user.id !== loggedInUserId) {
        return notFound(); // or redirect("/")
    }

    const posts = await getGaragePosts(user.id);

    const postsWithCreator = posts.map((post) => ({
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
        createdBy: {
            username: user.username,
            image: user.image,
        },
    }));

    return (
        <div className={styles.wraper}>
            <NavBar />

            <div className={styles.container}>

                <AvatarImage size={140} />
                <div className={styles.gridpostlayout}>
                    {postsWithCreator.length === 0 ? (
                        <p>No posts yet.</p>
                    ) : (
                        postsWithCreator.map((post) => (
                            <GaragePostCard key={post.id} post={post} />
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
