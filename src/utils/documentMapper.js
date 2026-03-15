// src/utils/documentMapper.js
import { DOCUMENT_TEMPLATE_TYPES, getDocumentTemplate } from "../constants/documentTemplates";

const BARANGAY_CONTEXT = {
  republic: "Republic of the Philippines",
  province: "Ilocos Norte",
  municipality: "Pinili",
  barangay: "Upon",
  office: "OFFICE OF THE PUNONG BARANGAY",
  punongBarangay: "HON. LEONARDO P. BLANCO",
  barangayTreasurer: "LARRY B. BAGAYAS",
  barangaySecretary: "ERWIN F. BAGAYAS",
  issuedAtDefault: "Upon, Pinili, Ilocos Norte",
  preparedByDefault: "LARRY B. BAGAYAS",
  approvedByDefault: "HON. LEONARDO P. BLANCO",
  witnessDefault: "HON. JANCENT T. DAGUIMOL",
};

export const mapDocumentData = ({
  documentType,
  request = {},
  resident = {},
  settings = {},
}) => {
  const template = getDocumentTemplate(documentType);

  if (!template) {
    throw new Error(`Unsupported document type: ${documentType}`);
  }

  const person = buildPersonData({ request, resident });
  const issueDate = buildIssueDate(request);
  const common = buildCommonFields({ request, resident, settings, issueDate, person });

  switch (documentType) {
    case DOCUMENT_TEMPLATE_TYPES.BARANGAY_BUSINESS_CLEARANCE:
      return {
        ...common,
        businessName:
          request.businessName ||
          request.business?.name ||
          request.storeName ||
          "",
        businessAddress:
          request.businessAddress ||
          request.business?.address ||
          common.addressLine,
        purpose:
          request.purpose || "business clearance application",
        preparedBy:
          settings.preparedBy || BARANGAY_CONTEXT.preparedByDefault,
        approvedBy:
          settings.approvedBy || BARANGAY_CONTEXT.approvedByDefault,
      };

    case DOCUMENT_TEMPLATE_TYPES.BARANGAY_CLEARANCE:
      return {
        ...common,
        purpose: request.purpose || "legal purposes",
        signatureName: common.fullName,
      };

    case DOCUMENT_TEMPLATE_TYPES.FIRST_TIME_JOBSEEKER:
      return {
        ...common,
        sexTitle: person.sexTitle,
        issueDateText: issueDate.longText,
        approvedBy:
          settings.approvedBy || BARANGAY_CONTEXT.approvedByDefault,
        witnessedBy:
          settings.witnessedBy || BARANGAY_CONTEXT.witnessDefault,
        witnessDateText:
          settings.witnessDateText || issueDate.fullText,
        purpose:
          request.purpose || "First Time Jobseeker Act of 2019 application",
      };

    case DOCUMENT_TEMPLATE_TYPES.GOOD_MORAL:
      return {
        ...common,
        ageLabel: person.age ? `${person.age} years of age` : "of legal age",
        purpose: request.purpose || "board examination purposes",
        approvedBy:
          settings.approvedBy || BARANGAY_CONTEXT.approvedByDefault,
      };

    case DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_INDIGENCY:
      return {
        ...common,
        familyNameReference:
          request.familyNameReference ||
          resident.lastName ||
          extractLastName(common.fullName),
        purpose: request.purpose || "all legal intents and purposes",
        approvedBy:
          settings.approvedBy || BARANGAY_CONTEXT.approvedByDefault,
      };

    case DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_RESIDENCY:
      return {
        ...common,
        purpose: request.purpose || "all legal intents and purposes",
        approvedBy:
          settings.approvedBy || BARANGAY_CONTEXT.approvedByDefault,
      };

    default:
      return common;
  }
};

function buildCommonFields({ request, resident, settings, issueDate, person }) {
  const referenceNo = request.referenceNo || "";
  const fullName = person.fullName;
  const civilStatus = normalizeCivilStatus(
    request.civilStatus || resident.civilStatus || ""
  );

  return {
    referenceNo,

    republic: BARANGAY_CONTEXT.republic,
province:
  settings?.province ||
  request?.province ||
  resident?.province ||
  BARANGAY_CONTEXT.province,

municipality:
  settings?.municipality ||
  request?.municipalityId ||
  resident?.municipalityId ||
  BARANGAY_CONTEXT.municipality,

barangay:
  settings?.barangay ||
  request?.barangayId ||
  resident?.barangayId ||
  BARANGAY_CONTEXT.barangay,

office: settings.office || BARANGAY_CONTEXT.office,
    fullName,
    firstName: person.firstName,
    middleName: person.middleName,
    lastName: person.lastName,
    sex: person.sex,
    sexTitle: person.sexTitle,
    age: person.age,
    ageLabel: person.age ? `${person.age}` : "",
    civilStatus,
    citizenship: request.citizenship || resident.citizenship || "Filipino",

    addressLine: buildAddressLine(request, resident, settings),
    purok: request.purok || resident.purok || "",
    sitio: request.sitio || resident.sitio || "",
    birthDate: request.birthDate || resident.birthDate || "",
    contactNumber: request.contactNumber || resident.contactNumber || "",

    purpose: request.purpose || "",
    remarks: request.remarks || "",

    issueDay: issueDate.day,
    issueMonth: issueDate.monthUpper,
    issueMonthText: issueDate.monthText,
    issueYear: issueDate.year,
    issueDateText: issueDate.fullText,
    issuedOn: request.issuedOn || issueDate.isoDate,
    issuedAt: request.issuedAt || settings.issuedAt || BARANGAY_CONTEXT.issuedAtDefault,

    resCertNo: request.resCertNo || "",
    feesPaid: request.feesPaid || "",
    orNo: request.orNo || "",
    orDate: request.orDate || issueDate.isoDate,

    preparedBy:
      settings.preparedBy || BARANGAY_CONTEXT.preparedByDefault,
    approvedBy:
      settings.approvedBy || BARANGAY_CONTEXT.approvedByDefault,
    barangaySecretary:
      settings.barangaySecretary || BARANGAY_CONTEXT.barangaySecretary,
    barangayTreasurer:
      settings.barangayTreasurer || BARANGAY_CONTEXT.barangayTreasurer,
    punongBarangay:
      settings.punongBarangay || BARANGAY_CONTEXT.punongBarangay,
  };
}

function buildPersonData({ request, resident }) {
  const snapshot = request.applicantSnapshot || {};

  const firstName =
    request.firstName ||
    snapshot.firstName ||
    resident.firstName ||
    "";

  const middleName =
    request.middleName ||
    snapshot.middleName ||
    resident.middleName ||
    "";

  const lastName =
    request.lastName ||
    snapshot.lastName ||
    resident.lastName ||
    "";

  const fullName =
    request.fullName ||
    snapshot.fullName ||
    resident.fullName ||
    [firstName, middleName, lastName].filter(Boolean).join(" ").trim();

  const age =
    request.age ||
    snapshot.age ||
    resident.age ||
    computeAge(
      request.birthDate ||
      snapshot.birthDate ||
      resident.birthDate
    ) ||
    "";

  const sex =
    request.sex ||
    snapshot.sex ||
    resident.sex ||
    "";

  return {
    fullName,
    firstName,
    middleName,
    lastName: lastName || extractLastName(fullName),
    age,
    sex,
    sexTitle: deriveSexTitle(sex, fullName),
  };
}

function computeAge(birthDateValue) {
  if (!birthDateValue) return "";

  const birthDate = new Date(birthDateValue);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age > 0 ? age : "";
}

function buildAddressLine(request, resident, settings) {
  const snapshot = request.applicantSnapshot || {};

  const customAddress =
    request.address ||
    request.fullAddress ||
    snapshot.address ||
    snapshot.fullAddress ||
    resident.address ||
    resident.fullAddress;

  if (customAddress) return customAddress;

  const municipality =
  settings?.municipality ||
  request?.municipalityId ||
  resident?.municipalityId ||
  "";

const barangay =
  settings?.barangay ||
  request?.barangayId ||
  resident?.barangayId ||
  "";
  
  const province =
  settings?.province ||
  request?.province ||
  resident?.province ||
  BARANGAY_CONTEXT.province;

  return `Barangay ${barangay}, ${municipality}, ${province}`;
}

function buildIssueDate(request) {
  const rawDate =
    request.issueDate ||
    request.releasedAt ||
    request.updatedAt?.toDate?.() ||
    request.createdAt?.toDate?.() ||
    new Date();

  let date;

  if (rawDate instanceof Date) {
    date = rawDate;
  } else if (rawDate?.toDate && typeof rawDate.toDate === "function") {
    date = rawDate.toDate();
  } else {
    date = new Date(rawDate);
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    date = new Date();
  }

  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const safeMonth = months[monthIndex] || "JANUARY";

  return {
    day,
    monthUpper: safeMonth,
    monthText: safeMonth.charAt(0) + safeMonth.slice(1).toLowerCase(),
    year,
    isoDate: date.toISOString().split("T")[0],
    fullText: `${safeMonth} ${day}, ${year}`,
    longText: `${ordinal(day)} day of ${safeMonth}, ${year}`,
  };
}
function joinNameParts(firstName = "", middleName = "", lastName = "") {
  return [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
}

function extractLastName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : "";
}

function deriveSexTitle(sex = "", fullName = "") {
  const normalized = String(sex).trim().toLowerCase();

  if (normalized === "male") return "MR.";
  if (normalized === "female") return "MS.";

  if (/^mr\.?/i.test(fullName)) return "MR.";
  if (/^ms\.?/i.test(fullName)) return "MS.";
  if (/^mrs\.?/i.test(fullName)) return "MRS.";

  return "MR./MS.";
}

function normalizeCivilStatus(value = "") {
  if (!value) return "single/married";

  const normalized = String(value).trim().toLowerCase();

  if (normalized === "single") return "single";
  if (normalized === "married") return "married";
  if (normalized === "widowed") return "widowed";
  if (normalized === "separated") return "separated";

  return value;
}

function ordinal(day) {
  const num = Number(day);
  if (num > 3 && num < 21) return `${num}th`;

  switch (num % 10) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}