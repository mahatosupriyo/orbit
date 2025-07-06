import { auth } from "@/auth";
import GarageFeed from "./garagefeed";
import { redirect } from "next/navigation";

export default async function GaragePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/auth')
    }

    return (
        <GarageFeed userId={session.user.id} />
    );
}
