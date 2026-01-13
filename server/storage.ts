import { type User, type InsertUser, type Preset, type InsertPreset, defaultAmpSettings } from "@shared/schema";
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
      {
        name: 'DJENT MASTER',
        settings: {
          ...defaultAmpSettings,
          inputGain: 6,
          bass: 5,
          mid: 3,
          treble: 7,
          presence: 6,
          drive: 8,
          punish: true,
          plus10db: false,
          plusLow: false,
          masterVolume: 5,
        },
        isFactory: true,
      },
      {
        name: 'THALL CRUSH',
        settings: {
          ...defaultAmpSettings,
          inputGain: 7,
          bass: 7,
          mid: 2,
          treble: 6,
          presence: 5,
          drive: 9,
          punish: true,
          plus10db: true,
          plusLow: true,
          masterVolume: 4,
          irIndex: 1,
        },
        isFactory: true,
      },
      {
        name: 'PERIPHERY CLEAN',
        settings: {
          ...defaultAmpSettings,
          inputGain: 4,
          bass: 6,
          mid: 5,
          treble: 6,
          presence: 7,
          drive: 5,
          punish: false,
          plus10db: false,
          plusLow: false,
          masterVolume: 6,
          irIndex: 2,
        },
        isFactory: true,
      },
      {
        name: 'MESHUGGAH CHUG',
        settings: {
          ...defaultAmpSettings,
          inputGain: 8,
          bass: 4,
          mid: 4,
          treble: 8,
          presence: 7,
          drive: 9,
          punish: true,
          plus10db: true,
          plusLow: false,
          masterVolume: 5,
          irIndex: 4,
        },
        isFactory: true,
      },
      {
        name: 'AAL BRIGHT',
        settings: {
          ...defaultAmpSettings,
          inputGain: 5,
          bass: 5,
          mid: 6,
          treble: 8,
          presence: 8,
          drive: 6,
          punish: true,
          plus10db: false,
          plusLow: false,
          masterVolume: 5,
          irIndex: 5,
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
    const preset: Preset = { id, ...insertPreset };
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
