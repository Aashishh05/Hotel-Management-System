import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup.js"],
    // Each test file spins up its own in-memory Mongo; running files serially
    // keeps that predictable on Windows dev machines.
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 180000,
  },
});
