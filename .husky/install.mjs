// Skip Husky when the package is omitted (e.g. Vercel production install)
// or when hooks are irrelevant (CI). See https://typicode.github.io/husky/how-to.html
if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
  process.exit(0);
}

try {
  const husky = (await import("husky")).default;
  console.log(husky());
} catch {
  // husky not installed (omit=dev / production install)
  process.exit(0);
}
