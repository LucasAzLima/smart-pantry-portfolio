export default {
  "packages/web/**/*.{js,jsx,mjs,ts,tsx}": (filenames) =>
    `npm run lint -w web -- ${filenames.join(" ")}`,
};
