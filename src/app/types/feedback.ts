export type FeedbackRole = "TRAINEES" | "COACHES" | "ADMIN";

export interface WebsiteFeedback {
  id: number | null;
  userId: number;
  username: string;
  fullName: string | null;
  email: string;
  role: FeedbackRole;
  rating: number | null;
  comment: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WebsiteFeedbackRequest {
  rating: number;
  comment?: string;
}

export interface PaginatedFeedback {
  content: WebsiteFeedback[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
