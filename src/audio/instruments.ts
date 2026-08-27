import * as Tone from 'tone';
import type { Instrument, Note } from '../utils/notes';
import { noteToString } from '../utils/notes';

const SALAMANDER_URLS: Record<string, string> = {
  A0: 'A0.mp3',
  C1: 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
  A6: 'A6.mp3',
  C7: 'C7.mp3',
  'D#7': 'Ds7.mp3',
  'F#7': 'Fs7.mp3',
  A7: 'A7.mp3',
  C8: 'C8.mp3',
};

const GUITAR_URLS: Record<string, string> = {
  A2: 'A2.mp3',
  A3: 'A3.mp3',
  A4: 'A4.mp3',
  'A#2': 'As2.mp3',
  'A#3': 'As3.mp3',
  'A#4': 'As4.mp3',
  B2: 'B2.mp3',
  B3: 'B3.mp3',
  B4: 'B4.mp3',
  C3: 'C3.mp3',
  C4: 'C4.mp3',
  C5: 'C5.mp3',
  'C#3': 'Cs3.mp3',
  'C#4': 'Cs4.mp3',
  'C#5': 'Cs5.mp3',
  D2: 'D2.mp3',
  D3: 'D3.mp3',
  D4: 'D4.mp3',
  D5: 'D5.mp3',
  'D#2': 'Ds2.mp3',
  'D#3': 'Ds3.mp3',
  'D#4': 'Ds4.mp3',
  E2: 'E2.mp3',
  E3: 'E3.mp3',
  E4: 'E4.mp3',
  F2: 'F2.mp3',
  F3: 'F3.mp3',
  F4: 'F4.mp3',
  'F#2': 'Fs2.mp3',
  'F#3': 'Fs3.mp3',
  'F#4': 'Fs4.mp3',
  G2: 'G2.mp3',
  G3: 'G3.mp3',
  G4: 'G4.mp3',
  'G#2': 'Gs2.mp3',
  'G#3': 'Gs3.mp3',
  'G#4': 'Gs4.mp3',
};

let initialized = false;
let currentInstrument: Instrument = 'piano';
let pianoLoadPromise: Promise<void> | null = null;
let guitarLoadPromise: Promise<void> | null = null;

const masterChain = new Tone.Gain(0.85).toDestination();

const pianoReverb = new Tone.Reverb({
  decay: 2.4,
  preDelay: 0.02,
  wet: 0.18,
}).connect(masterChain);

const pianoCompressor = new Tone.Compressor({
  threshold: -22,
  ratio: 3,
  attack: 0.005,
  release: 0.15,
  knee: 6,
}).connect(pianoReverb);

let piano: Tone.Sampler | null = null;

function loadPiano(): Promise<void> {
  if (pianoLoadPromise) return pianoLoadPromise;

  pianoLoadPromise = new Promise((resolve, reject) => {
    piano = new Tone.Sampler({
      urls: SALAMANDER_URLS,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      attack: 0,
      release: 1.4,
      onload: () => resolve(),
      onerror: (error) => reject(error),
    }).connect(pianoCompressor);

    piano.volume.value = -2;
  });

  return pianoLoadPromise;
}

const guitarReverb = new Tone.Reverb({
  decay: 2.8,
  preDelay: 0.025,
  wet: 0.22,
}).connect(masterChain);

// Warm body + natural string brightness
const guitarFilter = new Tone.Filter({
  type: 'lowpass',
  frequency: 5200,
  Q: 0.7,
  rolloff: -12,
}).connect(guitarReverb);

const guitarEq = new Tone.EQ3({
  low: 3.5,
  mid: -2.5,
  high: 2,
  lowFrequency: 180,
  highFrequency: 2800,
}).connect(guitarFilter);

const guitarCompressor = new Tone.Compressor({
  threshold: -20,
  ratio: 2.2,
  attack: 0.01,
  release: 0.28,
  knee: 10,
}).connect(guitarEq);

// Soft stereo width for a more “recorded” feel
const guitarChorus = new Tone.Chorus({
  frequency: 0.8,
  delayTime: 3.2,
  depth: 0.18,
  wet: 0.12,
  spread: 160,
})
  .connect(guitarCompressor)
  .start();

let guitar: Tone.Sampler | null = null;

// Quiet pluck transient layered under the sample for a more realistic pick attack
const guitarPick = new Tone.PluckSynth({
  attackNoise: 0.8,
  dampening: 4200,
  resonance: 0.97,
}).connect(guitarCompressor);

guitarPick.volume.value = -28;

function loadGuitar(): Promise<void> {
  if (guitarLoadPromise) return guitarLoadPromise;

  guitarLoadPromise = (async () => {
    await guitarReverb.generate();

    await new Promise<void>((resolve, reject) => {
      guitar = new Tone.Sampler({
        urls: GUITAR_URLS,
        baseUrl:
          'https://cdn.jsdelivr.net/npm/tonejs-instrument-guitar-acoustic-mp3@1.1.2/',
        attack: 0.004,
        release: 2.6,
        curve: 'exponential',
        onload: () => resolve(),
        onerror: (error) => reject(error),
      }).connect(guitarChorus);

      guitar.volume.value = -3;
    });
  })();

  return guitarLoadPromise;
}

export async function initAudio(): Promise<void> {
  if (initialized) return;
  await Tone.start();
  await Promise.all([loadPiano(), loadGuitar()]);
  initialized = true;
}

export function setInstrument(instrument: Instrument): void {
  currentInstrument = instrument;
}

export function playNote(note: Note, duration = '2n'): void {
  if (!initialized) return;

  const time = Tone.now();
  const noteName = noteToString(note);

  if (currentInstrument === 'piano') {
    piano?.triggerAttackRelease(noteName, duration, time);
    return;
  }

  if (!guitar) return;

  // Slightly softer attack on very high notes, fuller on low ones
  const velocity =
    note.octave <= 2 ? 0.95 : note.octave >= 5 ? 0.72 : 0.86;

  // Open the filter briefly so the pluck feels brighter, then settle warm
  guitarFilter.frequency.cancelScheduledValues(time);
  guitarFilter.frequency.setValueAtTime(7200, time);
  guitarFilter.frequency.exponentialRampToValueAtTime(4800, time + 0.18);

  guitar.triggerAttackRelease(noteName, duration, time, velocity);

  // Soft pick transient under the sample
  const pickFreq = Tone.Frequency(noteName).toFrequency();
  guitarPick.triggerAttack(pickFreq * 1.01, time);
  guitarPick.triggerRelease(time + 0.12);
}

export function playNoteByName(noteStr: string, duration = '2n'): void {
  const match = noteStr.match(/^([A-G]#?)(\d)$/);
  if (!match) return;
  playNote(
    { name: match[1] as Note['name'], octave: Number(match[2]) },
    duration,
  );
}

export function stopAll(): void {
  piano?.releaseAll();
  guitar?.releaseAll();
  guitarPick.triggerRelease();
}

export { noteToString };
