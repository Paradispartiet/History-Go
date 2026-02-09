export async function bootApp() {
  await loadBaseData();
  await loadPeople();
  await loadEpoker();

  initMap();
  initPosition();
  initUI();
  initQuizzes();
}
