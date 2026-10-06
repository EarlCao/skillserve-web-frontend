# SkillServe admin web (React + Vite)

The administrators' console for SkillServe. Plain JavaScript/JSX, React Query, React Hook Form +
Zod, Tailwind/daisyUI, and the React Compiler. Project overview and setup are in the repository
root `README.md`; deployment is in `DEPLOYMENT.md`.

## Layout

- `src/modules/<feature>/` — each feature's `api/`, `hooks/`, `components/` and `pages/`.
- `src/services/api.js` — the only way feature code calls the backend.
- `src/utils/permissions.js` and `RequirePermission` — UI and route gating with the backend's
  Spatie permission names.
- `src/constants` — React Query keys (`QUERY_KEYS`) and shared constants.

## Commands

```bash
npm run dev     # http://localhost:5173
npm run lint
npm run build
```

Configuration comes from `.env` (see `.env.example`): the API URL and the Reverb settings.
