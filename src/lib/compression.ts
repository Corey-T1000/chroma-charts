import { deflate, inflate } from 'pako';

// Convert string to base64url-safe string
function toBase64URL(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert base64url-safe string back to original string
function fromBase64URL(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

// Compress string and make it URL-safe
export function compressToEncodedURIComponent(input: string): string {
  const compressed = deflate(input, { level: 9 });
  const binaryStr = String.fromCharCode.apply(null, compressed as unknown as number[]);
  return toBase64URL(binaryStr);
}

// Decompress URL-safe string back to original
export function decompressFromEncodedURIComponent(input: string): string {
  const binaryStr = fromBase64URL(input);
  const compressed = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    compressed[i] = binaryStr.charCodeAt(i);
  }
  const decompressed = inflate(compressed);
  return new TextDecoder().decode(decompressed);
}