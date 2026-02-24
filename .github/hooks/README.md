Pre-commit Hook for Workflow Validation

What it does
- Validates touched GitHub Actions workflow files using the repository's validator
  script at .github/scripts/validate-workflows.sh before commits are created.
- If validation fails, the commit is aborted with a clear error message.

How to enable
- Ensure the hook directory is in place and executable:
  - Run: chmod +x .github/hooks/pre-commit
- Git will look for hooks in your repo's .git/hooks by default. To use the
  repository-provided hook path, set:
  - git config core.hooksPath ".github/hooks"
- After enabling, try committing changes that touch .github/workflows/*.yml

Notes
- This hook relies on the existing validator at .github/scripts/validate-workflows.sh.
- It checks YAML syntax, actionlint (if available), and anti-patterns as defined in the script.
