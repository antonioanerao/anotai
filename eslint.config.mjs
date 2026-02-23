import nextVitals from "eslint-config-next/core-web-vitals.js";

const config = Array.isArray(nextVitals) ? nextVitals : [nextVitals];

export default config;
