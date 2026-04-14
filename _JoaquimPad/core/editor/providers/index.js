
import { registerSqlProvider } from "./sqlProvider.js";
import { registerPythonProvider } from "./pythonProvider.js";
import { registerCSharpProvider } from "./csharpProvider.js";

export function registerAllProviders(monaco) {
  registerSqlProvider(monaco);
  registerPythonProvider(monaco);
  registerCSharpProvider(monaco);
}
