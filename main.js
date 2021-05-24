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
const { google } = require("googleapis");
const { response } = require("express");
const customSearch = google.customsearch("v1");
const wiki = require("wikijs").default({
  apiUrl: "http://ja.wikipedia.org/w/api.php",
});
const jihou = [
  [0, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [1, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [2, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [3, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [4, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [5, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [6, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [7, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [8, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [9, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [10, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [11, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [12, "https://www.youtube.com/watch?v=m-Ago7Sey4k", 25, 58],
  [13, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [14, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [15, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [16, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [17, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [18, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [19, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [20, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [21, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [22, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
  [23, "https://www.youtube.com/watch?v=ZD-eWcKYRYU", 15, 49],
];

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

// 毎時0分に時報音を再生する
schedule.scheduleJob("59 * * * *", async function () {
  const connection = await client.channels.cache.get(mainChannelID).join();
  const Hour = new Date(
    Date.now() + (new Date().getTimezoneOffset() + 10 * 60) * 60 * 1000
  ).getHours();
  setTimeout(function () {
    connection.play(
      ytdl(jihou[Hour][1], {
        filter: "audioonly",
      }),
      { volume: 0.1 }
    );
    const url = googleTTS.getAudioUrl(Hour + "時です", {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com",
    });
    setTimeout(function () {
      connection.play(url, { volume: 1.0 });
    }, jihou[Hour][2] * 1000);
  }, jihou[Hour][3] * 1000);
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
  // ユーザーの発言に対して10 % の確率でランダムなリアクションを返す(休止中);
  /*const prob = Math.floor(Math.random() * 100);
  if (message.content && prob < 10) {
    //massageがBot以外の発言だったら
    if (message.author.id !== "780629853606510592") {
      //絵文字のIDと名前を取得して配列に格納
      const emojiID = [];
      const emojiName = [];
      client.emojis.cache.map((e, x) => emojiID.push(x));
      client.emojis.cache.map((e, x) => emojiName.push(e.name));
      //乱数を使って絵文字をランダムに選ぶ
      const arrayLength = emojiID.length - 1;
      const arrayIndex = Math.floor(Math.random() * arrayLength);
      const reactionEmoji =
        "<:" + emojiName[arrayIndex] + ":" + emojiID[arrayIndex] + ">";
      //リアクションを実行
      message.react(reactionEmoji);
    }
  }*/

  // ミュート中のユーザーが聞き専にテキストを送信した場合は読み上げる
  if (
    message.member.voice.channel &&
    message.member.guild.voiceStates.cache.get(message.author.id).selfMute &&
    !message.content.startsWith(prefix) &&
    !message.content.match(/http/) &&
    !message.content.match(/@/) &&
    !message.content.startsWith("-p")
  ) {
    const url = googleTTS.getAudioUrl(message.content, {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com",
    });
    const connection = await client.channels.cache.get(mainChannelID).join();
    connection.play(url, { volume: 0.7 });
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
    } else if (command === "search" || command === "s") {
      let keyword = message.content.slice(prefix.length + command.length + 1);
      let result = await customSearch.cse.list({
        //APIキー
        auth: process.env.GOOGLE_SEARCH_API_KEY,

        //カスタムエンジン名ID
        cx: process.env.SEARCH_ENGINE_ID,

        //検索したいキーワード
        q: keyword,
      });
      const exampleEmbed = {
        color: 0x0099ff,
        title: "検索結果",
        url: "https://www.google.com/search?q=" + keyword,
        description: "「" + keyword + "」" + "の検索結果はこちらです",
        thumbnail: {
          url: "https://img.icons8.com/color/452/google-logo.png",
        },
        fields: [
          {
            name: ":one: " + result.data.items[0].title,
            value: result.data.items[0].link,
          },
          {
            name: ":two: " + result.data.items[1].title,
            value: result.data.items[1].link,
          },
          {
            name: ":three: " + result.data.items[2].title,
            value: result.data.items[2].link,
          },
          {
            name: ":four: " + result.data.items[3].title,
            value: result.data.items[3].link,
          },
          {
            name: ":five: " + result.data.items[4].title,
            value: result.data.items[4].link,
          },
          {
            name: "\u200b",
            value: "\u200b",
            inline: false,
          },
        ],
      };
      message.channel.send({ embed: exampleEmbed });
    } else if (command === "searchimg" || command === "si") {
      let keyword = message.content.slice(prefix.length + command.length + 1);
      let result = await customSearch.cse.list({
        //APIキー
        auth: process.env.GOOGLE_SEARCH_API_KEY,
        //カスタムエンジン名ID
        cx: process.env.SEARCH_ENGINE_ID,
        //検索したいキーワード
        q: keyword,
        searchType: "image",
      });
      message.channel.send(result.data.items[0].link);
    } else if (command === "wiki" || command === "w") {
      let keyword = message.content.slice(prefix.length + command.length + 1);
      const list = await wiki.search(keyword);
      const page = await wiki.page(list.results[0]);
      const summary = await page.summary();
      const exampleEmbed = new Discord.MessageEmbed()
        .setTitle(list.results[0])
        .setURL("https://ja.wikipedia.org/wiki/" + list.results[0])
        .setDescription(summary);
      message.channel.send({ embed: exampleEmbed });
    } else if (command === "tts") {
      const url = googleTTS.getAudioUrl(
        message.content.slice(prefix.length + command.length + 1),
        {
          lang: "ja-JP",
          slow: false,
          host: "https://translate.google.com",
        }
      );
      const connection = await client.channels.cache.get(mainChannelID).join();
      connection.play(url, { volume: 0.7 });
    } else if (command === "ban") {
      if (message.mentions.members.size === 1) {
        const member = await message.mentions.members.first();
        const id = member.user.id;
        message.channel.send({
          //あとで編集などができるようにawait（非同期処理）をつける
          embed: {
            color: 16757683,
            description:
              "banが提議されました。30秒以内に提案者を除く2人のユーザーは`ban`と発言してbanを承認してください。",
          },
        });
        const filter = (msg) =>
          msg.content.match(/ban/) && msg.author.id != message.author.id;
        const collected = await message.channel.awaitMessages(filter, {
          max: 2,
          time: 30000,
        });
        const response = collected.first();
        if (!response)
          message.channel.send({
            embed: {
              description: "banは否決されました。",
            },
          });
        message.guild.members.ban(id, { reason: response.content });
        message.channel.send({
          embed: {
            description: `banが可決されました。<@${id}>をBANしました。`,
          },
        });
      }
    }
  }
});
