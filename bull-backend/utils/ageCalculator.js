// utils/ageCalculator.js

const calculateAge = (birthDateStr) => {
  if (!birthDateStr) return null;

  // "25.10.2003" -> [25, 10, 2003]
  const [day, month, year] = birthDateStr.split('.').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Ay henüz gelmediyse veya ay aynı ama gün henüz gelmediyse yaşı bir eksilt
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

module.exports = calculateAge;