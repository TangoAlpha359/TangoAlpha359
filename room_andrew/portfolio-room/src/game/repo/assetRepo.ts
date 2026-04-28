export type CharacterAsset = {
  key: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
};

export const characterAssets: CharacterAsset[] = [
  { key: "player", url: "/assets/sprites/player.png", frameWidth: 48, frameHeight: 48 },
  { key: "jamaal", url: "/assets/sprites/jamaal.png", frameWidth: 48, frameHeight: 48 },
  { key: "jonathan", url: "/assets/sprites/jonathan.png", frameWidth: 48, frameHeight: 48 },
  { key: "kapa", url: "/assets/sprites/kapa.png", frameWidth: 48, frameHeight: 48 },
];
