const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const session = require("express-session");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4242;
const VOTES_FILE = path.join(__dirname, "votes.json");

let votes = [];
if (fs.existsSync(VOTES_FILE)) {
  votes = JSON.parse(fs.readFileSync(VOTES_FILE, "utf8"));
} else {
  votes = [
    { id: "c1", name: "Abimbola", votes: 0 },
    { id: "c2", name: "Bright", votes: 0 },
    { id: "c3", name: "Gbolahan", votes: 0 },
  ];
  fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2));
}

// --- Admin credentials ---
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "Agbolahan@88";

app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
  })
);

// --- Auth middleware ---
function requireLogin(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect("/");
}

// --- Login page ---
app.get("/", (req, res) => {
  res.render("login");
});

// --- Handle login ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.loggedIn = true;
    res.redirect("/dashboard");
  } else {
    res.send("<h3>Invalid credentials. <a href='/'>Try again</a></h3>");
  }
});

// --- Admin dashboard ---
app.get("/dashboard", requireLogin, (req, res) => {
  res.render("dashboard");
});

// --- Admin API: get votes ---
app.get("/admin/votes", requireLogin, (req, res) => {
  res.json(votes);
});

// --- Admin API: reset votes ---
app.post("/admin/reset", requireLogin, (req, res) => {
  const resetVotes = votes.map(v => ({ ...v, votes: 0 }));
  votes = resetVotes;
  fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2));
  res.send("✅ Votes reset successfully!");
});

// --- Admin API: export votes file ---
app.get("/admin/export", requireLogin, (req, res) => {
  res.download(VOTES_FILE);
});

// --- Public route: fetch votes for frontend ---
app.get("/votes", (req, res) => {
  res.json(votes);
});

// --- Public route: verify paystack payment ---
app.post("/verify", async (req, res) => {
  const { reference, candidateId } = req.body;
  if (!reference || !candidateId) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const data = response.data.data;
    if (data.status === "success") {
      const amount = data.amount / 100;
      const votesToAdd = Math.floor(amount / 100);

      votes = votes.map(v =>
        v.id === candidateId ? { ...v, votes: v.votes + votesToAdd } : v
      );

      fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2));
      return res.json({ success: true, votes });
    } else {
      return res.json({ success: false, message: "Payment not successful" });
    }
  } catch (err) {
    console.error("❌ Verify error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
