export function sessionDestination(role: string, search: string): string {
  const admin = role.toUpperCase() !== "CUSTOMER";
  const destination = new URLSearchParams(search).get("redirect");
  if (destination && destination.startsWith("/") && !destination.startsWith("//") && !destination.includes("\\") && !/[\u0000-\u001f]/.test(destination)) {
    const path = destination.split(/[?#]/)[0];
    if (path === "/account" || path.startsWith("/account/") || admin && (path === "/admin" || path.startsWith("/admin/") || path === "/dashboard" || path.startsWith("/dashboard/"))) return destination;
  }
  return admin ? "/admin" : "/account";
}
