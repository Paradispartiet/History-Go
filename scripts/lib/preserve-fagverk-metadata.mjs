const parseVersion = (value) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value ?? '');
  return match ? match.slice(1).map(Number) : null;
};

const isOlderVersion = (current, minimum) => {
  const currentParts = parseVersion(current);
  const minimumParts = parseVersion(minimum);
  if (!minimumParts) throw new Error(`Ugyldig minimumsversjon: ${minimum}`);
  if (!currentParts) return true;
  return currentParts.some((part, index) =>
    part !== minimumParts[index] &&
    currentParts.slice(0, index).every((prefixPart, prefixIndex) => prefixPart === minimumParts[prefixIndex]) &&
    part < minimumParts[index]
  );
};

export function preserveNewerFagverkMetadata(record, minimumVersion, minimumUpdatedAt) {
  if (isOlderVersion(record.version, minimumVersion)) record.version = minimumVersion;
  if (!record.updatedAt || record.updatedAt < minimumUpdatedAt) record.updatedAt = minimumUpdatedAt;
}
