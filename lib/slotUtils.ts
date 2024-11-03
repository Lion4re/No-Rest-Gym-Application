import { parseISO, getDay, setHours, setMinutes, isBefore, isAfter } from 'date-fns';

export function isValidSlotTime(date: string, time: string): boolean {
  const slotDate = parseISO(date);
  const [hours, minutes] = time.split(':').map(Number);
  const slotTime = setMinutes(setHours(slotDate, hours), minutes);
  const dayOfWeek = getDay(slotDate);

  switch (dayOfWeek) {
    case 0: // Sunday
      return false;
    case 6: // Saturday
      return !isBefore(slotTime, setHours(slotDate, 9)) && !isAfter(slotTime, setHours(slotDate, 16));
    default: // Monday to Friday
      return !isBefore(slotTime, setHours(slotDate, 9)) && !isAfter(slotTime, setHours(slotDate, 21));
  }
}