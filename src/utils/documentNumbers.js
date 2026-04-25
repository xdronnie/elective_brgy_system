// src/utils/documentNumbers.js

/**
 * Generate a Residence Certificate Number
 * Format: [YY]-[sequential number padded to 6 digits]
 * Example: 24-001234
 */
export function generateResCertNo(sequence) {
  const year = new Date().getFullYear().toString().slice(-2);
  const paddedSeq = sequence.toString().padStart(6, '0');
  return `${year}-${paddedSeq}`;
}

/**
 * Generate an Official Receipt Number
 * Format: [YYYYMMDD]-[random 4 digits]
 * Example: 20250425-8732
 */
export function generateORNo() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${yyyymmdd}-${random}`;
}

/**
 * Get fees paid (could be dynamic based on document type)
 */
export function getFeesPaid(documentType = 'default') {
  const feeTable = {
    'certificate_of_indigency': 50,
    'barangay_clearance': 100,
    'residency_certificate': 75,
    'default': 100
  };
  return feeTable[documentType] || feeTable.default;
}

/**
 * Get next sequence number from Firestore (maintain a counter)
 * Use a transaction to prevent duplicates
 */
export async function getNextResCertSequence(db) {
  const counterRef = doc(db, 'counters', 'resCertSequence');
  try {
    const result = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let currentSeq = counterDoc.exists() ? counterDoc.data().value : 0;
      const nextSeq = currentSeq + 1;
      transaction.set(counterRef, { value: nextSeq });
      return nextSeq;
    });
    return result;
  } catch (error) {
    console.error('Failed to get sequence:', error);
    // Fallback to timestamp-based sequence
    return Date.now() % 1000000;
  }
}