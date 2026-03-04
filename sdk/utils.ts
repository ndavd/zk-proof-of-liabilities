/**
 * Encodes a UTF-8 string into a little-endian bigint that fits within a field of size `fieldBits`.
 * Returns `null` if the string's UTF-8 encoding exceeds the field's capacity.
 */
function stringToField(input: string, fieldBits: number): bigint | null {
  const encoder = new TextEncoder();
  const trimmedInput = input.trim();
  if (trimmedInput == "") {
    return null;
  }
  const raw = encoder.encode(trimmedInput);

  const maxBytes = Math.floor(fieldBits / 8);
  if (raw.length > maxBytes) {
    return null;
  }

  const bytes = new Uint8Array(maxBytes);
  bytes.set(raw, 0);

  let value = BigInt(0);
  let shift = BigInt(0);
  for (const b of bytes) {
    value |= BigInt(b) << shift;
    shift += BigInt(8);
  }

  return value;
}

export default {
  stringToField,
};
