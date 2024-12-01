const { Octokit } = require("@octokit/core");
const fs = require("fs");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Ensure the token is added as a secret in your repo
const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function fetchContributions(username) {
  const response = await octokit.request("GET /search/commits", {
    q: `author:${username}`,
    headers: {
      Accept: "application/vnd.github.cloak-preview"
    }
  });

  return response.data.items.map(commit => ({
    repo: commit.repository.full_name,
    message: commit.commit.message,
    url: commit.html_url
  }));
}

async function updateReadme() {
  const username = "relspas"; // Replace with your GitHub username
  const contributions = await fetchContributions(username);

  const contributionLines = contributions
    .slice(0, 10) // Limit to 10 contributions for brevity
    .map(c => `- [${c.message}](${c.url}) in [${c.repo}](https://github.com/${c.repo})`)
    .join("\n");

  const readmePath = "README.md";
  const readmeContent = fs.readFileSync(readmePath, "utf8");

  const newReadmeContent = readmeContent.replace(
    /<!--START_SECTION:external-contributions-->[\s\S]*?<!--END_SECTION:external-contributions-->/,
    `<!--START_SECTION:external-contributions-->\n${contributionLines}\n<!--END_SECTION:external-contributions-->`
  );

  fs.writeFileSync(readmePath, newReadmeContent, "utf8");
}

updateReadme().catch(error => {
  console.error(error);
  process.exit(1);
});
