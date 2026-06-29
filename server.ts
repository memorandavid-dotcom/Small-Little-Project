import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/callback"
);

async function startServer() {
  // API Routes
  app.get("/api/info", (req, res) => {
    res.json({
      application: "Chronos AI Suite",
      description: "An advanced, comprehensive time-management, calendar scheduler, academic coaching hub, and multi-agent AI workspace designed for high-achieving student productivity.",
      version: "1.0.0",
      architecture: "Full-Stack (Vite SPA Client + Node/Express Backend on Cloud Run Container)",
      coreCapabilities: [
        {
          feature: "Academic Hub",
          description: "Tracks course progression, calculates dynamic GPA scales (using A-F criteria or 100-0 penalty systems), and handles precise grade weight sliders for quizzes, exams, and homework."
        },
        {
          feature: "Smart Task Breakdown",
          description: "Allows complex assignments to be broken down into actionable sub-steps with integrated reminders, estimation periods, and materials manifests."
        },
        {
          feature: "Dynamic Calendar Schedule",
          description: "Supports Month/Day interactive grid views, hybrid/online event definitions, and automated timezone shifting capabilities."
        },
        {
          feature: "AI Multi-Agent Portal",
          description: "Deploy, select, and customize multiple AI co-pilots such as the default Chronos Orchestrator, Academic Study Coach, and Focus & Grit Companion, or deploy custom specialist bots on the fly."
        },
        {
          feature: "Integrated Mail Workspace",
          description: "Syncs Google Workspace Gmail securely using OAuth 2.0 to view, read, and manage workspace inbox items directly in the app."
        }
      ],
      systemRequirements: {
        node: ">=18.x",
        dependencies: ["Express", "Vite", "@google/genai", "Google APIs SDK", "React", "Tailwind CSS", "Motion", "Lucide React"]
      },
      supportPortal: {
        chatbot: "Specialist Diagnostics",
        ticketSystem: "Direct Ticket Queue (categories: Technical, Academic, AI, Billing)"
      }
    });
  });

  app.get("/api/auth/google/url", (req, res) => {
    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent"
    });

    res.json({ url });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      // In a real app, you'd store these tokens securely (e.g., in a session or database)
      // For this demo, we'll send them back to the client via postMessage
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  tokens: ${JSON.stringify(tokens)} 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.get("/api/emails", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No tokens provided" });
    }

    const tokens = JSON.parse(authHeader);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10
      });

      const messages = response.data.messages || [];
      const emailDetails = await Promise.all(
        messages.map(async (msg) => {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!
          });

          const headers = detail.data.payload?.headers;
          const subject = headers?.find(h => h.name === "Subject")?.value || "No Subject";
          const from = headers?.find(h => h.name === "From")?.value || "Unknown Sender";
          const date = headers?.find(h => h.name === "Date")?.value || new Date().toISOString();
          const snippet = detail.data.snippet || "";

          return {
            id: msg.id,
            sender: from,
            subject,
            preview: snippet,
            date: new Date(date).toISOString(),
            isRead: !detail.data.labelIds?.includes("UNREAD"),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(from)}&background=random`
          };
        })
      );

      res.json(emailDetails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({ error: "Failed to fetch emails" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
