// shared/schema.ts
import { z } from 'zod';

// Координати
export const coordinatesSchema = z.object({
  lat: z.number(),
  lon: z.number()
});

// Стара версия на birthData схемата (за обратна съвместимост)
const legacyBirthDataSchema = z.object({
  name: z.string(),
  gender: z.enum(['Мъж', 'Жена']),
  year: z.number().min(1900).max(new Date().getFullYear()),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  second: z.number().min(0).max(59).optional().default(0),
  city: z.string(),
  country: z.string()
});

// Нова версия на birthData схемата
const modernBirthDataSchema = z.object({
  name: z.string(),
  gender: z.enum(['Мъж', 'Жена', 'male', 'female']).transform(val => {
    // Преобразуваме английски стойности към български
    if (val === 'male') return 'Мъж';
    if (val === 'female') return 'Жена';
    return val;
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Датата трябва да е във формат YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Часът трябва да е във формат HH:MM или HH:MM:SS'),
  city: z.string().optional(),
  country: z.string().optional()
});

// Комбинирана схема, която поддържа и двата формата
export const birthDataSchema = z.union([
  legacyBirthDataSchema,
  modernBirthDataSchema.transform(data => {
    // Преобразуваме новия формат към стария за съвместимост
    const [year, month, day] = data.date.split('-').map(Number);
    const timeParts = data.time.split(':').map(Number);
    const hour = timeParts[0];
    const minute = timeParts[1];
    const second = timeParts[2] || 0;
    
    return {
      name: data.name,
      gender: data.gender as 'Мъж' | 'Жена',
      year,
      month,
      day,
      hour,
      minute,
      second,
      city: data.city || '',
      country: data.country || ''
    };
  })
]);

// Схема за заявка за прогноза
export const forecastRequestSchema = z.object({
  birthData: birthDataSchema,
  coordinates: coordinatesSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

// Типове
export type BirthData = z.infer<typeof legacyBirthDataSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type ForecastRequest = z.infer<typeof forecastRequestSchema>;
