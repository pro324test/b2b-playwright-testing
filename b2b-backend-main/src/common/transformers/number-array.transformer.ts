import { Transform } from 'class-transformer';

export function ToNumberArray() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      // Try JSON parse first
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map(v => Number(v));
        }
        return [Number(parsed)];
      } catch {
        // If JSON parsing fails, try splitting by comma
        return value.split(',').map(v => Number(v.trim()));
      }
    }
    if (Array.isArray(value)) {
      return value.map(v => Number(v));
    }
    return value;
  });
}