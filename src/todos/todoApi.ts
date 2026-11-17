// WEEK 9 — Asynchronous API Request: Todo List (GET / POST / PATCH).
//
// Memakai REST API publik JSONPlaceholder (https://jsonplaceholder.typicode.com).
// PENTING: JSONPlaceholder adalah API SIMULASI. POST dan PATCH mengembalikan
// 200/201 OK, tetapi data TIDAK disimpan permanen di server.
//
// Sengaja TIDAK memakai `apiFetch` (src/api/client.ts): fungsi itu memasang
// Bearer token milik pengguna, dan token tidak boleh dikirim ke server pihak ketiga.
import { ApiError } from "../api/client";
import { API_TIMEOUT_MS } from "../config";

export const TODO_API = "https://jsonplaceholder.typicode.com";

/** Bentuk data MENTAH dari API. */
export type TodoDto = {
  userId?: number;
  id: number;
  title: string;
  completed: boolean;
};

/** Data model yang dipakai UI. */
export type Todo = {
  /** Kunci unik untuk list. (POST di JSONPlaceholder selalu mengembalikan id 201.) */
  kunci: string;
  id: number;
  judul: string;
  selesai: boolean;
  /** true = dibuat di aplikasi ini (server simulasi tidak benar-benar menyimpannya). */
  lokal: boolean;
};

const isTodoDto = (x: unknown): x is TodoDto => {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    typeof o.title === "string" &&
    typeof o.completed === "boolean"
  );
};

let nomorLokal = 0;

/** Mapping: field API -> data model aplikasi. */
export const toTodo = (dto: TodoDto, lokal = false): Todo => ({
  kunci: lokal ? `lokal-${++nomorLokal}` : `server-${dto.id}`,
  id: dto.id,
  judul: dto.title.trim(),
  selesai: dto.completed,
  lokal,
});

type Opsi = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  /** Pembatalan dari luar (mis. layar ditutup). */
  signal?: AbortSignal;
};

/** Satu pintu request: header JSON, timeout, cek status HTTP, parse JSON. */
async function kirim(path: string, opsi: Opsi = {}): Promise<unknown> {
  const { method = "GET", body, signal } = opsi;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS); // timeout
  const batalkan = () => ctrl.abort();
  if (signal?.aborted) ctrl.abort();
  else signal?.addEventListener("abort", batalkan);

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const response = await fetch(`${TODO_API}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!response.ok) throw new ApiError(response.status, `HTTP_${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", batalkan);
  }
}

/** 1) GET /todos?_limit=10 — ambil 10 tugas awal. */
export async function fetchTodos(signal?: AbortSignal): Promise<Todo[]> {
  const data = await kirim("/todos?_limit=10", { signal });
  if (!Array.isArray(data)) throw new Error("FORMAT");
  return data.filter(isTodoDto).map((d) => toTodo(d));
}

/** 2) POST /todos — tambah tugas baru. */
export async function addTodo(judul: string, signal?: AbortSignal): Promise<Todo> {
  const data = await kirim("/todos", {
    method: "POST",
    body: { title: judul, completed: false, userId: 1 },
    signal,
  });
  if (!isTodoDto(data)) throw new Error("FORMAT");
  return toTodo(data, true);
}

/** 3) PATCH /todos/:id — ubah status selesai. Mengembalikan status dari server. */
export async function patchTodo(
  id: number,
  selesai: boolean,
  signal?: AbortSignal,
): Promise<boolean> {
  const data = await kirim(`/todos/${id}`, {
    method: "PATCH",
    body: { completed: selesai },
    signal,
  });
  if (!isTodoDto(data)) throw new Error("FORMAT");
  return data.completed;
}
