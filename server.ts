import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import net from "net";
import dotenv from "dotenv";

dotenv.config();

async function getAvailablePort(startPort: number, endPort: number): Promise<number> {
  const tryPort = (port: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const server = net.createServer();

      server.once("error", (error: any) => {
        server.close();
        if (error.code === "EADDRINUSE") {
          if (port < endPort) {
            resolve(tryPort(port + 1));
          } else {
            reject(new Error(`No available ports between ${startPort} and ${endPort}`));
          }
          return;
        }
        reject(error);
      });

      server.once("listening", () => {
        server.close(() => resolve(port));
      });

      server.listen(port, "0.0.0.0");
    });
  };

  return tryPort(startPort);
}

async function startServer() {
  const app = express();
  const requestedPort = Number(process.env.PORT) || 3000;
  const PORT = await getAvailablePort(requestedPort, requestedPort + 5);

  app.use(express.json());

  // SerpApi Proxy Route
  app.get("/api/search", async (req, res) => {
    const query = req.query.q;
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "SERPAPI_API_KEY is not configured on the server." });
    }

    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required." });
    }

    try {
      const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query as string)}&api_key=${apiKey}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("SerpApi Error:", error);
      res.status(500).json({ error: "Failed to fetch search results from SerpApi." });
    }
  });

  const { verifyFakeNews } = await import("./src/lib/groq.ts");

  app.post('/api/verify', async (req, res) => {
    const text = req.body?.text;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Request body must include a valid text field." });
    }

    const serpApiKey = process.env.SERPAPI_API_KEY;
    if (!serpApiKey) {
      return res.status(500).json({ error: "SERPAPI_API_KEY is not configured on the server." });
    }

    try {
      const searchResponse = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(text)}&api_key=${serpApiKey}&num=5`);
      const searchData = await searchResponse.json();
      const organicResults = Array.isArray(searchData.organic_results) ? searchData.organic_results : [];
      const searchContext = organicResults.slice(0, 5).map((item: any) => `${item.title || ''} - ${item.snippet || ''}`);

      const data = await verifyFakeNews(text, searchContext);
      res.json({ detection: data, searchResults: organicResults });
    } catch (error: any) {
      console.error('Verify endpoint error:', error);
      res.status(500).json({ error: error?.message || 'Failed to verify fake news with SerpApi.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
