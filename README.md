# Orbit

Orbit is a modern web application built with the [T3 Stack](https://create.t3.gg/), featuring a clean UI, authentication, user account management, and interactive video and capsule components. This project leverages Next.js, NextAuth.js, Prisma, and other best-in-class tools for a robust developer and user experience.

---

## Features

- **Authentication**: Secure sign-in with GitHub (NextAuth.js).
- **User Profiles**: Update name and username with validation and daily limits.
- **Account Management**: Responsive account settings page with avatar and email display.
- **Video & Capsule Components**: Interactive, animated UI elements for media and content.
- **Reusable UI**: Modular components (buttons, overlays, navigation, etc.) with production-ready patterns.
- **Prisma ORM**: Type-safe database access and migrations.
- **Modern Animations**: Smooth transitions and feedback using Framer Motion.
- **Production Best Practices**: Singleton database client, error handling, and accessibility.

---

## Tech Stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Framer Motion](https://www.framer.com/motion/)
- [Zod](https://zod.dev) (validation)
- [SCSS Modules](https://sass-lang.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/orbit.git
   cd orbit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` and fill in your secrets (GitHub OAuth, database URL, etc.).

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Project Structure

- `/src/app` — Next.js app directory (pages, layouts, routes)
- `/src/components` — Reusable UI components (atoms, molecules, overlay, etc.)
- `/src/server` — Database and server utilities
- `/src/lib` — Helper functions (authentication, validation, etc.)

---

## Deployment

Orbit is ready for deployment on [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/), or any platform supporting Next.js.

- See [Next.js deployment docs](https://nextjs.org/docs/deployment) for more info.

---

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

- [T3 Stack](https://create.t3.gg/)
- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Framer Motion](https://www.framer.com/motion/)