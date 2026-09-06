# ShortJob Client

React + Vite frontend for the ShortJob professional community platform.

## Frontend Stack

| Area | Technology |
| --- | --- |
| App | React 19, Vite |
| Styling | Tailwind CSS 4, DaisyUI 5 |
| State | Zustand |
| Icons | FontAwesome, Lucide |
| Realtime | Socket.io client |
| PWA | vite-plugin-pwa |

## UI Features

- Warm teal/coral design system with light, dark, and system theme modes shared across feed, jobs, explore, profile, admin, chat, settings, and auth pages.
- Responsive mobile layout with fuller screen width, compact spacing, bottom navigation, and user avatar profile icon.
- Smooth collapsible sidebar behavior for larger screens.
- Responsive global search icon with a full-screen mobile surface and grouped people, job, post, and page results.
- Global search uses a document-level portal, debounced/cancelled requests, keyboard dismissal, scroll locking, safe areas, and exact destination routes.
- Only one desktop global-search trigger is shown: left sidebar when the right rail is hidden, right rail at `2xl` widths.
- Mobile header dropdown includes Explore People.
- Feed post cards with preserved full-image previews, special user styling, linked job cards, tags, likes, saves, sharing, and comments.
- Comment modal and post detail conversation layout with multiline input, replies, empty states, and desktop/mobile optimized spacing.
- Job pages with advanced applicant UI, kanban workflow, quick apply, Q&A, skill gap, reach stats, and formatted Excel/PDF applicant exports.
- Job discovery defaults to a 5 km radius, presents nearby areas rather than broad cities, supports custom distance, and keeps locality/distance/type/payment filters synchronized.
- Live geolocation tracking can refresh nearby jobs and distances as the user moves, while movement thresholds reduce GPS jitter and excessive requests.
- Profile pages with timeline, current and previous work details, special theme variants, opportunities status, and scoped avatar badges.
- Explore page with active/popular/admin discovery, followed-user search, and special profile presentation.
- Right-sidebar Who to Follow includes real user search plus working follow/unfollow controls.
- Login audit modal with location permission, camera capture, full-face guidance, and face-quality validation.
- Settings includes user-controlled location access and online-status visibility, with custom confirmation before camera/location permission flows.
- Chat supports text, photos, documents, stickers, swipe/drag reply, quoted previews, emoji reactions, typing state in the composer, and sent/delivered/read ticks.
- Chat media stays outside text bubbles; desktop conversations are resizable and mobile composer/reaction controls retain fixed shapes above the bottom navigation.
- Notification and message counters have explicit high-contrast light/dark colors.
- Shared stacking tiers coordinate sticky content, dropdowns, sidebars, navigation, popovers, modals, immersive viewers, and global search.
- Admin dashboards and related admin pages tuned for small and large screens.
- Login-audit pages and records are restricted to super admins; regular admins see moderation-focused user details without super-admin controls.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

Default local URL:

```text
http://localhost:5173
```
