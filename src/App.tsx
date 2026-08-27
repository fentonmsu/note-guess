import Game from './components/Game';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">♪</div>
        <div>
          <h1>Note Guess</h1>
          <p className="subtitle">Ear training for piano &amp; guitar</p>
        </div>
      </header>
      <main>
        <Game />
      </main>
    </div>
  );
}
