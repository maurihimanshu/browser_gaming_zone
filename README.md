# 🎮 Gamer - Browser Games Collection

A modern, scalable React application featuring a collection of browser-based games. Play classic games like Snake, Tic-Tac-Toe, and more - all running entirely in your browser with no backend required!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)

## ✨ Features

- 🎯 **Zero Backend**: All games run entirely in the browser
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS
- 📦 **Scalable Architecture**: Easy to add new games
- 🚀 **Fast Performance**: Built with Vite for optimal performance
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices
- 🔍 **Search & Filter**: Find games by category or search term
- 🎮 **Multiple Games**: Growing collection of classic and modern games

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gamer.git
cd gamer

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
gamer/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Dashboard.tsx    # Main dashboard with game grid
│   │   ├── GameCard.tsx     # Individual game card component
│   │   ├── GameView.tsx     # Game view/play page
│   │   └── Layout.tsx        # Main layout with navigation
│   ├── games/               # Game modules
│   │   ├── snake/           # Snake game
│   │   │   ├── index.ts     # Game module export
│   │   │   └── SnakeGame.tsx
│   │   └── tic-tac-toe/     # Tic-Tac-Toe game
│   │       ├── index.ts
│   │       └── TicTacToeGame.tsx
│   ├── types/               # TypeScript type definitions
│   │   └── game.ts          # Game-related types
│   ├── utils/               # Utility functions
│   │   └── gameRegistry.ts  # Central game registry
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎮 Adding a New Game

Adding a new game is simple! Follow these steps:

### 1. Create Game Directory

Create a new directory under `src/games/`:

```bash
mkdir src/games/your-game-name
```

### 2. Create Game Component

Create your game component file (e.g., `YourGame.tsx`):

```tsx
// src/games/your-game-name/YourGame.tsx
export default function YourGame() {
  // Your game logic here
  return (
    <div>
      {/* Your game UI */}
    </div>
  )
}
```

### 3. Create Game Module

Create an `index.ts` file that exports your game module:

```tsx
// src/games/your-game-name/index.ts
import { GameModule } from '@/types/game'
import YourGame from './YourGame'

const yourGame: GameModule = {
  metadata: {
    id: 'your-game-id',
    name: 'Your Game Name',
    description: 'A brief description of your game',
    category: 'Arcade', // or 'Strategy', 'Puzzle', etc.
    difficulty: 'Easy', // or 'Medium', 'Hard'
    players: 1, // or 2, 3, etc.
    estimatedTime: '5-10 min',
  },
  component: YourGame,
}

export default yourGame
```

### 4. Register the Game

Add your game to the registry in `src/utils/gameRegistry.ts`:

```tsx
import yourGame from '@/games/your-game-name'

const gameRegistry: GameRegistry = {
  // ... existing games
  [yourGame.metadata.id]: yourGame,
}
```

That's it! Your game will automatically appear on the dashboard.

## 🎨 Styling Guidelines

- Use Tailwind CSS utility classes for styling
- Follow the existing design system (see `src/index.css`)
- Use the provided button classes: `btn-primary` and `btn-secondary`
- Use `game-card` class for game cards on the dashboard
- Maintain consistent spacing and color scheme

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic

## 📝 Game Categories

Current categories:
- **Arcade**: Action-based games (Snake, etc.)
- **Strategy**: Thinking games (Tic-Tac-Toe, etc.)
- **Puzzle**: Brain teasers
- **Racing**: Speed-based games
- **Sports**: Sports simulations

Feel free to add new categories as needed!

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-game`)
3. Add your game following the structure above
4. Commit your changes (`git commit -m 'Add amazing game'`)
5. Push to the branch (`git push origin feature/amazing-game`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/gamer)

1. Push your code to GitHub
2. Import the project on Vercel
3. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import the project on Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

### Deploy to GitHub Pages

See the GitHub Actions workflow in `.github/workflows/deploy.yml` for automatic deployment.

## 🎯 Roadmap

- [ ] Add more games (Pong, Tetris, Memory Game, etc.)
- [ ] Add game statistics and leaderboards (localStorage)
- [ ] Add sound effects and music
- [ ] Add game difficulty levels
- [ ] Add multiplayer support (WebRTC)
- [ ] Add game achievements
- [ ] Add dark/light theme toggle

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Bundled with [Vite](https://vitejs.dev/)
- Icons and emojis for visual appeal

## 📧 Contact

Have questions or suggestions? Open an issue or start a discussion!

---

Made with ❤️ by the Gamer community

