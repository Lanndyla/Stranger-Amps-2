import { type User, type InsertUser, type Preset, type InsertPreset, type AmpSettings, defaultAmpSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPresets(): Promise<Preset[]>;
  getPreset(id: string): Promise<Preset | undefined>;
  createPreset(preset: InsertPreset): Promise<Preset>;
  deletePreset(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private presets: Map<string, Preset>;

  constructor() {
    this.users = new Map();
    this.presets = new Map();
    
    this.initializeFactoryPresets();
  }

  private initializeFactoryPresets() {
    const factoryPresets: Omit<Preset, 'id'>[] = [
      {
        name: 'INIT',
        settings: defaultAmpSettings,
        isFactory: true,
      },
      // HIGH GAIN DJENT PRESETS
      {
        name: 'DJENT MASTER',
        settings: {
          ...defaultAmpSettings,
          inputGain: 7,
          bass: 5,
          mid: 3,
          treble: 8,
          presence: 7,
          drive: 9,
          punish: true,
          plus10db: true,
          plusLow: false,
          masterVolume: 5,
          irIndex: 0,
          aiEnhance: true,
          aiTuning: 'dropA',
          thickenEnabled: true,
          thicken: 30,
          chugEnabled: true,
          chugEnhance: 40,
          peqEnabled: true,
          peqBand1Freq: 80,
          peqBand1Gain: -3,
          peqBand1Q: 1.2,
          peqBand2Freq: 400,
          peqBand2Gain: -2,
          peqBand2Q: 1.5,
          peqBand3Freq: 2500,
          peqBand3Gain: 3,
          peqBand3Q: 1.0,
          peqBand4Freq: 6000,
          peqBand4Gain: 2,
          peqBand4Q: 0.8,
        },
        isFactory: true,
      },
      {
        name: 'THALL DESTROYER',
        settings: {
          ...defaultAmpSettings,
          inputGain: 8,
          bass: 8,
          mid: 2,
          treble: 7,
          presence: 5,
          drive: 10,
          punish: true,
          plus10db: true,
          plusLow: true,
          masterVolume: 4,
          irIndex: 1,
          aiEnhance: true,
          aiTuning: 'dropE',
          thickenEnabled: true,
          thicken: 50,
          chugEnabled: true,
          chugEnhance: 70,
          pitchEnabled: true,
          pitchShift: -12,
          peqEnabled: true,
          peqBand1Freq: 60,
          peqBand1Gain: 4,
          peqBand1Q: 0.8,
          peqBand2Freq: 250,
          peqBand2Gain: -4,
          peqBand2Q: 2.0,
          peqBand3Freq: 3000,
          peqBand3Gain: 3,
          peqBand3Q: 1.2,
          peqBand4Freq: 8000,
          peqBand4Gain: -2,
          peqBand4Q: 1.0,
        },
        isFactory: true,
      },
      {
        name: 'MESHUGGAH POLYRHYTHM',
        settings: {
          ...defaultAmpSettings,
          inputGain: 8,
          bass: 4,
          mid: 4,
          treble: 9,
          presence: 8,
          drive: 9,
          punish: true,
          plus10db: true,
          plusLow: false,
          masterVolume: 5,
          irIndex: 4,
          aiEnhance: true,
          aiTuning: 'dropB',
          thickenEnabled: true,
          thicken: 25,
          chugEnabled: true,
          chugEnhance: 55,
          peqEnabled: true,
          peqBand1Freq: 100,
          peqBand1Gain: -2,
          peqBand1Q: 1.0,
          peqBand2Freq: 800,
          peqBand2Gain: 2,
          peqBand2Q: 1.5,
          peqBand3Freq: 3500,
          peqBand3Gain: 4,
          peqBand3Q: 1.0,
          peqBand4Freq: 10000,
          peqBand4Gain: 1,
          peqBand4Q: 0.7,
        },
        isFactory: true,
      },
      {
        name: 'AAL PRECISION',
        settings: {
          ...defaultAmpSettings,
          inputGain: 6,
          bass: 5,
          mid: 5,
          treble: 8,
          presence: 8,
          drive: 7,
          punish: true,
          plus10db: false,
          plusLow: false,
          masterVolume: 5,
          irIndex: 5,
          aiEnhance: true,
          aiTuning: 'dropA',
          thickenEnabled: true,
          thicken: 20,
          chugEnabled: false,
          chugEnhance: 0,
          peqEnabled: true,
          peqBand1Freq: 120,
          peqBand1Gain: -1,
          peqBand1Q: 1.0,
          peqBand2Freq: 500,
          peqBand2Gain: 1,
          peqBand2Q: 1.2,
          peqBand3Freq: 2800,
          peqBand3Gain: 3,
          peqBand3Q: 1.0,
          peqBand4Freq: 7000,
          peqBand4Gain: 2,
          peqBand4Q: 0.8,
        },
        isFactory: true,
      },
      {
        name: '8-STRING BRUTALITY',
        settings: {
          ...defaultAmpSettings,
          inputGain: 9,
          bass: 7,
          mid: 3,
          treble: 7,
          presence: 6,
          drive: 10,
          punish: true,
          plus10db: true,
          plusLow: true,
          masterVolume: 4,
          irIndex: 3,
          aiEnhance: true,
          aiTuning: 'dropE',
          thickenEnabled: true,
          thicken: 60,
          chugEnabled: true,
          chugEnhance: 80,
          pitchEnabled: false,
          peqEnabled: true,
          peqBand1Freq: 50,
          peqBand1Gain: 5,
          peqBand1Q: 0.7,
          peqBand2Freq: 300,
          peqBand2Gain: -5,
          peqBand2Q: 2.5,
          peqBand3Freq: 2000,
          peqBand3Gain: 2,
          peqBand3Q: 1.0,
          peqBand4Freq: 5000,
          peqBand4Gain: 3,
          peqBand4Q: 1.0,
        },
        isFactory: true,
      },
      // CLEAN ATMOSPHERIC PRESETS
      {
        name: 'AMBIENT SHIMMER',
        settings: {
          ...defaultAmpSettings,
          inputGain: 4,
          bass: 5,
          mid: 6,
          treble: 7,
          presence: 8,
          drive: 2,
          punish: false,
          plus10db: false,
          plusLow: false,
          cleanse: true,
          masterVolume: 6,
          irIndex: 2,
          reverbEnabled: true,
          reverbType: 'hall',
          reverbMix: 7,
          reverbDecay: 8,
          pitchEnabled: true,
          pitchShift: 12,
          peqEnabled: true,
          peqBand1Freq: 80,
          peqBand1Gain: -2,
          peqBand1Q: 1.0,
          peqBand2Freq: 400,
          peqBand2Gain: 1,
          peqBand2Q: 1.0,
          peqBand3Freq: 3000,
          peqBand3Gain: 3,
          peqBand3Q: 0.8,
          peqBand4Freq: 12000,
          peqBand4Gain: 4,
          peqBand4Q: 0.6,
        },
        isFactory: true,
      },
      {
        name: 'CRYSTAL CLEAN',
        settings: {
          ...defaultAmpSettings,
          inputGain: 4,
          bass: 6,
          mid: 5,
          treble: 6,
          presence: 7,
          drive: 3,
          punish: false,
          plus10db: false,
          plusLow: false,
          cleanse: true,
          masterVolume: 6,
          irIndex: 2,
          reverbEnabled: true,
          reverbType: 'room',
          reverbMix: 4,
          reverbDecay: 5,
          peqEnabled: true,
          peqBand1Freq: 100,
          peqBand1Gain: -1,
          peqBand1Q: 1.0,
          peqBand2Freq: 600,
          peqBand2Gain: 2,
          peqBand2Q: 1.2,
          peqBand3Freq: 2500,
          peqBand3Gain: 2,
          peqBand3Q: 1.0,
          peqBand4Freq: 8000,
          peqBand4Gain: 1,
          peqBand4Q: 0.8,
        },
        isFactory: true,
      },
      {
        name: 'POST-ROCK WASH',
        settings: {
          ...defaultAmpSettings,
          inputGain: 5,
          bass: 4,
          mid: 5,
          treble: 6,
          presence: 6,
          drive: 4,
          punish: false,
          plus10db: false,
          plusLow: false,
          cleanse: false,
          masterVolume: 5,
          irIndex: 5,
          reverbEnabled: true,
          reverbType: 'plate',
          reverbMix: 8,
          reverbDecay: 9,
          lofi: true,
          peqEnabled: true,
          peqBand1Freq: 150,
          peqBand1Gain: -3,
          peqBand1Q: 1.5,
          peqBand2Freq: 700,
          peqBand2Gain: 2,
          peqBand2Q: 1.0,
          peqBand3Freq: 2200,
          peqBand3Gain: 1,
          peqBand3Q: 1.2,
          peqBand4Freq: 6000,
          peqBand4Gain: -2,
          peqBand4Q: 1.0,
        },
        isFactory: true,
      },
      {
        name: 'ETHEREAL PAD',
        settings: {
          ...defaultAmpSettings,
          inputGain: 3,
          bass: 6,
          mid: 4,
          treble: 5,
          presence: 5,
          drive: 2,
          punish: false,
          plus10db: false,
          plusLow: false,
          cleanse: true,
          masterVolume: 7,
          irIndex: 2,
          reverbEnabled: true,
          reverbType: 'hall',
          reverbMix: 9,
          reverbDecay: 10,
          thickenEnabled: true,
          thicken: 40,
          pitchEnabled: true,
          pitchShift: 7,
          peqEnabled: true,
          peqBand1Freq: 60,
          peqBand1Gain: 2,
          peqBand1Q: 0.8,
          peqBand2Freq: 350,
          peqBand2Gain: -2,
          peqBand2Q: 1.5,
          peqBand3Freq: 1800,
          peqBand3Gain: 1,
          peqBand3Q: 1.0,
          peqBand4Freq: 10000,
          peqBand4Gain: 3,
          peqBand4Q: 0.6,
        },
        isFactory: true,
      },
      {
        name: 'LOFI DREAMS',
        settings: {
          ...defaultAmpSettings,
          inputGain: 4,
          bass: 5,
          mid: 5,
          treble: 4,
          presence: 4,
          drive: 3,
          punish: false,
          plus10db: false,
          plusLow: false,
          cleanse: false,
          lofi: true,
          masterVolume: 6,
          irIndex: 1,
          reverbEnabled: true,
          reverbType: 'plate',
          reverbMix: 6,
          reverbDecay: 7,
          peqEnabled: true,
          peqBand1Freq: 200,
          peqBand1Gain: 2,
          peqBand1Q: 1.0,
          peqBand2Freq: 800,
          peqBand2Gain: 1,
          peqBand2Q: 1.2,
          peqBand3Freq: 4000,
          peqBand3Gain: -4,
          peqBand3Q: 0.8,
          peqBand4Freq: 10000,
          peqBand4Gain: -6,
          peqBand4Q: 0.5,
        },
        isFactory: true,
      },
    ];

    factoryPresets.forEach((preset) => {
      const id = randomUUID();
      this.presets.set(id, { id, ...preset });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPresets(): Promise<Preset[]> {
    return Array.from(this.presets.values()).sort((a, b) => {
      if (a.isFactory && !b.isFactory) return -1;
      if (!a.isFactory && b.isFactory) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  async getPreset(id: string): Promise<Preset | undefined> {
    return this.presets.get(id);
  }

  async createPreset(insertPreset: InsertPreset): Promise<Preset> {
    const id = randomUUID();
    const preset = { 
      id, 
      name: insertPreset.name,
      settings: insertPreset.settings as AmpSettings,
      isFactory: insertPreset.isFactory ?? false,
    } satisfies Preset;
    this.presets.set(id, preset);
    return preset;
  }

  async deletePreset(id: string): Promise<boolean> {
    const preset = this.presets.get(id);
    if (preset && !preset.isFactory) {
      this.presets.delete(id);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
