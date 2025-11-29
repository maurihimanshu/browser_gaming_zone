# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Visit `http://localhost:5173`

That's it! You're ready to start developing or playing games.

## 🎮 Playing Games

1. Browse games on the dashboard
2. Click on any game card to play
3. Use the back button to return to the dashboard

## ➕ Adding Your First Game

1. Create a new folder: `src/games/my-game/`
2. Create `MyGame.tsx` with your game component
3. Create `index.ts` with game metadata
4. Register it in `src/utils/gameRegistry.ts`
5. Your game appears automatically on the dashboard!

See [README.md](README.md) for detailed instructions.

## 📦 Build for Production

```bash
npm run build
```

The `dist` folder contains your production-ready app!

## 🐛 Troubleshooting

**Port already in use?**
- Change the port: `npm run dev -- --port 3000`

**TypeScript errors?**
- Run `npm install` again
- Check that all dependencies are installed

**Styling not working?**
- Ensure Tailwind CSS is properly configured
- Check `tailwind.config.js` and `postcss.config.js`

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Explore the existing games to understand the structure

Happy coding! 🎉

