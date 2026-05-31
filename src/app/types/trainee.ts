export interface Trainee {
  id: number;
  userId?: number;
  fullName: string;
  avatar?: string;
  goal?: string;
  age?: number;
  weight?: number;
  height?: number;
  phone?: string;
}

export interface TraineeProfileRequest {
  goal?: string;
  age?: number;
  weight?: number;
  height?: number;
  phone?: string;
  avatar?: File;
}
