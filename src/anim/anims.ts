import type { AnimDef, Pose } from './engine';

// Side view figure facing right. Floor at y=120. ViewBox 200x140.
const STAND: Pose = {
  head: [103, 24], shoulder: [98, 37], hip: [98, 64],
  kneeR: [100, 89], ankleR: [100, 114], toeR: [111, 117],
  elbowR: [99, 52], wristR: [100, 66],
};

// Front view figure (both limbs visible, symmetric).
const FRONT: Pose = {
  head: [100, 26], shoulder: [100, 40], hip: [100, 72],
  kneeR: [110, 93], ankleR: [112, 114], kneeL: [90, 93], ankleL: [88, 114],
  elbowR: [112, 56], wristR: [114, 70], elbowL: [88, 56], wristL: [86, 70],
};

export const ANIMS: Record<string, AnimDef> = {
  // ---------------- squat patterns ----------------
  squat: {
    frames: [
      { ...STAND, elbowR: [106, 46], wristR: [104, 34], bar: [96, 34] },
      {
        head: [99, 44], shoulder: [93, 55], hip: [76, 85],
        kneeR: [102, 93], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [100, 64], wristR: [98, 52], bar: [92, 52],
      },
    ],
    props: [{ kind: 'plate', at: 'bar' }],
  },

  'box-squat': {
    frames: [
      { ...STAND, elbowR: [106, 46], wristR: [104, 34], bar: [96, 34] },
      {
        head: [100, 46], shoulder: [94, 57], hip: [72, 88],
        kneeR: [102, 94], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [101, 66], wristR: [99, 54], bar: [93, 54],
      },
    ],
    props: [{ kind: 'rect', x: 46, y: 94, w: 28, h: 26 }, { kind: 'plate', at: 'bar' }],
  },

  'goblet-squat': {
    frames: [
      { ...STAND, elbowR: [104, 50], wristR: [108, 44] },
      {
        head: [101, 43], shoulder: [95, 54], hip: [78, 85],
        kneeR: [103, 92], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [101, 66], wristR: [105, 60],
      },
    ],
    props: [{ kind: 'db', at: 'wristR' }],
  },

  // ---------------- hinge patterns ----------------
  deadlift: {
    frames: [
      {
        head: [104, 47], shoulder: [95, 55], hip: [73, 76],
        kneeR: [96, 93], ankleR: [98, 114], toeR: [110, 117],
        elbowR: [97, 72], wristR: [99, 89], bar: [99, 93],
      },
      { ...STAND, elbowR: [98, 56], wristR: [99, 72], bar: [99, 74] },
    ],
    props: [{ kind: 'plate', at: 'bar', r: 15 }],
  },

  rdl: {
    frames: [
      { ...STAND, elbowR: [98, 56], wristR: [99, 72], bar: [99, 74] },
      {
        head: [112, 54], shoulder: [105, 60], hip: [80, 70],
        kneeR: [94, 92], ankleR: [98, 114], toeR: [110, 117],
        elbowR: [104, 74], wristR: [102, 88], bar: [102, 90],
      },
    ],
    props: [{ kind: 'plate', at: 'bar', r: 12 }],
  },

  'single-leg-rdl': {
    frames: [
      { ...STAND, kneeL: [98, 90], ankleL: [96, 113], elbowR: [99, 54], wristR: [100, 70] },
      {
        head: [118, 57], shoulder: [111, 62], hip: [88, 68],
        kneeR: [98, 91], ankleR: [100, 114], toeR: [111, 117],
        kneeL: [68, 76], ankleL: [48, 68], toeL: [40, 66],
        elbowR: [108, 76], wristR: [106, 89],
      },
    ],
    props: [{ kind: 'db', at: 'wristR' }],
  },

  // ---------------- glute bridge / thrust ----------------
  'hip-thrust': {
    frames: [
      {
        head: [30, 76], shoulder: [42, 82], hip: [72, 102],
        kneeR: [102, 87], ankleR: [104, 114], toeR: [115, 117],
        elbowR: [56, 94], wristR: [70, 96], bar: [72, 92],
      },
      {
        head: [30, 74], shoulder: [42, 81], hip: [72, 81],
        kneeR: [101, 85], ankleR: [104, 114], toeR: [115, 117],
        elbowR: [55, 84], wristR: [69, 74], bar: [71, 71],
      },
    ],
    props: [{ kind: 'rect', x: 12, y: 87, w: 32, h: 33 }, { kind: 'plate', at: 'bar', r: 12 }],
  },

  'glute-bridge': {
    frames: [
      {
        head: [29, 111], shoulder: [44, 110], hip: [82, 112],
        kneeR: [106, 89], ankleR: [112, 114], toeR: [120, 110],
        elbowR: [58, 114], wristR: [70, 114],
      },
      {
        head: [29, 111], shoulder: [44, 110], hip: [80, 92],
        kneeR: [104, 86], ankleR: [112, 114], toeR: [120, 110],
        elbowR: [58, 114], wristR: [70, 114],
      },
    ],
  },

  'single-leg-glute-bridge': {
    frames: [
      {
        head: [29, 111], shoulder: [44, 110], hip: [82, 112],
        kneeR: [106, 89], ankleR: [112, 114],
        kneeL: [108, 102], ankleL: [130, 96],
        elbowR: [58, 114], wristR: [70, 114],
      },
      {
        head: [29, 111], shoulder: [44, 110], hip: [80, 92],
        kneeR: [104, 86], ankleR: [112, 114],
        kneeL: [102, 78], ankleL: [122, 68],
        elbowR: [58, 114], wristR: [70, 114],
      },
    ],
  },

  'pull-through': {
    frames: [
      {
        head: [119, 57], shoulder: [112, 62], hip: [86, 72],
        kneeR: [98, 93], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [98, 80], wristR: [80, 90],
      },
      { ...STAND, elbowR: [97, 56], wristR: [95, 72] },
    ],
    props: [{ kind: 'cable', from: [14, 108], to: 'wristR' }],
  },

  // ---------------- single leg / knee friendly ----------------
  'step-up': {
    frames: [
      {
        head: [96, 27], shoulder: [91, 40], hip: [90, 64],
        kneeR: [110, 76], ankleR: [118, 97], toeR: [128, 100],
        kneeL: [90, 90], ankleL: [90, 114], toeL: [100, 117],
        elbowR: [92, 55], wristR: [93, 69],
      },
      {
        head: [121, 10], shoulder: [116, 22], hip: [116, 48],
        kneeR: [118, 73], ankleR: [118, 97], toeR: [129, 100],
        kneeL: [112, 74], ankleL: [107, 96], toeL: [114, 99],
        elbowR: [117, 37], wristR: [118, 51],
      },
    ],
    props: [{ kind: 'rect', x: 106, y: 100, w: 40, h: 20 }, { kind: 'db', at: 'wristR' }],
    duration: 3000,
  },

  'split-squat': {
    frames: [
      {
        head: [97, 26], shoulder: [92, 39], hip: [92, 66],
        kneeR: [104, 88], ankleR: [110, 114], toeR: [121, 117],
        kneeL: [80, 90], ankleL: [66, 110], toeL: [57, 117],
        elbowR: [93, 54], wristR: [94, 68],
      },
      {
        head: [94, 44], shoulder: [89, 57], hip: [88, 84],
        kneeR: [107, 93], ankleR: [110, 114], toeR: [121, 117],
        kneeL: [77, 105], ankleL: [63, 115], toeL: [55, 118],
        elbowR: [90, 72], wristR: [91, 86],
      },
    ],
    props: [{ kind: 'db', at: 'wristR' }],
  },

  'rfe-split-squat': {
    frames: [
      {
        head: [97, 26], shoulder: [92, 39], hip: [92, 66],
        kneeR: [103, 88], ankleR: [111, 114], toeR: [122, 117],
        kneeL: [74, 90], ankleL: [52, 93], toeL: [43, 89],
        elbowR: [93, 54], wristR: [94, 68],
      },
      {
        head: [93, 45], shoulder: [88, 58], hip: [87, 85],
        kneeR: [106, 93], ankleR: [111, 114], toeR: [122, 117],
        kneeL: [70, 103], ankleL: [52, 93], toeL: [43, 89],
        elbowR: [89, 73], wristR: [90, 87],
      },
    ],
    props: [{ kind: 'rect', x: 26, y: 96, w: 28, h: 24 }, { kind: 'db', at: 'wristR' }],
  },

  'leg-curl': {
    frames: [
      {
        head: [72, 34], shoulder: [68, 47], hip: [72, 76],
        kneeR: [102, 79], ankleR: [128, 85], toeR: [136, 82],
        elbowR: [80, 60], wristR: [92, 71],
      },
      {
        head: [72, 34], shoulder: [68, 47], hip: [72, 76],
        kneeR: [102, 79], ankleR: [110, 107], toeR: [112, 115],
        elbowR: [80, 60], wristR: [92, 71],
      },
    ],
    props: [
      { kind: 'rect', x: 56, y: 44, w: 9, h: 40 },
      { kind: 'rect', x: 58, y: 80, w: 46, h: 9 },
      { kind: 'rect', x: 96, y: 96, w: 10, h: 24 },
      { kind: 'line', from: [102, 96], to: 'ankleR', w: 3 },
    ],
  },

  'leg-extension': {
    frames: [
      {
        head: [72, 34], shoulder: [68, 47], hip: [72, 76],
        kneeR: [102, 79], ankleR: [108, 106], toeR: [111, 114],
        elbowR: [80, 60], wristR: [92, 71],
      },
      {
        head: [72, 34], shoulder: [68, 47], hip: [72, 76],
        kneeR: [102, 79], ankleR: [130, 84], toeR: [139, 82],
        elbowR: [80, 60], wristR: [92, 71],
      },
    ],
    props: [
      { kind: 'rect', x: 56, y: 44, w: 9, h: 40 },
      { kind: 'rect', x: 58, y: 80, w: 46, h: 9 },
      { kind: 'rect', x: 96, y: 96, w: 10, h: 24 },
      { kind: 'line', from: [102, 96], to: 'ankleR', w: 3 },
    ],
  },

  'calf-raise': {
    frames: [
      { ...STAND, elbowR: [99, 54], wristR: [100, 70] },
      {
        head: [103, 17], shoulder: [98, 30], hip: [98, 57],
        kneeR: [100, 82], ankleR: [101, 106], toeR: [111, 117],
        elbowR: [99, 47], wristR: [100, 63],
      },
    ],
    props: [{ kind: 'db', at: 'wristR' }],
    duration: 2200,
  },

  // ---------------- push ----------------
  'bench-press': {
    frames: [
      {
        head: [55, 84], shoulder: [71, 86], hip: [106, 87],
        kneeR: [124, 97], ankleR: [127, 117], toeR: [136, 117],
        elbowR: [87, 98], wristR: [77, 82], bar: [77, 79],
      },
      {
        head: [55, 84], shoulder: [71, 86], hip: [106, 87],
        kneeR: [124, 97], ankleR: [127, 117], toeR: [136, 117],
        elbowR: [76, 74], wristR: [76, 60], bar: [76, 57],
      },
    ],
    props: [
      { kind: 'rect', x: 42, y: 92, w: 76, h: 8 },
      { kind: 'rect', x: 50, y: 100, w: 7, h: 20 },
      { kind: 'rect', x: 102, y: 100, w: 7, h: 20 },
      { kind: 'plate', at: 'bar', r: 11 },
    ],
  },

  'chest-press-machine': {
    frames: [
      {
        head: [74, 36], shoulder: [70, 49], hip: [74, 79],
        kneeR: [98, 84], ankleR: [100, 114], toeR: [110, 117],
        elbowR: [80, 64], wristR: [87, 52],
      },
      {
        head: [74, 36], shoulder: [70, 49], hip: [74, 79],
        kneeR: [98, 84], ankleR: [100, 114], toeR: [110, 117],
        elbowR: [93, 55], wristR: [108, 52],
      },
    ],
    props: [
      { kind: 'rect', x: 56, y: 40, w: 9, h: 46 },
      { kind: 'rect', x: 58, y: 82, w: 34, h: 8 },
      { kind: 'db', at: 'wristR' },
    ],
  },

  'chest-fly-machine': {
    frames: [
      { ...FRONT, elbowR: [126, 48], wristR: [142, 42], elbowL: [74, 48], wristL: [58, 42] },
      { ...FRONT, elbowR: [116, 46], wristR: [108, 36], elbowL: [84, 46], wristL: [92, 36] },
    ],
    props: [{ kind: 'circle', at: 'wristR', r: 5 }, { kind: 'circle', at: 'wristL', r: 5 }],
  },

  'cable-fly': {
    frames: [
      { ...FRONT, elbowR: [126, 46], wristR: [144, 38], elbowL: [74, 46], wristL: [56, 38] },
      { ...FRONT, elbowR: [118, 52], wristR: [106, 58], elbowL: [82, 52], wristL: [94, 58] },
    ],
    props: [
      { kind: 'cable', from: [182, 24], to: 'wristR' },
      { kind: 'cable', from: [18, 24], to: 'wristL' },
    ],
  },

  ohp: {
    frames: [
      {
        ...FRONT,
        elbowR: [115, 55], wristR: [113, 42], elbowL: [85, 55], wristL: [87, 42],
        barL: [87, 40], barR: [113, 40],
      },
      {
        ...FRONT,
        elbowR: [111, 27], wristR: [108, 13], elbowL: [89, 27], wristL: [92, 13],
        barL: [92, 11], barR: [108, 11],
      },
    ],
    props: [
      { kind: 'line', from: 'barL', to: 'barR', w: 4 },
      { kind: 'circle', at: 'barL', r: 4 },
      { kind: 'circle', at: 'barR', r: 4 },
    ],
  },

  'db-shoulder-press': {
    frames: [
      { ...FRONT, elbowR: [116, 54], wristR: [116, 40], elbowL: [84, 54], wristL: [84, 40] },
      { ...FRONT, elbowR: [110, 26], wristR: [107, 12], elbowL: [90, 26], wristL: [93, 12] },
    ],
    props: [{ kind: 'db', at: 'wristR' }, { kind: 'db', at: 'wristL' }],
  },

  'lateral-raise': {
    frames: [
      { ...FRONT, elbowR: [111, 57], wristR: [113, 71], elbowL: [89, 57], wristL: [87, 71] },
      { ...FRONT, elbowR: [124, 45], wristR: [142, 44], elbowL: [76, 45], wristL: [58, 44] },
    ],
    props: [{ kind: 'db', at: 'wristR' }, { kind: 'db', at: 'wristL' }],
  },

  pushdown: {
    frames: [
      { ...STAND, elbowR: [103, 52], wristR: [112, 38] },
      { ...STAND, elbowR: [103, 52], wristR: [114, 68] },
    ],
    props: [{ kind: 'cable', from: [122, 8], to: 'wristR' }],
    duration: 2200,
  },

  'oh-tricep': {
    frames: [
      {
        head: [95, 39], shoulder: [90, 52], hip: [90, 80],
        kneeR: [108, 86], ankleR: [110, 114], toeR: [120, 117],
        elbowR: [95, 36], wristR: [79, 40],
      },
      {
        head: [95, 39], shoulder: [90, 52], hip: [90, 80],
        kneeR: [108, 86], ankleR: [110, 114], toeR: [120, 117],
        elbowR: [95, 36], wristR: [97, 19],
      },
    ],
    props: [{ kind: 'rect', x: 70, y: 84, w: 36, h: 8 }, { kind: 'db', at: 'wristR' }],
  },

  // ---------------- pull ----------------
  'lat-pulldown': {
    frames: [
      {
        head: [96, 36], shoulder: [92, 50], hip: [88, 82],
        kneeR: [108, 86], ankleR: [108, 114], toeR: [118, 117],
        elbowR: [104, 31], wristR: [113, 16], barL: [105, 13], barR: [123, 18],
      },
      {
        head: [98, 38], shoulder: [93, 52], hip: [88, 82],
        kneeR: [108, 86], ankleR: [108, 114], toeR: [118, 117],
        elbowR: [99, 63], wristR: [111, 49], barL: [103, 46], barR: [121, 51],
      },
    ],
    props: [
      { kind: 'rect', x: 72, y: 86, w: 36, h: 8 },
      { kind: 'cable', from: [128, 5], to: 'wristR' },
      { kind: 'line', from: 'barL', to: 'barR', w: 3.5 },
    ],
  },

  'seated-row': {
    frames: [
      {
        head: [84, 39], shoulder: [79, 52], hip: [76, 84],
        kneeR: [104, 79], ankleR: [126, 91], toeR: [131, 84],
        elbowR: [96, 58], wristR: [114, 62],
      },
      {
        head: [82, 37], shoulder: [77, 50], hip: [76, 84],
        kneeR: [104, 79], ankleR: [126, 91], toeR: [131, 84],
        elbowR: [66, 64], wristR: [86, 64],
      },
    ],
    props: [
      { kind: 'rect', x: 60, y: 88, w: 30, h: 6 },
      { kind: 'rect', x: 130, y: 76, w: 8, h: 28 },
      { kind: 'cable', from: [166, 62], to: 'wristR' },
    ],
  },

  'one-arm-row': {
    frames: [
      {
        head: [113, 52], shoulder: [104, 57], hip: [70, 63],
        kneeL: [72, 84], ankleL: [56, 86],
        kneeR: [76, 90], ankleR: [78, 114], toeR: [88, 117],
        elbowL: [106, 70], wristL: [108, 84],
        elbowR: [100, 72], wristR: [98, 89],
      },
      {
        head: [113, 52], shoulder: [104, 57], hip: [70, 63],
        kneeL: [72, 84], ankleL: [56, 86],
        kneeR: [76, 90], ankleR: [78, 114], toeR: [88, 117],
        elbowL: [106, 70], wristL: [108, 84],
        elbowR: [94, 54], wristR: [96, 70],
      },
    ],
    props: [{ kind: 'rect', x: 48, y: 86, w: 66, h: 7 }, { kind: 'rect', x: 54, y: 93, w: 7, h: 27 }, { kind: 'rect', x: 100, y: 93, w: 7, h: 27 }, { kind: 'db', at: 'wristR' }],
  },

  'chest-supported-row': {
    frames: [
      {
        head: [110, 48], shoulder: [98, 58], hip: [72, 84],
        kneeR: [58, 100], ankleR: [46, 114], toeR: [38, 117],
        elbowR: [100, 74], wristR: [100, 88],
      },
      {
        head: [110, 48], shoulder: [98, 58], hip: [72, 84],
        kneeR: [58, 100], ankleR: [46, 114], toeR: [38, 117],
        elbowR: [90, 58], wristR: [94, 73],
      },
    ],
    props: [{ kind: 'line', from: [58, 102], to: [104, 60], w: 7 }, { kind: 'db', at: 'wristR' }],
  },

  'chin-up': {
    frames: [
      {
        head: [104, 40], shoulder: [100, 52], hip: [98, 82],
        kneeR: [95, 100], ankleR: [86, 111],
        elbowR: [102, 34], wristR: [103, 17],
      },
      {
        head: [104, 17], shoulder: [100, 29], hip: [98, 59],
        kneeR: [95, 77], ankleR: [86, 88],
        elbowR: [109, 27], wristR: [103, 17],
      },
    ],
    props: [{ kind: 'line', from: [76, 15], to: [130, 15], w: 4 }, { kind: 'rect', x: 128, y: 15, w: 5, h: 105 }],
    noFloor: true,
    duration: 3000,
  },

  'face-pull': {
    frames: [
      { ...STAND, elbowR: [116, 39], wristR: [133, 33] },
      { ...STAND, elbowR: [108, 33], wristR: [95, 30] },
    ],
    props: [{ kind: 'cable', from: [176, 26], to: 'wristR' }],
  },

  'barbell-row': {
    frames: [
      {
        head: [113, 52], shoulder: [106, 58], hip: [80, 70],
        kneeR: [94, 92], ankleR: [98, 114], toeR: [110, 117],
        elbowR: [104, 74], wristR: [103, 89], bar: [103, 91],
      },
      {
        head: [113, 52], shoulder: [106, 58], hip: [80, 70],
        kneeR: [94, 92], ankleR: [98, 114], toeR: [110, 117],
        elbowR: [92, 68], wristR: [98, 74], bar: [98, 76],
      },
    ],
    props: [{ kind: 'plate', at: 'bar', r: 11 }],
    duration: 2200,
  },

  'straight-arm-pulldown': {
    frames: [
      {
        head: [106, 27], shoulder: [100, 39], hip: [96, 65],
        kneeR: [99, 90], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [113, 31], wristR: [126, 24],
      },
      {
        head: [106, 27], shoulder: [100, 39], hip: [96, 65],
        kneeR: [99, 90], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [107, 57], wristR: [112, 72],
      },
    ],
    props: [{ kind: 'cable', from: [152, 8], to: 'wristR' }],
  },

  // ---------------- biceps ----------------
  curl: {
    frames: [
      { ...STAND, elbowR: [100, 52], wristR: [102, 68], bar: [102, 70] },
      { ...STAND, elbowR: [100, 52], wristR: [112, 43], bar: [112, 41] },
    ],
    props: [{ kind: 'plate', at: 'bar', r: 8 }],
    duration: 2200,
  },

  'db-curl': {
    frames: [
      { ...STAND, elbowR: [100, 52], wristR: [102, 68] },
      { ...STAND, elbowR: [100, 52], wristR: [112, 43] },
    ],
    props: [{ kind: 'db', at: 'wristR' }],
    duration: 2200,
  },

  'cable-curl': {
    frames: [
      { ...STAND, elbowR: [100, 52], wristR: [104, 68] },
      { ...STAND, elbowR: [100, 52], wristR: [113, 44] },
    ],
    props: [{ kind: 'cable', from: [168, 112], to: 'wristR' }],
    duration: 2200,
  },

  'machine-curl': {
    frames: [
      {
        head: [80, 36], shoulder: [76, 49], hip: [78, 79],
        kneeR: [100, 84], ankleR: [102, 114], toeR: [112, 117],
        elbowR: [96, 62], wristR: [112, 70],
      },
      {
        head: [80, 36], shoulder: [76, 49], hip: [78, 79],
        kneeR: [100, 84], ankleR: [102, 114], toeR: [112, 117],
        elbowR: [96, 62], wristR: [100, 48],
      },
    ],
    props: [
      { kind: 'rect', x: 62, y: 82, w: 34, h: 8 },
      { kind: 'line', from: [88, 70], to: [110, 76], w: 6 },
      { kind: 'db', at: 'wristR' },
    ],
    duration: 2200,
  },

  'concentration-curl': {
    frames: [
      {
        head: [93, 41], shoulder: [88, 54], hip: [86, 80],
        kneeR: [108, 85], ankleR: [110, 114], toeR: [120, 117],
        elbowR: [103, 69], wristR: [106, 85],
      },
      {
        head: [93, 41], shoulder: [88, 54], hip: [86, 80],
        kneeR: [108, 85], ankleR: [110, 114], toeR: [120, 117],
        elbowR: [103, 69], wristR: [93, 57],
      },
    ],
    props: [{ kind: 'rect', x: 68, y: 84, w: 34, h: 8 }, { kind: 'db', at: 'wristR' }],
    duration: 2200,
  },

  // ---------------- core & lower-back recovery ----------------
  'mcgill-curl-up': {
    frames: [
      {
        head: [35, 110], shoulder: [50, 110], hip: [88, 112],
        kneeR: [112, 91], ankleR: [118, 112], toeR: [124, 108],
        kneeL: [114, 110], ankleL: [140, 112], toeL: [148, 108],
        elbowR: [64, 112], wristR: [78, 109],
      },
      {
        head: [37, 101], shoulder: [52, 104], hip: [88, 112],
        kneeR: [112, 91], ankleR: [118, 112], toeR: [124, 108],
        kneeL: [114, 110], ankleL: [140, 112], toeL: [148, 108],
        elbowR: [64, 112], wristR: [78, 109],
      },
    ],
    duration: 3400,
  },

  'side-plank': {
    frames: [
      {
        head: [56, 84], shoulder: [66, 90], hip: [100, 106],
        kneeR: [122, 108], ankleR: [144, 112],
        elbowR: [62, 112], wristR: [78, 113],
      },
      {
        head: [54, 80], shoulder: [64, 87], hip: [98, 95],
        kneeR: [122, 103], ankleR: [144, 112],
        elbowR: [62, 112], wristR: [78, 113],
      },
    ],
    duration: 3200,
  },

  'bird-dog': {
    frames: [
      {
        head: [58, 66], shoulder: [72, 74], hip: [104, 74],
        elbowL: [72, 92], wristL: [72, 113],
        kneeR: [106, 113], ankleR: [122, 114],
        elbowR: [70, 90], wristR: [66, 108],
        kneeL: [104, 108], ankleL: [116, 112],
      },
      {
        head: [58, 64], shoulder: [72, 72], hip: [104, 72],
        elbowL: [72, 92], wristL: [72, 113],
        kneeR: [106, 113], ankleR: [122, 114],
        elbowR: [50, 66], wristR: [32, 62],
        kneeL: [128, 70], ankleL: [150, 68],
      },
    ],
    duration: 3400,
  },

  'dead-bug': {
    frames: [
      {
        head: [38, 111], shoulder: [53, 110], hip: [92, 112],
        kneeR: [94, 87], ankleR: [110, 89],
        kneeL: [96, 88], ankleL: [112, 90],
        elbowR: [56, 93], wristR: [56, 77],
      },
      {
        head: [38, 111], shoulder: [53, 110], hip: [92, 112],
        kneeR: [116, 97], ankleR: [136, 105],
        kneeL: [96, 88], ankleL: [112, 90],
        elbowR: [42, 96], wristR: [29, 104],
      },
    ],
    duration: 3200,
  },

  pallof: {
    frames: [
      {
        head: [93, 25], shoulder: [98, 38], hip: [98, 64],
        kneeR: [98, 89], ankleR: [98, 114], toeR: [87, 117],
        elbowR: [104, 52], wristR: [102, 48],
      },
      {
        head: [93, 25], shoulder: [98, 38], hip: [98, 64],
        kneeR: [98, 89], ankleR: [98, 114], toeR: [87, 117],
        elbowR: [88, 50], wristR: [72, 48],
      },
    ],
    props: [{ kind: 'cable', from: [180, 54], to: 'wristR' }],
    duration: 2800,
  },

  plank: {
    frames: [
      {
        head: [54, 82], shoulder: [66, 89], hip: [96, 95],
        kneeR: [118, 101], ankleR: [138, 108], toeR: [141, 115],
        elbowR: [64, 112], wristR: [80, 113],
      },
      {
        head: [54, 84], shoulder: [66, 91], hip: [96, 97],
        kneeR: [118, 103], ankleR: [138, 109], toeR: [141, 116],
        elbowR: [64, 112], wristR: [80, 113],
      },
    ],
    duration: 3600,
  },

  'cable-chop': {
    frames: [
      {
        head: [88, 47], shoulder: [82, 60], hip: [80, 90],
        kneeL: [78, 114], ankleL: [64, 116],
        kneeR: [104, 92], ankleR: [104, 114], toeR: [115, 117],
        elbowR: [100, 48], wristR: [118, 38],
      },
      {
        head: [88, 47], shoulder: [82, 60], hip: [80, 90],
        kneeL: [78, 114], ankleL: [64, 116],
        kneeR: [104, 92], ankleR: [104, 114], toeR: [115, 117],
        elbowR: [72, 66], wristR: [58, 76],
      },
    ],
    props: [{ kind: 'cable', from: [170, 16], to: 'wristR' }],
  },

  'suitcase-carry': {
    frames: [
      {
        head: [103, 24], shoulder: [98, 37], hip: [98, 64],
        kneeR: [110, 89], ankleR: [118, 112], toeR: [128, 114],
        kneeL: [88, 91], ankleL: [80, 113], toeL: [72, 116],
        elbowR: [100, 52], wristR: [102, 68],
      },
      {
        head: [103, 24], shoulder: [98, 37], hip: [98, 64],
        kneeR: [88, 91], ankleR: [80, 113], toeR: [72, 116],
        kneeL: [110, 89], ankleL: [118, 112], toeL: [128, 114],
        elbowR: [100, 52], wristR: [102, 68],
      },
    ],
    props: [{ kind: 'db', at: 'wristR' }],
    mode: 'cycle',
    duration: 1300,
  },

  // ---------------- mobility ----------------
  'cat-cow': {
    frames: [
      {
        head: [58, 82], shoulder: [72, 76], midback: [88, 60], hip: [104, 74],
        elbowL: [72, 92], wristL: [72, 113],
        kneeR: [106, 113], ankleR: [122, 114],
        elbowR: [70, 90], wristR: [66, 110],
      },
      {
        head: [56, 60], shoulder: [72, 74], midback: [88, 86], hip: [104, 72],
        elbowL: [72, 92], wristL: [72, 113],
        kneeR: [106, 113], ankleR: [122, 114],
        elbowR: [70, 90], wristR: [66, 110],
      },
    ],
    duration: 3600,
  },

  'hip-flexor-stretch': {
    frames: [
      {
        head: [85, 45], shoulder: [80, 58], hip: [78, 88],
        kneeL: [76, 114], ankleL: [60, 116],
        kneeR: [102, 92], ankleR: [106, 114], toeR: [117, 117],
        elbowR: [82, 72], wristR: [84, 85],
      },
      {
        head: [97, 43], shoulder: [92, 56], hip: [90, 88],
        kneeL: [76, 114], ankleL: [60, 116],
        kneeR: [106, 90], ankleR: [106, 114], toeR: [117, 117],
        elbowR: [94, 70], wristR: [96, 83],
      },
    ],
    duration: 3600,
  },

  '90-90': {
    frames: [
      {
        head: [92, 56], shoulder: [88, 70], hip: [90, 103],
        kneeR: [116, 106], ankleR: [132, 113],
        kneeL: [70, 106], ankleL: [58, 113],
        elbowR: [96, 84], wristR: [102, 96],
      },
      {
        head: [88, 56], shoulder: [92, 70], hip: [90, 103],
        kneeR: [112, 108], ankleR: [96, 114],
        kneeL: [66, 108], ankleL: [82, 114],
        elbowR: [96, 84], wristR: [102, 96],
      },
    ],
    duration: 4000,
  },

  'bench-tspine': {
    frames: [
      {
        head: [46, 74], shoulder: [66, 84], hip: [92, 98],
        kneeR: [94, 114], ankleR: [110, 115],
        elbowR: [48, 84], wristR: [38, 72],
      },
      {
        head: [44, 82], shoulder: [64, 92], hip: [92, 98],
        kneeR: [94, 114], ankleR: [110, 115],
        elbowR: [46, 86], wristR: [36, 74],
      },
    ],
    props: [{ kind: 'rect', x: 22, y: 88, w: 34, h: 32 }],
    duration: 3600,
  },

  'open-book': {
    frames: [
      {
        head: [52, 100], shoulder: [64, 104], hip: [96, 108],
        kneeR: [114, 96], ankleR: [122, 110],
        elbowR: [78, 98], wristR: [92, 94],
      },
      {
        head: [52, 98], shoulder: [64, 102], hip: [96, 108],
        kneeR: [114, 96], ankleR: [122, 110],
        elbowR: [56, 88], wristR: [42, 80],
      },
    ],
    duration: 3600,
  },

  'leg-raise-stretch': {
    frames: [
      {
        head: [35, 111], shoulder: [50, 110], hip: [88, 112],
        kneeR: [112, 108], ankleR: [134, 110],
        kneeL: [112, 110], ankleL: [136, 112],
        elbowR: [62, 112], wristR: [74, 112],
      },
      {
        head: [35, 111], shoulder: [50, 110], hip: [88, 112],
        kneeR: [96, 85], ankleR: [102, 62],
        kneeL: [112, 110], ankleL: [136, 112],
        elbowR: [62, 112], wristR: [74, 112],
      },
    ],
    duration: 3400,
  },

  'ankle-rock': {
    frames: [
      {
        head: [85, 45], shoulder: [80, 58], hip: [78, 88],
        kneeL: [76, 114], ankleL: [60, 116],
        kneeR: [104, 92], ankleR: [108, 114], toeR: [119, 117],
        elbowR: [90, 70], wristR: [98, 82],
      },
      {
        head: [93, 43], shoulder: [88, 56], hip: [84, 88],
        kneeL: [76, 114], ankleL: [60, 116],
        kneeR: [116, 90], ankleR: [108, 114], toeR: [119, 117],
        elbowR: [98, 68], wristR: [108, 80],
      },
    ],
    duration: 2800,
  },

  pigeon: {
    frames: [
      {
        head: [93, 55], shoulder: [88, 68], hip: [86, 100],
        kneeR: [112, 104], ankleR: [96, 110],
        kneeL: [64, 106], ankleL: [44, 110],
        elbowR: [92, 82], wristR: [96, 95],
      },
      {
        head: [110, 70], shoulder: [102, 80], hip: [86, 100],
        kneeR: [112, 104], ankleR: [96, 110],
        kneeL: [64, 106], ankleL: [44, 110],
        elbowR: [110, 94], wristR: [116, 106],
      },
    ],
    duration: 4000,
  },

  'child-pose': {
    frames: [
      {
        head: [108, 102], shoulder: [96, 104], hip: [70, 98],
        kneeR: [80, 114], ankleR: [64, 116],
        elbowR: [114, 110], wristR: [130, 112],
      },
      {
        head: [110, 104], shoulder: [98, 106], hip: [70, 99],
        kneeR: [80, 114], ankleR: [64, 116],
        elbowR: [116, 111], wristR: [132, 113],
      },
    ],
    duration: 4200,
  },

  'calf-stretch': {
    frames: [
      {
        head: [122, 38], shoulder: [114, 49], hip: [96, 72],
        kneeR: [108, 91], ankleR: [108, 114], toeR: [119, 117],
        kneeL: [82, 93], ankleL: [70, 114], toeL: [80, 117],
        elbowR: [126, 52], wristR: [137, 54],
      },
      {
        head: [126, 40], shoulder: [118, 51], hip: [100, 73],
        kneeR: [112, 91], ankleR: [108, 114], toeR: [119, 117],
        kneeL: [84, 93], ankleL: [70, 114], toeL: [80, 117],
        elbowR: [128, 54], wristR: [139, 56],
      },
    ],
    props: [{ kind: 'rect', x: 140, y: 28, w: 8, h: 92 }],
    duration: 3200,
  },

  'mudgal-swing': {
    frames: [
      { ...STAND, elbowR: [96, 60], wristR: [90, 74], club: [78, 86] },
      { ...STAND, elbowR: [104, 34], wristR: [108, 20], club: [116, 9] },
    ],
    props: [{ kind: 'line', from: 'wristR', to: 'club', w: 3 }, { kind: 'kb', at: 'club' }],
    duration: 2400,
  },

  halo: {
    frames: [
      { ...FRONT, elbowR: [116, 40], wristR: [118, 28], elbowL: [92, 44], wristL: [104, 30], club: [122, 18] },
      { ...FRONT, elbowR: [110, 34], wristR: [104, 20], elbowL: [90, 34], wristL: [96, 20], club: [100, 8] },
      { ...FRONT, elbowR: [108, 44], wristR: [96, 30], elbowL: [84, 40], wristL: [82, 28], club: [78, 18] },
      { ...FRONT, elbowR: [112, 46], wristR: [106, 38], elbowL: [88, 46], wristL: [94, 38], club: [100, 30] },
    ],
    props: [{ kind: 'line', from: 'wristR', to: 'club', w: 3 }, { kind: 'kb', at: 'club' }],
    mode: 'cycle',
    duration: 2600,
  },

  // ---------------- conditioning / cardio ----------------
  'tyre-push': {
    frames: [
      {
        head: [124, 56], shoulder: [116, 65], hip: [92, 82],
        kneeR: [104, 99], ankleR: [92, 114], toeR: [102, 117],
        kneeL: [84, 100], ankleL: [70, 114], toeL: [80, 117],
        elbowR: [126, 70], wristR: [136, 76],
      },
      {
        head: [124, 56], shoulder: [116, 65], hip: [92, 82],
        kneeL: [104, 99], ankleL: [92, 114], toeL: [102, 117],
        kneeR: [84, 100], ankleR: [70, 114], toeR: [80, 117],
        elbowR: [126, 70], wristR: [136, 76],
      },
    ],
    props: [{ kind: 'circle', at: [154, 98], r: 21 }, { kind: 'circle', at: [154, 98], r: 9 }],
    mode: 'cycle',
    duration: 1100,
  },

  'tyre-flip': {
    frames: [
      {
        head: [104, 60], shoulder: [96, 68], hip: [74, 84],
        kneeR: [94, 99], ankleR: [92, 114], toeR: [103, 117],
        elbowR: [104, 82], wristR: [112, 96], tyre: [132, 98],
      },
      {
        head: [104, 27], shoulder: [98, 39], hip: [92, 62],
        kneeR: [98, 89], ankleR: [96, 114], toeR: [107, 117],
        elbowR: [110, 51], wristR: [120, 62], tyre: [142, 76],
      },
    ],
    props: [{ kind: 'circle', at: 'tyre', r: 21 }, { kind: 'circle', at: 'tyre', r: 9 }],
    duration: 3200,
  },

  'incline-walk': {
    frames: [
      {
        head: [104, 28], shoulder: [99, 40], hip: [97, 66],
        kneeR: [108, 88], ankleR: [114, 108], toeR: [124, 110],
        kneeL: [88, 90], ankleL: [82, 110], toeL: [74, 113],
        elbowR: [92, 54], wristR: [88, 66],
      },
      {
        head: [104, 28], shoulder: [99, 40], hip: [97, 66],
        kneeR: [88, 90], ankleR: [82, 110], toeR: [74, 113],
        kneeL: [108, 88], ankleL: [114, 108], toeL: [124, 110],
        elbowR: [106, 54], wristR: [112, 64],
      },
    ],
    props: [
      { kind: 'line', from: [52, 116], to: [148, 100], w: 5 },
      { kind: 'rect', x: 44, y: 116, w: 12, h: 4 },
    ],
    mode: 'cycle',
    duration: 1200,
    noFloor: true,
  },

  'spin-bike': {
    frames: [
      {
        head: [110, 44], shoulder: [102, 54], hip: [80, 72],
        kneeR: [100, 84], ankleR: [108, 100],
        elbowR: [114, 62], wristR: [124, 66],
      },
      {
        head: [110, 44], shoulder: [102, 54], hip: [80, 72],
        kneeR: [96, 88], ankleR: [100, 108],
        elbowR: [114, 62], wristR: [124, 66],
      },
      {
        head: [110, 44], shoulder: [102, 54], hip: [80, 72],
        kneeR: [92, 84], ankleR: [92, 100],
        elbowR: [114, 62], wristR: [124, 66],
      },
      {
        head: [110, 44], shoulder: [102, 54], hip: [80, 72],
        kneeR: [96, 78], ankleR: [100, 92],
        elbowR: [114, 62], wristR: [124, 66],
      },
    ],
    props: [
      { kind: 'rect', x: 74, y: 74, w: 14, h: 4 },
      { kind: 'rect', x: 79, y: 78, w: 5, h: 34 },
      { kind: 'rect', x: 122, y: 62, w: 5, h: 30 },
      { kind: 'circle', at: [100, 100], r: 4 },
      { kind: 'ellipse', cx: 100, cy: 111, rx: 26, ry: 8 },
    ],
    mode: 'cycle',
    duration: 1100,
  },

  // ---------------- bodyweight ----------------
  'push-up': {
    frames: [
      {
        head: [55, 77], shoulder: [66, 84], hip: [96, 92],
        kneeR: [118, 98], ankleR: [138, 104], toeR: [141, 112],
        elbowR: [66, 98], wristR: [66, 112],
      },
      {
        head: [54, 93], shoulder: [66, 100], hip: [96, 102],
        kneeR: [118, 105], ankleR: [138, 108], toeR: [141, 114],
        elbowR: [79, 107], wristR: [66, 112],
      },
    ],
    duration: 2400,
  },

  'wall-push-up': {
    frames: [
      {
        head: [109, 30], shoulder: [104, 42], hip: [96, 72],
        kneeR: [92, 92], ankleR: [88, 114], toeR: [99, 117],
        elbowR: [126, 46], wristR: [146, 50],
      },
      {
        head: [120, 34], shoulder: [115, 46], hip: [103, 74],
        kneeR: [95, 93], ankleR: [88, 114], toeR: [99, 117],
        elbowR: [130, 54], wristR: [146, 50],
      },
    ],
    props: [{ kind: 'rect', x: 150, y: 22, w: 8, h: 98 }],
    duration: 2400,
  },

  'bw-squat': {
    frames: [
      { ...STAND, elbowR: [100, 50], wristR: [104, 62] },
      {
        head: [100, 43], shoulder: [94, 54], hip: [77, 85],
        kneeR: [103, 92], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [105, 58], wristR: [119, 56],
      },
    ],
  },

  'wall-sit': {
    frames: [
      {
        head: [80, 40], shoulder: [76, 52], hip: [75, 84],
        kneeR: [102, 84], ankleR: [102, 112], toeR: [113, 116],
        elbowR: [80, 66], wristR: [84, 80],
      },
      {
        head: [80, 41], shoulder: [76, 53], hip: [75, 85],
        kneeR: [102, 85], ankleR: [102, 112], toeR: [113, 116],
        elbowR: [80, 67], wristR: [84, 81],
      },
    ],
    props: [{ kind: 'rect', x: 62, y: 28, w: 8, h: 92 }],
    duration: 3600,
  },

  'mountain-climber': {
    frames: [
      {
        head: [56, 72], shoulder: [66, 78], hip: [98, 84],
        elbowR: [66, 95], wristR: [66, 112],
        kneeR: [84, 92], ankleR: [80, 106], toeR: [78, 112],
        kneeL: [122, 96], ankleL: [140, 108], toeL: [146, 114],
      },
      {
        head: [56, 72], shoulder: [66, 78], hip: [98, 84],
        elbowR: [66, 95], wristR: [66, 112],
        kneeR: [122, 96], ankleR: [140, 108], toeR: [146, 114],
        kneeL: [84, 92], ankleL: [80, 106], toeL: [78, 112],
      },
    ],
    mode: 'cycle',
    duration: 900,
  },

  burpee: {
    frames: [
      { ...STAND, elbowR: [99, 52], wristR: [100, 66] },
      {
        head: [92, 60], shoulder: [86, 72], hip: [80, 95],
        kneeR: [100, 100], ankleR: [98, 114], toeR: [109, 117],
        elbowR: [92, 90], wristR: [96, 111],
      },
      {
        head: [54, 82], shoulder: [66, 89], hip: [96, 95],
        kneeR: [118, 101], ankleR: [138, 108], toeR: [141, 115],
        elbowR: [66, 100], wristR: [66, 112],
      },
    ],
    duration: 3200,
  },

  superman: {
    frames: [
      {
        head: [40, 110], shoulder: [54, 111], hip: [92, 112],
        kneeR: [114, 112], ankleR: [136, 113],
        elbowR: [38, 112], wristR: [24, 112],
      },
      {
        head: [39, 99], shoulder: [54, 105], hip: [92, 111],
        kneeR: [114, 107], ankleR: [136, 102],
        elbowR: [37, 104], wristR: [23, 97],
      },
    ],
    duration: 3200,
  },

  // ---------------- yoga ----------------
  'downward-dog': {
    frames: [
      {
        head: [66, 92], shoulder: [76, 80], hip: [102, 58],
        kneeR: [112, 84], ankleR: [120, 108], toeR: [127, 114],
        elbowR: [66, 97], wristR: [56, 113],
      },
      {
        head: [66, 93], shoulder: [76, 81], hip: [102, 60],
        kneeR: [112, 85], ankleR: [120, 112], toeR: [127, 115],
        elbowR: [66, 98], wristR: [56, 113],
      },
    ],
    duration: 3600,
  },

  cobra: {
    frames: [
      {
        head: [49, 88], shoulder: [58, 98], hip: [92, 112],
        kneeR: [114, 112], ankleR: [136, 113],
        elbowR: [62, 106], wristR: [62, 113],
      },
      {
        head: [50, 72], shoulder: [58, 85], hip: [92, 112],
        kneeR: [114, 112], ankleR: [136, 113],
        elbowR: [62, 100], wristR: [62, 113],
      },
    ],
    duration: 3600,
  },

  'warrior-2': {
    frames: [
      {
        head: [101, 30], shoulder: [96, 42], hip: [96, 70],
        kneeR: [118, 88], ankleR: [124, 114], toeR: [135, 117],
        kneeL: [72, 90], ankleL: [58, 112], toeL: [50, 116],
        elbowR: [116, 42], wristR: [135, 42],
        elbowL: [76, 42], wristL: [57, 42],
      },
      {
        head: [102, 32], shoulder: [97, 44], hip: [97, 73],
        kneeR: [120, 90], ankleR: [124, 114], toeR: [135, 117],
        kneeL: [73, 91], ankleL: [58, 112], toeL: [50, 116],
        elbowR: [117, 44], wristR: [136, 44],
        elbowL: [77, 44], wristL: [58, 44],
      },
    ],
    duration: 3800,
  },

  triangle: {
    frames: [
      {
        head: [116, 76], shoulder: [110, 80], hip: [90, 66],
        kneeR: [108, 90], ankleR: [122, 113], toeR: [132, 116],
        kneeL: [72, 90], ankleL: [58, 113], toeL: [50, 116],
        elbowR: [116, 92], wristR: [120, 103],
        elbowL: [110, 64], wristL: [108, 50],
      },
      {
        head: [119, 80], shoulder: [113, 84], hip: [90, 67],
        kneeR: [108, 90], ankleR: [122, 113], toeR: [132, 116],
        kneeL: [72, 90], ankleL: [58, 113], toeL: [50, 116],
        elbowR: [119, 95], wristR: [123, 106],
        elbowL: [112, 68], wristL: [110, 53],
      },
    ],
    duration: 3800,
  },

  'tree-pose': {
    frames: [
      {
        head: [100, 24], shoulder: [100, 38], hip: [100, 72],
        kneeL: [96, 92], ankleL: [95, 114],
        kneeR: [116, 84], ankleR: [102, 79],
        elbowR: [112, 26], wristR: [104, 13],
        elbowL: [88, 26], wristL: [96, 13],
      },
      {
        head: [100, 25], shoulder: [100, 39], hip: [100, 73],
        kneeL: [96, 93], ankleL: [95, 114],
        kneeR: [115, 85], ankleR: [102, 80],
        elbowR: [112, 27], wristR: [104, 14],
        elbowL: [88, 27], wristL: [96, 14],
      },
    ],
    duration: 3800,
  },

  'chair-pose': {
    frames: [
      {
        head: [97, 38], shoulder: [91, 50], hip: [82, 79],
        kneeR: [103, 89], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [102, 39], wristR: [113, 28],
      },
      {
        head: [96, 41], shoulder: [90, 53], hip: [81, 82],
        kneeR: [103, 91], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [101, 42], wristR: [112, 31],
      },
    ],
    duration: 3600,
  },

  'forward-fold': {
    frames: [
      {
        head: [113, 74], shoulder: [107, 66], hip: [88, 66],
        kneeR: [95, 92], ankleR: [96, 114], toeR: [107, 117],
        elbowR: [108, 80], wristR: [107, 92],
      },
      {
        head: [107, 99], shoulder: [104, 89], hip: [88, 67],
        kneeR: [95, 92], ankleR: [96, 114], toeR: [107, 117],
        elbowR: [104, 98], wristR: [104, 108],
      },
    ],
    duration: 3800,
  },

  // ---------------- senior ----------------
  'sit-to-stand': {
    frames: [
      {
        head: [77, 48], shoulder: [72, 60], hip: [66, 90],
        kneeR: [98, 92], ankleR: [98, 114], toeR: [109, 117],
        elbowR: [84, 62], wristR: [96, 62],
      },
      {
        head: [103, 24], shoulder: [98, 37], hip: [98, 64],
        kneeR: [100, 89], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [102, 48], wristR: [112, 50],
      },
    ],
    props: [{ kind: 'rect', x: 42, y: 92, w: 30, h: 28 }],
    duration: 3000,
  },

  'march-in-place': {
    frames: [
      {
        head: [103, 24], shoulder: [98, 37], hip: [98, 64],
        kneeR: [110, 74], ankleR: [106, 95], toeR: [112, 99],
        kneeL: [98, 90], ankleL: [96, 113], toeL: [106, 117],
        elbowR: [92, 50], wristR: [88, 62],
        elbowL: [104, 50], wristL: [110, 60],
      },
      {
        head: [103, 24], shoulder: [98, 37], hip: [98, 64],
        kneeR: [98, 90], ankleR: [96, 113], toeR: [106, 117],
        kneeL: [110, 74], ankleL: [106, 95], toeL: [112, 99],
        elbowR: [104, 50], wristR: [110, 60],
        elbowL: [92, 50], wristL: [88, 62],
      },
    ],
    mode: 'cycle',
    duration: 1400,
  },

  'single-leg-balance': {
    frames: [
      {
        head: [103, 24], shoulder: [98, 37], hip: [98, 64],
        kneeR: [100, 89], ankleR: [100, 114], toeR: [111, 117],
        kneeL: [92, 92], ankleL: [86, 106],
        elbowR: [110, 46], wristR: [120, 54],
      },
      {
        head: [104, 25], shoulder: [99, 38], hip: [99, 64],
        kneeR: [100, 89], ankleR: [100, 114], toeR: [111, 117],
        kneeL: [91, 93], ankleL: [85, 108],
        elbowR: [111, 47], wristR: [121, 55],
      },
    ],
    duration: 3600,
  },

  'side-leg-raise': {
    frames: [
      { ...FRONT, elbowL: [84, 54], wristL: [72, 50] },
      {
        ...FRONT,
        kneeR: [120, 88], ankleR: [130, 106],
        elbowL: [84, 54], wristL: [72, 50],
      },
    ],
    props: [{ kind: 'rect', x: 58, y: 40, w: 7, h: 80 }],
    duration: 2600,
  },

  // ---------------- trek / carries ----------------
  'farmers-carry': {
    frames: [
      {
        head: [103, 24], shoulder: [98, 37], hip: [98, 64],
        kneeR: [110, 89], ankleR: [118, 112], toeR: [128, 114],
        kneeL: [88, 91], ankleL: [80, 113], toeL: [72, 116],
        elbowR: [100, 52], wristR: [102, 68],
        elbowL: [95, 52], wristL: [94, 68],
      },
      {
        head: [103, 24], shoulder: [98, 37], hip: [98, 64],
        kneeR: [88, 91], ankleR: [80, 113], toeR: [72, 116],
        kneeL: [110, 89], ankleL: [118, 112], toeL: [128, 114],
        elbowR: [100, 52], wristR: [102, 68],
        elbowL: [95, 52], wristL: [94, 68],
      },
    ],
    props: [{ kind: 'db', at: 'wristR' }, { kind: 'db', at: 'wristL' }],
    mode: 'cycle',
    duration: 1300,
  },

  'db-shrug': {
    frames: [
      { ...STAND, elbowR: [99, 53], wristR: [100, 69] },
      {
        head: [103, 19], shoulder: [98, 32], hip: [98, 64],
        kneeR: [100, 89], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [99, 49], wristR: [100, 64],
      },
    ],
    props: [{ kind: 'db', at: 'wristR' }],
    duration: 2200,
  },

  'run-gait': {
    frames: [
      {
        head: [108, 26], shoulder: [102, 38], hip: [98, 66],
        kneeR: [116, 86], ankleR: [122, 108], toeR: [132, 111],
        kneeL: [84, 90], ankleL: [72, 100], toeL: [64, 106],
        elbowR: [88, 48], wristR: [82, 60],
        elbowL: [114, 48], wristL: [124, 40],
      },
      {
        head: [108, 26], shoulder: [102, 38], hip: [98, 64],
        kneeR: [104, 88], ankleR: [100, 108], toeR: [108, 112],
        kneeL: [94, 86], ankleL: [84, 102], toeL: [78, 108],
        elbowR: [98, 50], wristR: [98, 62],
        elbowL: [106, 50], wristL: [112, 44],
      },
      {
        head: [108, 26], shoulder: [102, 38], hip: [98, 66],
        kneeR: [84, 90], ankleR: [72, 100], toeR: [64, 106],
        kneeL: [116, 86], ankleL: [122, 108], toeL: [132, 111],
        elbowR: [114, 48], wristR: [124, 40],
        elbowL: [88, 48], wristL: [82, 60],
      },
      {
        head: [108, 26], shoulder: [102, 38], hip: [98, 64],
        kneeR: [94, 86], ankleR: [84, 102], toeR: [78, 108],
        kneeL: [104, 88], ankleL: [100, 108], toeL: [108, 112],
        elbowR: [106, 50], wristR: [112, 44],
        elbowL: [98, 50], wristL: [98, 62],
      },
    ],
    mode: 'cycle',
    duration: 800,
  },

  // ---------------- landing-page hero scenes (aspirational, tongue-in-cheek) ----------------

  // Bench press with comically oversized plates.
  'hero-bench': {
    frames: [
      {
        head: [55, 84], shoulder: [71, 86], hip: [106, 87],
        kneeR: [124, 97], ankleR: [127, 117], toeR: [136, 117],
        elbowR: [87, 98], wristR: [80, 82], bar: [82, 79],
      },
      {
        head: [55, 84], shoulder: [71, 86], hip: [106, 87],
        kneeR: [124, 97], ankleR: [127, 117], toeR: [136, 117],
        elbowR: [78, 74], wristR: [80, 58], bar: [82, 55],
      },
    ],
    props: [
      { kind: 'rect', x: 42, y: 92, w: 76, h: 8 },
      { kind: 'rect', x: 50, y: 100, w: 7, h: 20 },
      { kind: 'rect', x: 102, y: 100, w: 7, h: 20 },
      { kind: 'plate', at: 'bar', r: 16 },
    ],
    duration: 1900,
    face: { view: 'up', mood: 'grr' },
  },

  // Scrambling up a mountain face toward a summit flag.
  'hero-climb': {
    frames: [
      {
        head: [80, 48], shoulder: [72, 58], hip: [56, 76],
        kneeR: [64, 72], ankleR: [54, 82], kneeL: [48, 86], ankleL: [38, 98],
        elbowR: [84, 52], wristR: [96, 44],
        elbowL: [66, 66], wristL: [70, 70],
      },
      {
        head: [86, 42], shoulder: [78, 52], hip: [62, 70],
        kneeR: [68, 66], ankleR: [58, 76], kneeL: [54, 80], ankleL: [44, 92],
        elbowR: [88, 48], wristR: [96, 44],
        elbowL: [74, 56], wristL: [84, 50],
      },
    ],
    props: [
      { kind: 'line', from: [14, 120], to: [118, 26], w: 3 },
      { kind: 'line', from: [118, 26], to: [186, 120], w: 3 },
      { kind: 'line', from: [118, 26], to: [118, 6], w: 2 },
      { kind: 'line', from: [118, 9], to: [134, 14], w: 6 },
    ],
    duration: 1700,
    face: { view: 'right', mood: 'grr' },
  },

  // Tree pose, arms joined overhead, gentle breath.
  'hero-yoga': {
    frames: [
      {
        head: [100, 26], shoulder: [100, 40], hip: [100, 72],
        kneeR: [102, 93], ankleR: [102, 114],
        kneeL: [82, 88], ankleL: [94, 76],
        elbowR: [112, 28], wristR: [103, 12],
        elbowL: [88, 28], wristL: [97, 12],
      },
      {
        head: [100, 24], shoulder: [100, 39], hip: [100, 71],
        kneeR: [102, 93], ankleR: [102, 114],
        kneeL: [80, 86], ankleL: [94, 74],
        elbowR: [111, 25], wristR: [102, 8],
        elbowL: [89, 25], wristL: [98, 8],
      },
    ],
    duration: 2600,
    face: { view: 'front', mood: 'zen' },
  },

  // Jabbing a hanging bag that recoils on the hit.
  'hero-box': {
    frames: [
      {
        head: [94, 32], shoulder: [90, 44], hip: [88, 72],
        kneeR: [98, 92], ankleR: [96, 114], toeR: [107, 117],
        kneeL: [78, 94], ankleL: [72, 114], toeL: [83, 117],
        elbowR: [102, 54], wristR: [104, 42],
        elbowL: [84, 56], wristL: [96, 46],
        bagTop: [152, 26], bagBot: [150, 66],
      },
      {
        head: [98, 32], shoulder: [94, 44], hip: [90, 72],
        kneeR: [100, 92], ankleR: [96, 114], toeR: [107, 117],
        kneeL: [80, 94], ankleL: [72, 114], toeL: [83, 117],
        elbowR: [114, 46], wristR: [132, 44],
        elbowL: [86, 58], wristL: [98, 50],
        bagTop: [152, 26], bagBot: [161, 63],
      },
    ],
    props: [
      { kind: 'line', from: [152, 2], to: 'bagTop', w: 2 },
      { kind: 'line', from: 'bagTop', to: 'bagBot', w: 16 },
      { kind: 'circle', at: 'wristR', r: 5 },
      { kind: 'circle', at: 'wristL', r: 4.5 },
    ],
    duration: 1000,
    face: { view: 'right', mood: 'grr' },
  },

  // Story opener: Zorby stands and dreams of the summit (thought bubble).
  'hero-dream': {
    frames: [
      { ...STAND, elbowR: [99, 52], wristR: [100, 66] },
      {
        head: [103, 23], shoulder: [98, 36], hip: [98, 64],
        kneeR: [100, 89], ankleR: [100, 114], toeR: [111, 117],
        elbowR: [99, 51], wristR: [100, 65],
      },
    ],
    props: [
      { kind: 'circle', at: [113, 15], r: 2 },
      { kind: 'circle', at: [121, 9], r: 3 },
      { kind: 'ellipse', cx: 146, cy: 17, rx: 21, ry: 13 },
      { kind: 'line', from: [135, 24], to: [146, 10], w: 2 },
      { kind: 'line', from: [146, 10], to: [157, 24], w: 2 },
      { kind: 'line', from: [146, 10], to: [146, 5], w: 1.5 },
      { kind: 'line', from: [146, 6], to: [151, 7.5], w: 3 },
    ],
    duration: 2400,
    face: { view: 'right', mood: 'grr' },
  },

  // Story finale: on top of the mountain, flag planted, arms in a V.
  'hero-summit': {
    frames: [
      {
        head: [100, 8], shoulder: [100, 22], hip: [100, 52],
        kneeR: [108, 73], ankleR: [106, 94], kneeL: [92, 73], ankleL: [94, 94],
        elbowR: [113, 12], wristR: [121, 0],
        elbowL: [87, 12], wristL: [79, 0],
      },
      {
        head: [100, 10], shoulder: [100, 24], hip: [100, 54],
        kneeR: [108, 75], ankleR: [106, 96], kneeL: [92, 75], ankleL: [94, 96],
        elbowR: [114, 16], wristR: [124, 6],
        elbowL: [86, 16], wristL: [76, 6],
      },
    ],
    props: [
      { kind: 'line', from: [16, 140], to: [100, 98], w: 3 },
      { kind: 'line', from: [100, 98], to: [184, 140], w: 3 },
      { kind: 'line', from: [122, 109], to: [122, 82], w: 2 },
      { kind: 'line', from: [122, 84], to: [136, 89], w: 6 },
      { kind: 'circle', at: [26, 18], r: 8 },
    ],
    duration: 1400,
    noFloor: true,
    face: { view: 'front', mood: 'joy' },
  },
};

// The library's run-gait, with Zorby's determined game face for the landing story.
ANIMS['hero-run'] = { ...ANIMS['run-gait'], face: { view: 'right', mood: 'grr' } };

// ---------------- Zorby vs The Slump (streak-powered fight tiers) ----------------
// The Slump is drawn from pose-anchored danger-toned props: a blob body with
// horns, eyes, a mouth and one stubby arm. Each tier shrinks it and gives
// Zorby a stronger move. Streak tiers: 0 / 1–3 / 4–6 / 7–13 / 14+.

/** The Slump's standard prop set (r = body radius for the tier).
 * Horn/arm lines run from the body center but the opaque body circle is
 * drawn over them, so only the tips poke out — proper stubby horns. */
function slumpProps(r: number): import('./engine').PropDef[] {
  return [
    { kind: 'line', from: 'mBody', to: 'mHornA', w: 3.5, tone: 'danger' },
    { kind: 'line', from: 'mBody', to: 'mHornB', w: 3.5, tone: 'danger' },
    { kind: 'line', from: 'mBody', to: 'mFistA', w: 4.5, tone: 'danger' },
    { kind: 'circle', at: 'mFistA', r: 3.5, tone: 'danger', fill: true },
    { kind: 'circle', at: 'mBody', r, tone: 'danger', bg: true },
    { kind: 'circle', at: 'mEyeA', r: 1.4, tone: 'danger', fill: true },
    { kind: 'circle', at: 'mEyeB', r: 1.4, tone: 'danger', fill: true },
    { kind: 'line', from: 'mMouthA', to: 'mMouthB', w: 2, tone: 'danger' },
  ];
}

ANIMS['fight-0'] = {
  // Streak 0: The Slump towers — but Zorby is already getting back up.
  frames: [
    {
      head: [58, 58], shoulder: [55, 70], hip: [52, 92],
      kneeR: [70, 96], ankleR: [72, 114], toeR: [82, 117],
      kneeL: [44, 114], ankleL: [30, 116],
      elbowR: [66, 80], wristR: [66, 66], elbowL: [46, 82], wristL: [56, 70],
      mBody: [150, 74], mHornA: [138, 50], mHornB: [162, 48],
      mEyeA: [140, 68], mEyeB: [148, 65], mMouthA: [139, 78], mMouthB: [147, 76],
      mFistA: [126, 84],
    },
    {
      head: [60, 52], shoulder: [57, 64], hip: [54, 86],
      kneeR: [70, 94], ankleR: [72, 114], toeR: [82, 117],
      kneeL: [46, 110], ankleL: [32, 114],
      elbowR: [68, 74], wristR: [68, 60], elbowL: [48, 76], wristL: [58, 64],
      mBody: [150, 72], mHornA: [138, 48], mHornB: [162, 46],
      mEyeA: [140, 66], mEyeB: [148, 63], mMouthA: [139, 76], mMouthB: [147, 74],
      mFistA: [124, 82],
    },
  ],
  props: [...slumpProps(20), { kind: 'circle', at: 'wristR', r: 3.5 }, { kind: 'circle', at: 'wristL', r: 3.5 }],
  duration: 1600,
  face: { view: 'right', mood: 'grr' },
};

ANIMS['fight-1'] = {
  // Streak 1–3: on his feet, guard up, bouncing.
  frames: [
    {
      head: [66, 36], shoulder: [62, 48], hip: [60, 74],
      kneeR: [70, 94], ankleR: [68, 114], toeR: [79, 117],
      kneeL: [50, 96], ankleL: [44, 114], toeL: [55, 117],
      elbowR: [74, 58], wristR: [76, 46], elbowL: [56, 60], wristL: [68, 50],
      mBody: [148, 78], mHornA: [136, 56], mHornB: [160, 54],
      mEyeA: [139, 72], mEyeB: [147, 69], mMouthA: [137, 82], mMouthB: [145, 80],
      mFistA: [124, 86],
    },
    {
      head: [66, 34], shoulder: [62, 46], hip: [60, 72],
      kneeR: [70, 93], ankleR: [68, 114], toeR: [79, 117],
      kneeL: [50, 95], ankleL: [44, 114], toeL: [55, 117],
      elbowR: [75, 56], wristR: [77, 44], elbowL: [57, 58], wristL: [69, 48],
      mBody: [148, 74], mHornA: [136, 52], mHornB: [160, 50],
      mEyeA: [139, 68], mEyeB: [147, 65], mMouthA: [137, 78], mMouthB: [145, 76],
      mFistA: [122, 84],
    },
  ],
  props: [...slumpProps(18), { kind: 'circle', at: 'wristR', r: 3.5 }, { kind: 'circle', at: 'wristL', r: 3.5 }],
  duration: 1100,
  face: { view: 'right', mood: 'grr' },
};

ANIMS['fight-2'] = {
  // Streak 4–6: jabs are landing; The Slump recoils.
  frames: [
    {
      head: [66, 36], shoulder: [62, 48], hip: [60, 74],
      kneeR: [70, 94], ankleR: [68, 114], toeR: [79, 117],
      kneeL: [50, 96], ankleL: [44, 114], toeL: [55, 117],
      elbowR: [74, 58], wristR: [76, 46], elbowL: [56, 60], wristL: [68, 50],
      mBody: [146, 82], mHornA: [135, 62], mHornB: [157, 60],
      mEyeA: [138, 77], mEyeB: [145, 74], mMouthA: [136, 86], mMouthB: [143, 84],
      mFistA: [124, 90],
    },
    {
      head: [70, 36], shoulder: [66, 48], hip: [63, 74],
      kneeR: [72, 94], ankleR: [68, 114], toeR: [79, 117],
      kneeL: [52, 96], ankleL: [44, 114], toeL: [55, 117],
      elbowR: [84, 50], wristR: [100, 48], elbowL: [58, 60], wristL: [70, 50],
      mBody: [154, 80], mHornA: [143, 60], mHornB: [165, 58],
      mEyeA: [146, 75], mEyeB: [153, 72], mMouthA: [144, 84], mMouthB: [151, 82],
      mFistA: [132, 88],
    },
  ],
  props: [...slumpProps(15), { kind: 'circle', at: 'wristR', r: 3.5 }, { kind: 'circle', at: 'wristL', r: 3.5 }],
  duration: 1000,
  face: { view: 'right', mood: 'grr' },
};

ANIMS['fight-3'] = {
  // Streak 7–13: front kick; The Slump shrinks and shields itself.
  frames: [
    {
      head: [70, 34], shoulder: [66, 46], hip: [64, 72],
      kneeL: [56, 94], ankleL: [52, 114], toeL: [63, 117],
      kneeR: [78, 64], ankleR: [74, 80],
      elbowR: [78, 54], wristR: [82, 44], elbowL: [58, 56], wristL: [70, 48],
      mBody: [146, 88], mHornA: [136, 70], mHornB: [156, 68],
      mEyeA: [138, 84], mEyeB: [144, 81], mMouthA: [136, 92], mMouthB: [142, 90],
      mFistA: [134, 74],
    },
    {
      head: [72, 34], shoulder: [68, 46], hip: [66, 72],
      kneeL: [56, 94], ankleL: [52, 114], toeL: [63, 117],
      kneeR: [88, 60], ankleR: [106, 58], toeR: [114, 58],
      elbowR: [80, 54], wristR: [84, 44], elbowL: [58, 56], wristL: [70, 48],
      mBody: [154, 84], mHornA: [146, 66], mHornB: [166, 66],
      mEyeA: [146, 80], mEyeB: [152, 77], mMouthA: [144, 88], mMouthB: [150, 86],
      mFistA: [142, 70],
    },
  ],
  props: [...slumpProps(12), { kind: 'circle', at: 'wristR', r: 3.5 }, { kind: 'circle', at: 'wristL', r: 3.5 }],
  duration: 1100,
  face: { view: 'right', mood: 'grr' },
};

ANIMS['fight-4'] = {
  // Streak 14+: full power — The Slump can barely peek over its own fists.
  frames: [
    {
      head: [66, 44], shoulder: [62, 56], hip: [60, 82],
      kneeR: [72, 98], ankleR: [70, 114], toeR: [80, 117],
      kneeL: [52, 100], ankleL: [46, 114], toeL: [56, 117],
      elbowR: [72, 68], wristR: [70, 56], elbowL: [54, 68], wristL: [62, 58],
      mBody: [148, 102], mHornA: [142, 90], mHornB: [156, 88],
      mEyeA: [142, 98], mEyeB: [147, 96], mMouthA: [141, 106], mMouthB: [146, 104],
      mFistA: [138, 108],
    },
    {
      head: [68, 30], shoulder: [64, 42], hip: [62, 70],
      kneeR: [72, 92], ankleR: [70, 114], toeR: [80, 117],
      kneeL: [52, 96], ankleL: [46, 114], toeL: [56, 117],
      elbowR: [80, 44], wristR: [84, 26], elbowL: [56, 54], wristL: [66, 46],
      mBody: [150, 100], mHornA: [144, 88], mHornB: [158, 86],
      mEyeA: [144, 96], mEyeB: [149, 94], mMouthA: [143, 104], mMouthB: [148, 102],
      mFistA: [140, 106],
    },
  ],
  props: [...slumpProps(9), { kind: 'circle', at: 'wristR', r: 3.5 }, { kind: 'circle', at: 'wristL', r: 3.5 }],
  duration: 1300,
  face: { view: 'right', mood: 'grr' },
};

ANIMS['hero-victory'] = {
  // Belt overhead, The Slump flat on the canvas.
  frames: [
    {
      head: [92, 20], shoulder: [92, 34], hip: [92, 64],
      kneeR: [100, 86], ankleR: [98, 112], kneeL: [84, 86], ankleL: [86, 112],
      elbowR: [106, 24], wristR: [114, 10], elbowL: [78, 24], wristL: [70, 10],
      belt: [92, 8],
      mBody: [156, 110], mHornA: [148, 102], mHornB: [163, 100],
      mEyeA: [151, 107], mEyeB: [157, 105], mMouthA: [150, 114], mMouthB: [156, 113],
      mFistA: [146, 116],
    },
    {
      head: [92, 18], shoulder: [92, 32], hip: [92, 63],
      kneeR: [100, 85], ankleR: [98, 112], kneeL: [84, 85], ankleL: [86, 112],
      elbowR: [107, 21], wristR: [115, 6], elbowL: [77, 21], wristL: [69, 6],
      belt: [92, 4],
      mBody: [156, 110], mHornA: [148, 102], mHornB: [163, 100],
      mEyeA: [151, 107], mEyeB: [157, 105], mMouthA: [150, 114], mMouthB: [156, 113],
      mFistA: [146, 116],
    },
  ],
  props: [
    ...slumpProps(8),
    { kind: 'line', from: 'wristL', to: 'wristR', w: 5 },
    { kind: 'circle', at: 'belt', r: 5 },
  ],
  duration: 1400,
  face: { view: 'front', mood: 'joy' },
};
