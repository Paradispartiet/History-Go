(/** @param {any} root */ function (root) {
'use strict';
// Offline design preview only. Never reads/writes player state or pays money.
/** @param {any} config */
function preview(config, { employed = false, employmentPercent = 100, approvedSupportNok = 0 } = {}) {
  if (!Number.isFinite(employmentPercent) || employmentPercent < 0 || employmentPercent > 100
      || !Number.isFinite(approvedSupportNok) || approvedSupportNok < 0) throw new RangeError('Invalid scenario');
  const annualGross = employed ? config.job.grossMonthlyNok * 12 * employmentPercent / 100 : 0;
  const t = config.tax;
  const deduction = Math.min(annualGross * t.minimumDeductionRate, t.minimumDeductionCap);
  const ordinaryTax = Math.max(0, annualGross - deduction - t.personalAllowance) * t.ordinaryRate;
  const insurance = Math.min(annualGross * t.nationalInsuranceRate,
    Math.max(0, annualGross - t.nationalInsuranceThreshold) * t.nationalInsuranceRamp);
  const bracketTax = /** @type {number[][]} */ (t.brackets).reduce((sum, [threshold, rate], i, all) =>
    sum + Math.max(0, Math.min(annualGross, all[i + 1]?.[0] ?? Infinity) - threshold) * rate, 0);
  const annualTax = ordinaryTax + insurance + bracketTax;
  const monthlyNet = (annualGross - annualTax) / 12;
  const monthlyExpenses = Object.values(/** @type {Record<string, {monthlyNok: number}>} */ (config.budget)).reduce((sum, item) => sum + item.monthlyNok, 0);
  return { annualGross, annualTax, monthlyGross: annualGross / 12, monthlyTax: annualTax / 12,
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
const api = { preview, projectMonths };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else /** @type {any} */ (root).CivicationNokBudget = api;


})(typeof window !== 'undefined' ? window : globalThis);
