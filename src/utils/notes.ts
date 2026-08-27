export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export type Instrument = 'piano' | 'guitar';

export interface Note {
  name: NoteName;
  octave: number;
}

export const MIN_OCTAVE = 1;
export const MAX_OCTAVE = 7;

export function noteToFrequency(name: NoteName, octave: number): number {
  const semitoneIndex = NOTE_NAMES.indexOf(name);
  const midi = (octave + 1) * 12 + semitoneIndex;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function noteToString(note: Note): string {
  return `${note.name}${note.octave}`;
}

export function parseNoteString(value: string): Note | null {
  const match = value.match(/^([A-G]#?)(\d)$/);
  if (!match) return null;
  const name = match[1] as NoteName;
  const octave = Number(match[2]);
  if (!NOTE_NAMES.includes(name) || octave < MIN_OCTAVE || octave > MAX_OCTAVE) {
    return null;
  }
  return { name, octave };
}

export function randomNote(minOctave: number, maxOctave: number): Note {
  const octave =
    minOctave + Math.floor(Math.random() * (maxOctave - minOctave + 1));
  const name = NOTE_NAMES[Math.floor(Math.random() * NOTE_NAMES.length)];
  return { name, octave };
}

export function notesEqual(a: Note, b: Note): boolean {
  return a.name === b.name && a.octave === b.octave;
}

export function displayNoteName(name: NoteName): string {
  return name.replace('#', '♯');
}

export function getBeginnerChoices(
  correct: NoteName,
  count = 4,
): NoteName[] {
  const distractors = NOTE_NAMES.filter((name) => name !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);

  return [correct, ...distractors].sort(() => Math.random() - 0.5);
}
