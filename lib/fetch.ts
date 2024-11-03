import { useState, useEffect, useCallback } from "react";

export const fetchAPI = async (url: string, options?: RequestInit & { disableLogging?: boolean }) => {
    const { disableLogging, ...fetchOptions } = options || {};
    // console.log('fetchAPI - Starting request');
    // console.log('fetchAPI - URL:', url);
    // console.log('fetchAPI - Options:', JSON.stringify(fetchOptions, null, 2));

    try {
        // console.log('fetchAPI - Initiating fetch');
        const startTime = Date.now();
        const response = await fetch(url, fetchOptions);
        const endTime = Date.now();
        // console.log(`fetchAPI - Fetch completed in ${endTime - startTime}ms`);

        // console.log('fetchAPI - Response status:', response.status);
        // console.log('fetchAPI - Response status text:', response.statusText);
        // console.log('fetchAPI - Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

        if (!response.ok) {
            console.error(`fetchAPI - HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // console.log('fetchAPI - Reading response body');
        const text = await response.text();
        
        if (!disableLogging) {
            // console.log("fetchAPI - Raw response:", text.substring(0, 1000) + (text.length > 1000 ? '...' : ''));
        }

        try {
            // console.log('fetchAPI - Parsing JSON response');
            const jsonResponse = JSON.parse(text);
            // console.log('fetchAPI - Parsed JSON:', JSON.stringify(jsonResponse, null, 2));
            return jsonResponse;
        } catch (e) {
            console.error("fetchAPI - Failed to parse JSON:", e);
            console.error("fetchAPI - Raw response that failed to parse:", text);
            throw new Error("Invalid JSON response");
        }
    } catch (error) {
        console.error("fetchAPI - Fetch error:", error);
        if (error instanceof Error) {
            console.error("fetchAPI - Error name:", error.name);
            console.error("fetchAPI - Error message:", error.message);
            console.error("fetchAPI - Error stack:", error.stack);
        }
        throw error;
    } finally {
        // console.log('fetchAPI - Request completed');
    }
};

export const useFetch = <T>(url: string, options?: RequestInit & { disableLogging?: boolean }) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchAPI(url, options);
            setData(result.data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};