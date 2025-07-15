// import { db } from "@/server/db";
// import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

// const cloudfrontEnv = {
//   keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
//   privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
//   cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
// };

// export async function getGaragePosts() {
//   try {
//     const posts = await db.garagePost.findMany({
//       where: {
//         createdBy: {
//           verified: true,
//         },
//       },
//       include: {
//         images: {
//           orderBy: { order: "asc" },
//         },
//         makingOf: true,
//         createdBy: {
//           select: {
//             username: true,
//             image: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     const signedPosts = await Promise.all(
//       posts.map(async (post) => {
//         const signedImages = await Promise.all(
//           post.images.map(async (image) => {
//             const url = `${cloudfrontEnv.cloudfrontUrl}/${image.playbackID}`;
//             try {
//               const signedUrl = getSignedUrl({
//                 url,
//                 keyPairId: cloudfrontEnv.keyPairId,
//                 privateKey: cloudfrontEnv.privateKey,
//                 dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
//               });

//               return {
//                 id: image.id,
//                 url: signedUrl,
//                 order: image.order,
//               };
//             } catch (error) {
//               console.error("Failed to sign image URL:", error);
//               return null;
//             }
//           })
//         );

//         return {
//           ...post,
//           images: signedImages.filter(Boolean) as Array<{
//             id: number;
//             url: string;
//             order: number | null;
//           }>,
//         };
//       })
//     );

//     return signedPosts;
//   } catch (error) {
//     console.error("Failed to fetch garage posts:", error);
//     return [];
//   }
// }


import { db } from "@/server/db";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const cloudfrontEnv = {
  keyPairId: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID!,
  privateKey: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  cloudfrontUrl: process.env.ORBIT_CLOUDFRONT_URL!,
};

const PLACEHOLDER_AVATAR = "https://ontheorbit.com/placeholder.png";

async function signUrl(keyOrUrl: string | null): Promise<string> {
  if (!keyOrUrl) return PLACEHOLDER_AVATAR;

  // If already absolute URL, return as is
  if (keyOrUrl.startsWith("http")) return keyOrUrl;

  const url = `${cloudfrontEnv.cloudfrontUrl}/${keyOrUrl}`;
  try {
    return getSignedUrl({
      url,
      keyPairId: cloudfrontEnv.keyPairId,
      privateKey: cloudfrontEnv.privateKey,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h expiry
    });
  } catch (error) {
    console.error("Failed to sign URL:", error);
    return PLACEHOLDER_AVATAR;
  }
}

export async function getGaragePosts() {
  try {
    const posts = await db.garagePost.findMany({
      where: {
        createdBy: {
          verified: true,
        },
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        makingOf: true,
        createdBy: {
          select: {
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const signedPosts = await Promise.all(
      posts.map(async (post) => {
        // Sign all images URLs
        const signedImages = await Promise.all(
          post.images.map(async (image) => {
            return {
              id: image.id,
              url: await signUrl(image.playbackID),
              order: image.order,
            };
          })
        );

        // Sign avatar image URL
        const signedAvatar = await signUrl(post.createdBy.image);

        return {
          ...post,
          images: signedImages,
          createdBy: {
            ...post.createdBy,
            image: signedAvatar,
          },
        };
      })
    );

    return signedPosts;
  } catch (error) {
    console.error("Failed to fetch garage posts:", error);
    return [];
  }
}
