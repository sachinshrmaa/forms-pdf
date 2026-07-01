import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type StudentPayload = {
  studentName: string;
  gender: string;
  abcId: string;
  enrollmentNo: string;
  yearOfAdmission: string;
  dob: string;
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
  socialCategory: string;
  religion: string;
  ews: string;
  householdIncome: number;
  state: string;
  country: string;
  scholarshipFullSource: string;
  scholarshipFullName: string;
  scholarshipFullAmount: number;
  scholarshipPartialSource: string;
  scholarshipPartialName: string;
  scholarshipPartialAmount: number;
  finalYearStatus: string;
  fatherQualification: string;
  motherQualification: string;
  firstGraduation: string;
  submittedAt: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim();

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

const toRow = (student: StudentPayload, files: Partial<Record<UploadField, { url: string; name: string }>>) => ({
  student_name: student.studentName,
  gender: student.gender,
  abc_id: student.abcId,
  enrollment_no: student.enrollmentNo,
  year_of_admission: student.yearOfAdmission,
  dob: student.dob,
  dob_proof_url: files.dobProof?.url ?? "",
  dob_proof_name: files.dobProof?.name,
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
  disability_cert_url: files.disabilityCert?.url,
  disability_cert_name: files.disabilityCert?.name,
  social_category: student.socialCategory,
  category_cert_url: files.categoryCert?.url,
  category_cert_name: files.categoryCert?.name,
  religion: student.religion,
  ews: student.ews,
  ews_cert_url: files.ewsCert?.url,
  ews_cert_name: files.ewsCert?.name,
  household_income: student.householdIncome,
  state: student.state,
  country: student.country,
  scholarship_full_source: student.scholarshipFullSource,
  scholarship_full_name: student.scholarshipFullName,
  scholarship_full_amount: student.scholarshipFullAmount,
  scholarship_full_proof_url: files.scholarshipFullProof?.url,
  scholarship_full_proof_name: files.scholarshipFullProof?.name,
  scholarship_partial_source: student.scholarshipPartialSource,
  scholarship_partial_name: student.scholarshipPartialName,
  scholarship_partial_amount: student.scholarshipPartialAmount,
  scholarship_partial_proof_url: files.scholarshipPartialProof?.url,
  scholarship_partial_proof_name: files.scholarshipPartialProof?.name,
  final_year_status: student.finalYearStatus,
  father_qualification: student.fatherQualification,
  mother_qualification: student.motherQualification,
  first_graduation: student.firstGraduation,
  submitted_at: student.submittedAt,
});

type UploadField = "dobProof" | "categoryCert" | "disabilityCert" | "ewsCert" | "scholarshipFullProof" | "scholarshipPartialProof";

const uploadFile = async (file: File, folder: string, studentName: string) => {
  if (!supabase || !storageBucket) {
    throw new Error("Supabase service role key or storage bucket is missing.");
  }

  const cleanName = studentName.replace(/\s+/g, "_").toLowerCase();
  const path = `students/${cleanName}/${folder}_${Date.now()}_${file.name}`;

  const { error } = await supabase.storage.from(storageBucket).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(storageBucket).getPublicUrl(path);
  return { url: data.publicUrl, name: file.name };
};

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL." },
        { status: 500 }
      );
    }

    if (!storageBucket) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const studentRaw = formData.get("student");

    if (typeof studentRaw !== "string") {
      return NextResponse.json({ error: "Missing student payload." }, { status: 400 });
    }

    const student = JSON.parse(studentRaw) as StudentPayload;

    const dobProofFile = formData.get("dobProof");
    if (!(dobProofFile instanceof File)) {
      return NextResponse.json({ error: "Date of birth proof is required." }, { status: 400 });
    }

    const uploads: Partial<Record<UploadField, { url: string; name: string }>> = {};
    uploads.dobProof = await uploadFile(dobProofFile, "dob_proof", student.studentName);

    const categoryCertFile = formData.get("categoryCert");
    if (categoryCertFile instanceof File) {
      uploads.categoryCert = await uploadFile(categoryCertFile, "category_cert", student.studentName);
    }

    const disabilityCertFile = formData.get("disabilityCert");
    if (disabilityCertFile instanceof File) {
      uploads.disabilityCert = await uploadFile(disabilityCertFile, "disability_cert", student.studentName);
    }

    const ewsCertFile = formData.get("ewsCert");
    if (ewsCertFile instanceof File) {
      uploads.ewsCert = await uploadFile(ewsCertFile, "ews_cert", student.studentName);
    }

    const scholarshipFullProofFile = formData.get("scholarshipFullProof");
    if (scholarshipFullProofFile instanceof File) {
      uploads.scholarshipFullProof = await uploadFile(scholarshipFullProofFile, "scholarship_full_proof", student.studentName);
    }

    const scholarshipPartialProofFile = formData.get("scholarshipPartialProof");
    if (scholarshipPartialProofFile instanceof File) {
      uploads.scholarshipPartialProof = await uploadFile(scholarshipPartialProofFile, "scholarship_partial_proof", student.studentName);
    }

    const { data, error } = await supabase
      .from("students")
      .insert([toRow(student, uploads)])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ student: data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Failed to create student record.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}