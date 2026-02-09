function applyOpenModeUnlockAll() {
  if (!Array.isArray(PLACES) || !PLACES.length) return;

  let changedVisited = false;
  let changedPeople  = false;

  for (const p of PLACES) {
    const id = String(p?.id ?? "").trim();
    if (!id) continue;
    if (!visited[id]) {
      visited[id] = true;
      changedVisited = true;
    }
  }

  if (Array.isArray(PEOPLE) && PEOPLE.length) {
    for (const person of PEOPLE) {
      const id = String(person?.id ?? "").trim();
      if (!id) continue;
      if (!peopleCollected[id]) {
        peopleCollected[id] = true;
        changedPeople = true;
      }
    }
  }

  if (changedVisited) saveVisited();
  if (changedPeople)  savePeople();

  try { window.renderNearbyPlaces?.(); } catch {}
  try { window.renderPeopleGallery?.(); } catch {}

  window.dispatchEvent(new Event("updateProfile"));
}
