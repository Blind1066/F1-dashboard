export interface TrackTurn {
  number: string;
  name: string;
  x: number;
  y: number;
}

export interface TrackDrsZone {
  id: string;
  name: string;
  activation: { x: number; y: number; label: string };
  detection?: { x: number; y: number; label: string };
  path: string;
}

export const BRASIL_CIRCUIT_CONFIG = {
  id: "interlagos",
  name: "Autódromo José Carlos Pace",
  locality: "São Paulo, Brazil",
  grandPrixName: "Brazilian Grand Prix",
  viewBox: "0 0 800 580",
  // Continuous smooth SVG track path (anti-clockwise)
  trackPath:
    "M 620 180 C 655 190 680 220 680 255 C 680 290 645 315 610 305 C 585 295 578 265 570 230 C 565 195 530 185 480 185 L 230 185 C 190 185 145 205 130 250 C 115 295 125 345 155 385 C 195 435 265 480 345 480 C 405 480 450 445 465 400 C 475 365 455 335 420 330 C 385 325 365 345 370 375 C 375 405 410 425 450 425 C 495 425 535 460 560 460 C 585 460 590 415 580 365 C 570 315 570 250 595 205 C 602 195 610 185 620 180 Z",

  // Start / Finish Line
  startFinish: {
    x: 618,
    y: 182,
    angle: -25,
  },

  // DRS Zones
  drsZones: [
    {
      id: "drs-zone-1",
      name: "DRS ZONE 1",
      path: "M 565 380 C 570 315 570 250 595 205 L 620 180",
      activation: { x: 575, y: 310, label: "DRS ACTIVATION ZONE 1" },
      detection: { x: 555, y: 460, label: "DRS DETECTION ZONE 1" },
    },
    {
      id: "drs-zone-2",
      name: "DRS ZONE 2",
      path: "M 480 185 L 230 185",
      activation: { x: 420, y: 175, label: "DRS ACTIVATION ZONE 2" },
      detection: { x: 575, y: 250, label: "DRS DETECTION ZONE 2" },
    },
  ],

  // Speed Trap
  speedTrap: {
    x: 320,
    y: 185,
    label: "SPEED TRAP",
  },

  // Turn numbers & labels
  turns: [
    { number: "01", name: "Senna S (Part 1)", x: 672, y: 225 },
    { number: "02", name: "Senna S (Part 2)", x: 618, y: 295 },
    { number: "03", name: "Curva do Sol", x: 535, y: 215 },
    { number: "04", name: "Descida do Lago", x: 175, y: 205 },
    { number: "05", name: "Curva do Lago", x: 135, y: 285 },
    { number: "06", name: "Ferradura (Part 1)", x: 185, y: 405 },
    { number: "07", name: "Ferradura (Part 2)", x: 265, y: 465 },
    { number: "08", name: "Curva do Laranjinha", x: 395, y: 470 },
    { number: "09", name: "Pinheirinho", x: 460, y: 380 },
    { number: "10", name: "Bico de Pato", x: 375, y: 345 },
    { number: "11", name: "Mergulho", x: 440, y: 415 },
    { number: "12", name: "Junção", x: 550, y: 450 },
    { number: "13", name: "Subida dos Boxes", x: 575, y: 360 },
    { number: "14", name: "Cotovelo", x: 578, y: 270 },
    { number: "15", name: "Arquibancadas", x: 605, y: 205 },
  ] as TrackTurn[],

  // Sector boundaries
  sectors: [
    { name: "SECTOR 1", x: 500, y: 255 },
    { name: "SECTOR 2", x: 250, y: 370 },
    { name: "SECTOR 3", x: 470, y: 485 },
  ],
};
