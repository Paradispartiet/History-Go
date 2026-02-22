export function calculateCapital(user, CIVI_ITEMS, CIVI_SYNERGIES) {
  const capital = {
    economic: 0,
    cultural: 0,
    social: 0,
    symbolic: 0,
    institutional: 0,
    subculture: 0
  };

  user.ownedItems.forEach(id => {
    const item = CIVI_ITEMS[id];
    if (!item) return;

    Object.keys(item.capital_effect).forEach(key => {
      capital[key] += item.capital_effect[key];
    });
  });

  return capital;
}
