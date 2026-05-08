require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const userStates = {};
const userPhrases = {};

function resetUser(from) {
  delete userStates[from];
  delete userPhrases[from];
}

const stickers = [
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia00.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia01.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia02.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia03.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia04.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia05.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia06.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia07.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia08.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia09.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia10.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia11.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia12.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia13.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia14.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia15.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia16.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia17.webp",
  "https://raw.githubusercontent.com/fresnedov/dignarabia/main/stickers/dignarabia18.webp"
];

const menu = `Hola rabiosas y rabiosos, este es un espacio para explorar lo que sientes, pensarlo, hacerlo circular y transformarlo.

Elige un camino escribiendo el número correspondiente:

*1. Medir tu rabia*
*2. Avivar el fuego colectivo*
*3. Propagar la llama*
*4. Quiero ver la exposición*

_Puedes escribir RABIA en cualquier momento para volver aquí._`;

const menuRetorno = `Elige un camino escribiendo el número correspondiente:

*1. Medir tu rabia*
*2. Avivar el fuego colectivo*
*3. Propagar la llama*
*4. Quiero ver la exposición*

_Puedes escribir RABIA en cualquier momento para volver aquí._`;

async function sendText(to, body) {
  await axios.post(
    `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

async function sendSticker(to, link) {
  await axios.post(
    `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "sticker",
      sticker: { link }
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

function rabiaResponse(number) {
  if (number >= 75) {
    return {
      text: `*Volcán en erupción*

_La rabia se vuelve voz._
*→ Mira una obra de la exposición Digna Rabia y grita aquello que crees que debe cambiar.*`,
      sticker: stickers[13]
    };
  }

  if (number >= 61) {
    return {
      text: `*Furia histórica*

_Tu rabia se conecta con otras historias y otras luchas._
*→ Elige una obra de la Exposición Digna Rabia y crea un pequeño cartel inspirado en ella.*`,
      sticker: stickers[14]
    };
  }

  if (number >= 46) {
    return {
      text: `*La rabia aparece*

_La obra ya no solo te incomoda: algo en ella te interpela._
*→ Elige la obra de la Exposición Digna Rabia que más te afecte y sostén la mirada durante unos segundos más.*

_Pregúntate qué despierta en ti._`,
      sticker: stickers[15]
    };
  }

  if (number >= 31) {
    return {
      text: `*No me levante la voz*

_La incomodidad empieza a tomar forma._
*→ Camina lentamente alrededor de una obra de la Exposición Digna Rabia y obsérvala desde distintos ángulos.*`,
      sticker: stickers[16]
    };
  }

  if (number >= 16) {
    return {
      text: `*Ceja levantada*

_Tu rabia empieza a subir: es una mezcla de curiosidad y pregunta._
*→ Busca un detalle de la Exposición Digna Rabia y tómale una foto.*`,
      sticker: stickers[17]
    };
  }

  return {
    text: `*Ceño fruncido*

_La incomodidad empieza a tomar forma._
*→ Mira una obra de la Exposición Digna Rabia en silencio durante diez segundos.*`,
    sticker: stickers[18]
  };
}

app.get("/", (req, res) => {
  res.send("Digna Rabia Bot activo");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado");
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = (message.text?.body || "").trim().toLowerCase();

    console.log("Mensaje recibido:", text);

    // MENÚ PRINCIPAL
    if (["hola", "inicio", "menu", "menú"].includes(text)) {
  resetUser(from);
  await sendSticker(from, stickers[0]);
  await sendText(from, menu);
  return res.sendStatus(200);
}

if (text === "rabia") {
  resetUser(from);
  await sendText(from, menuRetorno);
  return res.sendStatus(200);
}

if (userStates[from] === "awaiting_rabia_number") {
  delete userStates[from];

  const number = Number(text);

  if (!Number.isNaN(number) && number >= 0) {
    const response = rabiaResponse(number);

    await sendSticker(from, response.sticker);
    await sendText(from, response.text);
    await sendText(from, "¿Quieres medir tu rabia de nuevo?");

    userStates[from] = "repeat_rabia";

    return res.sendStatus(200);
  }

  await sendText(from, menuRetorno);

  return res.sendStatus(200);
}

    // OPCIONES PRINCIPALES
    if (text === "1") {
      resetUser(from);
      await sendText(
        from,
        `*¿Cuánta rabia tienes hoy?*

Dímelo con un número de 0 a 90, siendo 90 el máximo.

Y recuerda:

_la rabia no es solo un estallido._
_A veces es una pregunta._
_A veces es memoria._
_A veces es una fuerza que nos mueve._

-Porque la rabia no siempre desaparece…_
_a veces se transforma_ - Exposición Digna Rabia`
      );

      userStates[from] = "awaiting_rabia_number";

      return res.sendStatus(200);
    }

    if (text === "2") {
      resetUser(from);
      await sendText(
        from,
        `*Avivar el fuego colectivo*

Piensa en una rabia que no es solo tuya.

_¿Con quién?_
_¿Cómo?_
_¿Qué te gustaría que cambiara?_

Selecciona alguna de estas opciones:

*a. Aquí se defiende…*
*b. Gritemos por…*
*c. Mi rabia es digna y…*

Escribe *a*, *b* o *c* para escoger el inicio de tu frase.`
      );

      userStates[from] = "awaiting_frase_opcion";

      return res.sendStatus(200);
    }

    if (text === "3") {
      resetUser(from);
      await sendText(
        from,
        `*Aquí podrás descargar un paquete de stickers de la exposición Digna Rabia.*

Son fragmentos para poner a circular lo que sientes y piensas, para que pasen de chat en chat, de voz en voz.

_Deja que el mensaje encuentre su lugar._

_¿Dónde podría aparecer?_

_Déjalo circular, multiplicarse y abrir nuevas conversaciones._

_Propaga la llama_

*¿Quieres un sticker?*`
      );

      return res.sendStatus(200);
    }

    if (text === "4") {
      resetUser(from);
      await sendText(
        from,
        `Esperamos que disfrutes la exposición Digna Rabia.

Este espacio estará disponible si quieres explorar lo que sientes durante el recorrido o después de atravesarlo:
pensarlo, hacerlo circular y transformarlo.

_Puedes escribir RABIA en cualquier momento para volver al menú principal._`
      );

      return res.sendStatus(200);
    }

    // ESTADOS DE FRASE COLECTIVA
    if (userStates[from] === "awaiting_frase_opcion") {
      if (["a", "a."].includes(text)) {
        userPhrases[from] = "Aquí se defiende";
      } else if (["b", "b."].includes(text)) {
        userPhrases[from] = "Gritemos por";
      } else if (["c", "c."].includes(text)) {
        userPhrases[from] = "Mi rabia es digna y";
      } else {
        await sendText(from, "Elige una opción escribiendo a, b o c.");
        return res.sendStatus(200);
      }

      userStates[from] = "awaiting_frase_final";

      await sendText(
        from,
        `Escribe cómo quieres completar la frase:

*${userPhrases[from]}…*`
      );

      return res.sendStatus(200);
    }

    if (userStates[from] === "awaiting_frase_final") {
      const fraseCompleta = `${userPhrases[from]} ${message.text.body}`;

      delete userStates[from];
      delete userPhrases[from];

      await sendText(
        from,
        `Tu frase es:

*${fraseCompleta}*

Gracias por avivar el fuego.

¿Quieres probar a hacer otra frase?

¿Quieres hacer un cartel con tu frase?
_Puedes ir a la sala didáctica de la exposición Digna Rabia para hacer el cartel._
_Hazlo visible._`
      );

      userStates[from] = "repeat_frase";

      return res.sendStatus(200);
    }

    // ESTADOS DE CONTINUIDAD
    if (userStates[from] === "repeat_rabia") {
      delete userStates[from];

      if (["sí", "si", "s"].includes(text)) {
        await sendText(
          from,
          `*¿Cuánta rabia tienes hoy?*
_Dímelo con un número de 0 a 90, siendo 90 el máximo._
          
*¿Quieres probar la fuerza de tu rabia en la sala?*
_Acércate al Rabiómetro de la sala didáctica en la Exposición Digna Rabia._`
        );
        return res.sendStatus(200);
      }

      await sendText(from, menuRetorno);
      return res.sendStatus(200);
    }

    if (userStates[from] === "repeat_frase") {
      delete userStates[from];

      if (["sí", "si", "s"].includes(text)) {
        await sendText(
          from,
          `Selecciona alguna de estas opciones:

*a. Aquí se defiende…*
*b. Gritemos por…*
*c. Mi rabia es digna y…*

Escribe *a*, *b* o *c* para escoger el inicio de tu frase.`
        );

        userStates[from] = "awaiting_frase_opcion";

        return res.sendStatus(200);
      }

      await sendText(from, menuRetorno);
      return res.sendStatus(200);
    }

    if (userStates[from] === "repeat_sticker") {
  delete userStates[from];

  if (["sí", "si", "s", "otro"].includes(text)) {
    const randomSticker = stickers[Math.floor(Math.random() * 12)];

    await sendText(from, "Aquí tienes uno.\nPonlo a circular.");
    await sendSticker(from, randomSticker);

    await sendText(
      from,
      `Dime *“otro”* si quieres uno más, *“varios”* si quieres varios o *“todos”* si quieres la colección completa.`
    );

    userStates[from] = "repeat_sticker";

    return res.sendStatus(200);
  }

  if (text === "varios") {
    for (let i = 0; i < 3; i++) {
      const randomSticker = stickers[Math.floor(Math.random() * 12)];
      await sendSticker(from, randomSticker);
    }

    await sendText(
      from,
      `Dime “otro” si quieres uno más, “varios” si quieres varios o “todos” si quieres la colección completa.`
    );

    userStates[from] = "repeat_sticker";

    return res.sendStatus(200);
  }

  if (text === "todos") {
    for (let i = 1; i <= 12; i++) {
      await sendSticker(from, stickers[i]);
    }

    await sendText(
      from,
      `Hazlos circular.

¿Quieres explorar otras formas de dinamizar tu rabia?`
    );

    return res.sendStatus(200);
  }

  await sendText(from, menuRetorno);

  return res.sendStatus(200);
}

    // MEDICIÓN NUMÉRICA DE LA RABIA
    /*const number = Number(text);

    if (!Number.isNaN(number) && number >= 0) {
      const response = rabiaResponse(number);

      await sendSticker(from, response.sticker);
      await sendText(from, response.text);
      await sendText(from, "¿Quieres medir tu rabia de nuevo?");
      userStates[from] = "repeat_rabia";

      return res.sendStatus(200);
    }*/

    // ENVÍO DE STICKERS
    if (["sí", "si", "sticker", "uno"].includes(text)) {
      const randomSticker =
        stickers[Math.floor(Math.random() * 12)];

      await sendText(from, "Aquí tienes uno.\nPonlo a circular.");
      await sendSticker(from, randomSticker);

      await sendText(
        from,
        `Dime *“otro”* si quieres uno más, *“varios”* si quieres varios o *“todos”* si quieres la colección completa.`
      );

      userStates[from] = "repeat_sticker";

      return res.sendStatus(200);
    }

    if (text === "todos") {
      for (let i = 0; i < 12; i++) {
        await sendSticker(from, stickers[i]);
      }

      await sendText(
        from,
        `Hazlos circular

¿Quieres explorar otras formas de dinamizar tu rabia?

Vuelve al menú principal.`
      );

      return res.sendStatus(200);
    }

    // RESPUESTA POR DEFECTO
    await sendSticker(from, stickers[0]);
    await sendText(from, menu);

    res.sendStatus(200);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor activo en puerto 3000");
});