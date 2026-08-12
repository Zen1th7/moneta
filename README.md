# Taraka — public site

This repository hosts the **public web pages** for the Taraka Android app:

- **Privacy policy** — https://zen1th7.github.io/moneta/privacy.html
- **Terms of use** — https://zen1th7.github.io/moneta/terms.html
- **Landing page** — https://zen1th7.github.io/moneta/

Taraka is a private, multi-currency money-management app for Android: wallets,
transactions, budgets, goals, recurring bills and receipts, local-first, with no
tracking, no analytics and no ads. Encrypted Google Drive backup, Google
sign-in and emailed PIN recovery are all opt-in.

The app's **source code is private** and lives in a separate repository.

## Why these URLs still say `/moneta/`

The app was called **Moneta** until version 2.9.0 and is now **Taraka** — same
app, same developer. These page URLs deliberately keep the old path, because
they are registered as the privacy-policy and terms links in the Google Play
Data Safety declaration and on the Google sign-in consent screen, and because
copies of the app already installed on people's phones link here. Renaming this
repository would change the URL and break all of those — permanently, for
anyone who never updates, since GitHub does not redirect project Pages URLs
after a rename. A stale-looking path is what keeps every published link working.

## Deploying

`docs/` is published to GitHub Pages by `.github/workflows/pages.yml` on any
push to `main` touching `docs/**`. Nothing else here is built.
