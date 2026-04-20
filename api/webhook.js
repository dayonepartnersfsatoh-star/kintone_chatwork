export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const record = body.record || {};

    const name = record["文字列__1行__3"]?.value || "";
    const phone = record["文字列__1行__6"]?.value || "";
    const address = record["文字列__1行__5"]?.value || "";

    const message =
      `[info][title]kintone通知[/title]` +
      `氏名：${name}\n` +
      `電話番号：${phone}\n` +
      `住所：${address}\n` +
      `レコードURL：${body.url || ""}` +
      `[/info]`;

    const roomId = await getRoomId();

    await fetch(`https://api.chatwork.com/v2/rooms/${roomId}/messages`, {
      method: "POST",
      headers: {
        "X-ChatWorkToken": process.env.CHATWORK_TOKEN,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        body: message
      })
    });

    return res.status(200).json({ ok: true });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

async function getRoomId() {
  const res = await fetch("https://api.chatwork.com/v2/rooms", {
    headers: {
      "X-ChatWorkToken": process.env.CHATWORK_TOKEN
    }
  });

  const rooms = await res.json();
  const room = rooms.find(r => r.name === "マイチャット");

  if (!room) throw new Error("マイチャットが見つからない");

  return room.room_id;
}