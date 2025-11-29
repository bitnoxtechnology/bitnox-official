import getBrowserFingerprint from "get-browser-fingerprint";

export async function getDeviceFingerprint(): Promise<string> {
  const fingerprint = await getBrowserFingerprint();
  return fingerprint.toString();
}
