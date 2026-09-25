import { NextRequest } from "next/server";

const COOKIE = "colae_admin";

function token() {
  return process.env.COLAE_ADMIN_KEY
    ? Buffer.from(process.env.COLAE_ADMIN_KEY).toString("base64url")
    : "";
}

export function isAdmin(request: NextRequest) {
  return Boolean(process.env.COLAE_ADMIN_KEY) && request.cookies.get(COOKIE)?.value === token();
}
