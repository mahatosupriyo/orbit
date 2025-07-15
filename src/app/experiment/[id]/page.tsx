import { db } from "@/server/db";
import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export default async function GaragePostPage({ params }: Props) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    notFound();
  }

  const post = await db.garagePost.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      makingOf: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main>
      <h1>{post.title}</h1>
      {post.caption && <p>{post.caption}</p>}

      {/* <div>
        {post.images.map((img) => (
        
          <img key={img.id} src={img.playbackID} alt={post.title} />
        ))}
      </div> */}

    </main>
  );
}
