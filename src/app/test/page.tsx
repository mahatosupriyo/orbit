// import { auth } from '@/auth'
// import { redirect } from 'next/navigation'
// import GaragePostView from './garageposts'
// import { Metadata } from 'next';

// export default async function GaragePage() {
//   const session = await auth()
//   if (!session?.user?.id) redirect('/')

//   if (session.user.role !== 'ADMIN') redirect('/')



//   return (
//     <div>
//       <GaragePostView />
//     </div>
//   )
// }

// app/mux-test/page.tsx
import { getSignedMuxUrl, getSignedPosterUrl } from "@/lib/getSignedMuxUrl";

export default async function MuxTestPage() {
  // Replace this with a real playback ID from your signed Mux asset
  const playbackId = "02AD7dj029302YqBBz02zv44ECCdMu6KaYp4KJunzmYMFRQ";

  const videoUrl = await getSignedMuxUrl(playbackId);
  const posterUrl = await getSignedPosterUrl(playbackId);

  return (
    <main style={{ padding: "2rem", background: "#111", color: "#fff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Mux Signed URL Test</h1>

      {videoUrl && posterUrl ? (
        <video
          controls
          autoPlay
          muted
          src={videoUrl}
          style={{ width: "100%", maxWidth: "720px", borderRadius: "1rem" }}
          poster={posterUrl}
        >
          {/* <source src={videoUrl} type="application/x-mpegURL" /> */}
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>No signed URLs available. Make sure your playback ID is valid.</p>
      )}
    </main>
  );
}
