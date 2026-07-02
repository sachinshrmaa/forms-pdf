"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { type Session } from "@supabase/supabase-js";
import { fetchStudents as loadStudentsFromSource, deleteStudent as deleteStudentFromSource, getMockDocument, supabase, useMock, StudentData } from "@/lib/supabase";
import { generateStudentPDF } from "@/lib/pdfGenerator";
import {
  Search, Download, Eye, RefreshCw, Users, FileText, Award, MapPin, X, ArrowLeft, Database, Trash2, UserPlus, ExternalLink, LogIn, LogOut, Shield, Loader2, ChevronDown, FileDown
} from "lucide-react";

export default function AdminDashboard() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [session, setSession] = useState<Session | null | undefined>(useMock || !supabase ? null : undefined);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [careerFilter, setCareerFilter] = useState("");
  const [ewsFilter, setEwsFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState<string[]>([]);
  const [programmeDropdownOpen, setProgrammeDropdownOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState("");
  const programmeDropdownRef = useRef<HTMLDivElement>(null);

  const authLoading = session === undefined;

  useEffect(() => {
    if (!programmeDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (programmeDropdownRef.current && !programmeDropdownRef.current.contains(event.target as Node)) {
        setProgrammeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [programmeDropdownOpen]);

  const refreshStudents = async () => {
    setLoading(true);
    try {
      const list = await loadStudentsFromSource();
      setStudents(list);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (useMock || !supabase) {
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;

      setSession(data.session);

      if (data.session) {
        void refreshStudents();
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      setSession(nextSession);

      if (nextSession) {
        void refreshStudents();
      } else {
        setStudents([]);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const filteredStudents = useMemo(() => {
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

    // Programme Filter
    if (programmeFilter.length > 0) {
      const selected = new Set(programmeFilter.map((p) => p.trim().toLowerCase()));
      result = result.filter((s) => selected.has(s.programmeName?.trim().toLowerCase() ?? ""));
    }

    // Study Year Filter
    if (yearFilter) {
      result = result.filter((s) => s.currentYear === yearFilter);
    }

    return result;
  }, [students, searchQuery, genderFilter, categoryFilter, careerFilter, ewsFilter, programmeFilter, yearFilter]);

  const programmeOptions = useMemo(() => {
    const seen = new Map<string, string>();

    students.forEach((s) => {
      const name = s.programmeName?.trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, name);
      }
    });

    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setGenderFilter("");
    setCategoryFilter("");
    setCareerFilter("");
    setEwsFilter("");
    setProgrammeFilter([]);
    setYearFilter("");
  };

  const toggleProgrammeFilter = (name: string) => {
    setProgrammeFilter((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const escapeCsvField = (value: unknown): string => {
    const str = value === null || value === undefined ? "" : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    const columns: { key: keyof StudentData; label: string }[] = [
      { key: "studentName", label: "Student Name" },
      { key: "gender", label: "Gender" },
      { key: "abcId", label: "ABC ID" },
      { key: "enrollmentNo", label: "Enrollment No." },
      { key: "yearOfAdmission", label: "Year of Admission" },
      { key: "dob", label: "DOB" },
      { key: "programmeName", label: "Programme Name" },
      { key: "programmeCode", label: "Programme Code" },
      { key: "specialization", label: "Specialization" },
      { key: "careerType", label: "Career Type" },
      { key: "programmeDuration", label: "Programme Duration" },
      { key: "currentYear", label: "Current Year" },
      { key: "lateralEntry", label: "Lateral Entry" },
      { key: "department", label: "Department" },
      { key: "school", label: "School" },
      { key: "differentlyAbled", label: "Differently Abled" },
      { key: "socialCategory", label: "Social Category" },
      { key: "religion", label: "Religion" },
      { key: "ews", label: "EWS" },
      { key: "householdIncome", label: "Household Income" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
      { key: "finalYearStatus", label: "Final Year Status" },
      { key: "submittedAt", label: "Submitted At" },
    ];

    const header = columns.map((c) => escapeCsvField(c.label)).join(",");
    const rows = filteredStudents.map((student) =>
      columns.map((c) => escapeCsvField(student[c.key])).join(",")
    );
    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!supabase) {
      setAuthError("Supabase is not configured. Add your environment variables to enable admin sign-in.");
      return;
    }

    setAuthSubmitting(true);
    setAuthError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    });

    if (error) {
      setAuthError(error.message);
    }

    setAuthSubmitting(false);
  };

  const handleAdminLogout = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setStudents([]);
    setLoading(false);
  };

  // Generate Mock Data for Testing
  const handleSeedMockData = () => {
    const mockStudents: StudentData[] = [
    
    ];

    localStorage.setItem("mock_students", JSON.stringify(mockStudents));
    void refreshStudents();
  };

  const handleClearMockData = () => {
    if (confirm("Are you sure you want to delete all local entries?")) {
      localStorage.removeItem("mock_students");
      void refreshStudents();
    }
  };

  const handleDeleteStudent = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this student record? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteStudentFromSource(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student record. Please try again.");
    }
  };

  // Document Click handler
  const handleViewDocument = (url?: string, fileName?: string) => {
    if (!url) return;
    if (
      url.startsWith("dob_") ||
      url.startsWith("category_") ||
      url.startsWith("disability_") ||
      url.startsWith("ews_") ||
      url.startsWith("scholarship_full_proof_") ||
      url.startsWith("scholarship_partial_proof_")
    ) {
      // Check in global memory cache
      const cached = getMockDocument(url);
      if (cached) {
        window.open(cached.url, "_blank");
      } else {
        alert(
          `Document '${fileName || url}' was uploaded in a mock session. Because this app is running in Local Storage fallback mode, files uploaded in previous browser refreshes are not stored permanently. Register a new student or configure Supabase to view permanent links.`
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-300">Loading admin session...</p>
        </div>
      </div>
    );
  }

  if (!useMock && !session) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.96),_rgba(2,6,23,1))] text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-slate-950/40 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-300 border border-indigo-400/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Admin Access</p>
              <h1 className="text-2xl font-black tracking-tight">Sign in to continue</h1>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Use a Supabase Auth email/password account to open the admin dashboard.
          </p>

          {authError && (
            <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
              <input
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400"
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-bold text-white transition flex items-center justify-center gap-2"
            >
              {authSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Sign in
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition">
              Back to public form
            </Link>
            <span>Powered by Supabase Auth</span>
          </div>
        </div>
      </div>
    );
  }

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
            <Link
              href="/"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition flex items-center gap-2 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Public Form
            </Link>

            <div className="text-[10px] text-slate-400 hidden md:block">
              {session?.user.email}
            </div>

            <button
              onClick={() => void handleAdminLogout()}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition flex items-center gap-2 border border-slate-700"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
            
            <button
              onClick={() => void refreshStudents()}
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

              {/* Programme Filter (multi-select) */}
              <div className="relative" ref={programmeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProgrammeDropdownOpen((prev) => !prev)}
                  className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-slate-700 font-semibold flex items-center gap-1.5"
                >
                  {programmeFilter.length === 0
                    ? "All Programmes"
                    : `${programmeFilter.length} Programme${programmeFilter.length > 1 ? "s" : ""} Selected`}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {programmeDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg py-2 max-h-72 overflow-y-auto">
                    {programmeOptions.length === 0 ? (
                      <div className="px-4 py-2 text-xs text-slate-400">No programmes available</div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setProgrammeFilter([])}
                          className="w-full text-left px-4 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                        >
                          Clear Selection
                        </button>
                        {programmeOptions.map((name) => (
                          <label
                            key={name}
                            className="flex items-center gap-2 px-4 py-1.5 text-xs text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={programmeFilter.includes(name)}
                              onChange={() => toggleProgrammeFilter(name)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            {name}
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Study Year Filter */}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-slate-700 font-semibold"
              >
                <option value="">All Years</option>
                <option value="I">I Year</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
                <option value="V">V Year</option>
              </select>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                disabled={filteredStudents.length === 0}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition ml-auto lg:ml-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown className="w-3.5 h-3.5" />
                Export CSV
              </button>

              {/* Reset */}
              {(searchQuery || genderFilter || categoryFilter || careerFilter || ewsFilter || programmeFilter.length > 0 || yearFilter) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 transition"
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
                Try searching with different terms, clearing your filters, or clicking &quot;Seed Mock Records&quot; if you are testing locally.
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

                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all shadow-sm"
                            title="Delete student record"
                          >
                            <Trash2 className="w-4 h-4" />
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
                    <p><strong className="text-slate-600 font-semibold block text-xs">Father&apos;s Qualification:</strong> {selectedStudent.fatherQualification}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">Mother&apos;s Qualification:</strong> {selectedStudent.motherQualification}</p>
                    <p><strong className="text-slate-600 font-semibold block text-xs">First Graduate Status:</strong> {selectedStudent.firstGraduation}</p>
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
                        {selectedStudent.scholarshipFullProofUrl && (
                          <button
                            onClick={() => handleViewDocument(selectedStudent.scholarshipFullProofUrl, selectedStudent.scholarshipFullProofName)}
                            className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Proof
                          </button>
                        )}
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
                        {selectedStudent.scholarshipPartialProofUrl && (
                          <button
                            onClick={() => handleViewDocument(selectedStudent.scholarshipPartialProofUrl, selectedStudent.scholarshipPartialProofName)}
                            className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Proof
                          </button>
                        )}
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
                  onClick={() => handleDeleteStudent(selectedStudent.id)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                  title="Delete student record"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
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
