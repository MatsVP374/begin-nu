import { escapeHtml } from './dom';

export const brand = 'Begin nu';

export const startCopy = {
  progressLink: 'Voortgang',
  title: 'Wat ga je doen?',
  subtitle: 'Je hoeft niet te studeren. Alleen te beginnen.',
  subjectLabel: 'Vak',
  subjectPlaceholder: 'Bijv. Statistiek',
  stepLabel: 'Allerkleinste eerste stap',
  stepLabelHint: '(iets van 2 minuten)',
  stepPlaceholder: 'Bijv. de pdf van hoofdstuk 3 openen',
  stepSuggestions: [
    'Boek of pdf openen',
    'Aantekeningen van vorige keer lezen',
    'Eén opgave maken',
    'Eén zin schrijven',
  ],
  startButton: 'Begin nu, 2 minuten',
  laterLink: 'Ik begin straks…',
};

export function streakLine(streak: number, startedToday: boolean): string {
  if (streak === 0) {
    return 'Nog geen reeks. De eerste twee minuten vandaag starten er een.';
  }
  const days = streak === 1 ? 'dag' : 'dagen';
  if (startedToday) {
    return `Je bent <strong>${streak} ${days} op rij</strong> begonnen. Vandaag telt al mee.`;
  }
  return `Je bent <strong>${streak} ${days} op rij</strong> begonnen. Twee minuten houden de reeks vast.`;
}

export const laterCopy = {
  title: 'Straks wordt vaak later.',
  text(hhmm: string): string {
    return `Doe eerst twee minuten. Daarna mag je pauzeren tot ${hhmm}, en dan ben je al op gang.`;
  },
  card: 'Twee minuten is kort genoeg om niet tegen op te zien. Wie begint, gaat meestal vanzelf door.',
  accept: 'Oké, twee minuten',
  back: 'Terug',
  emptyFieldsToast: 'Vul eerst je vak en eerste stap in',
};

export const timerCopy = {
  parkButton: 'Er schiet iets door mijn hoofd',
  stopLink: 'Stoppen',
  labelFor(kind: 'start' | 'block' | 'break'): string {
    if (kind === 'start') return 'Alleen deze stap. Meer hoeft niet.';
    if (kind === 'break') return 'Rek je uit, pak iets te drinken.';
    return 'Gewoon doorgaan. Afleiding? Parkeer het.';
  },
  breakStepText: 'Pauze. Even weg van je scherm.',
};

export const parkCopy = {
  title: 'Parkeer het even.',
  text: 'Schrijf op wat je wilt checken of opzoeken. Na het blok kijk je ernaar. De timer loopt gewoon door.',
  fieldLabel: 'Gedachte',
  placeholder: 'Bijv. appje van Sam beantwoorden, die video afkijken',
  save: 'Opschrijven en terug',
  back: 'Terug zonder opschrijven',
  savedToast: 'Geparkeerd',
};

export const startedCopy = {
  title: 'Je bent begonnen.',
  text: 'Dat was het moeilijkste stuk. Hoe verder?',
  block10: 'Nog 10 min',
  block25: 'Nog 25 min',
  doneEarly: 'Klaar voor nu',
  hint: 'Stoppen na twee minuten telt ook. Morgen weer twee.',
};

const blockTitleOptions = ['Lekker bezig.', 'Netjes.', 'Zo gaat dat.'];

export function randomBlockTitle(): string {
  const index = Math.floor(Math.random() * blockTitleOptions.length);
  return blockTitleOptions[index] ?? blockTitleOptions[0] ?? 'Lekker bezig.';
}

export function blockText(minutes: number, subject: string): string {
  const unit = minutes === 1 ? 'minuut' : 'minuten';
  return `Je zit nu op ${minutes} ${unit} ${escapeHtml(subject)} in deze sessie. Pauze is ook studeren: je hoofd verwerkt het dan.`;
}

export const blockCopy = {
  breakButton: '5 minuten pauze',
  block10: 'Nog 10 min',
  block25: 'Nog 25 min',
  finish: 'Klaar voor vandaag',
};

export const breakDoneCopy = {
  title: 'Pauze voorbij.',
  text: 'Weer twee minuten? Daarna kijk je gewoon verder.',
  again: 'Begin nu, 2 minuten',
  finish: 'Klaar voor vandaag',
};

export function doneTitle(minutes: number): string {
  return minutes >= 2 ? 'Goed gedaan.' : 'Je bent begonnen, dat telt.';
}

export function doneText(minutes: number, subject: string, streak: number): string {
  const minuteUnit = minutes === 1 ? 'minuut' : 'minuten';
  const streakUnit = streak === 1 ? 'dag' : 'dagen';
  return `${minutes} ${minuteUnit} aan ${escapeHtml(subject)}. De reeks staat op ${streak} ${streakUnit}.`;
}

export const doneCopy = {
  parkedHeading: 'Wat je had geparkeerd',
  toStart: 'Naar het begin',
  toProgress: 'Bekijk je voortgang',
};

export const progressCopy = {
  title: 'Voortgang',
  back: 'Terug',
  streakTileLabel(streak: number): string {
    return `${streak === 1 ? 'dag' : 'dagen'} op rij begonnen`;
  },
  startsTileLabel: 'keer begonnen deze week',
  minutesTileLabel: 'minuten gestudeerd deze week',
  weekHeading: 'Afgelopen 7 dagen',
  subjectHeading: 'Per vak',
  subjectEmpty: 'Nog niks deze week. Twee minuten is genoeg om te beginnen.',
  excuseText(chosenLater: number, startedAnyway: number): string {
    return `Je koos ${chosenLater} keer voor 'straks' deze week, en begon er ${startedAnyway} keer toch meteen.`;
  },
  parkHeading: 'Parkeerplaats',
  parkEmpty: 'Niks geparkeerd. Tijdens een blok kun je hier gedachten kwijt.',
  dataHeading: 'Gegevens',
  exportButton: 'Exporteren',
  importButton: 'Importeren',
  resetButton: 'Alles wissen',
  resetConfirm: 'Alle sessies en notities wissen? Dit kan niet ongedaan worden.',
  resetToast: 'Alles gewist',
  importedToast: 'Geïmporteerd',
  importFailedToast: 'Dat bestand kon niet gelezen worden',
  storageWarning:
    'Safari kan gegevens van websites wissen die je een week niet opent. Zet de app op je beginscherm, dan gebeurt dat niet.',
};

export const dayLabels = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
