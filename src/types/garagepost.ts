export interface ImageItem {
  id: string | number;
  src: string;
  alt?: string;
}

export interface OrbGaragePostProps {
  id: number,
  username: string;
  avatarUrl?: string;
  content: string;
  href?: string;
  images?: ImageItem[];
  likes?: number;
  isLiked?: boolean;
  onLike?: () => void;
  postedAt?: string;
}
