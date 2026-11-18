(/** @param {any} root */ function (root) {
'use strict';
// Pure estimates shared by previews, salary contracts and electricity billing.
// Never reads/writes player state or pays money.
/** @param {any} config @returns {any[]} */
function getSalaryJobs(config) {
  if (!config?.job || (config.jobs != null && !Array.isArray(config.jobs))) return [];
  const jobs = [config.job, ...(config.jobs || [])];
  if (jobs.some(job => !job || typeof job.id !== 'string' || !job.id.trim()
      || typeof job.careerId !== 'string' || !job.careerId.trim()
      || typeof job.roleTitle !== 'string' || !job.roleTitle.trim()
      || typeof job.source !== 'string' || !job.source.startsWith('https://')
      || typeof job.grossMonthlyNok !== 'number' || !Number.isFinite(job.grossMonthlyNok) || job.grossMonthlyNok <= 0
      || !Number.isSafeInteger(Math.round(job.grossMonthlyNok * 100))
      || Math.abs(job.grossMonthlyNok * 100 - Math.round(job.grossMonthlyNok * 100)) > .000001)
      || new Set(jobs.map(job => job.id)).size !== jobs.length) return [];
  for (const job of jobs) {
    if (job.hourlyRateNok != null && (typeof job.hourlyRateNok !== 'number' || !Number.isFinite(job.hourlyRateNok)
        || job.hourlyRateNok <= 0 || typeof job.fullTimeWeeklyHours !== 'number' || !Number.isFinite(job.fullTimeWeeklyHours)
        || job.fullTimeWeeklyHours <= 0 || job.fullTimeWeeklyHours > 40
        || Math.round(Math.round(job.hourlyRateNok * 100) * job.fullTimeWeeklyHours * 52 / 12)
          !== Math.round(job.grossMonthlyNok * 100))) return [];
  }
  return jobs;
}
/** @param {any} config @param {{jobId?: any, careerId?: any, roleTitle?: any}} [identity] */
function resolveSalaryJob(config, identity = {}) {
  const jobs = getSalaryJobs(config);
  const matches = jobs.filter(job => (identity.jobId == null || job.id === identity.jobId)
    && (identity.careerId == null || job.careerId === identity.careerId)
    && (identity.roleTitle == null || job.roleTitle === identity.roleTitle));
  return matches.length === 1 ? matches[0] : null;
}
/** @param {any} config @param {string|null} [profileId] */
function getElectricityProfile(config, profileId = null) {
  const baseline = config?.budget?.electricity;
  const alternativeProfiles = config?.electricityProfiles;
  if (alternativeProfiles != null && !Array.isArray(alternativeProfiles))
    throw new RangeError('Invalid electricity profiles');
  const alternatives = alternativeProfiles || [];
  const candidates = profileId == null ? [baseline] : [baseline, ...alternatives]
    .filter(profile => profile?.id === profileId);
  if (candidates.length !== 1) return null;
  const profile = candidates[0];
  if (profile?.kind !== 'effective_statistical_unit_price_with_assumed_consumption') return null;
  // All room-size profiles use the same documented price per kWh; only
  // estimated consumption changes. The estimates are NOT measured usage.
  if (profileId != null && profile !== baseline &&
      (profile.source !== baseline?.source ||
        profile.unitPriceNokPerKwh !== baseline?.unitPriceNokPerKwh ||
        profile.pricePeriod !== baseline?.pricePeriod ||
        profile.includes !== baseline?.includes ||
        profile.consumptionKind !== 'illustrative_larger_home_scenario_not_meter_reading'))
    throw new RangeError('Inconsistent electricity source');
  if (typeof profile.id !== 'string' || !profile.id.trim() || typeof profile.source !== 'string' || !profile.source.trim()
      || !Number.isFinite(profile.monthlyConsumptionKwh) || profile.monthlyConsumptionKwh <= 0
      || !Number.isFinite(profile.unitPriceNokPerKwh) || profile.unitPriceNokPerKwh <= 0)
    throw new RangeError('Invalid electricity profile');
  const cents = Math.round(profile.monthlyConsumptionKwh * profile.unitPriceNokPerKwh * 100);
  if (!Number.isSafeInteger(cents) || cents < 0 || profile.monthlyNok !== cents / 100
      || !Number.isSafeInteger(profile.monthlyConsumptionKwh * 1000))
    throw new RangeError('Inconsistent electricity estimate');
  return { ...profile, monthlyCents: cents, monthlyConsumptionMilliKwh: profile.monthlyConsumptionKwh * 1000 };
}
// Read-only, location-specific reference scenario. This is not a rent contract,
// a household fact, a grocery bill or a wallet transaction. No extrapolation.
 /** @param {any} config @param {{areaId?: string, rooms?: number, householdId?: string}} [selection] */
function costOfLivingScenario(config, { areaId = 'oslo_baerum', rooms = 3,
  householdId = 'two_adults_two_children' } = {}) {
  const refs = config?.costOfLiving;
  if (refs?.version !== 1 || !Array.isArray(refs.rentSources)
      || !Array.isArray(refs.foodProfiles))
    return { ok:false, reason:'REFERENCES_UNAVAILABLE' };
  if (!Number.isSafeInteger(rooms) || rooms < 1 || rooms > 5 ||
      typeof areaId !== 'string' || typeof householdId !== 'string')
    return { ok:false, reason:'INVALID_SELECTION' };
  const areas = refs.rentSources.filter(x => x?.id === areaId);
  const foods = refs.foodProfiles.filter(x => x?.id === householdId);
  if (areas.length !== 1 || foods.length !== 1)
    return { ok:false, reason:'UNKNOWN_REFERENCE' };
  const area = areas[0], household = foods[0];
  const amount = area.pricesByRoomsNok?.[String(rooms)];
  if (amount == null) return { ok:false, reason:'ROOM_REFERENCE_UNAVAILABLE' };
  if (!Number.isSafeInteger(amount) || amount <= 0 ||
      !Number.isSafeInteger(household.monthlyNok) || household.monthlyNok <= 0 ||
      !Number.isSafeInteger(area.year) || area.year < 2000 ||
      typeof area.source !== 'string' || !area.source.startsWith('https://') ||
      typeof household.source !== 'string' || !household.source.startsWith('https://'))
    return { ok:false, reason:'INVALID_REFERENCE' };
  const total = amount + household.monthlyNok;
  if (!Number.isSafeInteger(total))
    return { ok:false, reason:'INVALID_REFERENCE' };
  return { ok:true, currency:'NOK', areaId, rooms, householdId,
    monthlyRentNok:amount, monthlyFoodNok:household.monthlyNok,
    monthlyRentAndFoodNok:total, rentPriceKind:area.priceKind,
    rentSourceYear:area.year, rentSource:area.source,
    foodReferenceYear:2026, foodSource:household.source,
    includesElectricity:false, includesTransport:false,
    includesOtherLiving:false, includesRestaurants:false,
    isActualPayment:false, isHousingOffer:false };
}

/** @param {any} config */
function preview(config, { employed = false, employmentPercent = 100, approvedSupportNok = 0, jobId = config?.job?.id } = {}) {
  if (!Number.isFinite(employmentPercent) || employmentPercent < 0 || employmentPercent > 100
      || !Number.isFinite(approvedSupportNok) || approvedSupportNok < 0) throw new RangeError('Invalid scenario');
  getElectricityProfile(config);
  const job = resolveSalaryJob(config, { jobId });
  if (!job) throw new RangeError('Salary profile is missing or ambiguous');
  const monthlyGrossCents = employed ? Math.round(Math.round(job.grossMonthlyNok * 100) * employmentPercent / 100) : 0;
  const annualGross = monthlyGrossCents * 12 / 100;
  const t = config.tax;
  const deduction = Math.min(annualGross * t.minimumDeductionRate, t.minimumDeductionCap);
  const ordinaryTax = Math.max(0, annualGross - deduction - t.personalAllowance) * t.ordinaryRate;
  const insurance = Math.min(annualGross * t.nationalInsuranceRate,
    Math.max(0, annualGross - t.nationalInsuranceThreshold) * t.nationalInsuranceRamp);
  const bracketTax = /** @type {number[][]} */ (t.brackets).reduce((sum, [threshold, rate], i, all) =>
    sum + Math.max(0, Math.min(annualGross, all[i + 1]?.[0] ?? Infinity) - threshold) * rate, 0);
  const annualTax = ordinaryTax + insurance + bracketTax;
  const monthlyTaxCents = Math.round(annualTax * 100 / 12);
  const monthlyNet = (monthlyGrossCents - monthlyTaxCents) / 100;
  const monthlyExpenses = Object.values(/** @type {Record<string, {monthlyNok: number}>} */ (config.budget)).reduce((sum, item) => sum + item.monthlyNok, 0);
  return { annualGross, annualTax, monthlyGross: monthlyGrossCents / 100, monthlyTax: monthlyTaxCents / 100,
    monthlyNet, approvedSupportNok, monthlyExpenses,
    monthlyRemainder: monthlyNet + approvedSupportNok - monthlyExpenses,
    weeklyAccrualNet: (annualGross - annualTax) / 52,
    note: 'Annualised illustrative estimate, not a tax card; no holiday-pay, interest or personal deductions.' };
}
// Projection only: each row is an independent monthly scenario, not a payment.
// Taxes are annualised per scenario; this is not a cumulative tax assessment.
/** @param {any} config @param {Array<{employed?: boolean, employmentPercent?: number, approvedSupportNok?: number}>} scenarios */
function projectMonths(config, scenarios, openingBalanceNok = 0) {
  if (!Array.isArray(scenarios) || !Number.isFinite(openingBalanceNok)) throw new RangeError('Invalid projection');
  const cents = (/** @type {number} */ value) => {
    const amount = Math.round(value * 100);
    if (!Number.isSafeInteger(amount)) throw new RangeError('Amount outside supported range');
    return amount;
  };
  let balance = cents(openingBalanceNok);
  return scenarios.map((scenario, index) => {
    const view = preview(config, scenario);
    const net = cents(view.monthlyNet);
    const support = cents(view.approvedSupportNok);
    const expenses = cents(view.monthlyExpenses);
    const opening = balance;
    balance += net + support - expenses;
    if (!Number.isSafeInteger(balance)) throw new RangeError('Balance outside supported range');
    return { month: index + 1, openingBalanceNok: opening / 100,
      netSalaryNok: net / 100, approvedSupportNok: support / 100,
      expensesNok: expenses / 100, closingBalanceNok: balance / 100,
      uncoveredNeedNok: Math.max(0, -balance) / 100 };
  });
}
// Read-only cash flow: use payment dates, never earning periods or budget proxies.
// All amounts remain integer cents until display; invalid history has no partial total.
/** @param {any} wallet @param {string} monthId @param {(dayIndex: number) => string|null} gameDateForDayIndex */
function monthlyCashFlow(wallet, monthId, gameDateForDayIndex) {
  const nok = wallet?.nok_v1;
  if (nok?.active !== true || nok.version !== 1) return { ok: false, reason: 'NOK_NOT_ACTIVE' };
  const validDate = (/** @type {any} */ value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00.000Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if (typeof monthId !== 'string' || !/^\d{4}-\d{2}$/.test(monthId) || !validDate(monthId + '-01'))
    return { ok: false, reason: 'INVALID_MONTH' };
  try {
    if (nok.shopping != null && (typeof nok.shopping !== 'object' || Array.isArray(nok.shopping)))
      throw new Error('Invalid shopping history');
    const list = (/** @type {any} */ value, /** @type {string} */ key) => {
      const rows = value ?? [];
      if (!Array.isArray(rows) || rows.some(r => !r || typeof r[key] !== 'string' || !r[key].trim())
          || new Set(rows.map(r => r[key])).size !== rows.length) throw new Error('Invalid history');
      return rows;
    };
    const cents = (/** @type {any} */ amount) => {
      const result = Math.round(amount * 100);
      if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0
          || !Number.isSafeInteger(result) || Math.abs(amount * 100 - result) > 0.000001)
        throw new Error('Invalid amount');
      return result;
    };
    /** @type {Array<{id: string, dateISO: string, category: string, label: string, amountCents: number}>} */
    const entries = [];
    const add = (/** @type {string} */ id, /** @type {string} */ dateISO, /** @type {string} */ category,
      /** @type {string} */ label, /** @type {number} */ amountCents) => {
      if (!validDate(dateISO) || !Number.isSafeInteger(amountCents) || amountCents < 0) throw new Error('Invalid payment');
      if (dateISO.slice(0, 7) === monthId) entries.push({ id, dateISO, category, label, amountCents });
    };
    for (const row of list(nok.payrollLedger, 'monthId')) {
      if (!validDate(row.monthId + '-01') || !Number.isSafeInteger(row.grossCents)
          || !Number.isSafeInteger(row.taxCents) || row.taxCents < 0 || row.grossCents < row.taxCents)
        throw new Error('Invalid payroll');
      add('salary:' + row.monthId, row.paidDateISO, 'salary', 'Lønn opptjent ' + row.monthId, row.grossCents - row.taxCents);
    }
    for (const row of list(nok.invoices, 'id')) {
      if (row.status === 'paid') add('invoice:' + row.id, row.paidDateISO, 'invoices',
        String(row.title || 'Regning'), cents(row.amountNok));
    }
    for (const row of list(nok.shopping?.purchases, 'requestId')) {
      add('grocery:' + row.requestId, row.gameDateISO, 'groceries', String(row.title || 'Varekjøp'), cents(row.amountNok));
    }
    for (const row of list(nok.transportPasses, 'id')) {
      if (!Number.isSafeInteger(row.startsAtGameMinute) || row.startsAtGameMinute < 1440
          || typeof gameDateForDayIndex !== 'function') throw new Error('Invalid transport date');
      const date = gameDateForDayIndex(Math.floor(row.startsAtGameMinute / 1440));
      if (!date) throw new Error('Invalid transport date');
      add('transport:' + row.id, date, 'transport', '30-dagersbillett', cents(row.amountNok));
    }
    const sum = (/** @type {string} */ category) => entries.filter(e => e.category === category)
      .reduce((total, e) => {
        const next = total + e.amountCents;
        if (!Number.isSafeInteger(next)) throw new Error('Total outside supported range');
        return next;
      }, 0);
    const incomeCents = sum('salary');
    const invoiceCents = sum('invoices');
    const groceryCents = sum('groceries');
    const transportCents = sum('transport');
    const expenseCents = invoiceCents + groceryCents + transportCents;
    const netCents = incomeCents - expenseCents;
    if (!Number.isSafeInteger(expenseCents) || !Number.isSafeInteger(netCents)) throw new Error('Total outside supported range');
    entries.sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.id.localeCompare(b.id));
    return { ok: true, monthId, incomeCents, invoiceCents, groceryCents, transportCents, expenseCents, netCents, entries };
  } catch { return { ok: false, reason: 'INVALID_PAYMENT_HISTORY' }; }
}
const api = { preview, projectMonths, getElectricityProfile, monthlyCashFlow, getSalaryJobs, resolveSalaryJob, costOfLivingScenario };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else /** @type {any} */ (root).CivicationNokBudget = api;


})(typeof window !== 'undefined' ? window : globalThis);


