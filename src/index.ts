import { Bot, Context, webhookCallback } from "grammy";

export interface Env {
  BOT_TOKEN: string;
  BOT_INFO: {
    id: number;
    is_bot: true;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
    can_connect_to_business: boolean;
    has_main_web_app: boolean;
  };
}

const admin = 1205330781

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN, { botInfo: env.BOT_INFO });

bot.command("start", async (ctx: Context) => {
  const welcomeText = `
👋 <b>Welcome!</b>

This bot is designed to help you contact our admins directly.
Feel free to send your message — it will be forwarded to our team.

🛠 The source code of this bot is available below.

📢 Stay connected by joining our channel!
  `;

  await ctx.reply(welcomeText, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🌐 Source Code", url: "https://github.com/your-repo" },
          { text: "📢 Join Our Channel", url: "https://t.me/FlareBase" }
        ]
      ]
    }
  });
});


bot.on("message", async (ctx) => {
  if (ctx.chat?.type !== "private") return;
  const reply = ctx.message?.reply_to_message;

  if (reply?.text) {
    const regex = /user ID: (\d+).*?Msg Id ?: ?(\d+)/i;
    const match = reply.text.match(regex);

    if (match) {
      const userId = parseInt(match[1]);
      const msgId = parseInt(match[2]);
      await ctx.api.copyMessage(userId, ctx.chat.id, ctx.message.message_id, {
          reply_to_message_id: msgId,
        });
      await ctx.reply("Reply sent to the user.");
      return; 
    }
  }

  try {
    const userId = ctx.from?.id;
    if (!userId) return;
    if (userId == admin) return;
    const fullName = `${ctx.from?.first_name || ""} ${ctx.from?.last_name || ""}`.trim();

    const forwardedMsg = await ctx.forwardMessage(admin);
    const userInfo = `Message from user ID: ${userId} Msg Id : ${ctx.message?.message_id}  👤 Name: ${fullName}`;

    await ctx.api.sendMessage(1205330781, userInfo, {
      reply_to_message_id: forwardedMsg.message_id,
    });

    await ctx.reply("Your message has been forwarded to our admins.");
  } catch (err) {
    console.error("Error forwarding message:", err);
    await ctx.reply("Sorry, something went wrong.");
  }
});
    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
