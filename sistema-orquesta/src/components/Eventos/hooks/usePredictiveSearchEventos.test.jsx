import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import usePredictiveSearchEventos from './usePredictiveSearchEventos.js';
import * as api from '../../../api/eventos';

// Mock de suggestEventos
vi.mock('../../../api/eventos', () => ({
  suggestEventos: vi.fn()
}));

// Usaremos timers reales para simplificar comportamiento debounce

describe('usePredictiveSearchEventos', () => {
  beforeEach(() => {
    api.suggestEventos.mockReset();
  });

  it('no llama API si longitud menor a minLength', async () => {
    const { result } = renderHook(() => usePredictiveSearchEventos('a', { delay:50 }));
    await new Promise(r => setTimeout(r, 80));
    expect(api.suggestEventos).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it('hace debounce y devuelve resultados', async () => {
    api.suggestEventos.mockResolvedValueOnce([{ id:1, titulo:'Evento 1'}]);
    const { result } = renderHook(() => usePredictiveSearchEventos('ev', { delay:50 }));
    // Antes del delay no se llama
    expect(api.suggestEventos).not.toHaveBeenCalled();
    await new Promise(r => setTimeout(r, 60));
    await waitFor(() => {
      expect(api.suggestEventos).toHaveBeenCalledWith('ev');
      expect(result.current.results.length).toBe(1);
      expect(result.current.loading).toBe(false);
    });
  });

  it('maneja abort entre términos rápidos', async () => {
    // Primera llamada devuelve algo distinto y tardío; segunda produce resultado final
    const slowPromise = new Promise(res => setTimeout(() => res([{ id:99, titulo:'OLD'}]), 120));
    api.suggestEventos
      .mockReturnValueOnce(slowPromise)
      .mockResolvedValueOnce([{ id:1, titulo:'E1'}]);
    const { rerender, result } = renderHook((p) => usePredictiveSearchEventos(p, { delay:40 }), { initialProps: 'even' });
    // Esperamos a que el primer debounce dispare la llamada (delay ~40ms) pero NO resuelva aún (slowPromise 120ms)
    await new Promise(r => setTimeout(r, 50));
    expect(api.suggestEventos).toHaveBeenCalledTimes(1);
    // Ahora cambiamos el término -> abort anterior y programa nueva llamada
    rerender('evento');
    // Esperar a que segundo debounce + resolución rápida ocurra
    await new Promise(r => setTimeout(r, 100));
    await waitFor(() => {
      expect(api.suggestEventos).toHaveBeenCalledTimes(2);
      expect(result.current.results[0].titulo).toBe('E1');
    });
  });
});
