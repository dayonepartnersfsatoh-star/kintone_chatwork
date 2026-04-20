export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const record = body.record || {};
    const appId = String(body.app?.id || "");
    const recordUrl = body.url || "";

    let message = "";

    // ===== アプリ1 =====
    if (appId === "394") {
      const name = record["文字列__1行__3"]?.value || "";
      const phone = record["文字列__1行__6"]?.value || "";
      const address = record["文字列__1行__5"]?.value || "";

      message =
        `[info][title]アプリ1通知[/title]` +
        `氏名：${safeText(name)}\n` +
        `電話番号：${safeText(phone)}\n` +
        `住所：${safeText(address)}\n` +
        `レコードURL：${safeText(recordUrl)}` +
        `[/info]`;
    }

    // ===== アプリ2 =====
    else if (appId === "60") {
      const name = record["氏名"]?.value || "";
      const phone = record["電話番号"]?.value || "";
      const address = record["住所"]?.value || "";

      message =
        `[info][title]アプリ2通知[/title]` +
        `氏名：${safeText(name)}\n` +
        `電話番号：${safeText(phone)}\n` +
        `住所：${safeText(address)}\n` +
        `レコードURL：${safeText(recordUrl)}` +
        `[/info]`;
    }

    // ===== 対象外アプリ =====
    else {
      return res.status(200).json({
        ok: true,
        message: "対象外アプリです",
        appId
      });
    }

    const roomId = "434237792";

    const chatworkRes = await fetch(`https://api.chatwork.com/v2/rooms/${roomId}/messages`, {
      method: "POST",
      headers: {
        "X-ChatWorkToken": process.env.CHATWORK_TOKEN,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        body: message
      })
    });

    const resultText = await chatworkRes.text();

    if (!chatworkRes.ok) {
      throw new Error(`Chatwork送信失敗: ${chatworkRes.status} ${resultText}`);
    }

    return res.status(200).json({
      ok: true,
      appId,
      roomId,
      result: resultText
    });

  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e.message
    });
  }
}

function safeText(value) {
  return String(value || "").replace(/\[info\]|\[\/info\]|\[title\]|\[\/title\]/g, "");
}
