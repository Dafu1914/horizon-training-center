export function generateEnrollmentCode(): string {
  // Format: HRZ-XXXX (4 random digits)
  const num = Math.floor(1000 + Math.random() * 9000);
  return `HRZ-${num}`;
}

/**
 * Optional — check if a code is unique in the DB
 * Usage: await isCodeUnique(code) before using it
 */
export async function isCodeUnique(
  code: string,
  EnrollmentModel: any
): Promise<boolean> {
  const existing = await EnrollmentModel.findOne({ code });
  return !existing;
}