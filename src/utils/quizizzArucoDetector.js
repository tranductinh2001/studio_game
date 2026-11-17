// Quizizz Paper Mode Q-Cards (ArUco 4x4) Realtime Detector & Visualizer
// Reverse-engineered from official Quizizz / Wayground Q-Cards PDF (vi.pdf)
// Supports all 60 physical cards (P 1 to P 60) with 4-direction orientation (A, B, C, D)

export const QUIZIZZ_CARDS = {
  "1": {
    "participant": 1,
    "markerId": 20,
    "bits": "1000011010001011"
  },
  "2": {
    "participant": 2,
    "markerId": 21,
    "bits": "1011000000101011"
  },
  "3": {
    "participant": 3,
    "markerId": 22,
    "bits": "1100110011010101"
  },
  "4": {
    "participant": 4,
    "markerId": 23,
    "bits": "1101110110000010"
  },
  "5": {
    "participant": 5,
    "markerId": 24,
    "bits": "1111111001000111"
  },
  "6": {
    "participant": 6,
    "markerId": 25,
    "bits": "1001010001110001"
  },
  "7": {
    "participant": 7,
    "markerId": 26,
    "bits": "1010110011100100"
  },
  "8": {
    "participant": 8,
    "markerId": 27,
    "bits": "1010010101010100"
  },
  "9": {
    "participant": 9,
    "markerId": 28,
    "bits": "0010000100100011"
  },
  "10": {
    "participant": 10,
    "markerId": 29,
    "bits": "0011010001101111"
  },
  "11": {
    "participant": 11,
    "markerId": 40,
    "bits": "0001011100011000"
  },
  "12": {
    "participant": 12,
    "markerId": 41,
    "bits": "0010101000101000"
  },
  "13": {
    "participant": 13,
    "markerId": 42,
    "bits": "0011001010001100"
  },
  "14": {
    "participant": 14,
    "markerId": 43,
    "bits": "0011100010110010"
  },
  "15": {
    "participant": 15,
    "markerId": 44,
    "bits": "0010010011101000"
  },
  "16": {
    "participant": 16,
    "markerId": 45,
    "bits": "0010111011101011"
  },
  "17": {
    "participant": 17,
    "markerId": 46,
    "bits": "0010110100111111"
  },
  "18": {
    "participant": 18,
    "markerId": 47,
    "bits": "0100101101100100"
  },
  "19": {
    "participant": 19,
    "markerId": 48,
    "bits": "0101000000101110"
  },
  "20": {
    "participant": 20,
    "markerId": 49,
    "bits": "0101000000010011"
  },
  "21": {
    "participant": 21,
    "markerId": 60,
    "bits": "0110011111011111"
  },
  "22": {
    "participant": 22,
    "markerId": 61,
    "bits": "0111111000011011"
  },
  "23": {
    "participant": 23,
    "markerId": 62,
    "bits": "1000000010100000"
  },
  "24": {
    "participant": 24,
    "markerId": 63,
    "bits": "1000001101000100"
  },
  "25": {
    "participant": 25,
    "markerId": 64,
    "bits": "1000101110100010"
  },
  "26": {
    "participant": 26,
    "markerId": 65,
    "bits": "1001001101111010"
  },
  "27": {
    "participant": 27,
    "markerId": 66,
    "bits": "1000010001101100"
  },
  "28": {
    "participant": 28,
    "markerId": 67,
    "bits": "1000010100101010"
  },
  "29": {
    "participant": 29,
    "markerId": 68,
    "bits": "1000010110011100"
  },
  "30": {
    "participant": 30,
    "markerId": 69,
    "bits": "1001110010001001"
  },
  "31": {
    "participant": 31,
    "markerId": 80,
    "bits": "1100110010011000"
  },
  "32": {
    "participant": 32,
    "markerId": 81,
    "bits": "1100011110100000"
  },
  "33": {
    "participant": 33,
    "markerId": 82,
    "bits": "1100010100110111"
  },
  "34": {
    "participant": 34,
    "markerId": 83,
    "bits": "1110100101011101"
  },
  "35": {
    "participant": 35,
    "markerId": 84,
    "bits": "1111100100100101"
  },
  "36": {
    "participant": 36,
    "markerId": 135,
    "bits": "0000010110110101"
  },
  "37": {
    "participant": 37,
    "markerId": 86,
    "bits": "1110111000101010"
  },
  "38": {
    "participant": 38,
    "markerId": 87,
    "bits": "1111011101001101"
  },
  "39": {
    "participant": 39,
    "markerId": 88,
    "bits": "0011010101110101"
  },
  "40": {
    "participant": 40,
    "markerId": 89,
    "bits": "1000101010101101"
  },
  "41": {
    "participant": 41,
    "markerId": 100,
    "bits": "0111101001101110"
  },
  "42": {
    "participant": 42,
    "markerId": 101,
    "bits": "1011010011101010"
  },
  "43": {
    "participant": 43,
    "markerId": 102,
    "bits": "1110110101001111"
  },
  "44": {
    "participant": 44,
    "markerId": 103,
    "bits": "1111110011100111"
  },
  "45": {
    "participant": 45,
    "markerId": 104,
    "bits": "1111111010100110"
  },
  "46": {
    "participant": 46,
    "markerId": 105,
    "bits": "0000000000100101"
  },
  "47": {
    "participant": 47,
    "markerId": 96,
    "bits": "0100111100110110"
  },
  "48": {
    "participant": 48,
    "markerId": 107,
    "bits": "0000101010001000"
  },
  "49": {
    "participant": 49,
    "markerId": 108,
    "bits": "0000101010000110"
  },
  "50": {
    "participant": 50,
    "markerId": 99,
    "bits": "0111000011000111"
  },
  "51": {
    "participant": 51,
    "markerId": 120,
    "bits": "0001000001111000"
  },
  "52": {
    "participant": 52,
    "markerId": 121,
    "bits": "0001000001110011"
  },
  "53": {
    "participant": 53,
    "markerId": 122,
    "bits": "0001001001110100"
  },
  "54": {
    "participant": 54,
    "markerId": 123,
    "bits": "0001001010110001"
  },
  "55": {
    "participant": 55,
    "markerId": 124,
    "bits": "0001101011111001"
  },
  "56": {
    "participant": 56,
    "markerId": 125,
    "bits": "0001001100000110"
  },
  "57": {
    "participant": 57,
    "markerId": 116,
    "bits": "0000100111111011"
  },
  "58": {
    "participant": 58,
    "markerId": 117,
    "bits": "0000101101011000"
  },
  "59": {
    "participant": 59,
    "markerId": 118,
    "bits": "0001000010000010"
  },
  "60": {
    "participant": 60,
    "markerId": 129,
    "bits": "0000110010011111"
  }
};

export const QUIZIZZ_ROTATIONS = {"1000011010001011": {"participant": 1, "rotation": 0, "answer": "A"}, "1101001010101000": {"participant": 1, "rotation": 1, "answer": "B"}, "1101000101100001": {"participant": 1, "rotation": 2, "answer": "C"}, "0001010101001011": {"participant": 1, "rotation": 3, "answer": "D"}, "1011000000101011": {"participant": 2, "rotation": 0, "answer": "A"}, "1001000011011001": {"participant": 2, "rotation": 1, "answer": "B"}, "1101010000001101": {"participant": 2, "rotation": 2, "answer": "C"}, "1001101100001001": {"participant": 2, "rotation": 3, "answer": "D"}, "1100110011010101": {"participant": 3, "rotation": 0, "answer": "A"}, "0111111100001100": {"participant": 3, "rotation": 1, "answer": "B"}, "1010101100110011": {"participant": 3, "rotation": 2, "answer": "C"}, "0011000011111110": {"participant": 3, "rotation": 3, "answer": "D"}, "1101110110000010": {"participant": 4, "rotation": 0, "answer": "A"}, "0111001110000011": {"participant": 4, "rotation": 1, "answer": "B"}, "0100000110111011": {"participant": 4, "rotation": 2, "answer": "C"}, "1100000111001110": {"participant": 4, "rotation": 3, "answer": "D"}, "1111111001000111": {"participant": 5, "rotation": 0, "answer": "A"}, "0011111110111001": {"participant": 5, "rotation": 1, "answer": "B"}, "1110001001111111": {"participant": 5, "rotation": 2, "answer": "C"}, "1001110111111100": {"participant": 5, "rotation": 3, "answer": "D"}, "1001010001110001": {"participant": 6, "rotation": 0, "answer": "A"}, "0001011001001101": {"participant": 6, "rotation": 1, "answer": "B"}, "1000111000101001": {"participant": 6, "rotation": 2, "answer": "C"}, "1011001001101000": {"participant": 6, "rotation": 3, "answer": "D"}, "1010110011100100": {"participant": 7, "rotation": 0, "answer": "A"}, "0111111001010000": {"participant": 7, "rotation": 1, "answer": "B"}, "0010011100110101": {"participant": 7, "rotation": 2, "answer": "C"}, "0000101001111110": {"participant": 7, "rotation": 3, "answer": "D"}, "1010010101010100": {"participant": 8, "rotation": 0, "answer": "A"}, "0001111000010110": {"participant": 8, "rotation": 1, "answer": "B"}, "0010101010100101": {"participant": 8, "rotation": 2, "answer": "C"}, "0110100001111000": {"participant": 8, "rotation": 3, "answer": "D"}, "0010000100100011": {"participant": 9, "rotation": 0, "answer": "A"}, "0000000011011010": {"participant": 9, "rotation": 1, "answer": "B"}, "1100010010000100": {"participant": 9, "rotation": 2, "answer": "C"}, "0101101100000000": {"participant": 9, "rotation": 3, "answer": "D"}, "0011010001101111": {"participant": 10, "rotation": 0, "answer": "A"}, "1000111011011001": {"participant": 10, "rotation": 1, "answer": "B"}, "1111011000101100": {"participant": 10, "rotation": 2, "answer": "C"}, "1001101101110001": {"participant": 10, "rotation": 3, "answer": "D"}, "0001011100011000": {"participant": 11, "rotation": 0, "answer": "A"}, "1000001000100111": {"participant": 11, "rotation": 1, "answer": "B"}, "0001100011101000": {"participant": 11, "rotation": 2, "answer": "C"}, "1110010001000001": {"participant": 11, "rotation": 3, "answer": "D"}, "0010101000101000": {"participant": 12, "rotation": 0, "answer": "A"}, "1010000001110000": {"participant": 12, "rotation": 1, "answer": "B"}, "0001010001010100": {"participant": 12, "rotation": 2, "answer": "C"}, "0000111000000101": {"participant": 12, "rotation": 3, "answer": "D"}, "0011001010001100": {"participant": 13, "rotation": 0, "answer": "A"}, "1100100000110001": {"participant": 13, "rotation": 1, "answer": "B"}, "0011000101001100": {"participant": 13, "rotation": 2, "answer": "C"}, "1000110000010011": {"participant": 13, "rotation": 3, "answer": "D"}, "0011100010110010": {"participant": 14, "rotation": 0, "answer": "A"}, "0110000011010101": {"participant": 14, "rotation": 1, "answer": "B"}, "0100110100011100": {"participant": 14, "rotation": 2, "answer": "C"}, "1010101100000110": {"participant": 14, "rotation": 3, "answer": "D"}, "0010010011101000": {"participant": 15, "rotation": 0, "answer": "A"}, "1100011001010000": {"participant": 15, "rotation": 1, "answer": "B"}, "0001011100100100": {"participant": 15, "rotation": 2, "answer": "C"}, "0000101001100011": {"participant": 15, "rotation": 3, "answer": "D"}, "0010111011101011": {"participant": 16, "rotation": 0, "answer": "A"}, "1110011011111000": {"participant": 16, "rotation": 1, "answer": "B"}, "1101011101110100": {"participant": 16, "rotation": 2, "answer": "C"}, "0001111101100111": {"participant": 16, "rotation": 3, "answer": "D"}, "0010110100111111": {"participant": 17, "rotation": 0, "answer": "A"}, "1010101011011110": {"participant": 17, "rotation": 1, "answer": "B"}, "1111110010110100": {"participant": 17, "rotation": 2, "answer": "C"}, "0111101101010101": {"participant": 17, "rotation": 3, "answer": "D"}, "0100101101100100": {"participant": 18, "rotation": 0, "answer": "A"}, "0010110101100010": {"participant": 18, "rotation": 1, "answer": "B"}, "0010011011010010": {"participant": 18, "rotation": 2, "answer": "C"}, "0100011010110100": {"participant": 18, "rotation": 3, "answer": "D"}, "0101000000101110": {"participant": 19, "rotation": 0, "answer": "A"}, "1000100111000001": {"participant": 19, "rotation": 1, "answer": "B"}, "0111010000001010": {"participant": 19, "rotation": 2, "answer": "C"}, "1000001110010001": {"participant": 19, "rotation": 3, "answer": "D"}, "0101000000010011": {"participant": 20, "rotation": 0, "answer": "A"}, "0000000110001101": {"participant": 20, "rotation": 1, "answer": "B"}, "1100100000001010": {"participant": 20, "rotation": 2, "answer": "C"}, "1011000110000000": {"participant": 20, "rotation": 3, "answer": "D"}, "0110011111011111": {"participant": 21, "rotation": 0, "answer": "A"}, "1100111110111110": {"participant": 21, "rotation": 1, "answer": "B"}, "1111101111100110": {"participant": 21, "rotation": 2, "answer": "C"}, "0111110111110011": {"participant": 21, "rotation": 3, "answer": "D"}, "0111111000011011": {"participant": 22, "rotation": 0, "answer": "A"}, "1010001110111101": {"participant": 22, "rotation": 1, "answer": "B"}, "1101100001111110": {"participant": 22, "rotation": 2, "answer": "C"}, "1011110111000101": {"participant": 22, "rotation": 3, "answer": "D"}, "1000000010100000": {"participant": 23, "rotation": 0, "answer": "A"}, "0101000001000000": {"participant": 23, "rotation": 1, "answer": "B"}, "0000010100000001": {"participant": 23, "rotation": 2, "answer": "C"}, "0000001000001010": {"participant": 23, "rotation": 3, "answer": "D"}, "1000001101000100": {"participant": 24, "rotation": 0, "answer": "A"}, "0001110000100010": {"participant": 24, "rotation": 1, "answer": "B"}, "0010001011000001": {"participant": 24, "rotation": 2, "answer": "C"}, "0100010000111000": {"participant": 24, "rotation": 3, "answer": "D"}, "1000101110100010": {"participant": 25, "rotation": 0, "answer": "A"}, "0111000011100010": {"participant": 25, "rotation": 1, "answer": "B"}, "0100010111010001": {"participant": 25, "rotation": 2, "answer": "C"}, "0100011100001110": {"participant": 25, "rotation": 3, "answer": "D"}, "1001001101111010": {"participant": 26, "rotation": 0, "answer": "A"}, "1001010011100111": {"participant": 26, "rotation": 1, "answer": "B"}, "0101111011001001": {"participant": 26, "rotation": 2, "answer": "C"}, "1110011100101001": {"participant": 26, "rotation": 3, "answer": "D"}, "1000010001101100": {"participant": 27, "rotation": 0, "answer": "A"}, "1001111001000000": {"participant": 27, "rotation": 1, "answer": "B"}, "0011011000100001": {"participant": 27, "rotation": 2, "answer": "C"}, "0000001001111001": {"participant": 27, "rotation": 3, "answer": "D"}, "1000010100101010": {"participant": 28, "rotation": 0, "answer": "A"}, "1001001011000010": {"participant": 28, "rotation": 1, "answer": "B"}, "0101010010100001": {"participant": 28, "rotation": 2, "answer": "C"}, "0100001101001001": {"participant": 28, "rotation": 3, "answer": "D"}, "1000010110011100": {"participant": 29, "rotation": 0, "answer": "A"}, "1101101000000110": {"participant": 29, "rotation": 1, "answer": "B"}, "0011100110100001": {"participant": 29, "rotation": 2, "answer": "C"}, "0110000001011011": {"participant": 29, "rotation": 3, "answer": "D"}, "1001110010001001": {"participant": 30, "rotation": 0, "answer": "A"}, "1111001000001001": {"participant": 30, "rotation": 1, "answer": "B"}, "1001000100111001": {"participant": 30, "rotation": 2, "answer": "C"}, "1001000001001111": {"participant": 30, "rotation": 3, "answer": "D"}, "1100110010011000": {"participant": 31, "rotation": 0, "answer": "A"}, "1111001100000100": {"participant": 31, "rotation": 1, "answer": "B"}, "0001100100110011": {"participant": 31, "rotation": 2, "answer": "C"}, "0010000011001111": {"participant": 31, "rotation": 3, "answer": "D"}, "1100011110100000": {"participant": 32, "rotation": 0, "answer": "A"}, "0101001101100010": {"participant": 32, "rotation": 1, "answer": "B"}, "0000010111100011": {"participant": 32, "rotation": 2, "answer": "C"}, "0100011011001010": {"participant": 32, "rotation": 3, "answer": "D"}, "1100010100110111": {"participant": 33, "rotation": 0, "answer": "A"}, "0001101111001110": {"participant": 33, "rotation": 1, "answer": "B"}, "1110110010100011": {"participant": 33, "rotation": 2, "answer": "C"}, "0111001111011000": {"participant": 33, "rotation": 3, "answer": "D"}, "1110100101011101": {"participant": 34, "rotation": 0, "answer": "A"}, "1011110100011110": {"participant": 34, "rotation": 1, "answer": "B"}, "1011101010010111": {"participant": 34, "rotation": 2, "answer": "C"}, "0111100010111101": {"participant": 34, "rotation": 3, "answer": "D"}, "1111100100100101": {"participant": 35, "rotation": 0, "answer": "A"}, "0011100101011011": {"participant": 35, "rotation": 1, "answer": "B"}, "1010010010011111": {"participant": 35, "rotation": 2, "answer": "C"}, "1101101010011100": {"participant": 35, "rotation": 3, "answer": "D"}, "0000010110110101": {"participant": 36, "rotation": 0, "answer": "A"}, "0100101001001110": {"participant": 36, "rotation": 1, "answer": "B"}, "1010110110100000": {"participant": 36, "rotation": 2, "answer": "C"}, "0111001001010010": {"participant": 36, "rotation": 3, "answer": "D"}, "1110111000101010": {"participant": 37, "rotation": 0, "answer": "A"}, "1011001111110000": {"participant": 37, "rotation": 1, "answer": "B"}, "0101010001110111": {"participant": 37, "rotation": 2, "answer": "C"}, "0000111111001101": {"participant": 37, "rotation": 3, "answer": "D"}, "1111011101001101": {"participant": 38, "rotation": 0, "answer": "A"}, "1001111100111011": {"participant": 38, "rotation": 1, "answer": "B"}, "1011001011101111": {"participant": 38, "rotation": 2, "answer": "C"}, "1101110011111001": {"participant": 38, "rotation": 3, "answer": "D"}, "0011010101110101": {"participant": 39, "rotation": 0, "answer": "A"}, "0000111001011111": {"participant": 39, "rotation": 1, "answer": "B"}, "1010111010101100": {"participant": 39, "rotation": 2, "answer": "C"}, "1111101001110000": {"participant": 39, "rotation": 3, "answer": "D"}, "1000101010101101": {"participant": 40, "rotation": 0, "answer": "A"}, "1111100001101000": {"participant": 40, "rotation": 1, "answer": "B"}, "1011010101010001": {"participant": 40, "rotation": 2, "answer": "C"}, "0001011000011111": {"participant": 40, "rotation": 3, "answer": "D"}, "0111101001101110": {"participant": 41, "rotation": 0, "answer": "A"}, "1010110111110001": {"participant": 41, "rotation": 1, "answer": "B"}, "0111011001011110": {"participant": 41, "rotation": 2, "answer": "C"}, "1000111110110101": {"participant": 41, "rotation": 3, "answer": "D"}, "1011010011101010": {"participant": 42, "rotation": 0, "answer": "A"}, "1101011011010001": {"participant": 42, "rotation": 1, "answer": "B"}, "0101011100101101": {"participant": 42, "rotation": 2, "answer": "C"}, "1000101101101011": {"participant": 42, "rotation": 3, "answer": "D"}, "1110110101001111": {"participant": 43, "rotation": 0, "answer": "A"}, "1011111110011010": {"participant": 43, "rotation": 1, "answer": "B"}, "1111001010110111": {"participant": 43, "rotation": 2, "answer": "C"}, "0101100111111101": {"participant": 43, "rotation": 3, "answer": "D"}, "1111110011100111": {"participant": 44, "rotation": 0, "answer": "A"}, "0111111111011001": {"participant": 44, "rotation": 1, "answer": "B"}, "1110011100111111": {"participant": 44, "rotation": 2, "answer": "C"}, "1001101111111110": {"participant": 44, "rotation": 3, "answer": "D"}, "1111111010100110": {"participant": 45, "rotation": 0, "answer": "A"}, "0111101111110001": {"participant": 45, "rotation": 1, "answer": "B"}, "0110010101111111": {"participant": 45, "rotation": 2, "answer": "C"}, "1000111111011110": {"participant": 45, "rotation": 3, "answer": "D"}, "0000000000100101": {"participant": 46, "rotation": 0, "answer": "A"}, "0000100001001000": {"participant": 46, "rotation": 1, "answer": "B"}, "1010010000000000": {"participant": 46, "rotation": 2, "answer": "C"}, "0001001000010000": {"participant": 46, "rotation": 3, "answer": "D"}, "0100111100110110": {"participant": 47, "rotation": 0, "answer": "A"}, "0010101111100110": {"participant": 47, "rotation": 1, "answer": "B"}, "0110110011110010": {"participant": 47, "rotation": 2, "answer": "C"}, "0110011111010100": {"participant": 47, "rotation": 3, "answer": "D"}, "0000101010001000": {"participant": 48, "rotation": 0, "answer": "A"}, "1110000000100000": {"participant": 48, "rotation": 1, "answer": "B"}, "0001000101010000": {"participant": 48, "rotation": 2, "answer": "C"}, "0000010000000111": {"participant": 48, "rotation": 3, "answer": "D"}, "0000101010000110": {"participant": 49, "rotation": 0, "answer": "A"}, "0110100010100000": {"participant": 49, "rotation": 1, "answer": "B"}, "0110000101010000": {"participant": 49, "rotation": 2, "answer": "C"}, "0000010100010110": {"participant": 49, "rotation": 3, "answer": "D"}, "0111000011000111": {"participant": 50, "rotation": 0, "answer": "A"}, "0100110110011001": {"participant": 50, "rotation": 1, "answer": "B"}, "1110001100001110": {"participant": 50, "rotation": 2, "answer": "C"}, "1001100110110010": {"participant": 50, "rotation": 3, "answer": "D"}, "0001000001111000": {"participant": 51, "rotation": 0, "answer": "A"}, "1000010001000101": {"participant": 51, "rotation": 1, "answer": "B"}, "0001111000001000": {"participant": 51, "rotation": 2, "answer": "C"}, "1010001000100001": {"participant": 51, "rotation": 3, "answer": "D"}, "0001000001110011": {"participant": 52, "rotation": 0, "answer": "A"}, "0000010011001101": {"participant": 52, "rotation": 1, "answer": "B"}, "1100111000001000": {"participant": 52, "rotation": 2, "answer": "C"}, "1011001100100000": {"participant": 52, "rotation": 3, "answer": "D"}, "0001001001110100": {"participant": 53, "rotation": 0, "answer": "A"}, "0000110001100101": {"participant": 53, "rotation": 1, "answer": "B"}, "0010111001001000": {"participant": 53, "rotation": 2, "answer": "C"}, "1010011000110000": {"participant": 53, "rotation": 3, "answer": "D"}, "0001001010110001": {"participant": 54, "rotation": 0, "answer": "A"}, "0100000001101101": {"participant": 54, "rotation": 1, "answer": "B"}, "1000110101001000": {"participant": 54, "rotation": 2, "answer": "C"}, "1011011000000010": {"participant": 54, "rotation": 3, "answer": "D"}, "0001101011111001": {"participant": 55, "rotation": 0, "answer": "A"}, "1110010001101101": {"participant": 55, "rotation": 1, "answer": "B"}, "1001111101011000": {"participant": 55, "rotation": 2, "answer": "C"}, "1011011000100111": {"participant": 55, "rotation": 3, "answer": "D"}, "0001001100000110": {"participant": 56, "rotation": 0, "answer": "A"}, "0000100010100011": {"participant": 56, "rotation": 1, "answer": "B"}, "0110000011001000": {"participant": 56, "rotation": 2, "answer": "C"}, "1100010100010000": {"participant": 56, "rotation": 3, "answer": "D"}, "0000100111111011": {"participant": 57, "rotation": 0, "answer": "A"}, "1110010011001110": {"participant": 57, "rotation": 1, "answer": "B"}, "1101111110010000": {"participant": 57, "rotation": 2, "answer": "C"}, "0111001100100111": {"participant": 57, "rotation": 3, "answer": "D"}, "0000101101011000": {"participant": 58, "rotation": 0, "answer": "A"}, "1010010000100110": {"participant": 58, "rotation": 1, "answer": "B"}, "0001101011010000": {"participant": 58, "rotation": 2, "answer": "C"}, "0110010000100101": {"participant": 58, "rotation": 3, "answer": "D"}, "0001000010000010": {"participant": 59, "rotation": 0, "answer": "A"}, "0100000010000001": {"participant": 59, "rotation": 1, "answer": "B"}, "0100000100001000": {"participant": 59, "rotation": 2, "answer": "C"}, "1000000100000010": {"participant": 59, "rotation": 3, "answer": "D"}, "0000110010011111": {"participant": 60, "rotation": 0, "answer": "A"}, "1110101010001100": {"participant": 60, "rotation": 1, "answer": "B"}, "1111100100110000": {"participant": 60, "rotation": 2, "answer": "C"}, "0011000101010111": {"participant": 60, "rotation": 3, "answer": "D"}};

/**
 * Returns a 6x6 binary matrix (0=black, 1=white) for a Quizizz Participant (1..60)
 */
export function getQuizizzMarkerMatrix(participant) {
  const card = QUIZIZZ_CARDS[participant] || QUIZIZZ_CARDS[String(participant)];
  if (!card) return null;
  const bits = card.bits;
  const matrix = [];
  // Row 0: all black border
  matrix.push([0, 0, 0, 0, 0, 0]);
  // Rows 1..4: black border on edges, 4 bits inside
  for (let r = 0; r < 4; r++) {
    const row = [0];
    for (let c = 0; c < 4; c++) {
      row.push(bits[r * 4 + c] === '1' ? 1 : 0);
    }
    row.push(0);
    matrix.push(row);
  }
  // Row 5: all black border
  matrix.push([0, 0, 0, 0, 0, 0]);
  return matrix;
}

/**
 * Generates an SVG string for a Quizizz Q-Card ArUco marker
 */
export function renderQuizizzMarkerSVG(participant, size = 220) {
  const mat = getQuizizzMarkerMatrix(participant);
  if (!mat) return '';
  const cellSize = size / 6;
  let svg = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="display:block;">`;
  svg += `<rect width="${size}" height="${size}" fill="black"/>`;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (mat[r][c] === 1) {
        svg += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${(cellSize + 0.5).toFixed(1)}" height="${(cellSize + 0.5).toFixed(1)}" fill="white"/>`;
      }
    }
  }
  svg += `</svg>`;
  return svg;
}

// -------------------------------------------------------------
// Fast In-Browser Computer Vision Primitives for Marker Detection
// -------------------------------------------------------------
class CVImage {
  constructor(width = 0, height = 0, data = null) {
    this.width = width;
    this.height = height;
    this.data = data || [];
  }
}

const neighborhood = [
  [1, 0], [1, -1], [0, -1], [-1, -1],
  [-1, 0], [-1, 1], [0, 1], [1, 1]
];

function neighborhoodDeltas(width) {
  const deltas = [];
  for (let i = 0; i < neighborhood.length; ++i) {
    deltas[i] = neighborhood[i][0] + (neighborhood[i][1] * width);
  }
  return deltas.concat(deltas);
}

function cvGrayscale(imageSrc, imageDst) {
  const src = imageSrc.data;
  let dst = imageDst.data;
  const len = src.length;
  if (!dst || dst.length !== (len >> 2)) {
    dst = new Uint8Array(len >> 2);
    imageDst.data = dst;
  }
  let j = 0;
  for (let i = 0; i < len; i += 4) {
    dst[j++] = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114 + 0.5) | 0;
  }
  imageDst.width = imageSrc.width;
  imageDst.height = imageSrc.height;
  return imageDst;
}

const stackBoxBlurMult = [1, 171, 205, 293, 57, 373, 79, 137, 241, 27, 391, 357, 41, 19, 283, 265];
const stackBoxBlurShift = [0, 9, 10, 11, 9, 12, 10, 11, 12, 9, 13, 13, 10, 9, 13, 13];

function stackBoxBlur(imageSrc, imageDst, kernelSize) {
  const src = imageSrc.data;
  let dst = imageDst.data;
  const height = imageSrc.height;
  const width = imageSrc.width;
  const heightMinus1 = height - 1;
  const widthMinus1 = width - 1;
  const size = kernelSize + kernelSize + 1;
  const radius = kernelSize + 1;
  const mult = stackBoxBlurMult[kernelSize];
  const shift = stackBoxBlurShift[kernelSize];

  if (!dst || dst.length !== src.length) {
    dst = new Uint8Array(src.length);
    imageDst.data = dst;
  }

  // Circular ring buffer of size nodes
  const nodes = [];
  for (let i = 0; i < size; ++i) {
    nodes.push({ color: 0, next: null });
  }
  for (let i = 0; i < size; ++i) {
    nodes[i].next = nodes[(i + 1) % size];
  }
  let stack = nodes[0];

  let pos = 0;
  for (let y = 0; y < height; ++y) {
    let sum = 0;
    const p = pos;
    const color = src[pos];
    let stackStart = stack;
    for (let i = 0; i < radius; ++i) {
      stackStart.color = color;
      sum += color * (i + 1);
      stackStart = stackStart.next;
    }
    for (let i = 1; i < radius; ++i) {
      const idx = pos + (i <= widthMinus1 ? i : widthMinus1);
      const c = src[idx];
      stackStart.color = c;
      sum += c * (radius - i);
      stackStart = stackStart.next;
    }
    let stackEnd = stack;
    for (let x = 0; x < width; ++x) {
      dst[pos++] = (sum * mult) >>> shift;
      const pNext = x + radius;
      const idx = p + (pNext < widthMinus1 ? pNext : widthMinus1);
      sum -= stackEnd.color;
      stackEnd.color = src[idx];
      sum += stackEnd.color;
      stackEnd = stackEnd.next;
    }
  }

  stack = nodes[0];
  for (let x = 0; x < width; ++x) {
    let sum = 0;
    let pos = x;
    const color = dst[pos];
    let stackStart = stack;
    for (let i = 0; i < radius; ++i) {
      stackStart.color = color;
      sum += color * (i + 1);
      stackStart = stackStart.next;
    }
    for (let i = 1; i < radius; ++i) {
      const idx = (i <= heightMinus1 ? i : heightMinus1) * width + x;
      const c = dst[idx];
      sum += c * (radius - i);
      stackStart = stackStart.next;
    }
    let stackEnd = stack;
    for (let y = 0; y < height; ++y) {
      dst[pos] = (sum * mult) >>> shift;
      pos += width;
      const pNext = y + radius;
      const idx = (pNext < heightMinus1 ? pNext : heightMinus1) * width + x;
      sum -= stackEnd.color;
      stackEnd.color = dst[idx];
      sum += stackEnd.color;
      stackEnd = stackEnd.next;
    }
  }

  imageDst.width = width;
  imageDst.height = height;
  return imageDst;
}

function cvAdaptiveThreshold(imageSrc, imageDst, kernelSize, threshold) {
  const src = imageSrc.data;
  stackBoxBlur(imageSrc, imageDst, kernelSize);
  const dst = imageDst.data;
  const len = src.length;
  for (let i = 0; i < len; ++i) {
    dst[i] = (src[i] - dst[i] <= -threshold) ? 255 : 0;
  }
  return imageDst;
}

function cvBinaryBorder(imageSrc, dst) {
  const src = imageSrc.data;
  const height = imageSrc.height;
  const width = imageSrc.width;
  let posSrc = 0;
  let posDst = 0;
  const total = (width + 2) * (height + 2);
  if (!dst || dst.length !== total) {
    dst = new Int32Array(total);
  } else {
    dst.fill(0);
  }
  for (let j = -2; j < width; ++j) {
    dst[posDst++] = 0;
  }
  for (let i = 0; i < height; ++i) {
    dst[posDst++] = 0;
    for (let j = 0; j < width; ++j) {
      dst[posDst++] = (src[posSrc++] === 0 ? 0 : 1);
    }
    dst[posDst++] = 0;
  }
  return dst;
}

function cvBorderFollowing(src, pos, nbd, point, hole, deltas) {
  const contour = [];
  contour.hole = hole;
  let s = hole ? 0 : 4;
  let s_end = s;
  do {
    s = (s - 1) & 7;
    if (src[pos + deltas[s]] !== 0) break;
  } while (s !== s_end);

  if (s === s_end) {
    src[pos] = -nbd;
    contour.push({ x: point.x, y: point.y });
  } else {
    let pos3 = pos;
    const pos1 = pos + deltas[s];
    while (true) {
      s_end = s;
      let pos4;
      do {
        pos4 = pos3 + deltas[++s];
      } while (src[pos4] === 0);
      s &= 7;
      if (((s - 1) >>> 0) < (s_end >>> 0)) {
        src[pos3] = -nbd;
      } else if (src[pos3] === 1) {
        src[pos3] = nbd;
      }
      contour.push({ x: point.x, y: point.y });
      point.x += neighborhood[s][0];
      point.y += neighborhood[s][1];
      if (pos4 === pos && pos3 === pos1) break;
      pos3 = pos4;
      s = (s + 4) & 7;
    }
  }
  return contour;
}

let _binBuf = null;
function cvFindContours(imageSrc) {
  const width = imageSrc.width;
  const height = imageSrc.height;
  const contours = [];
  _binBuf = cvBinaryBorder(imageSrc, _binBuf);
  const src = _binBuf;
  const deltas = neighborhoodDeltas(width + 2);
  let pos = width + 3;
  let nbd = 1;

  for (let i = 0; i < height; ++i, pos += 2) {
    for (let j = 0; j < width; ++j, ++pos) {
      const pix = src[pos];
      if (pix !== 0) {
        let outer = false;
        let hole = false;
        if (pix === 1 && src[pos - 1] === 0) outer = true;
        else if (pix >= 1 && src[pos + 1] === 0) hole = true;

        if (outer || hole) {
          ++nbd;
          contours.push(cvBorderFollowing(src, pos, nbd, { x: j, y: i }, hole, deltas));
        }
      }
    }
  }
  return contours;
}

function cvApproxPolyDP(contour, epsilon) {
  const len = contour.length;
  if (len < 4) return [];
  const poly = [];
  const stack = [];
  let max_dist = 0;
  let right_slice_index = 0;
  const epsSq = epsilon * epsilon;

  const start_pt = contour[0];
  for (let j = 1; j < len; ++j) {
    const pt = contour[j];
    const dx = pt.x - start_pt.x;
    const dy = pt.y - start_pt.y;
    const dist = dx * dx + dy * dy;
    if (dist > max_dist) {
      max_dist = dist;
      right_slice_index = j;
    }
  }

  if (max_dist <= epsSq) {
    poly.push({ x: start_pt.x, y: start_pt.y });
  } else {
    stack.push({ start: right_slice_index, end: len });
    stack.push({ start: 0, end: right_slice_index });
  }

  while (stack.length > 0) {
    const slice = stack.pop();
    const end_pt = contour[slice.end % len];
    const start_pt = contour[slice.start % len];
    if (slice.end <= slice.start + 1) {
      poly.push({ x: start_pt.x, y: start_pt.y });
    } else {
      let max_d = 0;
      let max_idx = slice.start;
      const dx = end_pt.x - start_pt.x;
      const dy = end_pt.y - start_pt.y;
      for (let i = slice.start + 1; i < slice.end; ++i) {
        const pt = contour[i % len];
        const dist = Math.abs((pt.y - start_pt.y) * dx - (pt.x - start_pt.x) * dy);
        if (dist > max_d) {
          max_d = dist;
          max_idx = i;
        }
      }
      if (max_d * max_d <= epsSq * (dx * dx + dy * dy)) {
        poly.push({ x: start_pt.x, y: start_pt.y });
      } else {
        stack.push({ start: max_idx, end: slice.end });
        stack.push({ start: slice.start, end: max_idx });
      }
    }
  }
  return poly;
}

function cvIsContourConvex(contour) {
  let orientation = 0;
  const len = contour.length;
  let prev_pt = contour[len - 1];
  let cur_pt = contour[0];
  let dx0 = cur_pt.x - prev_pt.x;
  let dy0 = cur_pt.y - prev_pt.y;

  for (let i = 0, j = 0; i < len; ++i) {
    if (++j === len) j = 0;
    prev_pt = cur_pt;
    cur_pt = contour[j];
    const dx = cur_pt.x - prev_pt.x;
    const dy = cur_pt.y - prev_pt.y;
    const dxdy0 = dx * dy0;
    const dydx0 = dy * dx0;
    orientation |= dydx0 > dxdy0 ? 1 : (dydx0 < dxdy0 ? 2 : 3);
    if (orientation === 3) return false;
    dx0 = dx;
    dy0 = dy;
  }
  return true;
}

function cvSquare2quad(src) {
  const sq = [];
  const px = src[0].x - src[1].x + src[2].x - src[3].x;
  const py = src[0].y - src[1].y + src[2].y - src[3].y;
  if (px === 0 && py === 0) {
    sq[0] = src[1].x - src[0].x;
    sq[1] = src[2].x - src[1].x;
    sq[2] = src[0].x;
    sq[3] = src[1].y - src[0].y;
    sq[4] = src[2].y - src[1].y;
    sq[5] = src[0].y;
    sq[6] = 0;
    sq[7] = 0;
    sq[8] = 1;
  } else {
    const dx1 = src[1].x - src[2].x;
    const dx2 = src[3].x - src[2].x;
    const dy1 = src[1].y - src[2].y;
    const dy2 = src[3].y - src[2].y;
    const den = dx1 * dy2 - dx2 * dy1;
    sq[6] = (px * dy2 - dx2 * py) / den;
    sq[7] = (dx1 * py - px * dy1) / den;
    sq[8] = 1;
    sq[0] = src[1].x - src[0].x + sq[6] * src[1].x;
    sq[1] = src[3].x - src[0].x + sq[7] * src[3].x;
    sq[2] = src[0].x;
    sq[3] = src[1].y - src[0].y + sq[6] * src[1].y;
    sq[4] = src[3].y - src[0].y + sq[7] * src[3].y;
    sq[5] = src[0].y;
  }
  return sq;
}

function cvWarp(imageSrc, imageDst, contour, warpSize) {
  const src = imageSrc.data;
  let dst = imageDst.data;
  const width = imageSrc.width;
  const height = imageSrc.height;
  if (!dst || dst.length !== warpSize * warpSize) {
    dst = new Uint8Array(warpSize * warpSize);
    imageDst.data = dst;
  }

  const rq = cvSquare2quad(contour);
  const size = warpSize - 1;
  rq[0] /= size; rq[1] /= size;
  rq[3] /= size; rq[4] /= size;
  rq[6] /= size; rq[7] /= size;

  let r = rq[8];
  let s = rq[2];
  let t = rq[5];
  let pos = 0;

  for (let i = 0; i < warpSize; ++i) {
    r += rq[7]; s += rq[1]; t += rq[4];
    let u = r; let v = s; let w = t;
    for (let j = 0; j < warpSize; ++j) {
      u += rq[6]; v += rq[0]; w += rq[3];
      const x = v / u;
      const y = w / u;
      const sx1 = x >>> 0;
      const sx2 = sx1 === width - 1 ? sx1 : sx1 + 1;
      const dx1 = x - sx1;
      const dx2 = 1.0 - dx1;
      const sy1 = y >>> 0;
      const sy2 = sy1 === height - 1 ? sy1 : sy1 + 1;
      const dy1 = y - sy1;
      const dy2 = 1.0 - dy1;
      const p1 = sy1 * width;
      const p2 = sy2 * width;
      dst[pos++] = (dy2 * (dx2 * src[p1 + sx1] + dx1 * src[p1 + sx2]) +
                    dy1 * (dx2 * src[p2 + sx1] + dx1 * src[p2 + sx2])) | 0;
    }
  }
  imageDst.width = warpSize;
  imageDst.height = warpSize;
  return imageDst;
}

function cvOtsu(imageSrc) {
  const src = imageSrc.data;
  const len = src.length;
  const hist = new Int32Array(256);
  for (let i = 0; i < len; ++i) hist[src[i]]++;
  let sum = 0;
  for (let i = 0; i < 256; ++i) sum += hist[i] * i;
  let sumB = 0;
  let wB = 0;
  let max = 0;
  let threshold = 0;
  for (let i = 0; i < 256; ++i) {
    wB += hist[i];
    if (wB !== 0) {
      const wF = len - wB;
      if (wF === 0) break;
      sumB += hist[i] * i;
      const mu = (sumB / wB) - ((sum - sumB) / wF);
      const between = wB * wF * mu * mu;
      if (between > max) {
        max = between;
        threshold = i;
      }
    }
  }
  return threshold;
}

function cvThreshold(imageSrc, imageDst, threshold) {
  const src = imageSrc.data;
  let dst = imageDst.data;
  const len = src.length;
  if (!dst || dst.length !== len) {
    dst = new Uint8Array(len);
    imageDst.data = dst;
  }
  for (let i = 0; i < len; ++i) {
    dst[i] = src[i] <= threshold ? 0 : 255;
  }
  imageDst.width = imageSrc.width;
  imageDst.height = imageSrc.height;
  return imageDst;
}

function cvCountNonZero(imageSrc, square) {
  const src = imageSrc.data;
  const height = square.height;
  const width = square.width;
  let pos = square.x + (square.y * imageSrc.width);
  const span = imageSrc.width - width;
  let nz = 0;
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      if (src[pos++] !== 0) ++nz;
    }
    pos += span;
  }
  return nz;
}

// Reusable image buffers
const greyBuf = new CVImage();
const thresBuf = new CVImage();
const homographyBuf = new CVImage();

/**
 * Main Detection Function: Detects any Quizizz Q-Cards in the given ImageData
 * @param {ImageData} imageData From canvas.getImageData
 * @returns {Array} Array of detected Quizizz card objects
 */
export function detectQuizizzCards(imageData) {
  if (!imageData || !imageData.data || imageData.width < 100 || imageData.height < 100) {
    return [];
  }

  // 1. Grayscale
  cvGrayscale(imageData, greyBuf);

  // 2. Adaptive threshold
  cvAdaptiveThreshold(greyBuf, thresBuf, 2, 7);

  // 3. Find contours
  const contours = cvFindContours(thresBuf);
  const minSize = Math.max(30, imageData.width * 0.08);
  const detected = [];
  const seenParticipants = new Set();

  for (let i = 0; i < contours.length; ++i) {
    const contour = contours[i];
    if (contour.length >= minSize) {
      const poly = cvApproxPolyDP(contour, contour.length * 0.05);
      if (poly.length === 4 && cvIsContourConvex(poly)) {
        // Enforce clockwise ordering
        const dx1 = poly[1].x - poly[0].x;
        const dy1 = poly[1].y - poly[0].y;
        const dx2 = poly[2].x - poly[0].x;
        const dy2 = poly[2].y - poly[0].y;
        if ((dx1 * dy2 - dy1 * dx2) < 0) {
          const swap = poly[1];
          poly[1] = poly[3];
          poly[3] = swap;
        }

        // Warp to 48x48 homography
        cvWarp(greyBuf, homographyBuf, poly, 48);
        const otsuThresh = cvOtsu(homographyBuf);
        cvThreshold(homographyBuf, homographyBuf, otsuThresh);

        // Check 6x6 border (all 20 border cells must be mostly black)
        const cellW = 8;
        const minZero = 32; // half of 8x8=64
        let borderOk = true;
        for (let r = 0; r < 6; r++) {
          const inc = (r === 0 || r === 5) ? 1 : 5;
          for (let c = 0; c < 6; c += inc) {
            if (cvCountNonZero(homographyBuf, { x: c * cellW, y: r * cellW, width: cellW, height: cellW }) > minZero) {
              borderOk = false;
              break;
            }
          }
          if (!borderOk) break;
        }
        if (!borderOk) continue;

        // Extract inner 4x4 bits
        let extractedBits = '';
        for (let r = 1; r <= 4; r++) {
          for (let c = 1; c <= 4; c++) {
            const nz = cvCountNonZero(homographyBuf, { x: c * cellW, y: r * cellW, width: cellW, height: cellW });
            extractedBits += nz > minZero ? '1' : '0';
          }
        }

        // Check if extracted bits match any of our 240 rotation patterns
        const match = QUIZIZZ_ROTATIONS[extractedBits];
        if (match && !seenParticipants.has(match.participant)) {
          seenParticipants.add(match.participant);
          const p = match.participant;
          const pStr = p < 10 ? `000${p}` : (p < 100 ? `00${p}` : `0${p}`);

          // Compute angle of top edge
          const topDx = poly[1].x - poly[0].x;
          const topDy = poly[1].y - poly[0].y;
          let visualAngle = Math.round((Math.atan2(topDy, topDx) * 180) / Math.PI);
          if (visualAngle < 0) visualAngle += 360;

          detected.push({
            participant: p,
            cardId: `CARD_${pStr}`,
            quizizzCode: `P ${p}`,
            answer: match.answer,
            rotation: match.rotation,
            visualAngle,
            corners: poly // [{x,y}, {x,y}, {x,y}, {x,y}]
          });
        }
      }
    }
  }

  return detected;
}
