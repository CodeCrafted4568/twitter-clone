import { state } from "../_state.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.json(state.users);
  }

  return res.status(405).end();
}
