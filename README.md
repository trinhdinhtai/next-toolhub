# ToolHub - A Collection of Useful Tools

ToolHub is a web application that provides a collection of useful tools for everyday tasks. It's built with Next.js and offers a modern, responsive user interface.

## Tools Included

- **Image Compression**: Compress and optimize images without losing significant quality
- **File Converter**: Convert files between different formats (TXT, JSON, CSV, YAML)
- **Password Generator**: Create strong, secure passwords with customizable options
- **JSON Formatter**: Format, validate and beautify JSON data
- **RegEx Checker**: Test and debug regular expressions with real-time feedback

## Tech Stack

- **Framework**: Next.js 15+
- **Styling**: Tailwind CSS
- **UI Components**: Custom components built with Tailwind
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: Contains all the pages and routes
- `/app/tools/`: Contains individual tool implementations
- `/components/`: Contains reusable UI components
- `/public/`: Contains static assets

## Features to Add in the Future

- More conversion options in the File Converter tool
- Image format conversion
- Color picker and converter
- Base64 encoder/decoder
- Text diff checker
- URL encoder/decoder
- Hash generator

## License

This project is licensed under the MIT License.

## What's Included

- Next.js 15
- React 19
- TailwindCSS v4
- TypeScript
- Shadcn UI
- Prettier
- ESLint

## Usage Guide

1. Install dependencies using bun:
   ```bash
   bun install
   ```
2. Start the development server:
   ```bash
   bun run dev
   ```
3. Build the project:
   ```bash
   bun run build
   ```
4. Start the production server:
   ```bash
   bun run start
   ```

First, run the development server:

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
