const HONOR_GAINS = [
  // needs to be sorted DESC by value
  { type: 'quest', info: '3x Mark of Honor', value: 398 },
  { type: 'HK', level: 60, rank: 13, value: 377 },
  { type: 'HK', level: 60, rank: 12, value: 358 },
  { type: 'HK', level: 60, rank: 11, value: 339 },
  { type: 'HK', level: 60, rank: 10, value: 321 },
  { type: 'HK', level: 60, rank: 9, value: 305 },
  { type: 'HK', level: 60, rank: 8, value: 289 },
  { type: 'HK', level: 60, rank: 7, value: 274 },
  { type: 'HK', level: 60, rank: 6, value: 260 },
  { type: 'HK', level: 60, rank: 5, value: 246 },
  { type: 'HK', level: 60, rank: 4, value: 233 },
  { type: 'HK', level: 60, rank: 3, value: 221 },
  { type: 'HK', level: 60, rank: 2, value: 210 },
  { type: 'HK', level: 60, rank: 1, value: 199 },
  { type: 'quest', info: 'Silithyst quest', value: 199 },
  { type: 'HK', level: 59, rank: 2, value: 188 },
  { type: 'HK', level: 59, rank: 1, value: 178 },
  { type: 'HK', level: 58, rank: 3, value: 176 },
  { type: 'HK', level: 58, rank: 1, value: 159 },
  { type: 'HK', level: 57, rank: 2, value: 148 },
  { type: 'HK', level: 57, rank: 1, value: 141 },
  { type: 'HK', level: 56, rank: 2, value: 131 },
  { type: 'HK', level: 56, rank: 1, value: 124 },
  { type: 'HK', level: 55, rank: 3, value: 121 },
  { type: 'HK', level: 55, rank: 2, value: 115 },
  { type: 'HK', level: 55, rank: 1, value: 109 },
  { type: 'HK', level: 54, rank: 2, value: 100 },
  { type: 'HK', level: 54, rank: 1, value: 95 },
  { type: 'HK', level: 53, rank: 1, value: 82 },
  { type: 'HK', level: 52, rank: 1, value: 70 },
  { type: 'HK', level: 51, rank: 1, value: 59 },
  { type: 'HK', level: 50, rank: 1, value: 49 },
  { type: 'HK', level: 49, rank: 2, value: 42 },
  { type: 'HK', level: 49, rank: 1, value: 40 },
  { type: 'HK', level: 48, rank: 1, value: 32 },
];

function* genCombinations(number, options) {
  function* genCombination(remainingNumber, remainingSummands, found) {
    if (remainingNumber === 0) {
      yield found;
    }

    for (const [index, summand] of remainingSummands.entries()) {
      if (summand.value <= remainingNumber) {
        const isHonorKill = summand.type === 'HK';
        const indexToSliceSummands = options.allowDuplicateRanks ? index : (isHonorKill ? index + 1 : index);
        const nextNumber = remainingNumber - summand.value;
        const nextSummands = remainingSummands.slice(indexToSliceSummands);
        const nextFound = [...found, summand];

        if (nextFound.length > options.maxCombinationLength) {
          return;
        }

        yield* genCombination(nextNumber, nextSummands, nextFound);
      }
    }
  }

  const honorGains = HONOR_GAINS.reduce((result, gain) => {
    const isLowLevelRanker = gain.type === 'HK' && gain.level < 60 && gain.rank > 1;
    const isMarkOfHonorQuest = gain.type === 'quest' && gain.value === 398;
    const isAllowed = options.allowMarkOfHonor && isMarkOfHonorQuest

    if (isLowLevelRanker) {
      return options.allowLowLevelRankers ? [...result, gain] : result;
    } else if (isMarkOfHonorQuest) {
      return options.allowMarkOfHonor ? [...result, gain] : result;
    } else {
      return [...result, gain];
    }
  }, []);

  yield* genCombination(number, honorGains, []);
}

const getUndercutCombinationsFor = (remainingHonor, options) => {
  let remainingUndercut = 1;
  let undercutCombinations = [];

  while (remainingUndercut <= options.maxUndercut) {
    const combinations = [...genCombinations(remainingHonor - remainingUndercut, options)];

    if (combinations.length > 0) {
      undercutCombinations.push(...combinations);
    }

    remainingUndercut += 1;
  }

  return undercutCombinations;
};

const getCombinationsFor = (remainingHonor, options) => {
  const combinations = [...genCombinations(remainingHonor, options)];

  if (options.maxUndercut > 0 && combinations.length === 0) {
    if (options.maxUndercut >= remainingHonor) {
      return [];
    } else {
      return getUndercutCombinationsFor(remainingHonor, options);
    }
  } else {
    return combinations;
  }
};

const sortCombinations = (combinations) => (
  [...combinations].sort((a, b) => a.length - b.length)
);

this.addEventListener('message', (event) => {
  const combinations = getCombinationsFor(event.data.remainingHonor, {
    maxCombinationLength: event.data.maxCombinationLength,
    maxUndercut: event.data.maxUndercut,
    allowDuplicateRanks: event.data.allowDuplicateRanks,
    allowLowLevelRankers: event.data.allowLowLevelRankers,
    allowMarkOfHonor: event.data.allowMarkOfHonor,
  });
  const sortedCombinations = sortCombinations(combinations);

  this.postMessage({ done: true, combinations: sortedCombinations, remainingHonor: event.data.remainingHonor });
});
