const sample = [
  "## 1. Introduction",
  "",
  "We respect your privacy. Visit [our site](https://onewaynepal.com) for details.",
  "",
  "- First bullet",
  "- Second bullet with **bold** and *italic*",
  "",
  "1. Step one",
  "2. Step two",
  "",
  "> A quoted note from the team.",
  "",
  "Inspect `inline code` here.",
  "",
  "![Logo](/logo.png)",
  "",
  "---",
  "",
  "Bare link: https://example.com",
].join("\n");

const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const Module = require("module");

// Stub react/jsx-runtime so the transpiled TSX component can load
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "react/jsx-runtime") {
    return { jsx: () => null, jsxs: () => null, Fragment: () => null };
  }
  return origLoad.apply(this, arguments);
};

const source = fs.readFileSync(path.join(__dirname, "..", "src", "components", "ContentRenderer.tsx"), "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

const m = new Module(__filename);
m._compile(js, "ContentRenderer.tsx");
const { renderRich } = m.exports;

const { toc, html } = renderRich(sample);
console.log("TOC:", JSON.stringify(toc, null, 2));
console.log("---HTML---");
console.log(html);
console.log("---CHECKS---");
const checks = [
  ["h2 heading with id", html.includes('<h2 id="1-introduction">')],
  ["hyperlink", html.includes('<a href="https://onewaynepal.com" target="_blank" rel="noopener noreferrer">our site</a>')],
  ["ul bullets", html.includes("<ul><li>First bullet</li>")],
  ["bold", html.includes("<strong>bold</strong>")],
  ["italic", html.includes("<em>italic</em>")],
  ["ol steps", html.includes("<ol><li>Step one</li><li>Step two</li></ol>")],
  ["blockquote", html.includes("<blockquote><p>A quoted note from the team.</p></blockquote>")],
  ["code", html.includes("<code>inline code</code>")],
  ["image figure", html.includes("<figure><img src=\"/logo.png\" alt=\"Logo\" loading=\"lazy\" /></figure>")],
  ["hr", html.includes("<hr />")],
  ["bare URL linked", html.includes('<a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a>')],
];
let pass = true;
for (const [name, ok] of checks) {
  console.log((ok ? "PASS" : "FAIL") + " - " + name);
  if (!ok) pass = false;
}
process.exit(pass ? 0 : 1);