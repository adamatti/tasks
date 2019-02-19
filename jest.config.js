module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "bower_components/",
    "/node_modules/"
  ],

  coverageReporters: [
    "json",
    "html"
  ],

  testEnvironment: "node",

  verbose: false,
};
