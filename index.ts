import concurrently from "concurrently";

concurrently([
  {
    name: "server",
    command: "npm run dev",
    cwd: "server",
    prefixColor: "cyan",
  },
  {
    name: "nextjs",
    command: "npm run dev",
    cwd: "nextjs",
    prefixColor: "green",
  },
]);
