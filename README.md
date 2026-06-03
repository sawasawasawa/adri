# adri

A simple static website, deployed automatically to GitHub Pages.

## Structure

- `index.html` — the page
- `style.css` — the styling (light + dark mode)
- `.github/workflows/deploy.yml` — auto-deploys to Pages on every push to `main`

## Edit & ship

Change the words in `index.html`, commit, and push. The GitHub Action redeploys the live site in about a minute. No build step.

```sh
git add -A
git commit -m "update content"
git push
```

## Deploy

Pages is configured to deploy from **GitHub Actions** (Settings → Pages → Source). The workflow uploads the repo root as the site artifact and publishes it.

> Note: GitHub Pages on a **private** repository requires a paid plan (Pro/Team/Enterprise). On a free account, make the repo public to publish the site.
