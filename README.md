# Rongali Tarun | 3D Portfolio

An immersive 3D portfolio: a glass-and-gear AI/software "Core" you scroll into. Built with React, TypeScript, React Three Fiber, custom GLSL shaders, GSAP ScrollTrigger and Lenis.

## Scenes

| # | Scene | Content (from `src/content.ts`) |
| --- | --- | --- |
| 00 | The Core | Name, role, "Enter the system" |
| 01 | The Cognitive Engine | AI work: roles and clickable work items with full stories |
| 02 | The System Pipeline | Backend/cloud engineering and personal projects |
| 03 | The Experiments | Skill stack (clickable explanations) and certifications |
| 04 | Console | Contact form, resume, links, book a call |

## Edit your content

All text lives in [src/content.ts](src/content.ts) (name, about, experience, projects, skills, certifications, links, contact). Replace the resume at `public/resume_sde_detailed.pdf` and the photo at `public/assets/tarun.jpg`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Contact form

Same as before: set `contact.formUrl` in `src/content.ts` to your Google Apps Script web app URL (script in [integrations/google-apps-script/Code.gs](integrations/google-apps-script/Code.gs); setup steps are in the file header). With no URL set, the form opens the visitor's email app instead.

## Deploy on GitHub Pages

A workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Structure

```
src/
├── content.ts            # all editable content
├── scene/                # R3F: Core, particles, grid, fog, camera rig, post-processing
├── shaders/              # GLSL: noise, Fresnel shell, neural nodes/edges, particles, grid
├── lib/                  # scroll rig (Lenis + GSAP), shared state
└── ui/                   # glass HUD, scene content, contact console
```
