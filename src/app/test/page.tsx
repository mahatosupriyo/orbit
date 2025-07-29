import MuxUploader from './muxUploader'  // adjust import path if needed
import { auth } from "@/auth"; // or your auth method to get userId

export default async function TestPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return <div>Please login to upload videos</div>;

  // Render the uploader with userId passed in
  return <MuxUploader userId={userId} />;
}
