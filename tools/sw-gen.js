import { generateSW } from "workbox-build";

generateSW({
  globDirectory: "dist/",
  globPatterns: ["*.{css,woff2,png,svg,jpg,js,html}"],
  swDest: "dist/sw.js",
  sourcemap: false,
  maximumFileSizeToCacheInBytes: 1024 * 1024 * 5,
}).then(({ count, size, warnings }) => {
  if (warnings.length > 0) {
    console.warn(
      "Warnings encountered while generating a service worker:",
      warnings.join("\n")
    );
  }
  console.log(
    `✨ Generated a service worker, which will precache ${count} files, totaling ${
      (size / 1024 / 1024).toFixed(2)
    } MB.`
  );
});
