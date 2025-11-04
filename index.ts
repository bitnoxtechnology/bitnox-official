import concurrently from "concurrently";

concurrently([
  {
    name: "server",
    command: "npm run dev",
    cwd: "server",
    prefixColor: "cyan",
  },
  {
    name: "client",
    command: "npm run dev",
    cwd: "client",
    prefixColor: "green",
  },
]);
