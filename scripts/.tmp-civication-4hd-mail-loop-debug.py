from pathlib import Path

path = Path('tests/civication-mail-loop.test.js')
source = path.read_text()
needle = "  const lifeOpen = await global.HG_CiviEngine.onAppOpen({ force: true });\n  assert.strictEqual(lifeOpen.enqueued, true, 'Expected life mail to enqueue after enabling life tags without active job');"
replacement = """  const lifeOpen = await global.HG_CiviEngine.onAppOpen({ force: true });
  if (lifeOpen?.enqueued !== true) {
    const lifeDebugState = global.CivicationState.getState();
    const lifeDebugScenes = await global.CivicationSceneCatalog.getSourceScenes('life', {
      active: global.CivicationState.getActivePosition(),
      state: lifeDebugState,
      consumer: '4hd_mail_loop_debug'
    });
    console.error('4H-D LIFE DEBUG', JSON.stringify({
      lifeOpen,
      active: global.CivicationState.getActivePosition(),
      lifeTags: lifeDebugState?.life_tags || [],
      lifeInspect: global.CivicationLifeMailRuntime?.inspect?.(),
      sceneAdapters: global.CivicationSceneCatalog?.listSourceAdapters?.(),
      directLifeSceneIds: Array.isArray(lifeDebugScenes) ? lifeDebugScenes.map(scene => scene?.id || null) : []
    }, null, 2));
  }
  assert.strictEqual(lifeOpen.enqueued, true, 'Expected life mail to enqueue after enabling life tags without active job');"""
if needle not in source:
    raise SystemExit('Life-mail assertion needle not found')
path.write_text(source.replace(needle, replacement, 1))
