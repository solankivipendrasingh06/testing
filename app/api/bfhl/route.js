import { NextResponse } from 'next/server';

function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

function getMimeTypeAndSize(base64Str) {
  if (!base64Str) {
    return { valid: false, mime: "", sizeKb: 0 };
  }

  try {
    let mime = 'unknown';
    let dataPart = base64Str;
    
    // Check if it has a data URI prefix
    if (base64Str.startsWith('data:')) {
      const parts = base64Str.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) {
        mime = match[1];
      }
      dataPart = parts[1] || parts[0];
    } else {
      // Very basic magic bytes detection for raw base64
      // Convert first few chars of base64 back to hex to guess
      const buffer = Buffer.from(base64Str.substring(0, 50), 'base64');
      const hex = buffer.toString('hex').toUpperCase();
      
      if (hex.startsWith('89504E47')) mime = 'image/png';
      else if (hex.startsWith('FFD8FF')) mime = 'image/jpeg';
      else if (hex.startsWith('25504446')) mime = 'application/pdf';
      else if (hex.startsWith('D0CF11E0')) mime = 'application/msword';
      else if (hex.startsWith('504B0304')) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else mime = 'application/octet-stream';
    }

    // Size calculation
    // base64 size = (characters * 3/4) - padding
    let padding = 0;
    if (dataPart.endsWith('==')) padding = 2;
    else if (dataPart.endsWith('=')) padding = 1;
    
    const sizeInBytes = (dataPart.length * (3 / 4)) - padding;
    const sizeKb = (sizeInBytes / 1024).toFixed(2);

    // Consider valid if we got this far without crashing and size > 0
    const valid = sizeInBytes > 0;
    
    return { valid, mime, sizeKb: sizeKb.toString() };
  } catch (error) {
    return { valid: false, mime: "", sizeKb: 0 };
  }
}

export async function GET() {
  return NextResponse.json({ operation_code: 1 }, { status: 200 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, file_b64 } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ is_success: false, message: "Invalid data format" }, { status: 400 });
    }

    const numbers = [];
    const alphabets = [];
    let highestLowercase = null;
    let isPrimeFound = false;

    for (const item of data) {
      if (typeof item !== 'string') continue;

      // Check if number
      if (!isNaN(item) && item.trim() !== "") {
        numbers.push(item);
        const numVal = Number(item);
        if (isPrime(numVal)) {
          isPrimeFound = true;
        }
      } 
      // Check if alphabet (single character)
      else if (/^[A-Za-z]$/.test(item)) {
        alphabets.push(item);
        if (/^[a-z]$/.test(item)) {
          if (!highestLowercase || item > highestLowercase) {
            highestLowercase = item;
          }
        }
      }
    }

    const { valid, mime, sizeKb } = getMimeTypeAndSize(file_b64);

    const responsePayload = {
      is_success: true,
      user_id: "vipendra_singh_solanki_06082005",
      email: "vipendrsingh230194@acropolis.in",
      roll_number: "0827RL231073",
      numbers,
      alphabets,
      highest_lowercase_alphabet: highestLowercase ? [highestLowercase] : [],
      is_prime_found: isPrimeFound,
      file_valid: valid,
      file_mime_type: valid ? mime : undefined,
      file_size_kb: valid ? sizeKb : undefined
    };

    // Clean up undefined properties like the example
    if (!valid) {
      responsePayload.file_mime_type = "invalid";
      responsePayload.file_size_kb = "0";
      // Based on Example C, if file_valid is false, they omit or set them differently, wait Example C:
      // “file_valid”:false  and no mime/size are returned
      delete responsePayload.file_mime_type;
      delete responsePayload.file_size_kb;
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    return NextResponse.json({ is_success: false, message: "Server error" }, { status: 500 });
  }
}
