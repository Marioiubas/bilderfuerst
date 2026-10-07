// Minimal CDP client (Node 22 global WebSocket) for the mobile WebGL probe. No dependencies.
export async function connect(port = 9871) {
  const {webSocketDebuggerUrl} = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const listeners = new Set();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const {res, rej} = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else listeners.forEach((l) => l(m));
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, {res, rej}); ws.send(JSON.stringify({id: i, method, params, sessionId})); });
  const on = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
  async function page() {
    const {targetId} = await send('Target.createTarget', {url: 'about:blank'});
    const {sessionId} = await send('Target.attachToTarget', {targetId, flatten: true});
    const s = (method, params) => send(method, params, sessionId);
    const evaluate = async (expression) => { const r = await s('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true}); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; };
    const close = () => send('Target.closeTarget', {targetId});
    const waitEvent = (method, timeout = 30000) => new Promise((res, rej) => { const t = setTimeout(() => { off(); rej(new Error('timeout ' + method)); }, timeout); const off = on((m) => { if (m.sessionId === sessionId && m.method === method) { clearTimeout(t); off(); res(m.params); } }); });
    return {s, evaluate, close, waitEvent, sessionId, targetId};
  }
  return {send, on, page, close: () => ws.close()};
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
