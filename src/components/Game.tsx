import { useCallback, useEffect, useRef, useState } from 'react';
import {
  initAudio,
  playNote,
  setInstrument,
  stopAll,
} from '../audio/instruments';
import {
  MAX_OCTAVE,
  MIN_OCTAVE,
  NOTE_NAMES,
  type Instrument,
  type Note,
  type NoteName,
  displayNoteName,
  getBeginnerChoices,
  noteToString,
  notesEqual,
  randomNote,
} from '../utils/notes';

type Feedback = 'correct' | 'wrong' | null;

export default function Game() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instrument, setInstrumentState] = useState<Instrument>('piano');
  const [minOctave, setMinOctave] = useState(MIN_OCTAVE);
  const [maxOctave, setMaxOctave] = useState(MAX_OCTAVE);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [choices, setChoices] = useState<NoteName[]>([]);
  const playTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      await initAudio();
      setReady(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const pickNewNote = useCallback(() => {
    setFeedback(null);
    setShowAnswer(false);
    return randomNote(minOctave, maxOctave);
  }, [minOctave, maxOctave]);

  const playCurrentNote = useCallback(
    (note: Note) => {
      if (playTimeout.current) clearTimeout(playTimeout.current);
      stopAll();
      setPlaying(true);
      playNote(note, '1n');
      playTimeout.current = setTimeout(() => setPlaying(false), 1800);
    },
    [],
  );

  const handleNewRound = useCallback(() => {
    const note = pickNewNote();
    setCurrentNote(note);
    setChoices(beginnerMode ? getBeginnerChoices(note.name) : []);
    playCurrentNote(note);
  }, [beginnerMode, pickNewNote, playCurrentNote]);

  const handleBeginnerModeChange = (enabled: boolean) => {
    setBeginnerMode(enabled);
    if (enabled && currentNote && feedback === null) {
      setChoices(getBeginnerChoices(currentNote.name));
    }
    if (!enabled) {
      setChoices([]);
    }
  };

  const handleGuess = useCallback(
    (name: NoteName) => {
      if (!currentNote || feedback !== null) return;

      const guessed: Note = { name, octave: currentNote.octave };
      const isCorrect = notesEqual(guessed, currentNote);

      setFeedback(isCorrect ? 'correct' : 'wrong');
      setShowAnswer(true);
      setScore((s) => ({
        correct: s.correct + (isCorrect ? 1 : 0),
        total: s.total + 1,
      }));
      setStreak((s) => (isCorrect ? s + 1 : 0));
    },
    [currentNote, feedback],
  );

  const handleInstrumentChange = (value: Instrument) => {
    setInstrumentState(value);
    setInstrument(value);
  };

  const handleReplay = () => {
    if (currentNote) playCurrentNote(currentNote);
  };

  useEffect(() => {
    return () => {
      if (playTimeout.current) clearTimeout(playTimeout.current);
      stopAll();
    };
  }, []);

  if (!ready) {
    return (
      <section className="card start-screen">
        <div className="start-icon">🎵</div>
        <h2>Ready to train your ear?</h2>
        <p>
          Listen to a note on piano or guitar and guess which one it is. Works
          on phone and desktop — tap to enable sound.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={start}
          disabled={loading}
        >
          {loading ? 'Loading instruments…' : 'Start Playing'}
        </button>
      </section>
    );
  }

  const accuracy =
    score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="game">
      <section className="card stats-bar">
        <div className="stat">
          <span className="stat-label">Score</span>
          <span className="stat-value">
            {score.correct}/{score.total}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value">{accuracy}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{streak}🔥</span>
        </div>
      </section>

      <section className="card settings">
        <div className="setting-row">
          <label htmlFor="instrument">Instrument</label>
          <div className="toggle-group" id="instrument">
            <button
              type="button"
              className={`toggle-btn ${instrument === 'piano' ? 'active' : ''}`}
              onClick={() => handleInstrumentChange('piano')}
            >
              🎹 Piano
            </button>
            <button
              type="button"
              className={`toggle-btn ${instrument === 'guitar' ? 'active' : ''}`}
              onClick={() => handleInstrumentChange('guitar')}
            >
              🎸 Guitar
            </button>
          </div>
        </div>

        <div className="setting-row">
          <label htmlFor="difficulty">Difficulty</label>
          <div className="toggle-group" id="difficulty">
            <button
              type="button"
              className={`toggle-btn ${beginnerMode ? 'active' : ''}`}
              onClick={() => handleBeginnerModeChange(true)}
            >
              🌱 Beginner
            </button>
            <button
              type="button"
              className={`toggle-btn ${!beginnerMode ? 'active' : ''}`}
              onClick={() => handleBeginnerModeChange(false)}
            >
              🎯 Advanced
            </button>
          </div>
          {beginnerMode && (
            <p className="setting-hint">4 note choices per round</p>
          )}
        </div>

        <div className="setting-row">
          <label htmlFor="octave-range">Octave range</label>
          <div className="octave-range" id="octave-range">
            <select
              value={minOctave}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinOctave(val);
                if (val > maxOctave) setMaxOctave(val);
              }}
            >
              {Array.from({ length: MAX_OCTAVE - MIN_OCTAVE + 1 }, (_, i) => {
                const o = MIN_OCTAVE + i;
                return (
                  <option key={o} value={o}>
                    {o}
                  </option>
                );
              })}
            </select>
            <span>to</span>
            <select
              value={maxOctave}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxOctave(val);
                if (val < minOctave) setMinOctave(val);
              }}
            >
              {Array.from({ length: MAX_OCTAVE - MIN_OCTAVE + 1 }, (_, i) => {
                const o = MIN_OCTAVE + i;
                return (
                  <option key={o} value={o}>
                    {o}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </section>

      <section className="card play-area">
        {!currentNote ? (
          <div className="play-prompt">
            <p>Press the button to hear a random note</p>
            <button
              type="button"
              className="btn btn-primary btn-large"
              onClick={handleNewRound}
            >
              Play Note
            </button>
          </div>
        ) : (
          <>
            <div className="play-controls">
              <button
                type="button"
                className={`btn btn-play ${playing ? 'playing' : ''}`}
                onClick={handleReplay}
                aria-label="Replay note"
              >
                {playing ? '♫' : '▶'}
              </button>
              <p className="play-hint">
                {playing ? 'Playing…' : 'Tap to replay the note'}
              </p>
            </div>

            {feedback && (
              <div className={`feedback feedback-${feedback}`}>
                {feedback === 'correct' ? (
                  <>✓ Correct!</>
                ) : (
                  <>
                    ✗ Wrong — it was{' '}
                    <strong>
                      {currentNote &&
                        `${displayNoteName(currentNote.name)} (octave ${currentNote.octave})`}
                    </strong>
                  </>
                )}
              </div>
            )}

            {showAnswer && currentNote && (
              <p className="answer-reveal">
                Note: <strong>{noteToString(currentNote)}</strong>
              </p>
            )}

            <div
              className={`note-grid ${beginnerMode ? 'note-grid-beginner' : ''}`}
            >
              {(beginnerMode ? choices : NOTE_NAMES).map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`note-btn ${
                    feedback &&
                    currentNote?.name === name &&
                    feedback === 'correct'
                      ? 'note-correct'
                      : ''
                  } ${
                    feedback &&
                    currentNote?.name === name &&
                    feedback === 'wrong'
                      ? 'note-reveal'
                      : ''
                  }`}
                  onClick={() => handleGuess(name)}
                  disabled={feedback !== null}
                >
                  {displayNoteName(name)}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={handleNewRound}
            >
              Next Note →
            </button>
          </>
        )}
      </section>
    </div>
  );
}
