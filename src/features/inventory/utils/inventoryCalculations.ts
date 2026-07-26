import { addDays } from 'date-fns';

export function calculateExpectedEndDate(registeredAt: Date, cycleDays: number): Date {
  return addDays(registeredAt, cycleDays);
}
