export default function Home() {
  return (
    <div>
      <h1>JoeGPT Widget Demo</h1>
      <div dangerouslySetInnerHTML={{ __html: `
<!-- JoeGPT Widget -->
<div id="joegpt-widget" style="max-width: 400px; height: 500px; position: fixed; bottom: 20px; right: 20px; border: 1px solid #ddd; border-radius: 12px; display: flex; flex-direction: column; font-family: Arial,sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: white; z-index: 9999; overflow: hidden;">
  <div style="background: #00796b; color: white; padding: 10px; font-weight: bold; text-align: center;">🏡 Ask JoeGPT</div>
  <div id="joegpt-chat" style="flex: 1; overflow-y: auto; padding: 10px; font-size: 14px; line-height: 1.4; display: flex; flex-direction: column;"></div>
  <div id="joegpt-suggestions" style="display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; border-top: 1px solid #ddd;">
    <button class="chip">Homes under $400k in PSL</button>
    <button class="chip">New construction in Martin County</button>
    <button class="chip">55+ Communities in PSL</button>
    <button class="chip">Waterfront homes in West Palm Beach</button>
  </div>
  <div style="display: flex; border-top: 1px solid #ddd;">
    <input id="joegpt-input" style="flex: 1; border: none; padding: 10px; font-size: 14px; outline: none;" type="text" placeholder="Ask about new homes..." />
    <button id="joegpt-send" style="background: #00796b; color: white; border: none; padding: 0 16px; cursor: pointer; font-weight: bold;">Send</button>
  </div>
</div>
<style>
  .chip { background:#e0f7fa; border:none; padding:6px 10px; border-radius:16px; cursor:pointer; font-size:12px; transition: background 0.2s; }
  .chip:hover { background:#b2ebf2; }
  .bubble { padding:8px 12px; border-radius:12px; margin:6px 0; max-width:80%; word-wrap:break-word; }
  .user { background:#e0f7fa; align-self:flex-end; }
  .bot  { background:#f1f1f1; align-self:flex-start; white-space:pre-line; }
  @media(max-width:600px){ #joegpt-widget { width:100%; height:100%; max-width:none; bottom:0; right:0; border-radius:0; } }
</style>
<script>
let thread = [];
function addBubble(text, type="bot") {
  const chat = document.getElementById("joegpt-chat");
  const div = document.createElement("div");
  div.className = "bubble " + type;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}
async function askJoeGPT(query) {
  const input = document.getElementById("joegpt-input");
  if (!query) query = input.value.trim();
  if (!query) return;
  input.value = "";
  addBubble(query, "user");
  const botMsg = addBubble("Thinking...", "bot");
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query, thread })
    });
    const data = await res.json();
    thread = data.thread;
    botMsg.textContent = data.reply || "No response from JoeGPT.";
  } catch (err) {
    botMsg.textContent = "⚠️ Error: " + err.message;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("joegpt-send").addEventListener("click",()=>askJoeGPT());
  document.getElementById("joegpt-input").addEventListener("keypress",e=>{ if(e.key==="Enter") askJoeGPT(); });
  document.querySelectorAll("#joegpt-suggestions .chip").forEach(chip=>{ chip.addEventListener("click",()=>askJoeGPT(chip.textContent)); });
});
</script>
      `}} />
    </div>
  );
}