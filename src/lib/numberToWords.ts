// Convert number to words in English (for Taka)
const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const scales = ['', 'Thousand', 'Lakh', 'Crore'];

function convertHundreds(num: number): string {
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  
  if (num > 0) {
    result += ones[num] + ' ';
  }
  
  return result.trim();
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Taka Only';
  
  // Round to nearest whole number for Taka
  const integerPart = Math.round(num);
  
  if (integerPart === 0) return 'Zero Taka Only';
  
  let result = '';
  let remaining = integerPart;
  let scaleIndex = 0;
  
  // Handle last 3 digits (hundreds)
  const hundreds = remaining % 1000;
  remaining = Math.floor(remaining / 1000);
  
  if (hundreds > 0) {
    result = convertHundreds(hundreds);
  }
  
  scaleIndex = 1;
  
  // Handle thousands, lakhs, crores (2 digits each in Indian system)
  while (remaining > 0) {
    const chunk = remaining % 100;
    remaining = Math.floor(remaining / 100);
    
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      result = chunkWords + ' ' + scales[scaleIndex] + ' ' + result;
    }
    
    scaleIndex++;
  }
  
  return result.trim() + ' Taka Only';
}
