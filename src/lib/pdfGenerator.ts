import { jsPDF } from "jspdf";
import { StudentData } from "./supabase";

export const generateStudentPDF = (student: StudentData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page width = 210, height = 297. Margins: 15mm. Printable width = 180mm.
  const marginX = 15;
  const pageBottom = 280;
  let currentY = 18;

  // Grayscale palette only.
  const black: [number, number, number] = [0, 0, 0];
  const gray: [number, number, number] = [110, 110, 110];
  const lineGray: [number, number, number] = [200, 200, 200];

  const colWidth = 86;
  const col1X = marginX;
  const col2X = marginX + 94;

  const LABEL_VALUE_GAP = 4.2;
  const LINE_HEIGHT = 4.3;
  const ROW_BOTTOM_PAD = 5;

  // Adds a new page if the upcoming block would run past the bottom margin.
  const ensureSpace = (height: number) => {
    if (currentY + height > pageBottom) {
      doc.addPage();
      currentY = 18;
    }
  };

  // Draws a label (small, gray, uppercase) directly above its value (black, wraps to width).
  const fieldBlock = (x: number, label: string, value: string, width: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(label.toUpperCase(), x, currentY);

    const lines = doc.splitTextToSize(value || "N/A", width);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(lines, x, currentY + LABEL_VALUE_GAP);

    return lines.length;
  };

  const drawSectionHeader = (title: string) => {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(title.toUpperCase(), marginX, currentY);
    currentY += 2;
    doc.setDrawColor(black[0], black[1], black[2]);
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY, marginX + 180, currentY);
    currentY += 6;
  };

  const drawTwoColumnRow = (label1: string, val1: string, label2: string, val2: string) => {
    const lines1 = doc.splitTextToSize(val1 || "N/A", colWidth);
    const lines2 = doc.splitTextToSize(val2 || "N/A", colWidth);
    const maxLines = Math.max(lines1.length, lines2.length, 1);
    const rowHeight = LABEL_VALUE_GAP + (maxLines - 1) * LINE_HEIGHT + ROW_BOTTOM_PAD;

    ensureSpace(rowHeight);

    fieldBlock(col1X, label1, val1, colWidth);
    fieldBlock(col2X, label2, val2, colWidth);

    doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + rowHeight - 2.5, marginX + 180, currentY + rowHeight - 2.5);

    currentY += rowHeight;
  };

  const drawFullWidthRow = (label: string, val: string) => {
    const fullWidth = 178;
    const lines = doc.splitTextToSize(val || "N/A", fullWidth);
    const rowHeight = LABEL_VALUE_GAP + (lines.length - 1) * LINE_HEIGHT + ROW_BOTTOM_PAD;

    ensureSpace(rowHeight);

    fieldBlock(marginX, label, val, fullWidth);

    doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + rowHeight - 2.5, marginX + 180, currentY + rowHeight - 2.5);

    currentY += rowHeight;
  };

  // Header
  doc.setDrawColor(black[0], black[1], black[2]);
  doc.setLineWidth(0.6);
  doc.line(marginX, currentY, marginX + 180, currentY);
  currentY += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("STUDENT REGISTRATION & VERIFICATION SHEET", 105, currentY, { align: "center" });
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text(
    `Generated on: ${new Date().toLocaleString()} | Reference ID: ${student.id || "TEMP-" + Date.now().toString().slice(-6)}`,
    105,
    currentY,
    { align: "center" }
  );
  currentY += 9;

  // --- SECTION 1: PERSONAL DETAILS ---
  drawSectionHeader("1. Personal Details");
  drawTwoColumnRow("Student Name", student.studentName, "Gender", student.gender);
  drawTwoColumnRow("Date of Birth", student.dob, "ABC ID", student.abcId);
  drawTwoColumnRow("Enrollment No.", student.enrollmentNo, "Year of Admission", student.yearOfAdmission);
  currentY += 2;

  // --- SECTION 2: ACADEMIC DETAILS ---
  drawSectionHeader("2. Academic & Program Details");
  drawTwoColumnRow("Programme Name", student.programmeName, "Programme Code", student.programmeCode);
  drawTwoColumnRow("Specialization", student.specialization, "Career Type", student.careerType);
  drawTwoColumnRow("Current Year", student.currentYear, "Duration (Years)", student.programmeDuration);
  drawTwoColumnRow("Lateral Entry", student.lateralEntry, "Department", student.department);
  drawFullWidthRow("School Name", student.school);
  currentY += 2;

  // --- SECTION 3: DEMOGRAPHIC & SOCIAL DETAILS ---
  drawSectionHeader("3. Socio-Demographic Details");
  drawTwoColumnRow("Social Category", student.socialCategory, "Religion", student.religion);
  drawTwoColumnRow("Differently Abled", student.differentlyAbled, "EWS Status", student.ews);
  drawTwoColumnRow(
    "Household Income",
    `Rs. ${Number(student.householdIncome).toLocaleString("en-IN")}`,
    "Final Year Status",
    student.finalYearStatus
  );
  drawTwoColumnRow("State of Origin", student.state, "Country", student.country);
  drawTwoColumnRow("Father's Qualification", student.fatherQualification, "Mother's Qualification", student.motherQualification);
  drawFullWidthRow("First Graduation (Self/Sib)", student.firstGraduation);
  currentY += 2;

  // --- SECTION 4: SCHOLARSHIP DETAILS ---
  drawSectionHeader("4. Scholarship & Fee Reimbursements");
  drawTwoColumnRow(
    "Full Reimbursement",
    student.scholarshipFullSource !== "None" ? `${student.scholarshipFullSource}` : "None",
    "Scholarship Name / Amt",
    student.scholarshipFullSource !== "None"
      ? `${student.scholarshipFullName} (Rs. ${Number(student.scholarshipFullAmount).toLocaleString("en-IN")})`
      : "N/A"
  );
  drawTwoColumnRow(
    "Partial Reimbursement",
    student.scholarshipPartialSource !== "None" ? `${student.scholarshipPartialSource}` : "None",
    "Scholarship Name / Amt",
    student.scholarshipPartialSource !== "None"
      ? `${student.scholarshipPartialName} (Rs. ${Number(student.scholarshipPartialAmount).toLocaleString("en-IN")})`
      : "N/A"
  );
  currentY += 2;

  // --- SECTION 5: SUPPORTING DOCUMENTS ATTACHED ---
  drawSectionHeader("5. Submitted Supporting Documents");
  const docList = [
    { label: "Date of Birth (DOB) Proof", file: student.dobProofName || (student.dobProofUrl ? "Attached" : "Not Provided") },
    {
      label: "Social Category Certificate",
      file: student.socialCategory !== "General" ? (student.categoryCertName || (student.categoryCertUrl ? "Attached" : "Not Uploaded")) : "Not Applicable",
    },
    {
      label: "Disability Certificate",
      file: student.differentlyAbled === "Yes" ? (student.disabilityCertName || (student.disabilityCertUrl ? "Attached" : "Not Uploaded")) : "Not Applicable",
    },
    {
      label: "EWS Certificate",
      file: student.ews === "Yes" ? (student.ewsCertName || (student.ewsCertUrl ? "Attached" : "Not Uploaded")) : "Not Applicable",
    },
    {
      label: "Full Reimbursement Proof",
      file:
        student.scholarshipFullSource !== "None"
          ? student.scholarshipFullProofName || (student.scholarshipFullProofUrl ? "Attached" : "Not Uploaded")
          : "Not Applicable",
    },
    {
      label: "Partial Reimbursement Proof",
      file:
        student.scholarshipPartialSource !== "None"
          ? student.scholarshipPartialProofName || (student.scholarshipPartialProofUrl ? "Attached" : "Not Uploaded")
          : "Not Applicable",
    },
  ];

  docList.forEach((docItem) => {
    const fullWidth = 88;
    const lines = doc.splitTextToSize(docItem.file, fullWidth);
    const rowHeight = LABEL_VALUE_GAP + (lines.length - 1) * LINE_HEIGHT + ROW_BOTTOM_PAD;

    ensureSpace(rowHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(docItem.label, marginX, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(lines, marginX + 92, currentY);

    doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + rowHeight - 2.5, marginX + 180, currentY + rowHeight - 2.5);

    currentY += rowHeight;
  });
  currentY += 2;

  // --- SECTION 6: DECLARATION ---
  const declarationText = `I, ${student.studentName.toUpperCase()}, hereby declare that the details and certificates submitted above are true and correct to the best of my knowledge and belief. I understand that in the event of any information being found false, my admission/registration will stand cancelled immediately and I will be held liable for any academic or legal repercussions.`;
  const splitDeclaration = doc.splitTextToSize(declarationText, 180);
  ensureSpace(5 + splitDeclaration.length * 4 + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("CANDIDATE DECLARATION & VERIFICATION", marginX, currentY);
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text(splitDeclaration, marginX, currentY);
  currentY += splitDeclaration.length * 4 + 12;

  // --- SECTION 7: SIGNATURES ---
  ensureSpace(14);
  doc.setDrawColor(black[0], black[1], black[2]);
  doc.setLineWidth(0.3);

  // Left: Candidate Signature
  doc.line(marginX + 5, currentY, marginX + 65, currentY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("Signature of the Candidate", marginX + 5, currentY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text("Date: ________________________", marginX + 5, currentY + 9);

  // Right: Verifying Officer Signature
  doc.line(marginX + 115, currentY, marginX + 175, currentY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("Signature of Verifying Authority", marginX + 115, currentY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text("Designation & Seal: ____________", marginX + 115, currentY + 9);

  // Download trigger
  const fileName = `${student.studentName.replace(/\s+/g, "_")}_verification.pdf`;
  doc.save(fileName);
};
