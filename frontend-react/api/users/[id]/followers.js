import { state, userById, publicUser } from "../../_state.js";

export default function handler(req, res) {
    const me = userById(state.currentUserId);
    const users = me.followers.map(id => publicUser(userById(id)));
    res.json(users);
}
