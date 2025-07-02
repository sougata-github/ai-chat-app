import Exa from "exa-js";

export function getExaClient() {
  const apiKey = process.env.EXASEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("EXASEARCH_API_KEY is not set in environment variables.");
  }

  return new Exa(apiKey);
}
