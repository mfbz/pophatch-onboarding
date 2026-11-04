// The mockup's generator (Park–Miller), so generated art matches it bar for bar.
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

// A row of bar heights between 0.06 and 1 that looks like a song: two slow waves plus noise.
// Rounded to three decimals, because sin and exp may differ in the last digit between the server
// and a browser (Safari's engine does), and the bars are drawn on both.
function levels(
  count: number,
  seed: number,
  shape?: (x: number, value: number) => number
): number[] {
  const random = seeded(seed);
  return Array.from({ length: count }, (_, index) => {
    const x = index / count;
    let value =
      0.35 +
      0.25 * Math.sin(x * 9 + seed) +
      0.15 * Math.sin(x * 23 + seed * 2) +
      0.25 * random();
    if (shape) value = shape(x, value);
    return Math.round(Math.max(0.06, Math.min(1, value)) * 1000) / 1000;
  });
}

export { levels, seeded };
