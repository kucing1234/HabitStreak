// SPRINT 04 — Secure the HabitStreak API
//
// Server REST API kecil (tanpa dependency) dengan token-based authentication:
//
//   POST /register   { name, email, password } -> { access_token, user }   (publik)
//   POST /login      { email, password }       -> { access_token, user }   (publik)
//   GET  /me         Authorization: Bearer <token> -> { user }             (PROTECTED)
//   GET  /habits     Authorization: Bearer <token> -> [ ...habit ]         (PROTECTED)
//   GET  /health                                -> { ok: true }            (publik)
//
// access_token adalah JWT (HS256): header.payload.signature.
// Server memvalidasi signature + masa berlaku (exp) di SETIAP request ke
// endpoint yang dilindungi. Token tanpa/salah/kedaluwarsa -> 401.
//
// Jalankan: npm run server

import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const HABITS_FILE = path.join(DIR, "..", "api", "habits.json");
const USERS_FILE = path.join(DIR, "users.json");
const DEV_SECRET = "dev-only-secret-ganti-lewat-JWT_SECRET";
const TOKEN_TTL_SECONDS = 60 * 60; // token berlaku 1 jam
const MAX_BODY_BYTES = 10 * 1024;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/* ---------------------------- JWT (HS256) ---------------------------- */

const b64url = (data) => Buffer.from(data).toString("base64url");
const hmac = (data, secret) =>
  crypto.createHmac("sha256", secret).update(data).digest();

export function signJwt(payload, secret) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const signature = b64url(hmac(`${header}.${body}`, secret));
  return `${header}.${body}.${signature}`;
}

/** Kembalikan payload jika token valid; null jika tidak. */
export function verifyJwt(token, secret, nowMs = Date.now()) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    // Hanya terima HS256 (menolak "alg: none" dan algoritma lain)
    const head = JSON.parse(Buffer.from(header, "base64url").toString());
    if (head.alg !== "HS256" || head.typ !== "JWT") return null;

    const expected = hmac(`${header}.${body}`, secret);
    const given = Buffer.from(signature, "base64url");
    if (given.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(given, expected)) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= nowMs)
      return null; // kedaluwarsa
    return payload;
  } catch {
    return null;
  }
}

/* ------------------------------ Password ------------------------------ */

const hashPassword = (password, salt) =>
  crypto.scryptSync(password, salt, 64).toString("hex");

function passwordCocok(password, user) {
  const a = Buffer.from(hashPassword(password, user.salt), "hex");
  const b = Buffer.from(user.hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ------------------------------ User store ------------------------------ */

function createUserStore(file) {
  let users = [];
  if (file && fs.existsSync(file)) {
    try {
      users = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      users = [];
    }
  }
  const save = () => file && fs.writeFileSync(file, JSON.stringify(users, null, 2));
  return {
    byEmail: (email) => users.find((u) => u.email === email),
    byId: (id) => users.find((u) => u.id === id),
    add(name, email, password) {
      const salt = crypto.randomBytes(16).toString("hex");
      const user = {
        id: users.reduce((m, u) => Math.max(m, u.id), 0) + 1,
        name,
        email,
        salt,
        hash: hashPassword(password, salt),
      };
      users.push(user);
      save();
      return user;
    },
  };
}

/* -------------------------------- HTTP -------------------------------- */

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

function send(res, status, body, extra = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    // Token dikirim lewat header (bukan cookie), jadi "*" aman untuk CORS.
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    ...extra,
  });
  res.end(JSON.stringify(body));
}

const unauthorized = (res) =>
  send(res, 401, { error: "UNAUTHORIZED" }, { "WWW-Authenticate": "Bearer" });

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("TOO_LARGE"));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(Buffer.concat(chunks).toString() || "{}");
        if (typeof data !== "object" || data === null || Array.isArray(data))
          throw new Error();
        resolve(data);
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });
    req.on("error", reject);
  });
}

export function createApp({
  secret = process.env.JWT_SECRET ?? DEV_SECRET,
  usersFile = USERS_FILE,
  ttlSeconds = TOKEN_TTL_SECONDS,
} = {}) {
  const store = createUserStore(usersFile);

  const issueToken = (user) =>
    signJwt(
      {
        sub: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + ttlSeconds,
      },
      secret,
    );

  const authResponse = (user) => ({
    access_token: issueToken(user),
    user: publicUser(user),
  });

  /** Token validation: Bearer token -> user, atau null. */
  const authenticate = (req) => {
    const m = /^Bearer (.+)$/i.exec(req.headers.authorization ?? "");
    if (!m) return null;
    const payload = verifyJwt(m[1], secret);
    return payload ? (store.byId(payload.sub) ?? null) : null;
  };

  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    try {
      if (req.method === "OPTIONS") return send(res, 204, {});

      if (req.method === "GET" && pathname === "/health")
        return send(res, 200, { ok: true });

      // ---------- PUBLIC: register & login ----------
      if (req.method === "POST" && pathname === "/register") {
        const { name, email, password } = await readJson(req);
        const nama = typeof name === "string" ? name.trim() : "";
        const mail = typeof email === "string" ? email.trim().toLowerCase() : "";
        if (
          !nama ||
          nama.length > 100 ||
          !EMAIL_RE.test(mail) ||
          mail.length > 254 ||
          typeof password !== "string" ||
          password.length < 6 ||
          password.length > 200
        )
          return send(res, 400, { error: "INVALID_INPUT" });
        if (store.byEmail(mail)) return send(res, 409, { error: "EMAIL_TAKEN" });
        return send(res, 201, authResponse(store.add(nama, mail, password)));
      }

      if (req.method === "POST" && pathname === "/login") {
        const { email, password } = await readJson(req);
        if (typeof email !== "string" || typeof password !== "string")
          return send(res, 400, { error: "INVALID_INPUT" });
        const user = store.byEmail(email.trim().toLowerCase());
        // Tetap hitung hash walau user tidak ada (waktu respons seragam),
        // dan pesan gagal sama untuk "email salah" maupun "password salah".
        const ok = user
          ? passwordCocok(password, user)
          : (hashPassword(password, "0".repeat(32)), false);
        if (!ok) return send(res, 401, { error: "INVALID_CREDENTIALS" });
        return send(res, 200, authResponse(user));
      }

      // ---------- PROTECTED: wajib Authorization: Bearer <token> ----------
      if (req.method === "GET" && (pathname === "/me" || pathname === "/habits")) {
        const user = authenticate(req);
        if (!user) return unauthorized(res);
        if (pathname === "/me") return send(res, 200, { user: publicUser(user) });
        return send(res, 200, JSON.parse(fs.readFileSync(HABITS_FILE, "utf8")));
      }

      return send(res, 404, { error: "NOT_FOUND" });
    } catch (e) {
      if (e instanceof Error && e.message === "TOO_LARGE")
        return send(res, 413, { error: "TOO_LARGE" });
      if (e instanceof Error && e.message === "INVALID_JSON")
        return send(res, 400, { error: "INVALID_JSON" });
      console.error(e);
      return send(res, 500, { error: "SERVER_ERROR" });
    }
  });
}

/* ------------------------------ Jalankan ------------------------------ */

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  if (!process.env.JWT_SECRET)
    console.warn(
      "[!] JWT_SECRET belum diset — memakai secret development. Jangan dipakai di produksi.",
    );
  createApp().listen(port, "0.0.0.0", () => {
    console.log(`HabitStreak API berjalan di port ${port}`);
    console.log(`  Lokal : http://localhost:${port}`);
    for (const list of Object.values(os.networkInterfaces()))
      for (const n of list ?? [])
        if (n.family === "IPv4" && !n.internal)
          console.log(`  LAN   : http://${n.address}:${port}  (isi EXPO_PUBLIC_API_URL dengan ini untuk Expo Go)`);
    console.log("Catatan: ini HTTP. Untuk HTTPS di luar development, pasang di belakang TLS (mis. tunnel ngrok / hosting).");
  });
}