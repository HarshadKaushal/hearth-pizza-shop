import { createHmac, timingSafeEqual } from "crypto";

export type Role = "CUSTOMER" | "KITCHEN";

export type AuthToken = {
  id: string;
  email: string;
  role: Role;
};

type Payload = AuthToken & { exp: number };

const TTL_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return process.env.JWT_SECRET ?? "hearth-dev-secret";
}

function encode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function sign(header: string, body: string) {
  return createHmac("sha256", secret()).update(`${header}.${body}`).digest();
}

export function issueToken(user: AuthToken) {
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encode(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
    }),
  );
  return `${header}.${body}.${encode(sign(header, body))}`;
}

export function readToken(token: string): AuthToken {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) {
    throw new Error("Malformed token.");
  }
  const expected = sign(header, body);
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error("Bad token signature.");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
  if (!payload.id || !payload.email || (payload.role !== "CUSTOMER" && payload.role !== "KITCHEN") || payload.exp * 1000 < Date.now()) {
    throw new Error("Expired token.");
  }
  return { id: payload.id, email: payload.email, role: payload.role };
}
