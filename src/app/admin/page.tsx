"use client";

import React, { useState, useEffect } from "react";
import { db, useMock, StudentData } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { generateStudentPDF } from "@/lib/pdfGenerator";
import {
  Search, Filter, Download, Eye, RefreshCw, Users, FileText, Award, MapPin, X, ArrowLeft, Database, Trash2, UserPlus, ExternalLink
} from "lucide-react";

export default function AdminDashboard() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [careerFilter, setCareerFilter] = useState("");
  const [ewsFilter, setEwsFilter] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      if (useMock) {
        // Load from LocalStorage
        const existing = localStorage.getItem("mock_students");
        const list = existing ? JSON.parse(existing) : [];
        // Sort by date desc
        list.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setStudents(list);
      } else {
        // Load from Firestore
        const q = query(collection(db, "students"), orderBy("submittedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const list: StudentData[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as StudentData);
        });
        setStudents(list);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Apply search & filters
  useEffect(() => {
    let result = [...students];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.enrollmentNo.toLowerCase().includes(q) ||
          s.abcId.toLowerCase().includes(q) ||
          s.programmeName.toLowerCase().includes(q)
      );
    }

    // Gender Filter
    if (genderFilter) {
      result = result.filter((s) => s.gender === genderFilter);
    }

    // Category Filter
    if (categoryFilter) {
      result = result.filter((s) => s.socialCategory === categoryFilter);
    }

    // Career Filter
    if (careerFilter) {
      result = result.filter((s) => s.careerType === careerFilter);
    }

    // EWS Filter
    if (ewsFilter) {
      result = result.filter((s) => s.ews === ewsFilter);
    }

    setFilteredStudents(result);
  }, [students, searchQuery, genderFilter, categoryFilter, careerFilter, ewsFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setGenderFilter("");
    setCategoryFilter("");
    setCareerFilter("");
    setEwsFilter("");
  };

  // Generate Mock Data for Testing
  const handleSeedMockData = () => {
    const mockStudents: StudentData[] = [
      {
        id: "MOCK-109283",
        studentName: "Aarav Sharma",
        gender: "Male",
        abcId: "543-982-120-432",
        enrollmentNo: "EN/2026/0042",
        yearOfAdmission: "2026",
        dob: "2005-04-12",
        dobProofUrl: "dob_proof_mock1",
        dobProofName: "aarav_birth_certificate.pdf",
        programmeName: "Bachelor of Technology",
        programmeCode: "BTECH-CSE",
        specialization: "Cyber Security",
        careerType: "UG",
        programmeDuration: "4",
        currentYear: "I",
        lateralEntry: "No",
        department: "Computer Science & Engineering",
        school: "School of Engineering & Technology",
        differentlyAbled: "No",
        socialCategory: "General",
        religion: "Hinduism",
        ews: "No",
        householdIncome: 450000,
        state: "Uttar Pradesh",
        country: "India",
        scholarshipFullSource: "None",
        scholarshipFullName: "",
        scholarshipFullAmount: 0,
        scholarshipPartialSource: "Government",
        scholarshipPartialName: "State Merit Scholarship",
        scholarshipPartialAmount: 25000,
        finalYearStatus: "Course Ongoing",
        submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      },
      {
        id: "MOCK-882713",
        studentName: "Priyanjali Sen",
        gender: "Female",
        abcId: "891-230-581-992",
        enrollmentNo: "EN/2026/0187",
        yearOfAdmission: "2026",
        dob: "2003-09-24",
        dobProofUrl: "dob_proof_mock2",
        dobProofName: "priya_passport_copy.jpg",
        programmeName: "Master of Business Administration",
        programmeCode: "MBA-HR",
        specialization: "Human Resource Management",
        careerType: "PG",
        programmeDuration: "2",
        currentYear: "I",
        lateralEntry: "No",
        department: "Management Studies",
        school: "School of Business & Finance",
        differentlyAbled: "Yes",
        disabilityCertUrl: "disability_cert_mock2",
        disabilityCertName: "priya_disability_udid.pdf",
        socialCategory: "OBC",
        categoryCertUrl: "category_cert_mock2",
        categoryCertName: "priya_obc_ncl.pdf",
        religion: "Hinduism",
        ews: "No",
        householdIncome: 180000,
        state: "West Bengal",
        country: "India",
        scholarshipFullSource: "Institution",
        scholarshipFullName: "Dean's Excellence Scholarship",
        scholarshipFullAmount: 90000,
        scholarshipPartialSource: "None",
        scholarshipPartialName: "",
        scholarshipPartialAmount: 0,
        finalYearStatus: "Course Ongoing",
        submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      },
      {
        id: "MOCK-447192",
        studentName: "Mohammed Yaseen",
        gender: "Male",
        abcId: "128-442-990-210",
        enrollmentNo: "EN/2026/0091",
        yearOfAdmission: "2026",
        dob: "2004-11-05",
        dobProofUrl: "dob_proof_mock3",
        dobProofName: "yaseen_10th_marksheet.pdf",
        programmeName: "Bachelor of Science",
        programmeCode: "BSC-MATHS",
        specialization: "Applied Mathematics",
        careerType: "UG",
        programmeDuration: "3",
        currentYear: "III",
        lateralEntry: "No",
        department: "Mathematics",
        school: "School of Basic & Applied Sciences",
        differentlyAbled: "No",
        socialCategory: "General",
        religion: "Islam",
        ews: "Yes",
        ewsCertUrl: "ews_cert_mock3",
        ewsCertName: "yaseen_ews_25-26.pdf",
        householdIncome: 95000,
        state: "Kerala",
        country: "India",
        scholarshipFullSource: "Government",
        scholarshipFullName: "National Means-Cum-Merit Scheme",
        scholarshipFullAmount: 60000,
        scholarshipPartialSource: "None",
        scholarshipPartialName: "",
        scholarshipPartialAmount: 0,
        finalYearStatus: "Pass",
        submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
      },
      {
        id: "MOCK-771829",
        studentName: "Sunita Gond",
        gender: "Female",
        abcId: "772-911-300-449",
        enrollmentNo: "EN/2026/0204",
        yearOfAdmission: "2026",
        dob: "2005-02-18",
        dobProofUrl: "dob_proof_mock4",
        dobProofName: "sunita_birth_cert.jpg",
        programmeName: "Integrated BA LLB",
        programmeCode: "INT-LAW",
        specialization: "Constitutional Law",
        careerType: "Integrated",
        programmeDuration: "5",
        currentYear: "I",
        lateralEntry: "No",
        department: "Legal Studies",
        school: "School of Law & Governance",
        differentlyAbled: "No",
        socialCategory: "ST",
        categoryCertUrl: "category_cert_mock4",
        categoryCertName: "sunita_st_certificate.pdf",
        religion: "Christianity",
        ews: "No",
        householdIncome: 120000,
        state: "Jharkhand",
        country: "India",
        scholarshipFullSource: "Government",
        scholarshipFullName: "Post Matric Scholarship for ST",
        scholarshipFullAmount: 75000,
        scholarshipPartialSource: "None",
        scholarshipPartialName: "",
        scholarshipPartialAmount: 0,
        finalYearStatus: "Course Ongoing",
        submittedAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
      }
    ];

    localStorage.setItem("mock_students", JSON.stringify(mockStudents));
    fetchStudents();
  };

  const handleClearMockData = () => {
    if (confirm("Are you sure you want to delete all local entries?")) {
      localStorage.removeItem("mock_students");
      fetchStudents();
    }
  };

  // Document Click handler
  const handleViewDocument = (url?: string, fileName?: string) => {
    if (!url) return;
    if (url.startsWith("dob_") || url.startsWith("category_") || url.startsWith("disability_") || url.startsWith("ews_")) {
      // Check in global memory cache
      if (typeof window !== "undefined" && (window as any).__local_file_cache?.[url]) {
        const cached = (window as any).__local_file_cache[url];
        window.open(cached.url, "_blank");
      } else {
        alert(
          `Document '${fileName || url}' was uploaded in a mock session. Because this app is running in Local Storage fallback mode, files uploaded in previous browser refreshes are not stored permanently. Register a new student or configure Firebase to view permanent links.`
        );
      }
    } else {
      window.open(url, "_blank");
    }
  };

  // Calculations for stats
  const totalCount = students.length;
  const femaleCount = students.filter((s) => s.gender === "Female").length;
  const maleCount = students.filter((s) => s.gender === "Male").length;
  const reservedCount = students.filter((s) => s.socialCategory !== "General").length;
  const differentlyAbledCount = students.filter((s) => s.differentlyAbled === "Yes").length;
  const ewsCount = students.filter((s) => s.ews === "Yes").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-lg block">Admin Central</span>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Registration Database</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition flex items-center gap-2 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Public Form
            </a>
            
            <button
              onClick={fetchStudents}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700"
              title="Refresh database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Banner Alert for Fallback */}
        {useMock && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm">
                <span className="font-bold text-amber-950">LocalStorage Sandbox Enabled:</span> You are viewing local records. Files are simulated in-memory.
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSeedMockData}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <UserPlus className="w-4 h-4" />
                Seed 4 Mock Records
              </button>
              {students.length > 0 && (
                <button
                  onClick={handleClearMockData}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Local DB
                </button>
              )}
            </div>
          </div>
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Total */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-semibold">Total Submissions</span>
              <h3 className="text-2xl font-black mt-0.5 text-slate-800">{totalCount}</h3>
            </div>
          </div>

          {/* Card 2: Gender Split */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-semibold">Gender (M / F)</span>
              <h3 className="text-xl font-black mt-0.5 text-slate-800">
                {maleCount} <span className="text-slate-350 font-normal">/</span> {femaleCount}
              </h3>
            </div>
          </div>

          {/* Card 3: Reserved Categories */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-semibold">Reserved (SC/ST/OBC)</span>
              <h3 className="text-2xl font-black mt-0.5 text-slate-800">{reservedCount}</h3>
            </div>
          </div>

          {/* Card 4: Inclusion Details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-semibold">Inclusions (EWS / PwD)</span>
              <h3 className="text-xl font-black mt-0.5 text-slate-800">
                {ewsCount} <span className="text-slate-350 font-normal">/</span> {differentlyAbledCount}
              </h3>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTERS CONTROLS */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            
            {/* Search */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, enrollment no, ABC ID or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition text-slate-800"
              />
            </div>

            {/* Filter Toggle/Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-slate-700 font-semibold"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-slate-700 font-semibold"
              >
                <option value="">All Categories</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>

              {/* Career Filter */}
              <select
                value={careerFilter}
                onChange={(e) => setCareerFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-slate-700 font-semibold"
              >
                <option value="">All Careers</option>
                <option value="UG">UG (Undergrad)</option>
                <option value="PG">PG (Postgrad)</option>
                <option value="Integrated">Integrated</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
                <option value="PhD">PhD</option>
              </select>

              {/* EWS Filter */}
              <select
                value={ewsFilter}
                onChange={(e) => setEwsFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-slate-700 font-semibold"
              >
                <option value="">All EWS</option>
                <option value="Yes">EWS Yes</option>
                <option value="No">EWS No</option>
              </select>

              {/* Reset */}
              {(searchQuery || genderFilter || categoryFilter || careerFilter || ewsFilter) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 transition ml-auto lg:ml-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* DATATABLE */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
              <span>Fetching student records from database...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-slate-200 mb-4" />
              <span className="font-bold text-slate-650 text-sm">No Student Records Found</span>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Try searching with different terms, clearing your filters, or clicking "Seed Mock Records" if you are testing locally.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase">
                    <th className="py-4 px-6 w-16">S.No.</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">Enrollment No.</th>
                    <th className="py-4 px-6">Programme</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Submission Date</th>
                    <th className="py-4 px-6 text-center w-40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                  {filteredStudents.map((student, index) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-4.5 px-6 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-4.5 px-6">
                        <div className="font-bold text-slate-800">{student.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{student.gender} | ABC: {student.abcId}</div>
                      </td>
                      <td className="py-4.5 px-6 font-mono text-xs">{student.enrollmentNo}</td>
                      <td className="py-4.5 px-6">
                        <div className="truncate max-w-[200px]" title={student.programmeName}>{student.programmeName}</div>
                        <div className="text-[10px] text-indigo-600 font-bold">{student.programmeCode} • Year {student.currentYear}</div>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          student.socialCategory === "General" 
                            ? "bg-slate-100 text-slate-700" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}>
                          {student.socialCategory}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-slate-400 text-xs">
                        {student.submittedAt ? new Date(student.submittedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all shadow-sm"
                            title="Inspect details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => generateStudentPDF(student)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm flex items-center gap-1 text-xs px-3"
                            title="Download verification PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* INSPECTOR VIEW MODAL / DRAWER */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-indigo-600 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Candidate Dossier</span>
                <h2 className="text-xl font-bold mt-1">{selectedStudent.studentName}</h2>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 hover:bg-slate-800 rounded-xl transition-all text-slate-350"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Identity */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 text-xs uppercase tracking-wider text-slate-400">1. Identity Profile</h3>
                  <div className="space-y-2.5">
                    <p><strong className="text-slate-600 font-semibold block text-xs">Full Name:</strong> {selectedStudent.studentName}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Gender:</strong> {selectedStudent.gender}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Date of Birth:</strong> {selectedStudent.dob}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Enrollment Number:</strong> {selectedStudent.enrollmentNo}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Academic Bank (ABC ID):</strong> {selectedStudent.abcId}</p>
                  </div>
                </div>

                {/* 2. Program */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 text-xs uppercase tracking-wider text-slate-400">2. Academic Course</h3>
                  <div className="space-y-2.5">
                    <p><strong className="text-slate-600 font-semibold block text-xs">Programme Code:</strong> {selectedStudent.programmeCode}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Programme Name:</strong> {selectedStudent.programmeName}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Specialization:</strong> {selectedStudent.specialization}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Career & Duration:</strong> {selectedStudent.careerType} ({selectedStudent.programmeDuration} Yrs)</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Study Year / Lateral:</strong> Year {selectedStudent.currentYear} (Lateral: {selectedStudent.lateralEntry})</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Department & School:</strong> {selectedStudent.department} / {selectedStudent.school}</p>
                  </div>
                </div>

                {/* 3. Socio-Economics */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 text-xs uppercase tracking-wider text-slate-400">3. Socio-Demographics</h3>
                  <div className="space-y-2.5">
                    <p><strong className="text-slate-600 font-semibold block text-xs">Social Category:</strong> {selectedStudent.socialCategory}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Religion:</strong> {selectedStudent.religion}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">EWS Section Status:</strong> {selectedStudent.ews}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Annual Income:</strong> Rs. {Number(selectedStudent.householdIncome).toLocaleString("en-IN")}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Differently Abled PwD:</strong> {selectedStudent.differentlyAbled}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Region:</strong> {selectedStudent.state}, {selectedStudent.country}</p>
                  </div>
                </div>
              </div>

              {/* Scholarships */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-800 border-b pb-1.5 text-xs uppercase tracking-wider text-slate-400">4. Tuition Fee Reimbursements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-bold text-indigo-650 text-xs mb-1.5">Full Fee Scholarship Details:</h4>
                    <p><strong className="text-slate-600 font-semibold">Source:</strong> {selectedStudent.scholarshipFullSource}</p>
                    {selectedStudent.scholarshipFullSource !== "None" && (
                      <>
                        <p><strong className="text-slate-600 font-semibold">Scholarship Name:</strong> {selectedStudent.scholarshipFullName}</p>
                        <p><strong className="text-slate-600 font-semibold">Annual Amount:</strong> Rs. {Number(selectedStudent.scholarshipFullAmount).toLocaleString("en-IN")}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-650 text-xs mb-1.5">Partial Fee Scholarship Details:</h4>
                    <p><strong className="text-slate-600 font-semibold">Source:</strong> {selectedStudent.scholarshipPartialSource}</p>
                    {selectedStudent.scholarshipPartialSource !== "None" && (
                      <>
                        <p><strong className="text-slate-600 font-semibold">Scholarship Name:</strong> {selectedStudent.scholarshipPartialName}</p>
                        <p><strong className="text-slate-600 font-semibold">Annual Amount:</strong> Rs. {Number(selectedStudent.scholarshipPartialAmount).toLocaleString("en-IN")}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">5. Verification Supporting Documents</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DOB Proof */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Date of Birth Proof</span>
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] block" title={selectedStudent.dobProofName}>{selectedStudent.dobProofName || "Attached File"}</span>
                    </div>
                    <button
                      onClick={() => handleViewDocument(selectedStudent.dobProofUrl, selectedStudent.dobProofName)}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View File
                    </button>
                  </div>

                  {/* Category Proof */}
                  {selectedStudent.categoryCertUrl && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Social Category Proof ({selectedStudent.socialCategory})</span>
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] block" title={selectedStudent.categoryCertName}>{selectedStudent.categoryCertName || "Attached File"}</span>
                      </div>
                      <button
                        onClick={() => handleViewDocument(selectedStudent.categoryCertUrl, selectedStudent.categoryCertName)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View File
                      </button>
                    </div>
                  )}

                  {/* Disability Proof */}
                  {selectedStudent.disabilityCertUrl && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Disability Certificate</span>
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] block" title={selectedStudent.disabilityCertName}>{selectedStudent.disabilityCertName || "Attached File"}</span>
                      </div>
                      <button
                        onClick={() => handleViewDocument(selectedStudent.disabilityCertUrl, selectedStudent.disabilityCertName)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View File
                      </button>
                    </div>
                  )}

                  {/* EWS Proof */}
                  {selectedStudent.ewsCertUrl && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">EWS Category Certificate</span>
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] block" title={selectedStudent.ewsCertName}>{selectedStudent.ewsCertName || "Attached File"}</span>
                      </div>
                      <button
                        onClick={() => handleViewDocument(selectedStudent.ewsCertUrl, selectedStudent.ewsCertName)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View File
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
              <span className="text-slate-400 text-xs">Submitted: {new Date(selectedStudent.submittedAt).toLocaleString()}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition"
                >
                  Close Detail
                </button>
                <button
                  onClick={() => generateStudentPDF(selectedStudent)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-slate-200"
                >
                  <Download className="w-4 h-4" />
                  Download Verification PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
