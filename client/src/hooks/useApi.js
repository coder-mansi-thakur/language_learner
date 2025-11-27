import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { config } from '../config/development';

export const useGet = (endpoint, options = {}) => {
  const { enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !endpoint) {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}${endpoint}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const usePost = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = useCallback(async (endpoint, body) => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.API_BASE_URL}${endpoint}`, body);
      setData(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { post, data, loading, error };
};
