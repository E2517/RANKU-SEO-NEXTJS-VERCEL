This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# 1. Crear la app Next.js con App Router, TypeScript y Tailwind
npx create-next-app@latest ranku-next --use-npm --typescript --tailwind --eslint --app --src-dir

# 2. Entrar en el directorio
cd ranku-next

# 3. Instalar dependencias adicionales que usarás más adelante (opcional ahora, pero buena práctica)
npm install next-auth mongoose stripe @types/node @types/react @types/react-dom

# 4. Si usas iconos (como en tu diseño actual con Font Awesome), puedes instalar:
npm install react-icons

ranku-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx            ← Layout global con top-bar y footer
│   │   ├── page.tsx              ← Página de inicio (home)
│   │   ├── auth/
│   │   │   └── page.tsx          ← Login / Registro
│   │   ├── contacto/
│   │   │   └── page.tsx
│   │   ├── dashboard/            ← (futuro) Área privada
│   │   │   └── page.tsx
│   │   └── globals.css           ← Estilos globales (opcional, Tailwind cubre casi todo)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/
│   │   │   ├── BenefitCard.tsx
│   │   │   ├── PricingCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── CtaBanner.tsx
│   │   └── common/
│   │       └── Logo.tsx
│   ├── public/
│   │   ├── assets/
│   │   │   ├── ranku.webp
│   │   │   ├── mapa.webp
│   │   │   ├── scanmap.webp
│   │   │   ├── ninja.png
│   │   │   ├── ewheel.webp
│   │   │   ├── coweb.webp
│   │   │   └── carloscr.webp
│   │   └── favicon.ico
│   └── lib/                       ← (futuro) utils, auth, stripe, db, etc.
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json# 

RANKU-SEO-NEXTJS-VERCEL
# RANKU-SEO-NEXTJS-VERCEL
