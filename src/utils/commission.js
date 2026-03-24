// src/utils/commission.js
// BULL Komisyon Hesaplama Sistemi
// Seri gün sayısına göre kademeli komisyon oranları

const COMMISSION_TIERS = [
  { minDays: 30, employerRate: 0.07, workerRate: 0.03, label: "Altın" },
  { minDays: 15, employerRate: 0.08, workerRate: 0.04, label: "Gümüş" },
  { minDays: 8, employerRate: 0.09, workerRate: 0.045, label: "Bronz" },
  { minDays: 0, employerRate: 0.1, workerRate: 0.05, label: "Başlangıç" },
];

const MIN_COMMISSION = 5; // Minimum komisyon: 5₺

/**
 * Seri gün sayısına göre komisyon kademesini döndürür
 */
export function getCommissionTier(streakDays = 0) {
  for (const tier of COMMISSION_TIERS) {
    if (streakDays >= tier.minDays) {
      return tier;
    }
  }
  return COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
}

/**
 * Tam komisyon hesaplaması yapar
 * @param {number} price - İlan fiyatı (TL)
 * @param {number} employerStreak - İşveren seri gün sayısı
 * @param {number} workerStreak - İşçi seri gün sayısı
 * @returns {object} Komisyon detayları
 */
export function calculateCommission(
  price,
  employerStreak = 0,
  workerStreak = 0,
) {
  const amount = parseFloat(price) || 0;
  if (amount <= 0) return null;

  const employerTier = getCommissionTier(employerStreak);
  const workerTier = getCommissionTier(workerStreak);

  const employerCommission = Math.max(
    amount * employerTier.employerRate,
    MIN_COMMISSION,
  );
  const workerCommission = Math.max(
    amount * workerTier.workerRate,
    MIN_COMMISSION,
  );

  return {
    // Fiyat bilgileri
    basePrice: amount,
    employerPays: amount + employerCommission,
    workerReceives: amount - workerCommission,

    // Komisyon detayları
    employerCommission: Math.round(employerCommission * 100) / 100,
    workerCommission: Math.round(workerCommission * 100) / 100,
    totalCommission:
      Math.round((employerCommission + workerCommission) * 100) / 100,

    // Oranlar
    employerRate: employerTier.employerRate,
    workerRate: workerTier.workerRate,
    employerRatePercent: (employerTier.employerRate * 100).toFixed(1),
    workerRatePercent: (workerTier.workerRate * 100).toFixed(1),

    // Kademe bilgileri
    employerTierLabel: employerTier.label,
    workerTierLabel: workerTier.label,
  };
}

/**
 * Sadece işveren tarafı için hızlı hesaplama (ilan yayınlarken)
 */
export function calculateEmployerPreview(price, streakDays = 0) {
  const amount = parseFloat(price) || 0;
  if (amount <= 0) return null;

  const tier = getCommissionTier(streakDays);
  const commission = Math.max(amount * tier.employerRate, MIN_COMMISSION);

  return {
    basePrice: amount,
    commission: Math.round(commission * 100) / 100,
    total: Math.round((amount + commission) * 100) / 100,
    ratePercent: (tier.employerRate * 100).toFixed(1),
    tierLabel: tier.label,
    streakDays,
  };
}

/**
 * Sadece işçi tarafı için hızlı hesaplama (başvururken)
 */
export function calculateWorkerPreview(price, streakDays = 0) {
  const amount = parseFloat(price) || 0;
  if (amount <= 0) return null;

  const tier = getCommissionTier(streakDays);
  const commission = Math.max(amount * tier.workerRate, MIN_COMMISSION);

  return {
    basePrice: amount,
    commission: Math.round(commission * 100) / 100,
    netPay: Math.round((amount - commission) * 100) / 100,
    ratePercent: (tier.workerRate * 100).toFixed(1),
    tierLabel: tier.label,
    streakDays,
  };
}

export { COMMISSION_TIERS, MIN_COMMISSION };
