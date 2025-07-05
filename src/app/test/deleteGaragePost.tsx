// 'use client';

// import React, { useTransition } from 'react';
// import { deleteGaragePost } from './deleteGaragePost';

// // import styles from './';

// interface DeletePostFormProps {
//   postId: number;
// }

// export default function DeletePostForm({ postId }: DeletePostFormProps) {
//   const [isPending, startTransition] = useTransition();

//   const handleDelete = async () => {
//     startTransition(async () => {
//       await deleteGaragePost(postId);
//       // You can add any client side refresh or toast here if needed
//     });
//   };

//   return (
//     <button
//       type="button"
//     //   className={styles.deleteButton}
//       disabled={isPending}
//       onClick={handleDelete}
//     >
//       {isPending ? 'Deleting...' : 'Delete Post'}
//     </button>
//   );
// }
