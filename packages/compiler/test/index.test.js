import fs from "fs";
import path from "path";
import autotest from "mocha-autotest";
import stripAnsi from "strip-ansi";
import escapeRegExp from "escape-string-regexp";
import { compileFileSync } from "../src";

const cwdRegExp = new RegExp(escapeRegExp(process.cwd() + "/"), "g");

fs.readdirSync(path.join(__dirname, "../../"))
  .map(dir => /^translator-(.*)|/.exec(dir)[1])
  .filter(Boolean)
  .forEach(translator => {
    autotest(path.normalize(`../../translator-${translator}/test/fixtures`), {
      cjs: runTest({ output: "html", modules: "cjs" }),
      html: runTest({ output: "html" }),
      htmlProduction: runTest({
        output: "html",
        optimize: true
      }),
      vdom: runTest({ output: "dom" }),
      vdomProduction: runTest({
        output: "dom",
        optimize: true
      }),
      generated: runTest({ output: "migrate" }),
      hydrate: runTest({
        output: "hydrate",
        resolveVirtualDependency(from, { virtualPath }) {
          return virtualPath;
        }
      })
    });

    function runTest(config) {
      return ({ mode, test, resolve, snapshot }) => {
        const testConfigFile = resolve("test.js");
        const testConfig = fs.existsSync(testConfigFile)
          ? require(testConfigFile)
          : {};
        const templateFile = resolve(
          testConfig.templateFile || "template.marko"
        );

        const compilerConfig = {
          ...config,
          babelConfig: {
            ...config.babelConfig,
            babelrc: false,
            configFile: false
          },
          writeVersionComment: false
        };

        const snapshotsDir = resolve("snapshots");
        const name = `snapshots${path.sep + mode}`;

        if (!fs.existsSync(snapshotsDir)) {
          fs.mkdirSync(snapshotsDir);
        }

        test(() => {
          let output;
          let diags;
          try {
            const result = compileFileSync(templateFile, compilerConfig);
            output = result.code;
            diags = result.meta.diagnostics;
          } catch (err) {
            try {
              snapshot(stripCwd(stripModuleStackTrace(stripAnsi(err.stack))), {
                name: `${name}-error`,
                ext: ".txt"
              });
              return;
            } catch {
              throw err;
            }
          }

          snapshot(output, {
            name,
            ext: mode === "generated" ? ".marko" : ".js"
          });

          if (mode === "generated") {
            snapshot(output, {
              name,
              ext: ".marko"
            });

            if (diags && diags.length) {
              snapshot(printDiags(diags), {
                name,
                ext: ".diagnostics.txt"
              });
            }
          } else {
            snapshot(output, {
              name,
              ext: ".js"
            });
          }
        });
      };
    }
  });

function stripCwd(message) {
  return message.replace(cwdRegExp, "");
}

function stripModuleStackTrace(message) {
  return message.replace(/\r?\n +at (?!packages[/\\])[^\n]+$/gm, "");
}

function printDiags(diags) {
  let result = "";

  for (const diag of diags) {
    result += `${diag.type}${diag.fix ? `[fixable]` : ""}${printLoc(
      diag.loc
    )}: ${diag.label}\n`;
  }

  return result;
}

function printLoc(loc) {
  if (loc) {
    return `(${loc.start.line}:${loc.start.column + 1}-${loc.end.line}:${
      loc.end.column + 1
    })`;
  }

  return "";
}
