'use strict';
// Offline design preview only. Never reads/writes player state or pays money.
function preview(config, { employed = false, employmentPercent = 100, approvedSupportNok = 0 } = {}) {
  if (!Number.isFinite(employmentPercent) || employmentPercent < 0 || employmentPercent > 100
      || !Number.isFinite(approvedSupportNok) || approvedSupportNok < 0) throw new RangeError('Invalid scenario');
  const annualGross = employed ? config.job.grossMonthlyNok * 12 * employmentPercent / 100 : 0;
  const t = config.tax;
  const deduction = Math.min(annualGross * t.minimumDeductionRate, t.minimumDeductionCap);
  const ordinaryTax = Math.max(0, annualGross - deduction - t.personalAllowance) * t.ordinaryRate;
  const insurance = Math.min(annualGross * t.nationalInsuranceRate,
    Math.max(0, annualGross - t.nationalInsuranceThreshold) * t.nationalInsuranceRamp);
  const bracketTax = t.brackets.reduce((sum, [threshold, rate], i, all) =>
    sum + Math.max(0, Math.min(annualGross, all[i + 1]?.[0] ?? Infinity) - threshold) * rate, 0);
  const annualTax = ordinaryTax + insurance + bracketTax;
  const monthlyNet = (annualGross - annualTax) / 12;
  const monthlyExpenses = Object.values(config.budget).reduce((sum, item) => sum + item.monthlyNok, 0);
  return { annualGross, annualTax, monthlyGross: annualGross / 12, monthlyTax: annualTax / 12,
    monthlyNet, approvedSupportNok, monthlyExpenses,
    monthlyRemainder: monthlyNet + approvedSupportNok - monthlyExpenses,
    weeklyAccrualNet: (annualGross - annualTax) / 52,
    note: 'Annualised illustrative estimate, not a tax card; no holiday-pay, interest or personal deductions.' };
}
module.exports = { preview };
