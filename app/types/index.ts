export type ProfileUriData = {
  name: string;
  image: string;
  attributes: [
    { trait_type: "name"; value: string },
    { trait_type: "about"; value: string },
    { trait_type: "email"; value: string },
    { trait_type: "website"; value: string },
    { trait_type: "twitter"; value: string },
    { trait_type: "telegram"; value: string },
    { trait_type: "instagram"; value: string }
  ];
};

export type BossUriData = {
  image: string;
  name: string;
  location: string;
  health: number;
};

export type BossFightRecord = {
  account: `0x${string}`;
  date: number;
  boss: string;
  distance: number;
  co2: number;
};
