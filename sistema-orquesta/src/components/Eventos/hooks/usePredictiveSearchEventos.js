import { useState, useEffect, useRef } from 'react';
import { suggestEventos } from '../../../api/eventos';

export default function usePredictiveSearchEventos(term, { delay = 300, minLength = 2 } = {}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const termRef = useRef(term);

  useEffect(() => {
    termRef.current = term;
    if (!term || term.trim().length < minLength) {
      setResults([]);
      return; 
    }
    const handle = setTimeout(async () => {
      try {
        setLoading(true); setError(null);
        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();
        const data = await suggestEventos(term);
        // Evitar race conditions
        if (termRef.current === term) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (err.name !== 'CanceledError') setError(err);
      } finally {
        if (termRef.current === term) setLoading(false);
      }
    }, delay);
    return () => clearTimeout(handle);
  }, [term, delay, minLength]);

  return { results, loading, error };
}
