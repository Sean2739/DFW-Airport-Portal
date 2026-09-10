import crypto from "crypto";

/**
 * Encrypt a Fronius System ID using AES-256-GCM
 *  @param {string} systemId - The plaintext system ID
 *  @returns {object} - { cipher, iv, tag }
 */
export function encryptSystemId(systemId) {
  // Load the AES master key from environment variables
  const MASTER_KEY = Buffer.from(process.env.FRONIUS_SYSTEM_KEY, "hex");
  
  const iv = crypto.randomBytes(12); // 12 bytes is standard for GCM

  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(systemId, "utf8"),
    cipher.final(),
  ]);

  return {
    cipher: encrypted.toString("hex"),      // store in system_cipher
    iv: iv.toString("hex"),                 // store in system_iv
    tag: cipher.getAuthTag().toString("hex"), // store in system_tag
  };
}

/**
 * Decrypt a Fronius System ID from the database
 * @param {object} record - { system_cipher, system_iv, system_tag }
 * @returns {string} - Decrypted system ID
 */
export function decryptSystemId(record) {
  // Load the AES master key from environment variables
  const MASTER_KEY = Buffer.from(process.env.FRONIUS_SYSTEM_KEY, "hex");
  
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    MASTER_KEY,
    Buffer.from(record.system_iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(record.system_tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(record.system_cipher, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
