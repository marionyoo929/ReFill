export type ImportanceLevel = 'essential' | 'important' | 'normal' | 'low';

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  brand?: string;
  cycleDays: number;
  importance: ImportanceLevel;
  registeredAt: Date;
  expectedEndDate: Date;
};

export type InventoryItemInput = {
  name: string;
  category: string;
  brand?: string;
  cycleDays: number;
  importance: ImportanceLevel;
};
