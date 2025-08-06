import { useEffect } from 'react';

const useSSE = (url, onMessage, body) => {
  useEffect(() => {

    if (!url || !body) return;
    
    const controller = new AbortController();
    const signal = controller.signal;
    let buffer = '';

    const fetchSSE = async () => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Could not get a reader from the response body.");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          let messageEnd = buffer.indexOf('\n\n');

          while (messageEnd !== -1) {
            const message = buffer.substring(0, messageEnd);
            buffer = buffer.substring(messageEnd + 2);

            if (message.startsWith('data: ')) {
              try {
                const data = JSON.parse(message.substring(6));
                onMessage(data);
              } catch (e) {
                console.error("Failed to parse SSE data:", e);
              }
            }

            messageEnd = buffer.indexOf('\n\n');
          }
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("SSE fetch error:", error);
        }
      }
    };

    fetchSSE();

    return () => {
      controller.abort();
    };
  }, [url, JSON.stringify(body)]); // Re-run if URL or body changes
};

export default useSSE;
