import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import EventosCalendar from './EventosCalendar.jsx';

// Para estabilidad del snapshot conteo, fijamos fecha actual
const RealDate = Date;
beforeAll(() => {
  const fixed = new Date('2025-01-15T12:00:00Z');
  globalThis.Date = class extends RealDate {
    constructor(...args){
      if (args.length === 0) return fixed; // now
      return new RealDate(...args);
    }
    static now(){ return fixed.getTime(); }
  };
});
afterAll(() => { globalThis.Date = RealDate; });

describe('EventosCalendar', () => {
  it('genera exactamente 42 celdas (6 semanas)', () => {
    const { container } = render(<EventosCalendar eventos={[]} />);
    const dayCells = container.querySelectorAll('.grid.grid-cols-7.gap-1.mt-1.relative > div');
    expect(dayCells.length).toBe(42);
  });
});
