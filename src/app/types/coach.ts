export type TeachingType = "ONLINE" | "OFFLINE" | "BOTH";
export type CoachSearchSort =
  | "MOST_RELEVANT"
  | "RATING_HIGHEST"
  | "PRICE_LOWEST"
  | "PRICE_HIGHEST"
  | "MOST_REVIEWS";

export interface Category {
  id: number;
  name: string;
}

export interface Coach {
  id: number;
  fullName: string;
  avatar?: string;
  category?: string;
  categoryId?: number;
  price?: number;
  rating?: number;
  reviewCount?: number;
  bio?: string;
  teachingType?: TeachingType;
  location?: string;
  experienceYears?: number;
}

export interface CoachReview {
  userName?: string;
  avatar?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
}

export interface CoachSchedule {
  id?: number;
  dayOfWeek?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  available?: boolean;
  status?: "AVAILABLE" | "BOOKED" | string;
  bookingId?: number;
  bookingStatus?: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED" | string;
}

export interface CreateCoachScheduleRequest {
  coachId: number;
  dayOfWeek: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface CoachDetail extends Coach {
  students?: number;
  totalSessions?: number;
  responseRate?: number;
  specializations?: string[];
  certificates?: string[];
  schedules?: CoachSchedule[];
  reviews?: CoachReview[];
}

export interface CreateCoachProfileRequest {
  categoryId: number;
  price: number;
  experienceYears: number;
  avatar: File;
  location: string;
  teachingType: TeachingType;
  bio: string;
}

export interface UpdateCoachProfileRequest {
  categoryId?: number;
  price?: number;
  experienceYears?: number;
  avatar?: File;
  location?: string;
  teachingType?: TeachingType;
  bio?: string;
}

export interface CoachSearchRequest {
  keyword?: string;
  name?: string;
  categoryId?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: CoachSearchSort;
  page?: number;
  size?: number;
}

export interface CoachPage {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: Coach[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}
