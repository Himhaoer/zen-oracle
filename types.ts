import React from 'react';

export enum OracleMethod {
  HE_LUO = 'HE_LUO', // 河洛理数
  MEI_HUA = 'MEI_HUA', // 梅花易数
  CE_ZI = 'CE_ZI', // 测字
}

export type Gender = 'male' | 'female';

export interface UserProfile {
  id: string; // Unique ID for profile
  name: string;
  gender: Gender;
  birthDate: string;
  occupation: string; 
  bio: string; 
  soulCards: SoulCard[]; // History of generated cards for this user
}

export interface SoulCard {
  id: string;
  timestamp: number;
  imageUrl: string;
  description: string; 
}

export interface ReadingRequest {
  method: OracleMethod;
  query: string;
  gender?: Gender; // Critical for He Luo
  // Specific inputs
  birthDate?: string; 
  birthTime?: string; 
  tapInterval1?: number; 
  tapInterval2?: number;
  character?: string; 
}

export interface ReadingResult {
  id: string;
  timestamp: number;
  method: OracleMethod;
  query: string;
  content: string; 
  summary: string; 
  imageUrl?: string; 
}

export interface NavItem {
  id: OracleMethod;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}