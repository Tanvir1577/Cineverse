// Cineverse TypeScript Types

export type ContentType = "Movie" | "Series" | "Anime";

export interface DownloadLink {
  id: string;
  title: string;
  url: string;
  quality: string[];
}

export interface DownloadGroup {
  id: string;
  title: string;
  links: DownloadLink[];
}

export interface Content {
  id: string;
  contentType: ContentType;
  mainTitle: string;
  secondaryTitle: string;
  imageHtml: string;
  name: string;
  season: string;
  imdbRating: number | null;
  releaseYear: number | null;
  genre: string[];
  language: string[];
  subtitle: string[];
  quality: string[];
  fileSize: string;
  format: string;
  storyline: string;
  downloadGroups: DownloadGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  type: "REQUEST" | "REPORT";
  title: string;
  contentType?: ContentType | null;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  contentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentListResponse {
  contents: Content[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// Genre options
export const GENRE_OPTIONS = [
  "Animation",
  "Action",
  "Adventure",
  "Thriller",
  "Crime",
  "Comedy",
  "Drama",
  "Romance",
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Horror",
  "Family",
  "Sports",
] as const;

export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Japanese",
  "Korean",
] as const;

export const SUBTITLE_OPTIONS = [
  "English",
  "Hindi",
  "Japanese",
  "Korean",
] as const;

export const QUALITY_OPTIONS = [
  "480p",
  "720p",
  "1080p",
  "4k",
] as const;

export const QUALITY_COLORS: Record<string, string> = {
  "480p": "bg-amber-500/90 text-white hover:bg-amber-600",
  "720p": "bg-blue-500/90 text-white hover:bg-blue-600",
  "1080p": "bg-emerald-500/90 text-white hover:bg-emerald-600",
  "4k": "bg-purple-500/90 text-white hover:bg-purple-600",
};

export const QUALITY_BORDER_COLORS: Record<string, string> = {
  "480p": "border-amber-500/50 text-amber-400",
  "720p": "border-blue-500/50 text-blue-400",
  "1080p": "border-emerald-500/50 text-emerald-400",
  "4k": "border-purple-500/50 text-purple-400",
};
