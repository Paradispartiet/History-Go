function handlePersonChat(person) {
  // Enkel V1: ett åpent spørsmål + lagring
  const userText = window.prompt(
    `Du snakker med ${person.name}.\n\n` +
    `Hva tenker du når du ser livet og tiden til denne personen?`
  );
  if (!userText) return;

  personDialogs.push({
    id: "dlg_" + Date.now(),
    personId: person.id,
    categoryId: (person.tags && person.tags[0]) || null,
    role: "user",
    text: userText,
    createdAt: new Date().toISOString()
  });
  savePersonDialogs();

  showToast(`Samtale med ${person.name} lagret 💬`);
}

function handlePersonNote(person) {
  const noteText = window.prompt(
    `Notat om ${person.name}.\n\n` +
    `Skriv én setning eller tanke du vil ta vare på:`
  );
  if (!noteText) return;

  userNotes.push({
    id: "note_" + Date.now(),
    userId: "local",              // senere: ekte bruker-id
    source: "historygo",
    type: "person",
    personId: person.id,
    placeId: null,
    categoryId: (person.tags && person.tags[0]) || null,
    title: `Notat om ${person.name}`,
    text: noteText,
    feeling: null,                // plass til følelser/valens senere
    createdAt: new Date().toISOString(),
    visibility: "private"
  });
  saveUserNotes();

  showToast(`Notat om ${person.name} lagret 📝`);
}

function handlePlaceNote(place) {
  const noteText = window.prompt(
    `Notat om ${place.name}.\n\nSkriv én setning eller tanke du vil ta vare på:`
  );
  if (!noteText) return;

  userNotes.push({
    id: "note_" + Date.now(),
    userId: "local",
    source: "historygo",
    type: "place",
    personId: null,
    placeId: place.id,
    categoryId: place.category || null,
    title: `Notat om ${place.name}`,
    text: noteText,
    feeling: null,
    createdAt: new Date().toISOString(),
    visibility: "private"
  });
  saveUserNotes();
  showToast(`Notat om ${place.name} lagret 📝`);
}
