/** @type {import('jest').Config} */
module.exports = {
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/src"],
};
