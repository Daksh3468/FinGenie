module.exports = {
  testRunner: "vitest",
  plugins: ["@stryker-mutator/vitest-runner"],
  mutate: ["src/components/**/*.jsx"],
  concurrency: 5,
  coverageAnalysis: "off",
  timeoutMS: 100000,
  ignoreMutations: [
    "StringLiteral",
    "ObjectLiteral",
    "ArrowFunction",
  ],
  thresholds: { high: 90, low: 50, break: 0 },
  ignorePatterns: [
    "node_modules/**",
    "dist/**",
    "build/**"
  ],
  reporters: ["html", "clear-text", "progress"],
  htmlReporter: { fileName: "reports/mutation/mutation.html" },
};