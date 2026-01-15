export interface CounterConfig {
  bits: number
  flipFlopType: "JK" | "T" | "D"
  countMode: "ascending" | "descending" | "custom"
  customSequence: number[]
  resetState?: number // State to return to after sequence ends (defaults to first state)
}

export interface StateTableRow {
  present: number
  next: number
  presentBits: number[]
  nextBits: number[]
}

export interface TransitionTableRow {
  present: number
  next: number
  presentBits: number[]
  nextBits: number[]
  inputs: string[]
}

export interface KMapData {
  inputName: string
  map: (number | string)[][]
  groups: { cells: number[]; color: string }[]
  equation: string
}

export interface EquationData {
  input: string
  expression: string
}

export interface CounterData {
  sequence: number[]
  stateTable: StateTableRow[]
  transitionTable: TransitionTableRow[]
  karnaughMaps: KMapData[]
  equations: EquationData[]
  resetInfo: {
    lastState: number
    resetState: number
    isCustomReset: boolean
  }
}

export function generateCounterData(config: CounterConfig): CounterData {
  const { bits, flipFlopType, customSequence, resetState } = config
  const sequence = customSequence.length > 0 ? customSequence : generateSequence(config)

  const effectiveResetState = resetState !== undefined ? resetState : sequence[0]
  const lastState = sequence[sequence.length - 1]
  const isCustomReset = effectiveResetState !== sequence[0]

  // Create modified sequence for state table that accounts for custom reset
  const stateTable = generateStateTable(sequence, bits, effectiveResetState)
  const transitionTable = generateTransitionTable(stateTable, flipFlopType, bits, sequence, effectiveResetState)
  const karnaughMaps = generateKarnaughMaps(transitionTable, flipFlopType, bits)
  const equations = extractEquations(karnaughMaps)

  return {
    sequence,
    stateTable,
    transitionTable,
    karnaughMaps,
    equations,
    resetInfo: {
      lastState,
      resetState: effectiveResetState,
      isCustomReset,
    },
  }
}

function generateSequence(config: CounterConfig): number[] {
  const maxValue = Math.pow(2, config.bits)

  if (config.countMode === "ascending") {
    return Array.from({ length: maxValue }, (_, i) => i)
  } else if (config.countMode === "descending") {
    return Array.from({ length: maxValue }, (_, i) => maxValue - 1 - i)
  }

  return config.customSequence
}

function generateStateTable(sequence: number[], bits: number, resetState: number): StateTableRow[] {
  const table: StateTableRow[] = []

  for (let i = 0; i < sequence.length; i++) {
    const present = sequence[i]
    // For the last state, go to resetState instead of sequence[0]
    const next = i === sequence.length - 1 ? resetState : sequence[i + 1]

    table.push({
      present,
      next,
      presentBits: toBits(present, bits),
      nextBits: toBits(next, bits),
    })
  }

  return table
}

function generateTransitionTable(
  stateTable: StateTableRow[],
  flipFlopType: "JK" | "T" | "D",
  bits: number,
  sequence: number[],
  resetState: number,
): TransitionTableRow[] {
  const table: TransitionTableRow[] = []
  const allStates = Math.pow(2, bits)
  const sequenceStates = new Set(stateTable.map((row) => row.present))

  // Create a map from present state to next state
  const stateMap = new Map<number, number>()
  stateTable.forEach((row) => stateMap.set(row.present, row.next))

  for (let state = 0; state < allStates; state++) {
    const presentBits = toBits(state, bits)
    let nextBits: number[]
    let next: number

    if (sequenceStates.has(state)) {
      next = stateMap.get(state)!
      nextBits = toBits(next, bits)
    } else {
      // Don't care state - goes to reset state (or first state in sequence)
      next = resetState
      nextBits = toBits(next, bits)
    }

    const inputs = calculateInputs(presentBits, nextBits, flipFlopType)

    table.push({
      present: state,
      next,
      presentBits,
      nextBits,
      inputs,
    })
  }

  return table
}

function calculateInputs(present: number[], next: number[], flipFlopType: "JK" | "T" | "D"): string[] {
  const inputs: string[] = []

  for (let i = 0; i < present.length; i++) {
    const q = present[i]
    const qNext = next[i]

    if (flipFlopType === "JK") {
      // JK Flip-Flop excitation table
      if (q === 0 && qNext === 0) {
        inputs.push("0", "X")
      } else if (q === 0 && qNext === 1) {
        inputs.push("1", "X")
      } else if (q === 1 && qNext === 0) {
        inputs.push("X", "1")
      } else {
        inputs.push("X", "0")
      }
    } else if (flipFlopType === "T") {
      // T Flip-Flop excitation table
      if (q === qNext) {
        inputs.push("0")
      } else {
        inputs.push("1")
      }
    } else {
      // D Flip-Flop - D = Q+
      inputs.push(qNext.toString())
    }
  }

  return inputs
}

function generateKarnaughMaps(
  transitionTable: TransitionTableRow[],
  flipFlopType: "JK" | "T" | "D",
  bits: number,
): KMapData[] {
  const maps: KMapData[] = []
  const labels = getFlipFlopLabels(bits)

  const inputsPerFF = flipFlopType === "JK" ? 2 : 1

  for (let ffIndex = 0; ffIndex < bits; ffIndex++) {
    for (let inputIndex = 0; inputIndex < inputsPerFF; inputIndex++) {
      const inputIdx = ffIndex * inputsPerFF + inputIndex
      let inputName: string

      if (flipFlopType === "JK") {
        inputName = inputIndex === 0 ? `J${labels[ffIndex]}` : `K${labels[ffIndex]}`
      } else if (flipFlopType === "T") {
        inputName = `T${labels[ffIndex]}`
      } else {
        inputName = `D${labels[ffIndex]}`
      }

      const { map, groups, equation } = createKMap(transitionTable, inputIdx, bits, inputName, labels)

      maps.push({
        inputName,
        map,
        groups,
        equation,
      })
    }
  }

  return maps
}

function createKMap(
  transitionTable: TransitionTableRow[],
  inputIndex: number,
  bits: number,
  inputName: string,
  labels: string[],
): { map: (number | string)[][]; groups: { cells: number[]; color: string }[]; equation: string } {
  let map: (number | string)[][]

  if (bits === 2) {
    map = [
      [getInputValue(transitionTable, 0, inputIndex), getInputValue(transitionTable, 1, inputIndex)],
      [getInputValue(transitionTable, 2, inputIndex), getInputValue(transitionTable, 3, inputIndex)],
    ]
  } else if (bits === 3) {
    map = [
      [
        getInputValue(transitionTable, 0, inputIndex),
        getInputValue(transitionTable, 1, inputIndex),
        getInputValue(transitionTable, 3, inputIndex),
        getInputValue(transitionTable, 2, inputIndex),
      ],
      [
        getInputValue(transitionTable, 4, inputIndex),
        getInputValue(transitionTable, 5, inputIndex),
        getInputValue(transitionTable, 7, inputIndex),
        getInputValue(transitionTable, 6, inputIndex),
      ],
    ]
  } else {
    // 4 bits
    map = [
      [
        getInputValue(transitionTable, 0, inputIndex),
        getInputValue(transitionTable, 1, inputIndex),
        getInputValue(transitionTable, 3, inputIndex),
        getInputValue(transitionTable, 2, inputIndex),
      ],
      [
        getInputValue(transitionTable, 4, inputIndex),
        getInputValue(transitionTable, 5, inputIndex),
        getInputValue(transitionTable, 7, inputIndex),
        getInputValue(transitionTable, 6, inputIndex),
      ],
      [
        getInputValue(transitionTable, 12, inputIndex),
        getInputValue(transitionTable, 13, inputIndex),
        getInputValue(transitionTable, 15, inputIndex),
        getInputValue(transitionTable, 14, inputIndex),
      ],
      [
        getInputValue(transitionTable, 8, inputIndex),
        getInputValue(transitionTable, 9, inputIndex),
        getInputValue(transitionTable, 11, inputIndex),
        getInputValue(transitionTable, 10, inputIndex),
      ],
    ]
  }

  const { groups, equation } = simplifyKMap(map, bits, labels, inputName)

  return { map, groups, equation }
}

function getInputValue(transitionTable: TransitionTableRow[], stateIndex: number, inputIndex: number): number | string {
  const row = transitionTable.find((r) => r.present === stateIndex)
  if (!row) return "X"

  const value = row.inputs[inputIndex]
  if (value === "X") return "X"
  return Number.parseInt(value)
}

function simplifyKMap(
  map: (number | string)[][],
  bits: number,
  labels: string[],
  inputName: string,
): { groups: { cells: number[]; color: string }[]; equation: string } {
  const rows = map.length
  const cols = map[0].length
  const groups: { cells: number[]; color: string }[] = []
  const terms: string[] = []
  const used = new Set<number>()

  const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
  let colorIndex = 0

  // Find groups of 8, 4, 2, 1 (in that order)
  const groupSizes = [8, 4, 2, 1]

  for (const size of groupSizes) {
    const possibleGroups = findGroupsOfSize(map, size, rows, cols)

    for (const group of possibleGroups) {
      const hasNewCell = group.some((cell) => !used.has(cell))
      const allOnesOrX = group.every((cell) => {
        const row = Math.floor(cell / cols)
        const col = cell % cols
        return map[row][col] === 1 || map[row][col] === "X"
      })
      const hasAtLeastOneOne = group.some((cell) => {
        const row = Math.floor(cell / cols)
        const col = cell % cols
        return map[row][col] === 1
      })

      if (hasNewCell && allOnesOrX && hasAtLeastOneOne) {
        group.forEach((cell) => used.add(cell))
        groups.push({
          cells: group,
          color: colors[colorIndex % colors.length],
        })
        colorIndex++

        const term = getTermFromGroup(group, rows, cols, bits, labels)
        if (term && !terms.includes(term)) {
          terms.push(term)
        }
      }
    }
  }

  // Check for all zeros
  let allZeros = true
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (map[r][c] === 1) {
        allZeros = false
        break
      }
    }
  }

  const equation = allZeros ? "0" : terms.length > 0 ? terms.join(" + ") : "1"

  return { groups, equation }
}

function findGroupsOfSize(map: (number | string)[][], size: number, rows: number, cols: number): number[][] {
  const groups: number[][] = []

  if (size === 1) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        groups.push([r * cols + c])
      }
    }
  } else if (size === 2) {
    // Horizontal pairs
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const c2 = (c + 1) % cols
        groups.push([r * cols + c, r * cols + c2])
      }
    }
    // Vertical pairs
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const r2 = (r + 1) % rows
        groups.push([r * cols + c, r2 * cols + c])
      }
    }
  } else if (size === 4) {
    // 2x2 squares
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const r2 = (r + 1) % rows
        const c2 = (c + 1) % cols
        groups.push([r * cols + c, r * cols + c2, r2 * cols + c, r2 * cols + c2])
      }
    }
    // 1x4 horizontal
    if (cols >= 4) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          groups.push([
            r * cols + c,
            r * cols + ((c + 1) % cols),
            r * cols + ((c + 2) % cols),
            r * cols + ((c + 3) % cols),
          ])
        }
      }
    }
    // 4x1 vertical
    if (rows >= 4) {
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          groups.push([
            r * cols + c,
            ((r + 1) % rows) * cols + c,
            ((r + 2) % rows) * cols + c,
            ((r + 3) % rows) * cols + c,
          ])
        }
      }
    }
  } else if (size === 8) {
    // 2x4
    if (cols >= 4) {
      for (let r = 0; r < rows; r++) {
        const r2 = (r + 1) % rows
        for (let c = 0; c < cols; c++) {
          groups.push([
            r * cols + c,
            r * cols + ((c + 1) % cols),
            r * cols + ((c + 2) % cols),
            r * cols + ((c + 3) % cols),
            r2 * cols + c,
            r2 * cols + ((c + 1) % cols),
            r2 * cols + ((c + 2) % cols),
            r2 * cols + ((c + 3) % cols),
          ])
        }
      }
    }
    // 4x2
    if (rows >= 4) {
      for (let c = 0; c < cols; c++) {
        const c2 = (c + 1) % cols
        for (let r = 0; r < rows; r++) {
          groups.push([
            r * cols + c,
            r * cols + c2,
            ((r + 1) % rows) * cols + c,
            ((r + 1) % rows) * cols + c2,
            ((r + 2) % rows) * cols + c,
            ((r + 2) % rows) * cols + c2,
            ((r + 3) % rows) * cols + c,
            ((r + 3) % rows) * cols + c2,
          ])
        }
      }
    }
  }

  return groups
}

function getTermFromGroup(group: number[], rows: number, cols: number, bits: number, labels: string[]): string {
  const positions = group.map((cell) => ({
    row: Math.floor(cell / cols),
    col: cell % cols,
  }))

  const term: string[] = []

  if (bits === 2) {
    // Check A (row)
    const rowValues = [...new Set(positions.map((p) => p.row))]
    if (rowValues.length === 1) {
      term.push(rowValues[0] === 0 ? `${labels[0]}'` : labels[0])
    }

    // Check B (col)
    const colValues = [...new Set(positions.map((p) => p.col))]
    if (colValues.length === 1) {
      term.push(colValues[0] === 0 ? `${labels[1]}'` : labels[1])
    }
  } else if (bits === 3) {
    // A is row (0 or 1)
    const rowValues = [...new Set(positions.map((p) => p.row))]
    if (rowValues.length === 1) {
      term.push(rowValues[0] === 0 ? `${labels[0]}'` : labels[0])
    }

    // BC are columns in Gray code: 00, 01, 11, 10
    const colValues = [...new Set(positions.map((p) => p.col))]
    const grayB = [0, 0, 1, 1]
    const grayC = [0, 1, 1, 0]

    const bValues = [...new Set(colValues.map((c) => grayB[c]))]
    if (bValues.length === 1) {
      term.push(bValues[0] === 0 ? `${labels[1]}'` : labels[1])
    }

    const cValues = [...new Set(colValues.map((c) => grayC[c]))]
    if (cValues.length === 1) {
      term.push(cValues[0] === 0 ? `${labels[2]}'` : labels[2])
    }
  } else {
    // 4 bits
    // AB are rows in Gray code: 00, 01, 11, 10
    // CD are columns in Gray code: 00, 01, 11, 10
    const grayRow = [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ]
    const grayCol = [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ]

    const rowValues = [...new Set(positions.map((p) => p.row))]
    const colValues = [...new Set(positions.map((p) => p.col))]

    const aValues = [...new Set(rowValues.map((r) => grayRow[r][0]))]
    if (aValues.length === 1) {
      term.push(aValues[0] === 0 ? `${labels[0]}'` : labels[0])
    }

    const bValues = [...new Set(rowValues.map((r) => grayRow[r][1]))]
    if (bValues.length === 1) {
      term.push(bValues[0] === 0 ? `${labels[1]}'` : labels[1])
    }

    const cValues = [...new Set(colValues.map((c) => grayCol[c][0]))]
    if (cValues.length === 1) {
      term.push(cValues[0] === 0 ? `${labels[2]}'` : labels[2])
    }

    const dValues = [...new Set(colValues.map((c) => grayCol[c][1]))]
    if (dValues.length === 1) {
      term.push(dValues[0] === 0 ? `${labels[3]}'` : labels[3])
    }
  }

  return term.length > 0 ? term.join("·") : "1"
}

function extractEquations(karnaughMaps: KMapData[]): EquationData[] {
  return karnaughMaps.map((kmap) => ({
    input: kmap.inputName,
    expression: kmap.equation,
  }))
}

function toBits(num: number, bits: number): number[] {
  const result: number[] = []
  for (let i = bits - 1; i >= 0; i--) {
    result.push((num >> i) & 1)
  }
  return result
}

function getFlipFlopLabels(bits: number): string[] {
  const labels: string[] = []
  for (let i = 0; i < bits; i++) {
    labels.push(String.fromCharCode(65 + i))
  }
  return labels
}
