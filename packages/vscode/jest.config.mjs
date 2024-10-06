const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/out/"],
  verbose: true,
  rootDir: "./",
};

export default config;
