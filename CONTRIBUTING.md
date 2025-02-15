# Commit Message Convention

We follow the **Conventional Commits** format for consistency and automated changelog generation.

## Format

```text
<type>(<scope>): <subject>

<body>
```

- `<type>` → Specifies the category of the change (e.g., `feat`, `fix`, `chore`).
- `<scope>` (optional) → Indicates the area of the code affected (e.g., `ui`, `api`).
- `<subject>` → A brief, imperative summary of the change.
- `<body>` (optional) → More detailed explanation if needed.


## Examples

- Feature Addition

    ```text
    feat(auth): add JWT token support
    ```

- Bug Fix

    ```text
    fix(ui): resolve navbar flickering issue
    ```
