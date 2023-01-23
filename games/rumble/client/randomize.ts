export const getRandomColor = () => `#${Math.random().toString(16).substring(2, 8)}`;
export const getRandomName = () => generateRandomName(letterFrequencies, 4, 8);

const getWeightedRandom = (list: number[]) => {
  const total = list.reduce((acc, l) => acc + l, 0);
  const random = Math.random() * total;
  let current = 0;
  let sum = list[0];
  while (random > sum) {
    sum += list[current + 1];
    current++;
  }
  return current;
};

const adjustEndPossibility = (list: number[], adjust: number) => [
  ...list.slice(0, -1).map((l) => l * (1 - adjust) ** 2),
  list.slice(-1)[0] * (adjust ? 1 : 0),
];

const generateRandomName = (
  frequencies: number[][],
  minLength: number,
  maxLength: number
) => {
  let done = false;
  let currentLetter = 0;
  const letters: number[] = [];
  while (!done) {
    const adjust =
      letters.length < minLength
        ? 0
        : (letters.length - minLength) / (maxLength - minLength);
    const adjustedLetters = adjustEndPossibility(
      frequencies[currentLetter],
      adjust
    );
    const letter = getWeightedRandom(adjustedLetters);
    if (letter === 26) {
      done = true;
      continue;
    }
    letters.push(letter);
    currentLetter = letter + 1;
  }
  const name = letters.map((l) => "abcdefghijklmnopqrstuvwxyz"[l]).join("");
  return name[0].toUpperCase() + name.slice(1);
};

const letterFrequencies = [
  [
    1532, 666, 1447, 1289, 590, 265, 408, 322, 204, 1515, 1372, 1283, 1357, 616,
    157, 280, 85, 947, 1765, 1341, 33, 254, 170, 19, 183, 139, 1,
  ],
  [
    69, 206, 315, 390, 236, 63, 97, 433, 463, 69, 294, 1258, 816, 3176, 25, 62,
    105, 2176, 701, 595, 320, 320, 177, 23, 503, 73, 5896,
  ],
  [
    159, 40, 1, 10, 352, 0, 0, 6, 133, 2, 0, 34, 0, 4, 67, 0, 0, 423, 3, 1, 37,
    0, 0, 0, 36, 0, 30,
  ],
  [
    609, 1, 27, 0, 400, 0, 1, 848, 316, 1, 233, 100, 0, 0, 307, 0, 38, 96, 4,
    22, 39, 0, 0, 0, 62, 1, 67,
  ],
  [
    964, 0, 0, 46, 806, 3, 15, 9, 361, 4, 0, 21, 10, 28, 352, 0, 0, 395, 24, 3,
    67, 2, 25, 0, 116, 3, 358,
  ],
  [
    528, 85, 162, 216, 671, 65, 85, 49, 314, 32, 173, 1854, 287, 1405, 158, 68,
    43, 1414, 786, 593, 46, 200, 47, 47, 414, 72, 2622,
  ],
  [
    135, 0, 0, 0, 85, 84, 1, 0, 51, 0, 1, 20, 0, 1, 47, 0, 0, 104, 2, 11, 8, 0,
    0, 0, 0, 0, 35,
  ],
  [
    180, 0, 0, 13, 266, 0, 20, 74, 133, 0, 0, 34, 2, 22, 48, 0, 0, 70, 4, 8, 74,
    1, 10, 0, 6, 0, 114,
  ],
  [
    2153, 2, 3, 3, 784, 1, 1, 1, 437, 1, 1, 65, 28, 92, 230, 1, 0, 160, 10, 16,
    124, 1, 4, 0, 60, 2, 522,
  ],
  [
    1381, 50, 701, 195, 968, 91, 125, 12, 7, 33, 291, 625, 231, 1436, 309, 39,
    66, 297, 1214, 495, 59, 88, 7, 15, 57, 82, 697,
  ],
  [
    702, 1, 2, 1, 402, 0, 0, 6, 65, 0, 0, 2, 2, 0, 385, 0, 0, 1, 2, 1, 152, 1,
    3, 0, 2, 0, 20,
  ],
  [
    867, 1, 4, 0, 657, 1, 0, 50, 362, 4, 23, 33, 0, 3, 146, 0, 2, 109, 12, 5,
    24, 1, 9, 0, 85, 0, 182,
  ],
  [
    1308, 57, 22, 121, 1170, 29, 5, 3, 1053, 2, 9, 942, 53, 6, 348, 20, 1, 8,
    56, 45, 103, 60, 6, 1, 491, 2, 709,
  ],
  [
    1299, 87, 14, 7, 549, 1, 0, 0, 617, 1, 1, 2, 80, 7, 272, 18, 0, 19, 13, 1,
    36, 0, 0, 0, 93, 5, 197,
  ],
  [
    1472, 4, 155, 920, 1215, 11, 197, 30, 968, 40, 21, 14, 11, 1030, 226, 11,
    10, 25, 103, 517, 38, 4, 10, 0, 196, 52, 2435,
  ],
  [
    65, 95, 61, 103, 54, 23, 18, 96, 39, 6, 19, 356, 181, 1558, 37, 57, 1, 657,
    302, 76, 110, 63, 32, 13, 89, 14, 674,
  ],
  [
    132, 1, 2, 0, 95, 2, 0, 176, 29, 1, 0, 4, 0, 1, 44, 19, 0, 69, 8, 2, 10, 0,
    0, 0, 0, 0, 21,
  ],
  [
    2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 386, 0, 1, 0, 0,
    0, 8,
  ],
  [
    1383, 29, 92, 164, 1057, 4, 80, 36, 1756, 12, 76, 316, 126, 173, 573, 7, 42,
    493, 106, 219, 101, 46, 18, 0, 364, 8, 495,
  ],
  [
    600, 6, 59, 6, 450, 1, 1, 2052, 279, 1, 20, 65, 51, 8, 195, 25, 2, 12, 352,
    667, 99, 2, 7, 0, 55, 5, 674,
  ],
  [
    1113, 1, 12, 0, 654, 0, 1, 460, 556, 4, 0, 53, 1, 48, 488, 5, 0, 374, 13,
    415, 47, 0, 22, 0, 194, 31, 220,
  ],
  [
    231, 29, 51, 83, 204, 8, 34, 8, 177, 8, 14, 157, 44, 233, 19, 12, 2, 227,
    299, 30, 2, 14, 9, 4, 15, 19, 49,
  ],
  [
    275, 0, 0, 1, 263, 0, 0, 1, 363, 0, 3, 2, 0, 1, 121, 0, 0, 11, 2, 0, 5, 1,
    0, 0, 17, 0, 17,
  ],
  [
    163, 0, 0, 1, 62, 1, 0, 10, 90, 1, 0, 4, 3, 118, 34, 0, 0, 8, 6, 3, 6, 0, 0,
    0, 30, 0, 28,
  ],
  [
    33, 0, 1, 0, 5, 2, 0, 0, 27, 0, 0, 0, 1, 0, 7, 0, 0, 0, 4, 8, 2, 0, 1, 2, 4,
    4, 23,
  ],
  [
    421, 14, 56, 51, 151, 7, 5, 5, 31, 9, 27, 268, 50, 572, 85, 1, 2, 104, 202,
    33, 36, 19, 10, 2, 5, 2, 1137,
  ],
  [
    178, 3, 2, 0, 87, 0, 1, 0, 69, 0, 2, 6, 15, 0, 26, 0, 0, 7, 0, 1, 11, 2, 0,
    0, 11, 23, 75,
  ],
];