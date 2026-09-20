function formatPhoneNumber(phone) {
  if (phone === null || phone === undefined || phone === '') return '';
  let s = String(phone).trim();
  if (s.startsWith("'")) s = s.substring(1).trim();
  const cleanDigits = s.replace(/\D/g, '');
  // Nếu là số điện thoại VN 9 chữ số (bị mất số 0 đầu: 903123456, 912345678, ...)
  if (/^[1-9]\d{8}$/.test(cleanDigits)) {
    return '0' + cleanDigits;
  }
  // Nếu là số 10 chữ số đã có số 0
  if (/^0\d{9}$/.test(cleanDigits)) {
    return cleanDigits;
  }
  // Nếu có định dạng chấm/gạch và bắt đầu bằng số khác 0 (ví dụ: 28.38386666)
  if (!s.startsWith('0') && /^[1-9]/.test(s)) {
    return '0' + s;
  }
  return s;
}

console.log('Case 1 (903123456):', formatPhoneNumber('903123456'));
console.log('Case 2 (903123456 number):', formatPhoneNumber(903123456));
console.log('Case 3 (0903123456):', formatPhoneNumber('0903123456'));
console.log("Case 4 ('0903123456):", formatPhoneNumber("'0903123456"));
console.log('Case 5 (028.38386666):', formatPhoneNumber('028.38386666'));
console.log('Case 6 (28.38386666):', formatPhoneNumber('28.38386666'));
