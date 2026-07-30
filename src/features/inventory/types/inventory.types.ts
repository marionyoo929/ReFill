export type InventoryItem = {
  id: string;
  name: string;
  brand?: string;
  cycleDays: number;
  capacityValue?: number;
  capacityUnit?: string;
  registeredAt: Date;
  expectedEndDate: Date;
  purchaseHistory?: Date[];
  notificationEnabled?: boolean;
  notificationLeadTimeDays?: number;
};

export type InventoryItemInput = {
  name: string;
  brand?: string;
  cycleDays: number;
  capacityValue?: number;
  capacityUnit?: string;
  registeredAt?: Date;
  purchaseHistory?: Date[];
  notificationEnabled?: boolean;
  notificationLeadTimeDays?: number;
};
