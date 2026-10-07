(function (root, factory) {
  const core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  root.SamenThuisCore = core;
})(globalThis, function () {
  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (value && typeof value === 'object') {
      return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
  }

  function sameData(left, right) {
    return stableStringify(left) === stableStringify(right);
  }

  function hasConcurrentChanges(localUpdatedAt, remoteUpdatedAt, lastSyncedAt, localData, remoteData) {
    const local = Date.parse(localUpdatedAt || '');
    const remote = Date.parse(remoteUpdatedAt || '');
    const baseline = Date.parse(lastSyncedAt || '');
    if (!Number.isFinite(baseline) || !Number.isFinite(local) || !Number.isFinite(remote)
      || local <= baseline || remote <= baseline) return false;
    if (localData !== undefined) return !sameData(localData, remoteData);
    return local !== remote;
  }

  function conditionalUpdateSucceeded(rows) {
    return Array.isArray(rows) && rows.length > 0;
  }

  return { stableStringify, sameData, hasConcurrentChanges, conditionalUpdateSucceeded };
});
