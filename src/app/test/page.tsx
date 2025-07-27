
import { generateMuxSignedUrls } from './generateSignedUrl'
import Video from 'next-video'

export default async function TestMuxPage() {
    const playbackId = 'npKfAXQdUYKC4RcH2qUnKKgTT4KShuf01bW2aT3547JU'
    const { videoUrl: signedVideoUrl, posterUrl: signedPosterUrl } = await generateMuxSignedUrls(playbackId)

    return (
        <main style={{ padding: '2rem' }}>
            <div style={{
                height: '100%',
                width: '100%',
                aspectRatio: '16/9'
            }}>
                <Video
                    src={signedVideoUrl}
                    poster={signedPosterUrl}
                    controls
                    style={{ borderRadius: '12px' }}
                />

                <img src={signedPosterUrl} />
            </div>
        </main>
    )
}
