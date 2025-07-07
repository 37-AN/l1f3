# Code Standards & Best Practices

## 1. General Coding Best Practices
- Use clear, descriptive names for variables, functions, classes, and files.
- Write modular, single-responsibility functions and components.
- Keep functions and files short and focused.
- Use comments to explain complex logic, not obvious code.
- Remove dead code and unused dependencies regularly.
- Prefer immutability and pure functions where possible.

## 2. Modern & Stable Code Requirements
- Use the latest stable versions of Node.js, TypeScript, and dependencies.
- Prefer ES6+ features (e.g., `const`, `let`, arrow functions, destructuring).
- Avoid deprecated APIs and unstable experimental features.
- Use type safety (TypeScript) throughout the codebase.
- Keep dependencies up to date and audit for vulnerabilities.

## 3. Context Awareness & Documentation
- Write clear, concise commit messages that explain the context and reason for changes.
- Update documentation (README, code comments, API docs) with every significant change.
- Use docstrings/JSDoc for all public functions, classes, and modules.
- Maintain architectural and workflow diagrams where helpful.

## 4. Testing & Quality Assurance
- Write unit, integration, and end-to-end tests for all critical logic.
- Maintain high test coverage (aim for 80%+ where practical).
- Use automated testing and linting in CI/CD pipelines.
- Fix lint and type errors before merging code.
- Test all code paths, including error and edge cases.

## 5. Security & Privacy
- Never commit secrets, API keys, or credentials to the repository.
- Use environment variables for sensitive configuration.
- Sanitize and validate all user input.
- Follow the principle of least privilege for permissions and access.
- Regularly audit dependencies for vulnerabilities.

## 6. Collaboration & Git Workflow
- Use feature branches for all new work; never commit directly to `main`.
- Rebase or merge `main` into your branch regularly to avoid conflicts.
- Open pull requests with clear descriptions and context.
- Request reviews and address feedback promptly.
- Squash commits before merging to keep history clean.
- Tag releases and maintain a changelog.

## 7. Project-Specific Guidelines
- Follow framework-specific best practices (e.g., NestJS for backend, React for frontend).
- Use dependency injection and modular architecture in NestJS.
- Use functional components and hooks in React.
- Keep business logic out of controllers and UI components.
- Store configuration in environment files, not code.

## 8. Continuous Improvement
- Refactor code regularly to improve readability and maintainability.
- Encourage knowledge sharing and code reviews.
- Document lessons learned and recurring issues.
- Stay updated with industry best practices and update this document as needed.

---

_Adhering to these rules ensures a robust, maintainable, and collaborative codebase. For questions or suggestions, open an issue or discuss with the team._ 