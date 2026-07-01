"use client";

import React, { useState, useEffect } from "react";
import { db, storage, useMock, StudentData } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  User, BookOpen, MapPin, Award, CheckCircle, ArrowRight, ArrowLeft, Upload, Loader2, Info, Check, AlertCircle, Database
} from "lucide-react";

export default function StudentForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<StudentData | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form Fields State
  const [formData, setFormData] = useState<Omit<StudentData, "dobProofUrl">>({
    studentName: "",
    gender: "",
    abcId: "",
    enrollmentNo: "",
    yearOfAdmission: new Date().getFullYear().toString(),
    dob: "",
    programmeName: "",
    programmeCode: "",
    specialization: "",
    careerType: "",
    programmeDuration: "3",
    currentYear: "I",
    lateralEntry: "No",
    department: "",
    school: "",
    differentlyAbled: "No",
    socialCategory: "General",
    religion: "",
    ews: "No",
    householdIncome: 0,
    state: "",
    country: "India",
    scholarshipFullSource: "None",
    scholarshipFullName: "",
    scholarshipFullAmount: 0,
    scholarshipPartialSource: "None",
    scholarshipPartialName: "",
    scholarshipPartialAmount: 0,
    finalYearStatus: "Course Ongoing",
    submittedAt: "",
  });

  // File Objects State
  const [files, setFiles] = useState<{
    dobProof: File | null;
    categoryCert: File | null;
    disabilityCert: File | null;
    ewsCert: File | null;
  }>({
    dobProof: null,
    categoryCert: null,
    disabilityCert: null,
    ewsCert: null,
  });

  // Custom styling elements: step labels
  const steps = [
    { number: 1, label: "Personal Info", icon: User },
    { number: 2, label: "Academic Info", icon: BookOpen },
    { number: 3, label: "Socio-Demographics", icon: MapPin },
    { number: 4, label: "Scholarships & Files", icon: Award },
    { number: 5, label: "Review & Submit", icon: CheckCircle },
  ];

  // Store uploaded documents locally in memory for session-level persistence in admin dashboard when firebase is missing
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.hasOwnProperty("__local_file_cache")) {
        (window as any).__local_file_cache = {};
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Amount") || name === "householdIncome" ? Number(value) : value,
    }));
    
    // Clear error
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Limit file size to 5MB
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [fieldName]: "File size exceeds 5MB limit" }));
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [fieldName]: selectedFile,
      }));

      // Clear error
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validateStep = (step: number) => {
    const stepErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.studentName.trim()) stepErrors.studentName = "Student Name is required";
      if (!formData.gender) stepErrors.gender = "Gender is required";
      if (!formData.abcId.trim()) stepErrors.abcId = "ABC ID is required";
      if (!formData.enrollmentNo.trim()) stepErrors.enrollmentNo = "Enrollment Number is required";
      if (!formData.dob) stepErrors.dob = "Date of Birth is required";
      if (!files.dobProof) stepErrors.dobProof = "Date of Birth Proof document is required";
    }

    if (step === 2) {
      if (!formData.programmeName.trim()) stepErrors.programmeName = "Programme Name is required";
      if (!formData.programmeCode.trim()) stepErrors.programmeCode = "Programme Code is required";
      if (!formData.specialization.trim()) stepErrors.specialization = "Specialization is required";
      if (!formData.careerType) stepErrors.careerType = "Career type is required";
      if (!formData.department.trim()) stepErrors.department = "Department is required";
      if (!formData.school.trim()) stepErrors.school = "School/Faculty name is required";
    }

    if (step === 3) {
      if (!formData.religion.trim()) stepErrors.religion = "Religion is required";
      if (!formData.state.trim()) stepErrors.state = "State is required";
      if (!formData.country.trim()) stepErrors.country = "Country is required";
      if (formData.householdIncome < 0) stepErrors.householdIncome = "Income cannot be negative";
    }

    if (step === 4) {
      // Check conditional file uploads
      if (formData.socialCategory !== "General" && !files.categoryCert) {
        stepErrors.categoryCert = `Social Category certificate is required for ${formData.socialCategory}`;
      }
      if (formData.differentlyAbled === "Yes" && !files.disabilityCert) {
        stepErrors.disabilityCert = "Disability certificate is required";
      }
      if (formData.ews === "Yes" && !files.ewsCert) {
        stepErrors.ewsCert = "EWS certificate is required";
      }
      
      // Conditional scholarship validations
      if (formData.scholarshipFullSource !== "None") {
        if (!formData.scholarshipFullName.trim()) stepErrors.scholarshipFullName = "Scholarship name is required";
        if (formData.scholarshipFullAmount <= 0) stepErrors.scholarshipFullAmount = "Scholarship amount must be greater than 0";
      }
      if (formData.scholarshipPartialSource !== "None") {
        if (!formData.scholarshipPartialName.trim()) stepErrors.scholarshipPartialName = "Scholarship name is required";
        if (formData.scholarshipPartialAmount <= 0) stepErrors.scholarshipPartialAmount = "Scholarship amount must be greater than 0";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Helper to upload a single file
  const uploadSingleFile = async (file: File, folder: string, studentName: string): Promise<{ url: string; name: string }> => {
    if (useMock) {
      // Mock File Upload (returns Object URL and saves to browser global session map for verification)
      const objectUrl = URL.createObjectURL(file);
      const fileId = `${folder}_${Date.now()}`;
      if (typeof window !== "undefined") {
        (window as any).__local_file_cache[fileId] = {
          url: objectUrl,
          name: file.name,
          file: file
        };
      }
      return { url: fileId, name: file.name };
    } else {
      // Real Firebase Upload
      const cleanName = studentName.replace(/\s+/g, "_").toLowerCase();
      const storageRef = ref(storage, `students/${cleanName}/${folder}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return { url, name: file.name };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      // 1. Upload files
      setUploadProgress({ status: "Uploading supporting documents..." });
      
      const dobRes = await uploadSingleFile(files.dobProof!, "dob_proof", formData.studentName);
      
      let categoryRes = { url: "", name: "" };
      if (files.categoryCert) {
        categoryRes = await uploadSingleFile(files.categoryCert, "category_cert", formData.studentName);
      }

      let disabilityRes = { url: "", name: "" };
      if (files.disabilityCert) {
        disabilityRes = await uploadSingleFile(files.disabilityCert, "disability_cert", formData.studentName);
      }

      let ewsRes = { url: "", name: "" };
      if (files.ewsCert) {
        ewsRes = await uploadSingleFile(files.ewsCert, "ews_cert", formData.studentName);
      }

      // 2. Prepare student data payload
      setUploadProgress({ status: "Saving student record to database..." });
      
      const finalStudentData: StudentData = {
        ...formData,
        dobProofUrl: dobRes.url,
        dobProofName: dobRes.name,
        categoryCertUrl: categoryRes.url || undefined,
        categoryCertName: categoryRes.name || undefined,
        disabilityCertUrl: disabilityRes.url || undefined,
        disabilityCertName: disabilityRes.name || undefined,
        ewsCertUrl: ewsRes.url || undefined,
        ewsCertName: ewsRes.name || undefined,
        submittedAt: new Date().toISOString(),
      };

      // 3. Write to Database
      if (useMock) {
        // Save to LocalStorage
        const existing = localStorage.getItem("mock_students");
        const list = existing ? JSON.parse(existing) : [];
        const record = {
          ...finalStudentData,
          id: "MOCK-" + Math.floor(Math.random() * 900000 + 100000),
        };
        list.push(record);
        localStorage.setItem("mock_students", JSON.stringify(list));
        setCreatedRecord(record);
      } else {
        // Save to Firebase Firestore
        const docRef = await addDoc(collection(db, "students"), finalStudentData);
        setCreatedRecord({
          ...finalStudentData,
          id: docRef.id,
        });
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrors({ form: err.message || "An error occurred during submission. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8 w-full max-w-4xl mx-auto px-4">
      <div className="relative flex justify-between items-center">
        {/* Connection lines */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
        <div 
          className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 -translate-y-1/2 transition-all duration-300 z-0"
          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
        ></div>

        {/* Steps */}
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = currentStep >= step.number;
          const isCurrent = currentStep === step.number;
          
          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  if (step.number < currentStep) {
                    setCurrentStep(step.number);
                  } else if (step.number > currentStep) {
                    // Validate intermediates
                    let isValid = true;
                    for (let s = currentStep; s < step.number; s++) {
                      if (!validateStep(s)) {
                        isValid = false;
                        setCurrentStep(s);
                        break;
                      }
                    }
                    if (isValid) setCurrentStep(step.number);
                  }
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isCurrent 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 ring-4 ring-indigo-100" 
                    : isActive 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-indigo-600" 
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                {isActive && currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </button>
              <span className={`mt-2 text-xs font-semibold hidden md:block ${isCurrent ? "text-indigo-600" : isActive ? "text-slate-800" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      {/* Top Banner for Fallback Mode */}
      {useMock && (
        <div className="max-w-4xl mx-auto mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start md:items-center gap-3 text-amber-900 shadow-sm">
          <Database className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-bold">Running in Mock/Local Storage Mode:</span> Firebase environment keys are not configured. Submissions will be stored in your browser's local storage so you can fully test form validation, uploads, and PDF export instantly!
          </div>
          <a
            href="/admin"
            className="text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 px-3 py-1.5 rounded-lg shrink-0 transition-colors shadow-sm"
          >
            Go to Admin Dashboard
          </a>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
        
        {/* Form Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-10 text-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent"></div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight relative z-10">
            Student Registration Portal
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-lg mx-auto relative z-10">
            Please fill in your academic, socio-demographic, and personal details accurately. All submitted information must be supported by official documents.
          </p>
        </div>

        {/* Stepper */}
        <div className="pt-8">
          {renderStepIndicator()}
        </div>

        {/* Success Screen */}
        {submitSuccess && createdRecord ? (
          <div className="p-8 md:p-12 text-center max-w-xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Registration Submitted Successfully!</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Thank you, <span className="font-semibold text-slate-800">{createdRecord.studentName}</span>. Your details have been stored in the database. An administrator can now review your application and download your printable verification document.
            </p>

            <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 w-full text-left">
              <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-200/60 pb-2 mb-3">Submission Receipt</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong className="text-slate-700">Record ID:</strong> {createdRecord.id}</p>
                <p><strong className="text-slate-700">Enrollment No:</strong> {createdRecord.enrollmentNo}</p>
                <p><strong className="text-slate-700">ABC ID:</strong> {createdRecord.abcId}</p>
                <p><strong className="text-slate-700">Programme:</strong> {createdRecord.programmeName} ({createdRecord.programmeCode})</p>
                <p><strong className="text-slate-700">Date/Time:</strong> {new Date(createdRecord.submittedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  setCreatedRecord(null);
                  setCurrentStep(1);
                  setFiles({ dobProof: null, categoryCert: null, disabilityCert: null, ewsCert: null });
                  setFormData({
                    studentName: "",
                    gender: "",
                    abcId: "",
                    enrollmentNo: "",
                    yearOfAdmission: new Date().getFullYear().toString(),
                    dob: "",
                    programmeName: "",
                    programmeCode: "",
                    specialization: "",
                    careerType: "",
                    programmeDuration: "3",
                    currentYear: "I",
                    lateralEntry: "No",
                    department: "",
                    school: "",
                    differentlyAbled: "No",
                    socialCategory: "General",
                    religion: "",
                    ews: "No",
                    householdIncome: 0,
                    state: "",
                    country: "India",
                    scholarshipFullSource: "None",
                    scholarshipFullName: "",
                    scholarshipFullAmount: 0,
                    scholarshipPartialSource: "None",
                    scholarshipPartialName: "",
                    scholarshipPartialAmount: 0,
                    finalYearStatus: "Course Ongoing",
                    submittedAt: "",
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
              >
                Submit Another Response
              </button>
              <a
                href="/admin"
                className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
              >
                Go to Admin Dashboard
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* ERROR BANNER */}
            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-2.5 text-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>{errors.form}</div>
              </div>
            )}

            {/* STEP 1: PERSONAL DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Personal & Identity Details</h2>
                  <p className="text-slate-400 text-xs">Verify all credentials against official certificates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Student Name *</label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      placeholder="Enter Full Name"
                      className={`w-full bg-slate-50 border ${errors.studentName ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.studentName && <span className="text-red-500 text-xs mt-1 block">{errors.studentName}</span>}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 border ${errors.gender ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <span className="text-red-500 text-xs mt-1 block">{errors.gender}</span>}
                  </div>

                  {/* ABC ID */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">ABC ID (Academic Bank of Credits) *</label>
                    <input
                      type="text"
                      name="abcId"
                      value={formData.abcId}
                      onChange={handleChange}
                      placeholder="e.g. 123-456-789-012"
                      className={`w-full bg-slate-50 border ${errors.abcId ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.abcId && <span className="text-red-500 text-xs mt-1 block">{errors.abcId}</span>}
                  </div>

                  {/* Enrollment No */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Enrollment No. *</label>
                    <input
                      type="text"
                      name="enrollmentNo"
                      value={formData.enrollmentNo}
                      onChange={handleChange}
                      placeholder="Enter Enrollment Number"
                      className={`w-full bg-slate-50 border ${errors.enrollmentNo ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.enrollmentNo && <span className="text-red-500 text-xs mt-1 block">{errors.enrollmentNo}</span>}
                  </div>

                  {/* Year of Admission */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Year of Admission *</label>
                    <select
                      name="yearOfAdmission"
                      value={formData.yearOfAdmission}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-100 transition"
                    >
                      {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Date of Birth (DOB) *</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 border ${errors.dob ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.dob && <span className="text-red-500 text-xs mt-1 block">{errors.dob}</span>}
                  </div>
                </div>

                {/* DOB Supporting Document */}
                <div className="border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Supporting Document: Date of Birth Proof *</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Upload Birth Certificate, Passport, or 10th Marksheet (PDF/JPG, Max 5MB).</p>
                    </div>
                    <label className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm text-sm font-semibold text-slate-700">
                      <Upload className="w-4 h-4 text-slate-500" />
                      Choose File
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, "dobProof")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {files.dobProof && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5">
                      <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-medium truncate">{files.dobProof.name}</span>
                      <span className="text-slate-400 shrink-0">({(files.dobProof.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  )}
                  {errors.dobProof && <span className="text-red-500 text-xs mt-1.5 block">{errors.dobProof}</span>}
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMIC DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Academic & Program Information</h2>
                  <p className="text-slate-400 text-xs">Details about your current course and department alignment.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Programme Name */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Programme Name *</label>
                    <input
                      type="text"
                      name="programmeName"
                      value={formData.programmeName}
                      onChange={handleChange}
                      placeholder="e.g. Bachelor of Technology"
                      className={`w-full bg-slate-50 border ${errors.programmeName ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.programmeName && <span className="text-red-500 text-xs mt-1 block">{errors.programmeName}</span>}
                  </div>

                  {/* Programme Code */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Programme Code *</label>
                    <input
                      type="text"
                      name="programmeCode"
                      value={formData.programmeCode}
                      onChange={handleChange}
                      placeholder="e.g. BTECH-CSE"
                      className={`w-full bg-slate-50 border ${errors.programmeCode ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.programmeCode && <span className="text-red-500 text-xs mt-1 block">{errors.programmeCode}</span>}
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Specialization *</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Artificial Intelligence"
                      className={`w-full bg-slate-50 border ${errors.specialization ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.specialization && <span className="text-red-500 text-xs mt-1 block">{errors.specialization}</span>}
                  </div>

                  {/* Career Type */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Career Type *</label>
                    <select
                      name="careerType"
                      value={formData.careerType}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 border ${errors.careerType ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    >
                      <option value="">Select Level</option>
                      <option value="UG">UG (Undergraduate)</option>
                      <option value="PG">PG (Postgraduate)</option>
                      <option value="Integrated">Integrated</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Certificate">Certificate</option>
                      <option value="PhD">PhD</option>
                    </select>
                    {errors.careerType && <span className="text-red-500 text-xs mt-1 block">{errors.careerType}</span>}
                  </div>

                  {/* Programme Duration */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Programme Duration (Years)</label>
                    <select
                      name="programmeDuration"
                      value={formData.programmeDuration}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-100 transition"
                    >
                      <option value="1">1 Year</option>
                      <option value="2">2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="4">4 Years</option>
                      <option value="5">5 Years</option>
                    </select>
                  </div>

                  {/* Current Year */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Current Year of Study</label>
                    <select
                      name="currentYear"
                      value={formData.currentYear}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-100 transition"
                    >
                      <option value="I">I Year</option>
                      <option value="II">II Year</option>
                      <option value="III">III Year</option>
                      <option value="IV">IV Year</option>
                      <option value="V">V Year</option>
                    </select>
                  </div>

                  {/* Lateral Entry */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Lateral Entry? *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 text-slate-700 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="lateralEntry"
                          value="Yes"
                          checked={formData.lateralEntry === "Yes"}
                          onChange={handleChange}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-slate-700 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="lateralEntry"
                          value="No"
                          checked={formData.lateralEntry === "No"}
                          onChange={handleChange}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science & Engineering"
                      className={`w-full bg-slate-50 border ${errors.department ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.department && <span className="text-red-500 text-xs mt-1 block">{errors.department}</span>}
                  </div>
                </div>

                {/* School */}
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">School / Faculty Name *</label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    placeholder="e.g. School of Engineering & Technology"
                    className={`w-full bg-slate-50 border ${errors.school ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                  />
                  {errors.school && <span className="text-red-500 text-xs mt-1 block">{errors.school}</span>}
                </div>
              </div>
            )}

            {/* STEP 3: SOCIO-DEMOGRAPHICS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Socio-Demographic Details</h2>
                  <p className="text-slate-400 text-xs">Demographics, religion, region and accessibility details.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Social Category */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Social Category *</label>
                    <select
                      name="socialCategory"
                      value={formData.socialCategory}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-100 transition"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>

                  {/* Religion */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Religion *</label>
                    <input
                      type="text"
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      placeholder="e.g. Hinduism, Islam, Christianity..."
                      className={`w-full bg-slate-50 border ${errors.religion ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.religion && <span className="text-red-500 text-xs mt-1 block">{errors.religion}</span>}
                  </div>

                  {/* Differently Abled */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Differently Abled Student? *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 text-slate-700 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="differentlyAbled"
                          value="Yes"
                          checked={formData.differentlyAbled === "Yes"}
                          onChange={handleChange}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-slate-700 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="differentlyAbled"
                          value="No"
                          checked={formData.differentlyAbled === "No"}
                          onChange={handleChange}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  {/* EWS */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">EWS (Economically Weaker Section) status? *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 text-slate-700 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="ews"
                          value="Yes"
                          checked={formData.ews === "Yes"}
                          onChange={handleChange}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-slate-700 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="ews"
                          value="No"
                          checked={formData.ews === "No"}
                          onChange={handleChange}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  {/* Household Income */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Annual Household Income (Rs) *</label>
                    <input
                      type="number"
                      name="householdIncome"
                      value={formData.householdIncome || ""}
                      onChange={handleChange}
                      placeholder="e.g. 350000"
                      className={`w-full bg-slate-50 border ${errors.householdIncome ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.householdIncome && <span className="text-red-500 text-xs mt-1 block">{errors.householdIncome}</span>}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter State"
                      className={`w-full bg-slate-50 border ${errors.state ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.state && <span className="text-red-500 text-xs mt-1 block">{errors.state}</span>}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 border ${errors.country ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 transition`}
                    />
                    {errors.country && <span className="text-red-500 text-xs mt-1 block">{errors.country}</span>}
                  </div>

                  {/* Final Year Status */}
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">Final Year Status *</label>
                    <select
                      name="finalYearStatus"
                      value={formData.finalYearStatus}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-100 transition"
                    >
                      <option value="Course Ongoing">Course Ongoing / Not Final Year</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SCHOLARSHIPS & FILES */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Scholarships & Supporting Documents</h2>
                  <p className="text-slate-400 text-xs">Specify if you receive tuition fee reimbursement, and attach necessary certificates.</p>
                </div>

                {/* 1. Full Tuition Fee Reimbursement */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs">1</span>
                    Scholarship Full Tuition Fee Reimbursement
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1.5">Reimbursement From</label>
                      <select
                        name="scholarshipFullSource"
                        value={formData.scholarshipFullSource}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:border-indigo-500"
                      >
                        <option value="None">None</option>
                        <option value="Government">a) Government</option>
                        <option value="Private organization">b) Private Organization</option>
                        <option value="Philanthropist">c) Philanthropist</option>
                        <option value="Institution">d) Institution</option>
                      </select>
                    </div>

                    {formData.scholarshipFullSource !== "None" && (
                      <>
                        <div>
                          <label className="block text-slate-700 text-xs font-semibold mb-1.5">Scholarship Name *</label>
                          <input
                            type="text"
                            name="scholarshipFullName"
                            value={formData.scholarshipFullName}
                            onChange={handleChange}
                            placeholder="e.g. PM-USP"
                            className={`w-full bg-white border ${errors.scholarshipFullName ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'} px-3 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2`}
                          />
                          {errors.scholarshipFullName && <span className="text-red-500 text-[10px] mt-1 block">{errors.scholarshipFullName}</span>}
                        </div>

                        <div>
                          <label className="block text-slate-700 text-xs font-semibold mb-1.5">Annual Amount (Rs) *</label>
                          <input
                            type="number"
                            name="scholarshipFullAmount"
                            value={formData.scholarshipFullAmount || ""}
                            onChange={handleChange}
                            placeholder="e.g. 50000"
                            className={`w-full bg-white border ${errors.scholarshipFullAmount ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'} px-3 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2`}
                          />
                          {errors.scholarshipFullAmount && <span className="text-red-500 text-[10px] mt-1 block">{errors.scholarshipFullAmount}</span>}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Partial Tuition Fee Reimbursement */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs">2</span>
                    Scholarship Partial Tuition Fee Reimbursement
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1.5">Reimbursement From</label>
                      <select
                        name="scholarshipPartialSource"
                        value={formData.scholarshipPartialSource}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:border-indigo-500"
                      >
                        <option value="None">None</option>
                        <option value="Government">a) Government</option>
                        <option value="Private organization">b) Private Organization</option>
                        <option value="Philanthropist">c) Philanthropist</option>
                        <option value="Institution">d) Institution</option>
                      </select>
                    </div>

                    {formData.scholarshipPartialSource !== "None" && (
                      <>
                        <div>
                          <label className="block text-slate-700 text-xs font-semibold mb-1.5">Scholarship Name *</label>
                          <input
                            type="text"
                            name="scholarshipPartialName"
                            value={formData.scholarshipPartialName}
                            onChange={handleChange}
                            placeholder="e.g. State Post-Matric"
                            className={`w-full bg-white border ${errors.scholarshipPartialName ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'} px-3 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2`}
                          />
                          {errors.scholarshipPartialName && <span className="text-red-500 text-[10px] mt-1 block">{errors.scholarshipPartialName}</span>}
                        </div>

                        <div>
                          <label className="block text-slate-700 text-xs font-semibold mb-1.5">Annual Amount (Rs) *</label>
                          <input
                            type="number"
                            name="scholarshipPartialAmount"
                            value={formData.scholarshipPartialAmount || ""}
                            onChange={handleChange}
                            placeholder="e.g. 20000"
                            className={`w-full bg-white border ${errors.scholarshipPartialAmount ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'} px-3 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2`}
                          />
                          {errors.scholarshipPartialAmount && <span className="text-red-500 text-[10px] mt-1 block">{errors.scholarshipPartialAmount}</span>}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Conditional File Upload Zones */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-850 text-sm">Supporting Documents Uploads</h3>

                  {/* Social Category Certificate */}
                  {formData.socialCategory !== "General" && (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{formData.socialCategory} Category Certificate *</h4>
                          <p className="text-slate-400 text-xs mt-0.5">Official caste certificate issued by authorities (PDF/JPG, Max 5MB).</p>
                        </div>
                        <label className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm text-sm font-semibold text-slate-700">
                          <Upload className="w-4 h-4 text-slate-500" />
                          Choose File
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "categoryCert")}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {files.categoryCert && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5">
                          <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-medium truncate">{files.categoryCert.name}</span>
                          <span className="text-slate-400 shrink-0">({(files.categoryCert.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      )}
                      {errors.categoryCert && <span className="text-red-500 text-xs mt-1.5 block">{errors.categoryCert}</span>}
                    </div>
                  )}

                  {/* Differently Abled Certificate */}
                  {formData.differentlyAbled === "Yes" && (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">Disability Certificate *</h4>
                          <p className="text-slate-400 text-xs mt-0.5">Upload UDID card or medical authority board certificate (PDF/JPG, Max 5MB).</p>
                        </div>
                        <label className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm text-sm font-semibold text-slate-700">
                          <Upload className="w-4 h-4 text-slate-500" />
                          Choose File
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "disabilityCert")}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {files.disabilityCert && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5">
                          <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-medium truncate">{files.disabilityCert.name}</span>
                          <span className="text-slate-400 shrink-0">({(files.disabilityCert.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      )}
                      {errors.disabilityCert && <span className="text-red-500 text-xs mt-1.5 block">{errors.disabilityCert}</span>}
                    </div>
                  )}

                  {/* EWS Certificate */}
                  {formData.ews === "Yes" && (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">EWS Income & Asset Certificate *</h4>
                          <p className="text-slate-400 text-xs mt-0.5">Upload current financial year income/caste certificate for EWS (PDF/JPG, Max 5MB).</p>
                        </div>
                        <label className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm text-sm font-semibold text-slate-700">
                          <Upload className="w-4 h-4 text-slate-500" />
                          Choose File
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "ewsCert")}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {files.ewsCert && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5">
                          <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-medium truncate">{files.ewsCert.name}</span>
                          <span className="text-slate-400 shrink-0">({(files.ewsCert.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      )}
                      {errors.ewsCert && <span className="text-red-500 text-xs mt-1.5 block">{errors.ewsCert}</span>}
                    </div>
                  )}

                  {formData.socialCategory === "General" && formData.differentlyAbled === "No" && formData.ews === "No" && (
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-500">
                      <Info className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                      Based on your demographic selections (General, Not Differently Abled, and non-EWS), no additional category documents are required. Just proceed.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & DECLARATION */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Review & Declaration</h2>
                  <p className="text-slate-400 text-xs">Verify all details before submitting. Once submitted, records cannot be modified without authority consent.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-5 text-sm">
                  <h3 className="font-bold text-slate-800 border-b pb-2 text-sm">Summary of Entered Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">Student Name:</span>
                      <span className="text-slate-800 font-medium">{formData.studentName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">Gender:</span>
                      <span className="text-slate-800 font-medium">{formData.gender}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">Enrollment No:</span>
                      <span className="text-slate-800 font-medium">{formData.enrollmentNo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">ABC ID:</span>
                      <span className="text-slate-800 font-medium">{formData.abcId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">Date of Birth:</span>
                      <span className="text-slate-800 font-medium">{formData.dob}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">Course Name:</span>
                      <span className="text-slate-800 font-medium truncate max-w-[200px]">{formData.programmeName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">Category:</span>
                      <span className="text-slate-800 font-medium">{formData.socialCategory}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">Religion:</span>
                      <span className="text-slate-800 font-medium">{formData.religion}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">State / Country:</span>
                      <span className="text-slate-800 font-medium">{formData.state}, {formData.country}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/40">
                      <span className="text-slate-400 font-semibold text-xs">Household Income:</span>
                      <span className="text-slate-800 font-medium">Rs. {Number(formData.householdIncome).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="font-semibold text-slate-800 text-xs mb-2">Attached Documents:</h4>
                    <ul className="text-xs space-y-1.5 text-indigo-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        DOB Proof: <span className="text-slate-600 font-mono">{files.dobProof?.name}</span>
                      </li>
                      {files.categoryCert && (
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Category Certificate: <span className="text-slate-600 font-mono">{files.categoryCert.name}</span>
                        </li>
                      )}
                      {files.disabilityCert && (
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Disability Certificate: <span className="text-slate-600 font-mono">{files.disabilityCert.name}</span>
                        </li>
                      )}
                      {files.ewsCert && (
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          EWS Certificate: <span className="text-slate-600 font-mono">{files.ewsCert.name}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Verification Statement */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">Declaration Statement</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    I hereby declare that all the information provided in this registration form is true, correct, and complete to the best of my knowledge and belief. I have uploaded original scanned copies of all official certificates to verify these claims. I understand that submitting false credentials will lead to immediate cancellation of admission and disciplinary action.
                  </p>
                  <label className="flex items-start gap-3 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="w-4 h-4 accent-indigo-600 rounded border-slate-300 mt-0.5"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      I agree to the declaration statement and confirm my details are true. *
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* FORM FOOTER CONTROLS */}
            <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold px-5 py-2 rounded-xl flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-100"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-indigo-400 disabled:to-indigo-400 text-white text-sm font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-100 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {uploadProgress.status || "Submitting..."}
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Floating Link to Dashboard */}
      <div className="text-center mt-6 text-sm text-slate-500">
        Are you an administrator?{" "}
        <a href="/admin" className="text-indigo-600 hover:underline font-semibold">
          Access Admin Dashboard &rarr;
        </a>
      </div>
    </div>
  );
}
