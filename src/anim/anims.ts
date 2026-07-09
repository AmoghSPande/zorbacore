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
};
