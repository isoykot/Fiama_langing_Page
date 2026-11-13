import { randomHex, secure } from "./core.js";
import { route } from "./router.js";

export default {
  async fetch(request, env) {
    const nonce = randomHex(16);
    const response = await route(request, env, nonce);
    return secure(response, nonce);
  }
};
