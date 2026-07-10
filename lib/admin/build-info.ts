import packageJson from "../../package.json";

export function getAppVersion(): string {
  return packageJson.version;
}

export function getBuildLabel(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha) return sha.slice(0, 7);
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID?.trim();
  if (deploymentId) return deploymentId.slice(0, 12);
  return "local";
}

export function getDeployEnvironment(): string {
  return process.env.VERCEL_ENV?.trim() || process.env.NODE_ENV || "development";
}
