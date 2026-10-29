# Tarun Rongali | Portfolio

Personal portfolio of **Tarun Rongali**, a software engineer (Go, Java, Node.js, AWS) now building AI agent and evaluation platforms.

A static site: plain HTML, CSS and JavaScript, no build step and no libraries. Light and dark modes, responsive.

## How it works

All text lives in one file, [content.js](content.js). The page builds itself from it, so you can update the site without touching HTML, CSS or JavaScript.

## Sections

| Section | What it shows |
| --- | --- |
| Hero | Name, role, tagline, portrait, resume button, keyword chips |
| Who I am | About text and summary stats |
| Work experience | Roles with clickable work items, plus a technology filter |
| Projects I've built | Personal projects with features, stack and links |
| Skill stack | Grouped skills. Click a skill for a plain explanation |
| Certifications | Cards that open a popup with a Credly verify link |
| Reach out to me! | Role, location, availability, contact form, links |

## Features

- **Skill popups:** skills that have an entry in `skillInfo` open "What it is" and "Think of it like this".
- **Certificate popups:** each certificate opens with Verify and Close. Add `"image": "assets/xyz.jpg"` to a certificate to show its image.
- **Contact form:** first and last name, email, phone, reason and message, with a hidden spam-trap field. Without a backend it opens the visitor's email app with the details filled in.
- **Book a call:** a button in the hero and contact section. It appears only when `bookCallUrl` is set.
- **Colour themes:** a dropdown in the nav (Forest, Violet, Ocean, Rose, Amber), each with light and dark variants. The choice is remembered.
- **Print as resume:** printing hides the navigation and buttons and shows link addresses.

## Edit your content

Everything is in [content.js](content.js):

| Key | Purpose |
| --- | --- |
| `name`, `role`, `tagline`, `about` | Hero and About text |
| `photo` | Portrait path (`assets/tarun.jpg`) |
| `resumeUrl` | Resume file (`resume.pdf`) |
| `links` | Email, LinkedIn, GitHub, Credly |
| `contact` | Role, location, availability, form reasons and `formUrl` |
| `bookCallUrl` | Calendly or Google Calendar link (empty hides the button) |
| `skills`, `skillInfo` | Skill groups and their popup explanations |
| `experience`, `projects` | Work and personal projects |
| `certifications`, `education` | Credentials (an empty list hides the section) |

To replace the resume, overwrite `resume.pdf`. To replace the photo, overwrite `assets/tarun.jpg`.

## Contact form setup (Google Sheet and email)

A static site has no server, so a small free Google Apps Script receives the form.

1. Create a Google Sheet. Keep sharing **Restricted**, because it will hold visitors' details.
2. Open **Extensions → Apps Script**, delete the sample code and paste [integrations/google-apps-script/Code.gs](integrations/google-apps-script/Code.gs).
3. Optional: set `notifyEmail` in `CONFIG` (empty means your own Google account).
4. **Deploy → New deployment → Web app**, with **Execute as: Me** and **Who has access: Anyone**. Approve the permission prompt.
5. Copy the web app URL (it ends in `/exec`) into `contact.formUrl` in `content.js`.
6. Submit the form once. A row should appear in the **Contact requests** tab and an email should arrive with the visitor's address as the reply-to.

After changing `Code.gs`, use **Deploy → Manage deployments → Edit → New version**.

Protection: the script validates and length-limits every field, ignores submissions that fill the hidden field, allows 3 messages per email and 30 in total per hour, and stores text starting with `=`, `+`, `-` or `@` as plain text. The web app URL is public, but it can only add rows and send you an email.

## Project structure

```
.
├── index.html          # Page shell
├── content.js          # All editable content
├── script.js           # Builds the page from content.js
├── features.js         # Colour themes, contact form, Book a call
├── styles.css          # Layout, themes, print styles
├── resume.pdf
├── assets/
│   └── tarun.jpg
└── integrations/
    └── google-apps-script/
        └── Code.gs     # Receives contact form posts
```

## Preview locally

Open `index.html` in a browser, or run:

```bash
python -m http.server 8000
```

then visit http://localhost:8000.

## Deploy on GitHub Pages

1. Create a GitHub repo (name it `<username>.github.io` for a root URL, or any name for `<username>.github.io/<repo>`).
2. Push this folder to the `main` branch.
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, choose `main` and `/ (root)`, then Save.
4. The site goes live at the URL shown on that page within a minute or two.
