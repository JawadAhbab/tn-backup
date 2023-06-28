### Backup Steps

- Create config file in root folder named `backup.configs.json`
- Run `npx backup`

### Config File Example

```json
{
  "base": "./",
  "excludes": [
    { "regexp": "\\\\node_modules$" },
    { "regexp": "\\\\build$" },
    { "regexp": "\\\\dist$" },
    "./backup"
  ],
  "saves": [
    {
      "filename": "Backup",
      "path": "./backup",
      "frequency": "hourly"
    }
  ]
}
```

_Backticks must be used when using `excludes > regexp`_
