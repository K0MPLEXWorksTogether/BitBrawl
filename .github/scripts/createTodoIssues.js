const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fetch = require("node-fetch");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const [REPO_OWNER, REPO_NAME] = process.env.GITHUB_REPOSITORY.split("/");

const CACHE_FILE = ".todo-cache.json";
let cache = new Set();

if (fs.existsSync(CACHE_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(CACHE_FILE));
    cache = new Set(data);
  } catch (e) {
    console.error("Failed to read TODO cache file:", e);
  }
}

function hashTodo(todo) {
  const hash = crypto.createHash("sha256");
  hash.update(`${todo.file}:${todo.line}:${todo.text}`);
  return hash.digest("hex");
}

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

const validExtensions = [".js", ".ts", ".jsx", ".tsx", ".md", ".yml", ".json"];

function findTodos(dir = ".", todos = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "build"].includes(entry.name))
        continue;
      findTodos(fullPath, todos);
    } else if (validExtensions.includes(path.extname(entry.name))) {
      const lines = fs.readFileSync(fullPath, "utf8").split("\n");

      lines.forEach((line, index) => {
        const match = line.match(/(?:\/\/|#|\/\*+)\s*TODO[:\s]+(.+)/i);
        if (match) {
          todos.push({
            file: fullPath,
            line: index + 1,
            text: match[1].trim(),
          });
        }
      });
    }
  }

  return todos;
}

async function createIssue(todo) {
  const title = `TODO: ${todo.text.substring(0, 50)}`;
  const body = `**File**: \`${todo.file}\` (line ${todo.line})\n\n\`\`\`\n${todo.text}\n\`\`\``;

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ title, body }),
    }
  );

  if (res.status === 201) {
    console.log(`Created issue: ${title}`);
  } else {
    const error = await res.text();
    console.error(`Failed to create issue: ${res.status} ${error}`);
  }
}

async function main() {
  const todos = findTodos();
  const newHashes = new Set();

  for (const todo of todos) {
    const todoHash = hashTodo(todo);

    if (cache.has(todoHash)) {
      console.log(`Skipping already seen TODO: ${todo.text}`);
      continue;
    }

    await createIssue(todo);
    newHashes.add(todoHash);
  }

  const updatedCache = new Set([...cache, ...newHashes]);
  fs.writeFileSync(CACHE_FILE, JSON.stringify([...updatedCache], null, 2));
  console.log(`Updated TODO cache with ${newHashes.size} new items`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
