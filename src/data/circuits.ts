export interface CircuitData {
  id: string;
  name: string;
  city: string;
  country: string;
  lengthKm: string;
  laps: number;
  raceDistanceKm: string;
  lapRecord: {
    time: string;
    driver: string;
    year: number;
  };
  turns: number;
  drsZones: number;
  type: string;
  svgPath: string;
  viewBox: string;
  startFinish?: { x: number; y: number };
  sector1Path?: string;
  sector2Path?: string;
  sector3Path?: string;
  turnsList?: { num: string; x: number; y: number }[];
}

export const CIRCUITS_DATA: Record<string, CircuitData> = {
  interlagos: {
    id: "interlagos",
    name: "Autódromo José Carlos Pace",
    city: "São Paulo",
    country: "Brazil",
    lengthKm: "4.309",
    laps: 71,
    raceDistanceKm: "305.879",
    lapRecord: { time: "1:10.540", driver: "Valtteri Bottas", year: 2018 },
    turns: 15,
    drsZones: 2,
    type: "Permanent Track • Anti-Clockwise",
    viewBox: "-10 -10 520 350",
    startFinish: { x: 213.1, y: 42.2 },
    svgPath:
      "M 213.1 42.2 L 206.5 44.3 L 199.7 45.9 L 193.1 47.8 L 186.4 49.5 L 179.7 51.4 L 173.0 53.2 L 166.3 55.0 L 159.7 56.9 L 153.0 58.5 L 146.4 60.5 L 139.6 62.1 L 132.9 63.8 L 126.2 65.7 L 119.6 67.7 L 112.8 69.2 L 106.3 71.3 L 99.5 72.8 L 92.9 74.9 L 86.1 76.4 L 79.5 78.4 L 72.8 80.1 L 66.3 82.5 L 60.0 85.1 L 53.8 88.1 L 48.4 92.5 L 45.8 98.9 L 45.9 105.9 L 49.6 111.8 L 55.0 116.7 L 60.4 121.6 L 64.7 127.2 L 64.9 134.3 L 62.6 140.8 L 58.7 146.6 L 55.5 152.7 L 53.0 159.1 L 51.6 165.9 L 51.0 173.1 L 51.5 180.3 L 53.0 187.1 L 54.5 193.9 L 57.4 200.1 L 60.9 206.1 L 65.4 211.7 L 70.7 216.9 L 76.3 221.1 L 82.3 224.5 L 88.5 227.6 L 95.0 229.8 L 101.7 231.6 L 108.4 233.4 L 115.0 235.3 L 121.8 237.0 L 128.5 238.6 L 135.1 240.6 L 141.9 242.1 L 148.5 244.1 L 155.3 245.7 L 162.1 247.2 L 168.7 249.2 L 175.5 250.8 L 182.2 252.5 L 188.9 254.3 L 195.5 256.1 L 202.2 257.9 L 209.0 259.4 L 215.6 261.4 L 222.4 263.0 L 229.1 264.7 L 235.8 266.6 L 242.6 268.1 L 249.3 269.7 L 256.0 271.6 L 262.5 273.7 L 269.3 275.2 L 276.1 276.8 L 282.8 278.6 L 289.5 280.3 L 296.3 281.9 L 302.9 283.9 L 309.6 285.6 L 316.3 287.4 L 323.1 289.0 L 330.1 290.0 L 337.1 289.0 L 343.0 285.4 L 346.8 279.6 L 348.7 272.9 L 350.2 266.1 L 351.4 259.2 L 352.7 252.3 L 353.6 245.3 L 354.3 238.1 L 353.8 230.9 L 352.5 224.0 L 350.1 217.6 L 346.6 211.6 L 342.5 205.8 L 337.3 200.6 L 331.7 196.1 L 326.0 191.9 L 320.3 187.7 L 314.6 183.6 L 308.8 179.7 L 303.1 175.6 L 297.4 171.4 L 291.7 167.2 L 285.8 163.4 L 280.1 159.2 L 274.3 155.4 L 268.6 151.3 L 262.9 147.1 L 257.2 142.9 L 251.5 138.8 L 245.8 134.6 L 240.1 130.4 L 234.3 126.3 L 228.7 122.1 L 224.5 116.4 L 221.4 110.2 L 220.2 103.3 L 220.2 96.2 L 221.2 89.2 L 223.3 82.6 L 225.9 76.3 L 229.7 70.4 L 234.6 65.0 L 240.8 62.1 L 247.6 60.6 L 254.4 59.1 L 261.2 57.5 L 268.0 56.0 L 275.0 55.0 L 282.0 54.0 L 289.1 54.0 L 295.9 55.5 L 300.2 60.1 L 300.8 66.9 L 298.6 73.4 L 294.4 79.1 L 291.0 85.1 L 289.5 92.0 L 290.6 99.0 L 294.1 104.9 L 300.2 108.0 L 307.3 109.0 L 314.2 107.8 L 319.9 103.7 L 325.1 98.4 L 330.4 93.1 L 335.6 87.9 L 340.9 82.6 L 346.4 78.1 L 352.3 74.3 L 358.9 72.3 L 365.7 70.8 L 372.5 69.2 L 379.3 67.7 L 386.3 67.7 L 391.5 71.7 L 392.0 78.6 L 388.8 84.7 L 383.4 89.6 L 378.0 94.5 L 372.6 99.4 L 367.2 104.3 L 361.8 109.2 L 357.3 114.8 L 354.1 120.9 L 351.7 127.3 L 350.9 134.4 L 351.2 141.5 L 352.2 148.5 L 354.8 154.9 L 359.0 160.6 L 364.2 165.8 L 369.8 170.4 L 375.6 174.3 L 381.3 178.3 L 387.3 181.8 L 393.2 185.5 L 399.3 188.7 L 405.2 192.5 L 411.1 196.2 L 417.2 199.4 L 423.2 202.9 L 429.6 205.4 L 436.6 204.6 L 441.3 199.4 L 444.1 193.1 L 446.6 186.7 L 449.1 180.3 L 451.1 173.7 L 453.2 167.2 L 454.2 160.2 L 454.2 152.7 L 453.2 145.7 L 452.2 138.7 L 450.6 131.9 L 449.0 125.2 L 447.1 118.5 L 444.9 112.0 L 442.2 105.7 L 439.4 99.4 L 436.4 93.2 L 433.3 87.1 L 429.9 81.1 L 426.1 75.3 L 421.9 69.5 L 416.5 64.7 L 410.8 60.5 L 404.6 57.4 L 398.3 54.7 L 391.8 52.4 L 385.0 50.9 L 378.2 49.4 L 371.4 47.8 L 364.6 46.3 L 357.9 44.8 L 351.1 43.2 L 344.3 41.7 L 337.5 40.2 L 330.7 38.7 L 323.8 37.3 L 316.9 36.0 L 310.1 34.6 L 303.3 33.1 L 296.5 31.5 L 289.4 30.8 L 282.1 30.5 L 274.9 30.0 L 267.8 30.9 L 260.6 31.5 L 253.8 33.1 L 246.9 34.4 L 240.1 35.6 L 233.2 37.1 L 226.6 38.9 L 219.9 40.7 Z",
    sector1Path:
      "M 159.7 56.9 L 153.0 58.5 L 146.4 60.5 L 139.6 62.1 L 132.9 63.8 L 126.2 65.7 L 119.6 67.7 L 112.8 69.2 L 106.3 71.3 L 99.5 72.8 L 92.9 74.9 L 86.1 76.4 L 79.5 78.4 L 72.8 80.1 L 66.3 82.5 L 60.0 85.1 L 53.8 88.1 L 48.4 92.5 L 45.8 98.9 L 45.9 105.9 L 49.6 111.8 L 55.0 116.7 L 60.4 121.6 L 64.7 127.2 L 64.9 134.3 L 62.6 140.8 L 58.7 146.6 L 55.5 152.7 L 53.0 159.1 L 51.6 165.9 L 51.0 173.1 L 51.5 180.3 L 53.0 187.1 L 54.5 193.9 L 57.4 200.1 L 60.9 206.1 L 65.4 211.7 L 70.7 216.9 L 76.3 221.1 L 82.3 224.5 L 88.5 227.6 L 95.0 229.8 L 101.7 231.6 L 108.4 233.4 L 115.0 235.3 L 121.8 237.0 L 128.5 238.6 L 135.1 240.6 L 141.9 242.1 L 148.5 244.1 L 155.3 245.7 L 162.1 247.2 L 168.7 249.2 L 175.5 250.8 L 182.2 252.5 L 188.9 254.3 L 195.5 256.1 L 202.2 257.9 L 209.0 259.4 L 215.6 261.4 L 222.4 263.0 L 229.1 264.7 L 235.8 266.6 L 242.6 268.1 L 249.3 269.7 L 256.0 271.6 L 262.5 273.7 L 269.3 275.2 L 276.1 276.8 L 282.8 278.6",
    sector2Path:
      "M 282.8 278.6 L 289.5 280.3 L 296.3 281.9 L 302.9 283.9 L 309.6 285.6 L 316.3 287.4 L 323.1 289.0 L 330.1 290.0 L 337.1 289.0 L 343.0 285.4 L 346.8 279.6 L 348.7 272.9 L 350.2 266.1 L 351.4 259.2 L 352.7 252.3 L 353.6 245.3 L 354.3 238.1 L 353.8 230.9 L 352.5 224.0 L 350.1 217.6 L 346.6 211.6 L 342.5 205.8 L 337.3 200.6 L 331.7 196.1 L 326.0 191.9 L 320.3 187.7 L 314.6 183.6 L 308.8 179.7 L 303.1 175.6 L 297.4 171.4 L 291.7 167.2 L 285.8 163.4 L 280.1 159.2 L 274.3 155.4 L 268.6 151.3 L 262.9 147.1 L 257.2 142.9 L 251.5 138.8 L 245.8 134.6 L 240.1 130.4 L 234.3 126.3 L 228.7 122.1 L 224.5 116.4 L 221.4 110.2 L 220.2 103.3 L 220.2 96.2 L 221.2 89.2 L 223.3 82.6 L 225.9 76.3 L 229.7 70.4 L 234.6 65.0 L 240.8 62.1 L 247.6 60.6 L 254.4 59.1 L 261.2 57.5 L 268.0 56.0 L 275.0 55.0 L 282.0 54.0 L 289.1 54.0 L 295.9 55.5 L 300.2 60.1 L 300.8 66.9 L 298.6 73.4 L 294.4 79.1 L 291.0 85.1 L 289.5 92.0 L 290.6 99.0 L 294.1 104.9 L 300.2 108.0 L 307.3 109.0 L 314.2 107.8 L 319.9 103.7 L 325.1 98.4 L 330.4 93.1 L 335.6 87.9 L 340.9 82.6 L 346.4 78.1 L 352.3 74.3 L 358.9 72.3 L 365.7 70.8 L 372.5 69.2 L 379.3 67.7 L 386.3 67.7 L 391.5 71.7 L 392.0 78.6 L 388.8 84.7 L 383.4 89.6 L 378.0 94.5 L 372.6 99.4 L 367.2 104.3 L 361.8 109.2 L 357.3 114.8 L 354.1 120.9 L 351.7 127.3 L 350.9 134.4 L 351.2 141.5 L 352.2 148.5 L 354.8 154.9 L 359.0 160.6 L 364.2 165.8 L 369.8 170.4 L 375.6 174.3 L 381.3 178.3 L 387.3 181.8 L 393.2 185.5",
    sector3Path:
      "M 393.2 185.5 L 399.3 188.7 L 405.2 192.5 L 411.1 196.2 L 417.2 199.4 L 423.2 202.9 L 429.6 205.4 L 436.6 204.6 L 441.3 199.4 L 444.1 193.1 L 446.6 186.7 L 449.1 180.3 L 451.1 173.7 L 453.2 167.2 L 454.2 160.2 L 454.2 152.7 L 453.2 145.7 L 452.2 138.7 L 450.6 131.9 L 449.0 125.2 L 447.1 118.5 L 444.9 112.0 L 442.2 105.7 L 439.4 99.4 L 436.4 93.2 L 433.3 87.1 L 429.9 81.1 L 426.1 75.3 L 421.9 69.5 L 416.5 64.7 L 410.8 60.5 L 404.6 57.4 L 398.3 54.7 L 391.8 52.4 L 385.0 50.9 L 378.2 49.4 L 371.4 47.8 L 364.6 46.3 L 357.9 44.8 L 351.1 43.2 L 344.3 41.7 L 337.5 40.2 L 330.7 38.7 L 323.8 37.3 L 316.9 36.0 L 310.1 34.6 L 303.3 33.1 L 296.5 31.5 L 289.4 30.8 L 282.1 30.5 L 274.9 30.0 L 267.8 30.9 L 260.6 31.5 L 253.8 33.1 L 246.9 34.4 L 240.1 35.6 L 233.2 37.1 L 226.6 38.9 L 219.9 40.7 L 213.1 42.2 L 206.5 44.3 L 199.7 45.9 L 193.1 47.8 L 186.4 49.5 L 179.7 51.4 L 173.0 53.2 L 166.3 55.0 L 159.7 56.9",
    turnsList: [{"num": "1", "x": 79.5, "y": 78.4}, {"num": "3", "x": 64.9, "y": 134.3}, {"num": "4", "x": 282.8, "y": 278.6}, {"num": "6", "x": 303.1, "y": 175.6}, {"num": "8", "x": 220.2, "y": 96.2}, {"num": "9", "x": 295.9, "y": 55.5}, {"num": "10", "x": 330.4, "y": 93.1}, {"num": "11", "x": 378.0, "y": 94.5}, {"num": "12", "x": 375.6, "y": 174.3}, {"num": "14", "x": 385.0, "y": 50.9}],
  },

  vegas: {
    id: "vegas",
    name: "Las Vegas Strip Circuit",
    city: "Las Vegas",
    country: "USA",
    lengthKm: "6.201",
    laps: 50,
    raceDistanceKm: "310.050",
    lapRecord: { time: "1:35.490", driver: "Oscar Piastri", year: 2023 },
    turns: 17,
    drsZones: 2,
    type: "Street Circuit • Anti-Clockwise",
    viewBox: "0 0 500 360",
    startFinish: { x: 90, y: 310 },
    // Las Vegas Strip street circuit (Sphere curve, Koval lane, Strip straight)
    svgPath:
      "M 80 320 L 80 180 C 80 140 105 110 145 110 L 210 110 C 230 110 245 95 245 75 L 245 45 C 245 30 265 25 275 40 L 320 100 C 340 125 370 135 400 135 L 440 135 C 470 135 480 165 460 185 L 420 225 C 400 245 410 275 435 285 L 460 295 C 475 300 470 325 450 325 L 100 325 C 85 325 80 325 80 320 Z",
  },

  losail: {
    id: "losail",
    name: "Lusail International Circuit",
    city: "Al Daayen",
    country: "Qatar",
    lengthKm: "5.419",
    laps: 57,
    raceDistanceKm: "308.611",
    lapRecord: { time: "1:24.319", driver: "Max Verstappen", year: 2023 },
    turns: 16,
    drsZones: 1,
    type: "Permanent Track • Clockwise",
    viewBox: "0 0 500 360",
    startFinish: { x: 250, y: 320 },
    // Lusail fast flowing sweepers and long straight
    svgPath:
      "M 120 325 L 390 325 C 430 325 455 295 440 260 L 405 185 C 390 155 405 120 435 105 L 460 90 C 475 80 465 50 440 50 L 370 50 C 340 50 320 70 315 100 L 310 130 C 305 160 280 180 250 175 L 210 170 C 180 165 165 140 170 110 L 175 75 C 180 45 150 25 125 35 L 75 55 C 45 70 35 110 55 135 L 90 180 C 110 205 105 240 80 260 L 60 275 C 40 290 50 325 80 325 L 120 325 Z",
  },

  yas_marina: {
    id: "yas_marina",
    name: "Yas Marina Circuit",
    city: "Abu Dhabi",
    country: "UAE",
    lengthKm: "5.281",
    laps: 58,
    raceDistanceKm: "306.183",
    lapRecord: { time: "1:26.103", driver: "Max Verstappen", year: 2021 },
    turns: 16,
    drsZones: 2,
    type: "Permanent / Twilight • Anti-Clockwise",
    viewBox: "0 0 500 360",
    startFinish: { x: 340, y: 310 },
    // Yas Marina modern layout with sweeping marina section
    svgPath:
      "M 320 320 L 420 320 C 450 320 465 295 450 270 L 410 200 C 395 175 410 140 435 125 L 455 115 C 475 105 470 70 445 65 L 360 50 C 320 45 285 70 280 110 L 275 150 C 270 190 230 215 190 205 L 120 190 C 85 180 60 145 65 110 L 70 70 C 75 40 40 20 20 40 L 15 50 C -5 70 0 105 20 125 L 70 180 C 95 210 90 255 60 280 L 45 295 C 30 310 40 330 65 330 L 220 330 C 250 330 275 310 290 285 L 305 260 C 320 235 350 235 365 260 L 380 285 C 390 305 375 320 350 320 Z",
  },

  albert_park: {
    id: "albert_park",
    name: "Albert Park Circuit",
    city: "Melbourne",
    country: "Australia",
    lengthKm: "5.278",
    laps: 58,
    raceDistanceKm: "306.124",
    lapRecord: { time: "1:19.813", driver: "Charles Leclerc", year: 2024 },
    turns: 14,
    drsZones: 4,
    type: "Street / Park Track • Clockwise",
    viewBox: "0 0 500 360",
    startFinish: { x: 260, y: 310 },
    svgPath:
      "M 220 320 L 360 320 C 400 320 425 290 410 255 L 375 175 C 365 150 380 120 405 105 L 435 85 C 455 70 445 40 420 40 L 330 40 C 295 40 270 65 265 100 L 260 140 C 255 175 225 200 190 195 L 140 185 C 110 180 90 150 95 120 L 100 85 C 105 55 75 35 50 50 L 35 60 C 15 75 15 110 35 130 L 85 185 C 110 215 105 260 75 285 L 55 300 C 40 315 50 330 75 330 L 220 320 Z",
  },

  shanghai: {
    id: "shanghai",
    name: "Shanghai International Circuit",
    city: "Shanghai",
    country: "China",
    lengthKm: "5.451",
    laps: 56,
    raceDistanceKm: "305.066",
    lapRecord: { time: "1:32.238", driver: "Michael Schumacher", year: 2004 },
    turns: 16,
    drsZones: 2,
    type: "Permanent Circuit • Clockwise",
    viewBox: "0 0 500 360",
    startFinish: { x: 180, y: 320 },
    svgPath:
      "M 140 320 L 260 320 C 310 320 345 285 335 235 L 325 185 C 315 135 350 90 400 90 L 440 90 C 470 90 480 60 455 45 L 395 20 C 360 5 320 20 305 55 L 290 90 C 275 125 235 145 195 135 L 135 120 C 90 110 55 145 65 190 L 75 230 C 85 270 55 310 15 310 L 5 310 C -5 310 -5 330 10 330 L 140 320 Z",
  },

  suzuka: {
    id: "suzuka",
    name: "Suzuka International Racing Course",
    city: "Suzuka",
    country: "Japan",
    lengthKm: "5.807",
    laps: 53,
    raceDistanceKm: "307.471",
    lapRecord: { time: "1:30.983", driver: "Lewis Hamilton", year: 2019 },
    turns: 18,
    drsZones: 1,
    type: "Figure-8 Permanent • Clockwise",
    viewBox: "0 0 500 360",
    startFinish: { x: 310, y: 315 },
    svgPath:
      "M 280 325 L 380 325 C 420 325 445 295 430 260 L 390 180 C 375 150 390 115 420 100 L 450 85 C 475 70 460 35 430 35 L 340 35 C 300 35 270 65 260 105 L 245 165 C 235 205 195 230 155 220 L 95 205 C 55 195 30 155 45 115 L 60 75 C 75 35 40 10 10 30 L 5 35 C -15 50 -10 85 10 105 L 70 175 C 100 210 95 265 60 295 L 45 310 C 30 325 45 340 70 340 L 280 325 Z",
  },

  monaco: {
    id: "monaco",
    name: "Circuit de Monaco",
    city: "Monte Carlo",
    country: "Monaco",
    lengthKm: "3.337",
    laps: 78,
    raceDistanceKm: "260.286",
    lapRecord: { time: "1:12.909", driver: "Lewis Hamilton", year: 2021 },
    turns: 19,
    drsZones: 1,
    type: "Historic Street Circuit • Clockwise",
    viewBox: "0 0 500 360",
    startFinish: { x: 280, y: 320 },
    svgPath:
      "M 250 325 L 360 325 C 400 325 425 295 410 260 L 385 205 C 375 180 390 150 415 135 L 440 120 C 465 105 455 70 425 65 L 340 50 C 300 45 265 70 255 110 L 245 150 C 235 190 195 215 155 205 L 95 190 C 60 180 35 145 40 110 L 45 70 C 50 40 15 20 -5 40 L -10 50 C -30 70 -25 105 -5 125 L 45 180 C 70 210 65 255 35 280 L 20 295 C 5 310 15 330 40 330 L 250 325 Z",
  },

  silverstone: {
    id: "silverstone",
    name: "Silverstone Circuit",
    city: "Silverstone",
    country: "UK",
    lengthKm: "5.891",
    laps: 52,
    raceDistanceKm: "306.198",
    lapRecord: { time: "1:27.097", driver: "Max Verstappen", year: 2020 },
    turns: 18,
    drsZones: 2,
    type: "Historic High-Speed • Clockwise",
    viewBox: "0 0 500 360",
    startFinish: { x: 300, y: 320 },
    svgPath:
      "M 260 325 L 390 325 C 430 325 455 290 435 255 L 395 180 C 380 150 400 115 430 100 L 455 85 C 475 70 460 35 430 35 L 330 35 C 290 35 260 65 250 105 L 240 155 C 230 195 190 220 150 210 L 90 195 C 55 185 30 150 40 115 L 50 75 C 60 40 25 15 0 35 L -5 40 C -25 55 -20 90 0 110 L 55 180 C 85 215 80 265 50 295 L 35 310 C 20 325 35 340 60 340 L 260 325 Z",
  },

  spa: {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    city: "Stavelot",
    country: "Belgium",
    lengthKm: "7.004",
    laps: 44,
    raceDistanceKm: "308.052",
    lapRecord: { time: "1:46.286", driver: "Valtteri Bottas", year: 2018 },
    turns: 19,
    drsZones: 2,
    type: "Ardennes High-Speed Rollercoaster",
    viewBox: "0 0 500 360",
    startFinish: { x: 230, y: 325 },
    svgPath:
      "M 200 330 L 340 330 C 380 330 405 300 395 265 L 380 215 C 370 180 390 145 425 130 L 455 115 C 480 100 470 65 440 60 L 340 45 C 300 40 265 65 255 105 L 245 155 C 235 195 190 220 150 210 L 80 190 C 45 180 20 140 30 100 L 40 60 C 50 25 15 5 -10 25 L -20 35 C -40 55 -35 90 -15 110 L 45 185 C 75 220 70 270 35 300 L 20 315 C 5 330 20 345 45 345 L 200 330 Z",
  },

  monza: {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    city: "Monza",
    country: "Italy",
    lengthKm: "5.793",
    laps: 53,
    raceDistanceKm: "306.720",
    lapRecord: { time: "1:21.046", driver: "Rubens Barrichello", year: 2004 },
    turns: 11,
    drsZones: 2,
    type: "Temple of Speed • Low Downforce",
    viewBox: "0 0 500 360",
    startFinish: { x: 240, y: 320 },
    svgPath:
      "M 190 325 L 390 325 C 435 325 465 290 450 245 L 420 160 C 410 130 430 95 460 85 L 475 80 C 490 75 485 50 465 45 L 350 25 C 310 15 270 35 255 75 L 235 125 C 220 165 180 190 140 185 L 80 175 C 45 170 20 135 25 100 L 30 65 C 35 35 5 15 -15 35 L -20 40 C -40 60 -35 95 -15 115 L 40 185 C 70 220 65 270 35 300 L 20 315 C 5 330 20 345 45 345 L 190 325 Z",
  },
};

/**
 * Fallback procedural track generator when an exact circuit path isn't explicitly defined.
 */
export function getCircuitData(circuitId: string, fallbackName = "", fallbackCountry = "", fallbackCity = ""): CircuitData {
  const normId = circuitId.toLowerCase().replace(/[^a-z0-9]/g, "_");

  // Direct match
  if (CIRCUITS_DATA[normId]) {
    return CIRCUITS_DATA[normId];
  }

  // Substring match
  for (const key of Object.keys(CIRCUITS_DATA)) {
    if (normId.includes(key) || key.includes(normId)) {
      return CIRCUITS_DATA[key];
    }
  }

  // Country/City matching
  const cNorm = fallbackCountry.toLowerCase();
  if (cNorm.includes("brazil")) return CIRCUITS_DATA.interlagos;
  if (cNorm.includes("vegas") || normId.includes("vegas")) return CIRCUITS_DATA.vegas;
  if (cNorm.includes("qatar") || normId.includes("losail")) return CIRCUITS_DATA.losail;
  if (cNorm.includes("abu dhabi") || cNorm.includes("uae") || normId.includes("yas")) return CIRCUITS_DATA.yas_marina;
  if (cNorm.includes("australia") || normId.includes("albert")) return CIRCUITS_DATA.albert_park;
  if (cNorm.includes("china") || normId.includes("shanghai")) return CIRCUITS_DATA.shanghai;
  if (cNorm.includes("japan") || normId.includes("suzuka")) return CIRCUITS_DATA.suzuka;
  if (cNorm.includes("monaco")) return CIRCUITS_DATA.monaco;
  if (cNorm.includes("united kingdom") || cNorm.includes("uk") || normId.includes("silverstone")) return CIRCUITS_DATA.silverstone;
  if (cNorm.includes("belgium") || normId.includes("spa")) return CIRCUITS_DATA.spa;
  if (cNorm.includes("italy") || normId.includes("monza")) return CIRCUITS_DATA.monza;

  // Generic procedural FIA grade 1 track
  return {
    id: normId || "circuit",
    name: fallbackName || "Grand Prix Circuit",
    city: fallbackCity || "Host City",
    country: fallbackCountry || "FIA World Tour",
    lengthKm: "5.250",
    laps: 55,
    raceDistanceKm: "305.250",
    lapRecord: { time: "1:22.450", driver: "Formula 1 Record", year: 2024 },
    turns: 16,
    drsZones: 2,
    type: "FIA Grade 1 Circuit • Clockwise",
    viewBox: "0 0 500 360",
    startFinish: { x: 260, y: 320 },
    svgPath:
      "M 160 320 L 360 320 C 400 320 430 290 415 250 L 380 170 C 365 140 385 105 415 90 L 445 75 C 470 60 460 25 430 25 L 330 25 C 290 25 260 55 250 95 L 240 145 C 230 185 190 210 150 200 L 90 185 C 55 175 30 140 40 105 L 50 65 C 60 30 25 10 0 30 L -5 35 C -25 50 -20 85 0 105 L 55 175 C 85 210 80 260 50 290 L 35 305 C 20 320 35 335 60 335 L 160 320 Z",
  };
}

