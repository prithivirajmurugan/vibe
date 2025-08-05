# Vibe

A powerful AI-powered development platform similar to [Lovable](https://lovable.dev), built with modern web technologies. This application enables users to create and manage projects with intelligent code generation and real-time collaboration features.

## Tech Stack

- **[Next.js](https://nextjs.org)** - React framework for production
- **[Prisma](https://prisma.io)** - Database ORM and management
- **[E2B](https://e2b.dev)** - Code execution and sandboxing
- **[OpenAI](https://openai.com)** - AI-powered code generation
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[Clerk](https://clerk.com)** - Authentication and user management
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework

## Getting Started

### Prerequisites

1. Node.js 18+ and npm/yarn/pnpm
2. PostgreSQL database
3. Required API keys:
   - OpenAI API key
   - E2B API key
   - Clerk authentication keys

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd vibe
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.sample .env
```
Then fill in your actual API keys and database URL in `.env`.

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server:

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

## Features

- 🤖 **AI-Powered Code Generation** - Generate code using OpenAI's advanced models
- 🏗️ **Project Management** - Create and organize development projects
- 💬 **Interactive Chat Interface** - Communicate with AI assistants for code help
- 🔒 **Secure Code Execution** - Run code safely in E2B sandboxed environments
- 👥 **User Authentication** - Secure login and user management with Clerk
- 📊 **Real-time Updates** - Live project updates and collaboration features
- 🎨 **Modern UI** - Beautiful, responsive interface built with Tailwind CSS

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # Reusable UI components
│   ├── modules/            # Feature-specific modules
│   ├── lib/                # Utility libraries
│   ├── trpc/               # tRPC API configuration
│   └── hooks/              # Custom React hooks
├── prisma/                 # Database schema and migrations
└── public/                 # Static assets
```

You can start editing the application by modifying files in the `src/` directory. The app auto-updates as you edit files.

## Learn More

To learn more about the technologies used in this project:

- **[Next.js Documentation](https://nextjs.org/docs)** - Learn about Next.js features and API
- **[Prisma Documentation](https://www.prisma.io/docs)** - Database toolkit and ORM
- **[E2B Documentation](https://e2b.dev/docs)** - Code execution platform
- **[OpenAI API Documentation](https://platform.openai.com/docs)** - AI and machine learning APIs
- **[tRPC Documentation](https://trpc.io/docs)** - End-to-end typesafe APIs
- **[Clerk Documentation](https://clerk.com/docs)** - Authentication and user management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
