# Publish directly from main

The root index.html, assets/, images/ and fallback.svg are the compiled website.
GitHub serves these files directly, without an npm build workflow.

1. Commit and push all project changes, including generated root files.
2. Open Settings > Pages in the GitHub repository.
3. Set Source to Deploy from a branch.
4. Select main and / (root), then Save.
5. Wait for deployment and open https://mrhiss1703-web.github.io/hotel-website/.

## Development

React source remains in src/ to preserve all current functionality. dev.html
is the development entry. npm run dev still serves http://localhost:5173/.
This is a compiled static distribution, not a rewrite without React.

After editing source, run npm run build locally before committing. It updates
dist/ and copies the static website to the repository root. Commit index.html,
assets/, images/, fallback.svg and .nojekyll. Do not edit generated files manually.
Local asset paths are relative so both root and /hotel-website/ hosting work.

Run npm test for business logic and npm run preview to preview dist/.
The legacy js/ and css/ files are not used by the current application.
