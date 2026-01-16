# Contributing to Task Management System

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/your-username/task-management-system.git
cd task-management-system
npm install
```

### 2. Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 3. Make Changes
- Write code following our coding standards
- Add tests for new functionality
- Update documentation if needed
- Test your changes locally

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for adding tests
- `refactor:` for code refactoring

### 5. Push and Create PR
```bash
git push -u origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Review Guidelines

### For Authors
- Provide clear PR description
- Include screenshots for UI changes
- Link related issues
- Ensure all tests pass
- Keep PRs focused and small

### For Reviewers
- Be constructive and respectful
- Test changes locally when possible
- Check for code quality and consistency
- Verify tests are adequate
- Approve when ready or request changes

## Coding Standards

### JavaScript
- Use ES6+ features
- Follow consistent naming conventions
- Add JSDoc comments for public methods
- Handle errors appropriately
- Write meaningful variable names

### Testing
- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow AAA pattern (Arrange-Act-Assert)

### Git
- Use meaningful commit messages
- Keep commits atomic (one logical change)
- Rebase feature branches before merging
- Delete branches after merging

## Getting Help

- Check existing issues and PRs
- Ask questions in PR comments
- Contact maintainers if needed

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a positive environment
```

**File**: `CODE_OF_CONDUCT.md` (buat file baru)

```markdown
# Code of Conduct

## Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

## Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## Enforcement

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org), version 1.4.