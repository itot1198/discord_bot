require("./package.json");
require("dotenv").config();
const { prefix } = require("./config.json");
const http = require("http");
const querystring = require("querystring");
const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require("axios");
const ytdl = require("ytdl-core");
const schedule = require("node-schedule");
const rule = new schedule.RecurrenceRule();
rule.tz = "Asia/Tokyo";
client.login(process.env.DISCORD_BOT_TOKEN);
const chaplusUrl = "https://www.chaplus.jp/v1/chat?apikey=5f4290de659e5";
const googleTTS = require("google-tts-api");
const mainChannelID = "775700380163244077";

http
  .createServer(function (req, res) {
    if (req.method == "POST") {
      let data = "";
      req.on("data", function (chunk) {
        data += chunk;
      });
      req.on("end", function () {
        if (!data) {
          console.log("No post data");
          res.end();
          return;
        }
        const dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        } else if (dataObject.type == "notice") {
          res.end();
        }
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Discord Bot is active now\n");
    }
  })
  .listen(3000);

client.on("ready", () => {
  console.log("サーバーが起動しました");
  client.user.setPresence({ activity: { name: "あしたからがんばる" } });
});

// 毎時０分に時報音を再生する
schedule.scheduleJob("59 * * * *", async function () {
  const connection = await client.channels.cache.get(mainChannelID).join();

  setTimeout(function () {
    connection.play(
      ytdl("https://www.youtube.com/watch?v=ZD-eWcKYRYU", {
        filter: "audioonly",
      }),
      { volume: 0.1 }
    );
    const Hour = new Date(
      Date.now() + (new Date().getTimezoneOffset() + 10 * 60) * 60 * 1000
    ).getHours();
    const url = googleTTS.getAudioUrl(Hour + "時です", {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com",
    });
    setTimeout(function () {
      connection.play(url, { volume: 1.0 });
    }, 15000);
  }, 49000);
});

// botを常駐化
schedule.scheduleJob("1-58/2 * * * *", async function () {
  await client.channels.cache.get(mainChannelID).join();
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (
    newState.channelID === mainChannelID &&
    oldState.channelID !== mainChannelID
  ) {
    let Name = await client.users.cache.get(oldState.id).username;
    if (oldState.id === "715925807369027664") {
      Name = "れいか";
    }
    if (oldState.id === "229276445891887114") {
      Name = "けーしん";
    }
    if (oldState.id === "594745810164645899") {
      Name = "うざき";
    }
    const url = googleTTS.getAudioUrl(Name + "さんが入室しました", {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com",
    });
    const connection = await client.channels.cache.get(mainChannelID).join();
    connection.play(url, { volume: 0.7 });
  } else if (
    newState.channelID !== mainChannelID &&
    oldState.channelID === mainChannelID
  ) {
    let Name = await client.users.cache.get(oldState.id).username;
    if (oldState.id === "715925807369027664") {
      Name = "れいか";
    }
    if (oldState.id === "229276445891887114") {
      Name = "けーしん";
    }
    if (oldState.id === "594745810164645899") {
      Name = "うざき";
    }
    const url = googleTTS.getAudioUrl(Name + "さんが退室しました", {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com",
    });
    const connection = await client.channels.cache.get(mainChannelID).join();
    connection.play(url, { volume: 0.7 });
  }
});

client.on("message", async (message) => {
  // ユーザーの発言に対して10%の確率でランダムなリアクションを返す(休止中)
  /* const prob = Math.floor(Math.random() * 100);
  if (message.content && prob < 10)
    {
      //massageがBot以外の発言だったら
      if (message.author.id !== '780629853606510592'){
       //絵文字のIDと名前を取得して配列に格納
       const emojiID = [];
       const emojiName = [];
       client.emojis.cache.map((e, x) => emojiID.push(x));
       client.emojis.cache.map((e, x) => emojiName.push(e.name));
       //乱数を使って絵文字をランダムに選ぶ
       const arrayLength = emojiID.length - 1;
       const arrayIndex = Math.floor(Math.random() * arrayLength);
       const reactionEmoji = "<:" + emojiName[arrayIndex] + ":" + emojiID[arrayIndex] + ">";
       //リアクションを実行
       message.react(reactionEmoji)
      }
    }*/

  // ミュート中のユーザーが聞き専にテキストを送信した場合は読み上げる
  if (
    message.member.voice.channel &&
    message.member.guild.voiceStates.cache.get(message.author.id).selfMute &&
    !message.content.startsWith(prefix) &&
    !message.content.match(/http/) &&
    !message.content.match(/@/)
  ) {
    const url = googleTTS.getAudioUrl(message.content, {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com",
    });
    const connection = await client.channels.cache.get(mainChannelID).join();
    connection.play(url, { volume: 0.5 });
  } else if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "talk" || command === "t") {
      const dialogue_options = {
        utterance: message.content.slice(prefix.length + command.length + 1),
        agentState: {
          agentName: "あしたからがんばるbot",
          age: "17歳",
          tone: "normal",
        },
      };
      await axios
        .post(chaplusUrl, JSON.stringify(dialogue_options))
        .then(function (response) {
          const data = response.data;
          console.log(data.bestResponse.utterance);
          message.channel.send(data.bestResponse.utterance);
        });
    } else if (command === "info") {
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("基本情報")
        .setAuthor(
          "あしたからがんばるbot",
          "https://drive.google.com/file/d/11ClF8BaDod54z3tDNOUSDyT-4hi4DckS/view?usp=sharing"
        )
        .setDescription("Some description here")
        .setThumbnail("https://i.imgur.com/wSTFkRM.png")
        .addFields(
          { name: "Regular field title", value: "Some value here" },
          { name: "\u200B", value: "\u200B" },
          {
            name: "Inline field title",
            value: "Some value here",
            inline: true,
          },
          { name: "Inline field title", value: "Some value here", inline: true }
        )
        .addField("Inline field title", "Some value here", true)
        .setImage("https://i.imgur.com/wSTFkRM.png")
        .setTimestamp()
        .setFooter("Some footer text here", "https://i.imgur.com/wSTFkRM.png");

      message.channel.send(exampleEmbed);
    }
  }
});
