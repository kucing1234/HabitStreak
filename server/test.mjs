// Test Sprint 04: authenticated request vs unauthenticated request.
// Jalankan: npm run test:api   (server dijalankan otomatis di port acak)

import crypto from "node:crypto";
import { createApp, signJwt } from "./index.mjs";

const SECRET = "secret-untuk-test";
let lulus = 0;
let gagal = 0;

const cek = (nama, kondisi, detail = "") => {
  if (kondisi) {
    lulus++;
    console.log(`  ✓ ${nama}`);
  } else {
    gagal++;
    console.log(`  ✗ ${nama} ${detail}`);
  }
};

async function jalankan(opsi, fn) {
  // usersFile: null -> user hanya di memori, file users.json tidak tersentuh
  const server = createApp({ secret: SECRET, usersFile: null, ...opsi });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const req = async (path, { method = "GET", body, token } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, data };
  };
  try {
    await fn(req);
  } finally {
    await new Promise((r) => server.close(r));
  }
}

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");

await jalankan({}, async (req) => {
  console.log("\nUNAUTHENTICATED request (harus ditolak)");
  let r = await req("/habits");
  cek("tanpa token -> 401", r.status === 401, `(dapat ${r.status})`);
  r = await req("/habits", { token: "bukan.token.valid" });
  cek("token asal-asalan -> 401", r.status === 401, `(dapat ${r.status})`);
  r = await req("/me");
  cek("/me tanpa token -> 401", r.status === 401, `(dapat ${r.status})`);

  const exp = Math.floor(Date.now() / 1000) + 3600;
  const none = `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub: 1, exp })}.`;
  r = await req("/habits", { token: none });
  cek('token "alg: none" (dipalsukan) -> 401', r.status === 401, `(dapat ${r.status})`);
  const salah = signJwt({ sub: 1, exp }, "secret-penyerang");
  r = await req("/habits", { token: salah });
  cek("signature dengan secret lain -> 401", r.status === 401, `(dapat ${r.status})`);

  console.log("\nREGISTER & LOGIN");
  r = await req("/register", { method: "POST", body: { name: "Budi", email: "a@b", password: "123456" } });
  cek("email tidak valid -> 400", r.status === 400, `(dapat ${r.status})`);
  r = await req("/register", { method: "POST", body: { name: "Budi", email: "budi@mail.com", password: "123" } });
  cek("password < 6 karakter -> 400", r.status === 400, `(dapat ${r.status})`);
  r = await req("/register", { method: "POST", body: { name: "Budi", email: "Budi@Mail.com", password: "rahasia123" } });
  cek("register valid -> 201 + access_token", r.status === 201 && typeof r.data?.access_token === "string", `(dapat ${r.status})`);
  cek("response tidak membocorkan password/hash", !JSON.stringify(r.data).match(/hash|salt|rahasia123/));
  r = await req("/register", { method: "POST", body: { name: "Budi", email: "budi@mail.com", password: "rahasia123" } });
  cek("email sudah terdaftar -> 409", r.status === 409, `(dapat ${r.status})`);

  const salahPw = await req("/login", { method: "POST", body: { email: "budi@mail.com", password: "salahsalah" } });
  const salahEmail = await req("/login", { method: "POST", body: { email: "tidakada@mail.com", password: "rahasia123" } });
  cek("password salah -> 401", salahPw.status === 401, `(dapat ${salahPw.status})`);
  cek(
    "pesan gagal sama untuk email salah & password salah",
    salahEmail.status === 401 && salahPw.data?.error === salahEmail.data?.error,
  );

  console.log("\nAUTHENTICATED request (harus berhasil)");
  r = await req("/login", { method: "POST", body: { email: "budi@mail.com", password: "rahasia123" } });
  cek("login benar -> 200 + access_token (JWT 3 bagian)", r.status === 200 && r.data?.access_token?.split(".").length === 3, `(dapat ${r.status})`);
  cek("response berisi user", r.data?.user?.email === "budi@mail.com" && r.data?.user?.name === "Budi");
  const token = r.data.access_token;

  r = await req("/habits", { token });
  cek("/habits dengan Bearer token -> 200 + array", r.status === 200 && Array.isArray(r.data) && r.data.length > 0, `(dapat ${r.status})`);
  r = await req("/me", { token });
  cek("/me dengan Bearer token -> data user", r.status === 200 && r.data?.user?.email === "budi@mail.com", `(dapat ${r.status})`);

  const [h, p, s] = token.split(".");
  const payload = JSON.parse(Buffer.from(p, "base64url").toString());
  const palsu = `${h}.${b64({ ...payload, sub: 999 })}.${s}`;
  r = await req("/habits", { token: palsu });
  cek("payload diubah (signature tidak cocok) -> 401", r.status === 401, `(dapat ${r.status})`);
});

await jalankan({ ttlSeconds: -10 }, async (req) => {
  console.log("\nTOKEN KEDALUWARSA");
  await req("/register", { method: "POST", body: { name: "Sari", email: "sari@mail.com", password: "rahasia123" } });
  const login = await req("/login", { method: "POST", body: { email: "sari@mail.com", password: "rahasia123" } });
  const r = await req("/habits", { token: login.data?.access_token });
  cek("token yang sudah expired -> 401", r.status === 401, `(dapat ${r.status})`);
});

// ---- Sprint 05: simulasi error HTTP & timeout (untuk uji state di aplikasi) ----
async function loginToken(req) {
  await req("/register", { method: "POST", body: { name: "Tes", email: "tes@mail.com", password: "rahasia123" } });
  const r = await req("/login", { method: "POST", body: { email: "tes@mail.com", password: "rahasia123" } });
  return r.data.access_token;
}

await jalankan({ debugStatus: 500 }, async (req) => {
  console.log("\nSIMULASI SERVER ERROR (5xx)");
  const token = await loginToken(req);
  const r = await req("/habits", { token });
  cek("DEBUG_STATUS=500 -> /habits membalas 500", r.status === 500, `(dapat ${r.status})`);
  const tanpa = await req("/habits");
  cek("tanpa token tetap 401 (auth dicek lebih dulu)", tanpa.status === 401, `(dapat ${tanpa.status})`);
});

await jalankan({ debugStatus: 404 }, async (req) => {
  console.log("\nSIMULASI CLIENT ERROR (4xx)");
  const token = await loginToken(req);
  const r = await req("/habits", { token });
  cek("DEBUG_STATUS=404 -> /habits membalas 404", r.status === 404, `(dapat ${r.status})`);
});

await jalankan({ debugDelayMs: 300 }, async (req) => {
  console.log("\nSIMULASI SERVER LAMBAT (timeout)");
  const token = await loginToken(req);
  const mulai = Date.now();
  const r = await req("/habits", { token });
  const lama = Date.now() - mulai;
  cek("DEBUG_DELAY_MS=300 -> dibalas setelah >= 300 ms", r.status === 200 && lama >= 290, `(status ${r.status}, ${lama} ms)`);
});

console.log(`\n${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);