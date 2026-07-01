import { jsPDF } from "jspdf";
import { StudentData } from "./firebase";

export const generateStudentPDF = (student: StudentData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page width = 210, height = 297. Margins: 15mm. Printable width = 180mm
  const marginX = 15;
  let currentY = 18;

  // Primary Colors (Slate/Navy theme)
  const primaryColor = [15, 23, 42]; // rgb(15, 23, 42) - Slate 900
  const secondaryColor = [71, 85, 105]; // rgb(71, 85, 105) - Slate 600
  const lightBg = [248, 250, 252]; // rgb(248, 250, 252) - Slate 50
  const borderColor = [226, 232, 240]; // rgb(226, 232, 240) - Slate 200

  // Helper: Draw Section Header
  const drawSectionHeader = (title: string) => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(marginX, currentY, 180, 7, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), marginX + 3, currentY + 5);
    currentY += 10;
  };

  // Helper: Draw Two Column Row
  const drawTwoColumnRow = (label1: string, val1: string, label2: string, val2: string) => {
    // Background for labels
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(marginX, currentY - 4, 40, 6, "F");
    doc.rect(marginX + 90, currentY - 4, 40, 6, "F");

    // Borders
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + 2, marginX + 180, currentY + 2); // Bottom row line

    // Label 1
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(label1, marginX + 2, currentY);

    // Value 1
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text(val1 || "N/A", marginX + 43, currentY);

    // Label 2
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(label2, marginX + 92, currentY);

    // Value 2
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text(val2 || "N/A", marginX + 133, currentY);

    currentY += 6;
  };

  // Helper: Draw Full Width Row
  const drawFullWidthRow = (label: string, val: string) => {
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(marginX, currentY - 4, 40, 6, "F");

    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + 2, marginX + 180, currentY + 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(label, marginX + 2, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text(val || "N/A", marginX + 43, currentY);

    currentY += 6;
  };

  // Header Logo Box / Placeholder
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(marginX, currentY, marginX + 180, currentY);
  currentY += 5;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("STUDENT REGISTRATION & VERIFICATION SHEET", 105, currentY, { align: "center" });
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Generated on: ${new Date().toLocaleString()} | Reference ID: ${student.id || "TEMP-" + Date.now().toString().slice(-6)}`, 105, currentY, { align: "center" });
  currentY += 8;

  // --- SECTION 1: PERSONAL DETAILS ---
  drawSectionHeader("1. Personal Details");
  drawTwoColumnRow("Student Name", student.studentName, "Gender", student.gender);
  drawTwoColumnRow("Date of Birth", student.dob, "ABC ID", student.abcId);
  drawTwoColumnRow("Enrollment No.", student.enrollmentNo, "Year of Admission", student.yearOfAdmission);
  currentY += 1;

  // --- SECTION 2: ACADEMIC DETAILS ---
  drawSectionHeader("2. Academic & Program Details");
  drawTwoColumnRow("Programme Name", student.programmeName, "Programme Code", student.programmeCode);
  drawTwoColumnRow("Specialization", student.specialization, "Career Type", student.careerType);
  drawTwoColumnRow("Current Year", student.currentYear, "Duration (Years)", student.programmeDuration);
  drawTwoColumnRow("Lateral Entry", student.lateralEntry, "Department", student.department);
  drawFullWidthRow("School Name", student.school);
  currentY += 1;

  // --- SECTION 3: DEMOGRAPHIC & SOCIAL DETAILS ---
  drawSectionHeader("3. Socio-Demographic Details");
  drawTwoColumnRow("Social Category", student.socialCategory, "Religion", student.religion);
  drawTwoColumnRow("Differently Abled", student.differentlyAbled, "EWS Status", student.ews);
  drawTwoColumnRow("Household Income", `Rs. ${Number(student.householdIncome).toLocaleString("en-IN")}`, "Final Year Status", student.finalYearStatus);
  drawTwoColumnRow("State of Origin", student.state, "Country", student.country);
  drawTwoColumnRow("Father's Qualification", student.fatherQualification, "Mother's Qualification", student.motherQualification);
  drawFullWidthRow("First Graduation (Self/Sib)", student.firstGraduation);
  currentY += 1;

  // --- SECTION 4: SCHOLARSHIP DETAILS ---
  drawSectionHeader("4. Scholarship & Fee Reimbursements");
  drawTwoColumnRow(
    "Full Reimbursement",
    student.scholarshipFullSource !== "None" ? `${student.scholarshipFullSource}` : "None",
    "Scholarship Name / Amt",
    student.scholarshipFullSource !== "None" ? `${student.scholarshipFullName} (Rs. ${Number(student.scholarshipFullAmount).toLocaleString("en-IN")})` : "N/A"
  );
  drawTwoColumnRow(
    "Partial Reimbursement",
    student.scholarshipPartialSource !== "None" ? `${student.scholarshipPartialSource}` : "None",
    "Scholarship Name / Amt",
    student.scholarshipPartialSource !== "None" ? `${student.scholarshipPartialName} (Rs. ${Number(student.scholarshipPartialAmount).toLocaleString("en-IN")})` : "N/A"
  );
  currentY += 1;

  // --- SECTION 5: SUPPORTING DOCUMENTS ATTACHED ---
  drawSectionHeader("5. Submitted Supporting Documents");
  const docList = [
    { label: "Date of Birth (DOB) Proof", file: student.dobProofName || (student.dobProofUrl ? "Attached" : "Not Provided") },
    { label: "Social Category Certificate", file: student.socialCategory !== "General" ? (student.categoryCertName || (student.categoryCertUrl ? "Attached" : "Not Uploaded")) : "Not Applicable" },
    { label: "Disability Certificate", file: student.differentlyAbled === "Yes" ? (student.disabilityCertName || (student.disabilityCertUrl ? "Attached" : "Not Uploaded")) : "Not Applicable" },
    { label: "EWS Certificate", file: student.ews === "Yes" ? (student.ewsCertName || (student.ewsCertUrl ? "Attached" : "Not Uploaded")) : "Not Applicable" }
  ];

  docList.forEach(docItem => {
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + 2, marginX + 180, currentY + 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(docItem.label, marginX + 2, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(docItem.file, marginX + 90, currentY);
    currentY += 6;
  });
  currentY += 2;

  // --- SECTION 6: DECLARATION ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("CANDIDATE DECLARATION & VERIFICATION", marginX, currentY);
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  const declarationText = `I, ${student.studentName.toUpperCase()}, hereby declare that the details and certificates submitted above are true and correct to the best of my knowledge and belief. I understand that in the event of any information being found false, my admission/registration will stand cancelled immediately and I will be held liable for any academic or legal repercussions.`;
  const splitText = doc.splitTextToSize(declarationText, 180);
  doc.text(splitText, marginX, currentY);
  currentY += 16;

  // --- SECTION 7: SIGNATURES ---
  // Lines for signature
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.3);
  
  // Left: Candidate Signature
  doc.line(marginX + 5, currentY, marginX + 65, currentY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Signature of the Candidate", marginX + 5, currentY + 4);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Date: ________________________`, marginX + 5, currentY + 9);

  // Right: Verifying Officer Signature
  doc.line(marginX + 115, currentY, marginX + 175, currentY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Signature of Verifying Authority", marginX + 115, currentY + 4);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("Designation & Seal: ____________", marginX + 115, currentY + 9);

  // Download trigger
  const fileName = `${student.studentName.replace(/\s+/g, "_")}_verification.pdf`;
  doc.save(fileName);
};
