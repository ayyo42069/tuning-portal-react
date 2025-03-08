import crypto from 'crypto';

// Encryption key and initialization vector size
const KEY_SIZE = 32; // 256 bits
const IV_SIZE = 16; // 128 bits
const ALGORITHM = 'aes-256-cbc';

// Get encryption key from environment variable or generate one
function getEncryptionKey(): Buffer {
  const envKey = process.env.MESSAGE_ENCRYPTION_KEY;
  
  if (!envKey) {
    console.warn('MESSAGE_ENCRYPTION_KEY not found in environment variables. Using fallback key.');
    // Fallback key - in production, this should always come from environment variables
    return crypto.scryptSync('fallback-key-for-development-only', 'salt', KEY_SIZE);
  }
  
  // If key is provided as hex string
  if (envKey.length === KEY_SIZE * 2) {
    return Buffer.from(envKey, 'hex');
  }
  
  // If key is provided as base64
  if (envKey.length === Math.ceil(KEY_SIZE * 4 / 3)) {
    return Buffer.from(envKey, 'base64');
  }
  
  // Otherwise, derive a key from the provided string
  return crypto.scryptSync(envKey, 'salt', KEY_SIZE);
}

/**
 * Encrypts a message string
 * @param message - The plain text message to encrypt
 * @returns The encrypted message as a string in format: iv:encryptedData (both hex encoded)
 */
export function encryptMessage(message: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_SIZE);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV and encrypted data as a single string
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypts an encrypted message string
 * @param encryptedMessage - The encrypted message in format: iv:encryptedData (both hex encoded)
 * @returns The decrypted plain text message
 */
export function decryptMessage(encryptedMessage: string): string {
  try {
    const [ivHex, encryptedData] = encryptedMessage.split(':');
    
    if (!ivHex || !encryptedData) {
      throw new Error('Invalid encrypted message format');
    }
    
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Utility function to check if a message is encrypted
 * @param message - The message to check
 * @returns Boolean indicating if the message appears to be encrypted
 */
export function isEncryptedMessage(message: string): boolean {
  // Check if the message follows our encryption format (iv:encryptedData)
  const parts = message.split(':');
  if (parts.length !== 2) return false;
  
  const [ivHex, encryptedData] = parts;
  
  // Check if IV is valid hex of correct length
  if (ivHex.length !== IV_SIZE * 2) return false;
  if (!/^[0-9a-f]+$/i.test(ivHex)) return false;
  
  // Check if encrypted data is hex
  if (!/^[0-9a-f]+$/i.test(encryptedData)) return false;
  
  return true;
}

/**
 * Safely decrypt a message, handling both encrypted and unencrypted messages
 * @param message - The message to decrypt (may or may not be encrypted)
 * @returns The decrypted message or the original if not encrypted
 */
export function safeDecryptMessage(message: string): string {
  if (!message) return message;
  
  if (isEncryptedMessage(message)) {
    try {
      return decryptMessage(message);
    } catch (error) {
      console.error('Failed to decrypt message, returning original:', error);
      return message; // Return original if decryption fails
    }
  }
  
  return message; // Return original if not encrypted
}