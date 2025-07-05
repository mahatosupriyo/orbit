// src/app/(main)/garage/page.tsx
import { auth } from "@/auth";
import GarageFeed from "./garagefeed";

export default async function GaragePage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold">Please sign in to view your garage.</h2>
            </div>
        );
    }

    return <GarageFeed userId={session.user.id} />;
}
