import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseStorageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim();

export const useMock = !(supabaseUrl && supabaseAnonKey);

const buildSupabaseClient = (): SupabaseClient | null => {
  if (useMock || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = buildSupabaseClient();

const mockStudentsKey = "mock_students";
const mockFileCacheKey = "__local_file_cache";
type MockFileEntry = {
  url: string;
  name: string;
  file: File;
};

type MockFileCache = Record<string, MockFileEntry>;

export interface StudentData {
  id?: string;
  studentName: string;
  gender: string;
  abcId: string;
  enrollmentNo: string;
  yearOfAdmission: string;
  dob: string;
  dobProofUrl: string;
  dobProofName?: string;
  programmeName: string;
  programmeCode: string;
  specialization: string;
  careerType: string;
  programmeDuration: string;
  currentYear: string;
  lateralEntry: string;
  department: string;
  school: string;
  differentlyAbled: string;
  disabilityCertUrl?: string;
  disabilityCertName?: string;
  socialCategory: string;
  categoryCertUrl?: string;
  categoryCertName?: string;
  religion: string;
  ews: string;
  ewsCertUrl?: string;
  ewsCertName?: string;
  householdIncome: number;
  state: string;
  country: string;
  scholarshipFullSource: string;
  scholarshipFullName: string;
  scholarshipFullAmount: number;
  scholarshipFullProofUrl?: string;
  scholarshipFullProofName?: string;
  scholarshipPartialSource: string;
  scholarshipPartialName: string;
  scholarshipPartialAmount: number;
  scholarshipPartialProofUrl?: string;
  scholarshipPartialProofName?: string;
  finalYearStatus: string;
  fatherQualification: string;
  motherQualification: string;
  firstGraduation: string;
  submittedAt: string;
}

type StudentRow = {
  id?: string;
  student_name: string;
  gender: string;
  abc_id: string;
  enrollment_no: string;
  year_of_admission: string;
  dob: string;
  dob_proof_url: string;
  dob_proof_name?: string;
  programme_name: string;
  programme_code: string;
  specialization: string;
  career_type: string;
  programme_duration: string;
  current_year: string;
  lateral_entry: string;
  department: string;
  school: string;
  differently_abled: string;
  disability_cert_url?: string;
  disability_cert_name?: string;
  social_category: string;
  category_cert_url?: string;
  category_cert_name?: string;
  religion: string;
  ews: string;
  ews_cert_url?: string;
  ews_cert_name?: string;
  household_income: number;
  state: string;
  country: string;
  scholarship_full_source: string;
  scholarship_full_name: string;
  scholarship_full_amount: number;
  scholarship_full_proof_url?: string;
  scholarship_full_proof_name?: string;
  scholarship_partial_source: string;
  scholarship_partial_name: string;
  scholarship_partial_amount: number;
  scholarship_partial_proof_url?: string;
  scholarship_partial_proof_name?: string;
  final_year_status: string;
  father_qualification: string;
  mother_qualification: string;
  first_graduation: string;
  submitted_at: string;
};

const toStudentData = (row: StudentRow): StudentData => ({
  id: row.id,
  studentName: row.student_name,
  gender: row.gender,
  abcId: row.abc_id,
  enrollmentNo: row.enrollment_no,
  yearOfAdmission: row.year_of_admission,
  dob: row.dob,
  dobProofUrl: row.dob_proof_url,
  dobProofName: row.dob_proof_name,
  programmeName: row.programme_name,
  programmeCode: row.programme_code,
  specialization: row.specialization,
  careerType: row.career_type,
  programmeDuration: row.programme_duration,
  currentYear: row.current_year,
  lateralEntry: row.lateral_entry,
  department: row.department,
  school: row.school,
  differentlyAbled: row.differently_abled,
  disabilityCertUrl: row.disability_cert_url,
  disabilityCertName: row.disability_cert_name,
  socialCategory: row.social_category,
  categoryCertUrl: row.category_cert_url,
  categoryCertName: row.category_cert_name,
  religion: row.religion,
  ews: row.ews,
  ewsCertUrl: row.ews_cert_url,
  ewsCertName: row.ews_cert_name,
  householdIncome: Number(row.household_income),
  state: row.state,
  country: row.country,
  scholarshipFullSource: row.scholarship_full_source,
  scholarshipFullName: row.scholarship_full_name,
  scholarshipFullAmount: Number(row.scholarship_full_amount),
  scholarshipFullProofUrl: row.scholarship_full_proof_url,
  scholarshipFullProofName: row.scholarship_full_proof_name,
  scholarshipPartialSource: row.scholarship_partial_source,
  scholarshipPartialName: row.scholarship_partial_name,
  scholarshipPartialAmount: Number(row.scholarship_partial_amount),
  scholarshipPartialProofUrl: row.scholarship_partial_proof_url,
  scholarshipPartialProofName: row.scholarship_partial_proof_name,
  finalYearStatus: row.final_year_status,
  fatherQualification: row.father_qualification,
  motherQualification: row.mother_qualification,
  firstGraduation: row.first_graduation,
  submittedAt: row.submitted_at,
});

const toStudentRow = (student: StudentData): StudentRow => ({
  id: student.id,
  student_name: student.studentName,
  gender: student.gender,
  abc_id: student.abcId,
  enrollment_no: student.enrollmentNo,
  year_of_admission: student.yearOfAdmission,
  dob: student.dob,
  dob_proof_url: student.dobProofUrl,
  dob_proof_name: student.dobProofName,
  programme_name: student.programmeName,
  programme_code: student.programmeCode,
  specialization: student.specialization,
  career_type: student.careerType,
  programme_duration: student.programmeDuration,
  current_year: student.currentYear,
  lateral_entry: student.lateralEntry,
  department: student.department,
  school: student.school,
  differently_abled: student.differentlyAbled,
  disability_cert_url: student.disabilityCertUrl,
  disability_cert_name: student.disabilityCertName,
  social_category: student.socialCategory,
  category_cert_url: student.categoryCertUrl,
  category_cert_name: student.categoryCertName,
  religion: student.religion,
  ews: student.ews,
  ews_cert_url: student.ewsCertUrl,
  ews_cert_name: student.ewsCertName,
  household_income: student.householdIncome,
  state: student.state,
  country: student.country,
  scholarship_full_source: student.scholarshipFullSource,
  scholarship_full_name: student.scholarshipFullName,
  scholarship_full_amount: student.scholarshipFullAmount,
  scholarship_full_proof_url: student.scholarshipFullProofUrl,
  scholarship_full_proof_name: student.scholarshipFullProofName,
  scholarship_partial_source: student.scholarshipPartialSource,
  scholarship_partial_name: student.scholarshipPartialName,
  scholarship_partial_amount: student.scholarshipPartialAmount,
  scholarship_partial_proof_url: student.scholarshipPartialProofUrl,
  scholarship_partial_proof_name: student.scholarshipPartialProofName,
  final_year_status: student.finalYearStatus,
  father_qualification: student.fatherQualification,
  mother_qualification: student.motherQualification,
  first_graduation: student.firstGraduation,
  submitted_at: student.submittedAt,
});

const readMockStudents = (): StudentData[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const existing = window.localStorage.getItem(mockStudentsKey);
  const list = existing ? (JSON.parse(existing) as StudentData[]) : [];
  return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};

const writeMockStudents = (students: StudentData[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockStudentsKey, JSON.stringify(students));
};

export const fetchStudents = async (): Promise<StudentData[]> => {
  if (useMock || !supabase) {
    return readMockStudents();
  }

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toStudentData(row as StudentRow));
};

export const createStudent = async (student: StudentData): Promise<StudentData> => {
  if (useMock || !supabase) {
    const existing = readMockStudents();
    const record = {
      ...student,
      id: `MOCK-${Math.floor(Math.random() * 900000 + 100000)}`,
    };

    existing.push(record);
    writeMockStudents(existing);
    return record;
  }

  const { data, error } = await supabase
    .from("students")
    .insert([toStudentRow(student)])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toStudentData(data as StudentRow);
};

export const uploadStudentDocument = async (
  file: File,
  folder: string,
  studentName: string
): Promise<{ url: string; name: string }> => {
  if (useMock || !supabase || !supabaseStorageBucket) {
    const objectUrl = URL.createObjectURL(file);
    const fileId = `${folder}_${Date.now()}`;

    if (typeof window !== "undefined") {
      const typedWindow = window as Window & { [mockFileCacheKey]?: MockFileCache };

      if (!typedWindow[mockFileCacheKey]) {
        typedWindow[mockFileCacheKey] = {};
      }

      typedWindow[mockFileCacheKey]![fileId] = {
        url: objectUrl,
        name: file.name,
        file,
      };
    }

    return { url: fileId, name: file.name };
  }

  const cleanName = studentName.replace(/\s+/g, "_").toLowerCase();
  const filePath = `students/${cleanName}/${folder}_${Date.now()}_${file.name}`;

  try {
    const { error } = await supabase.storage
      .from(supabaseStorageBucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(supabaseStorageBucket).getPublicUrl(filePath);

    return { url: data.publicUrl, name: file.name };
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (message.includes("bucket not found")) {
      throw new Error(
        `Supabase storage bucket "${supabaseStorageBucket}" was not found. Create a public bucket with that exact name in Supabase Storage, or clear NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET to use local fallback mode.`
      );
    }

    throw error;
  }
};

export const getMockDocument = (documentId: string): MockFileEntry | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const typedWindow = window as Window & { [mockFileCacheKey]?: MockFileCache };
  return typedWindow[mockFileCacheKey]?.[documentId];
};

export const updateStudent = async (student: StudentData): Promise<StudentData> => {
  if (!student.id) {
    throw new Error("Cannot update a student record without an id");
  }

  if (useMock || !supabase) {
    const existing = readMockStudents();
    const updated = existing.map((s) => (s.id === student.id ? student : s));
    writeMockStudents(updated);
    return student;
  }

  const { id, ...row } = toStudentRow(student);

  const { data, error } = await supabase
    .from("students")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toStudentData(data as StudentRow);
};

export const deleteStudent = async (id: string): Promise<void> => {
  if (!id) return;
  if (useMock || !supabase) {
    const existing = readMockStudents();
    const updated = existing.filter((student) => student.id !== id);
    writeMockStudents(updated);
    return;
  }

  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
};

