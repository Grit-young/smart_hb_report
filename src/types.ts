export interface StudentInfo {
  id?: string;
  student_name: string;
  grade: string;
  gender: string;
  test_date: string;
  unit_name: string;
}

export interface ReportData extends StudentInfo {
  score: number;
  achievement_level: string;
  strengths: string[];
  weak_points: string[];
  error_causes: string[];
  next_unit_connection: string[];
  academy_plan: string[];
  home_support_points: string[];
  kakao_short: string;
  kakao_standard: string;
  kakao_detailed: string;
  created_at?: string;
}

export type UploadedFile = {
  url: string;
  mimeType: string;
  data: string; // base64
  name: string;
};
