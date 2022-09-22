# Contributing

Please read the text at the bottom as carefully as possible.

## How to Contribute

### Getting Code

1. Clone this repository

```bash
git clone https://github.com/githru/githru-vscode-ext
```

2. Install dependencies

```bash
npm install
```

3. Build Githru Analysis Engine

```bash
cd githru-vscode-ext/packages/analysis-engine
npm run build
```

4. Run all Githru Analysis Engine tests locally

```bash
npm run test
```

### Code reviews

All submissions, including submissions by project members, require review.
We use GitHub pull requests for this purpose. And at least two approvals are required to merge PR.

### Code Style

- Coding style is fully defined in [.eslintrc](https://github.com/githru/githru-vscode-ext/blob/main/packages/analysis-engine/.eslintrc.json)
- Comments should be generally avoided. If the code would not be understood without comments, consider re-writing the code to make it self-explanatory.

To run code linter, use:

```bash
npm run lint
```

### API guidelines

When authoring new API methods, consider the following:

- Expose as little information as needed. When in doubt, don’t expose new information.
- Methods are used in favor of getters/setters.
- All string literals must be camel case. This includes event names and option values.
  - Create a plural variable name that always ends with `s`.
  - Even if it's a non-dispersible noun, put an `s` so that we can infer the data type.
  - Can write variable names such as `dict`, `list`, and `map` so that you can predict the data type.
- For the type file, create it under `src/types` and export it from `src/types/index.ts`.
- Except for type files, all files are managed by 1 depth under `/src`.
- Avoid adding "sugar" API (API that is trivially implementable in user-space) unless they're **very** common.

### Commit Messages

Commit messages should follow the Semantic Commit Messages format:

```
label(namespace): content
```

1. _label_ is one of the following:
   - `fix` - bug fixes.
   - `feat` - features.
   - `docs` - changes to docs, e.g. `docs(engine): README.md ...` to change documentation.
   - `test` - changes to tests infrastructure.
   - `chore` - everything that doesn't fall under previous categories
2. _namespace_ is put in parenthesis after label and is optional. Must be one of `engine | view | vsode`.
3. _content_ is a brief summary of changes.

Example:

```
feat(engine): add function to find git path on vscode
```

### Adding New Dependencies

For all dependencies (both installation and development):

- **Do not add** a dependency if the desired functionality is easily implementable.
- If adding a dependency, it should be well-maintained and trustworthy.

A barrier for introducing new installation dependencies is especially high:

- **Do not add** installation dependency unless it's critical to project success.

Management of all node modules is managed `package-lock.json` in the **root**:

- **Do not add** `package-lock.json` on `packages/analysis-engine`.

### Running & Writing Tests

- Every feature should be accompanied by a test.
- Every public API event/method should be accompanied by a test.
- Tests should be _hermetic_. Tests should not depend on external services.
- Tests should work on all three platforms: Mac, Linux and Win. This is especially important for screenshot tests.

Githru Analysis Engine tests are named as `**.spec.ts` and use `jest` test runner.
If there are integration tests, make sure public API methods and events work as expected.

- To run all tests:

```bash
npm run test
```

- To run specific test:

```bash
npm run test:stem
```

- To disable a specific test, substitute `it` with `it.skip`:

```js
...
// Using "it.skip" to skip a specific test
it.skip('should work', async () => {
  const response = await myFunction();
  expect(response).toBe(true);
});
```

- When should a test be marked with `skip`?

  - Only the case **Git log API is changed** and should notify repo maintainer

## Contributor License Agreement

This project welcomes contributions and suggestions.  
Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution.
For details, visit [Apache Foundation](https://www.apache.org/licenses/contributor-agreements.html).
