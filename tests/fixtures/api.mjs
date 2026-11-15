import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const port = Number(process.argv[2]);
const base = "http://127.0.0.1:" + port;
const pictures = new Set(["sneakers", "watch", "headphones", "phone", "bracelet", "bag"]);
const categories = ["electronics", "jewelery", "men's clothing", "women's clothing"];
const catalog = [
  ["sneakers", "کتانی ورزشی", "Everyday Sneakers", 3499000, 4.7, 80, 2],
  ["watch", "ساعت هوشمند", "Pulse Smartwatch", 3999000, 4.6, 95, 0],
  ["headphones", "هدفون بی‌سیم حرفه‌ای", "Studio Wireless Headphones", 2999000, 4.8, 120, 0],
  ["phone", "گوشی هوشمند", "Nova X Smartphone", 15999000, 4.6, 110, 0],
  ["bracelet", "دستبند نقره‌ای", "Silver Chain Bracelet", 1499000, 4.7, 60, 1],
  ["bag", "کیف دستی زنانه", "City Carry Handbag", 1999000, 4.5, 70, 3],
  ["headphones", "هدفون استودیویی", "Studio Headphones II", 3499000, 4.4, 53, 0],
  ["watch", "ساعت اسپرت", "Sport Smartwatch", 2799000, 4.1, 50, 0],
  ["bag", "کیف دوشی", "City Sling Bag", 2499000, 4.2, 44, 3],
];
const people = [
  ["آوا", "احمدی", "Ava", "Ahmadi", "ava.ahmadi", "ava@example.com", "0912 000 0124"],
  ["کیان", "رضایی", "Kian", "Rezaei", "kian.rezaei", "kian@example.com", "0935 000 0158"],
  ["رها", "کریمی", "Raha", "Karimi", "raha.karimi", "raha@example.com", "0919 000 0421"],
  ["نیما", "نوری", "Nima", "Nouri", "nima.nouri", "nima@example.com", "0936 000 0755"],
  ["نازنین", "موسوی", "Nazanin", "Mousavi", "naz.mousavi", "nazanin@example.com", "0912 000 0430"],
  ["آرین", "سلیمی", "Arian", "Salimi", "arian.salimi", "arian@example.com", "0910 000 0767"],
];
let locale = "en";
let mode = "ok";
let requests = {};
let mutations = {};

function send(res, code, payload) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}
async function parseBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return JSON.parse(body);
}

createServer(async (req, res) => {
  const url = new URL(req.url, base);
  const { pathname, searchParams } = url;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type,accept");
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }
  if (pathname === "/health") {
    send(res, 200, true);
    return;
  }
  if (pathname === "/__control") {
    mode = searchParams.get("mode") || "ok";
    locale = searchParams.get("locale") || "en";
    if (searchParams.get("reset")) {
      requests = {};
      mutations = {};
    }
    send(res, 200, { mode, locale });
    return;
  }
  if (pathname === "/__stats") {
    send(res, 200, { requests, mutations });
    return;
  }
  if (pathname.startsWith("/photos/")) {
    const image = pathname
      .split("/")
      .at(-1)
      ?.replace(/\.jpg$/, "");
    if (pictures.has(image)) {
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(await readFile(new URL("./photos/" + image + ".jpg", import.meta.url)));
      return;
    }
  }
  requests[pathname] = (requests[pathname] || 0) + 1;
  if (mode === "slow" || (req.method === "POST" && mode === "slow-post"))
    await new Promise((resolve) => setTimeout(resolve, 1000));
  if (mode === "error" && req.method === "GET") {
    send(res, 503, { error: true });
    return;
  }
  if (req.method === "POST") {
    mutations[pathname] = (mutations[pathname] || 0) + 1;
    const data = await parseBody(req);
    if (pathname === "/auth/login") {
      if (data.username === "demo" && data.password === "demo-pass")
        send(res, 200, { token: "fixture-demo-token" });
      else send(res, 401, { error: "invalid credentials" });
      return;
    }
    if (mode === "reject-post") {
      send(res, 503, { error: true });
      return;
    }
    if (pathname === "/products") {
      send(res, 200, { ...data, id: 21 });
      return;
    }
    if (pathname === "/users") {
      if (!data.address?.geolocation || !data.firstname || !data.lastname) {
        send(res, 422, { error: true });
        return;
      }
      send(res, 200, {
        ...data,
        id: 11,
        name: { firstname: data.firstname, lastname: data.lastname },
      });
      return;
    }
  }
  if (pathname === "/products/categories") {
    send(res, 200, categories);
    return;
  }
  if (pathname === "/products") {
    send(
      res,
      200,
      mode === "empty"
        ? []
        : catalog.slice(0, 6).map(([photo, fa, en, price, rate, count, category], index) => ({
            id: index + 1,
            title: locale === "fa" ? fa : en,
            description: "NOVA fixture",
            price,
            rating: { rate, count },
            category: categories[category],
            image: base + "/photos/" + photo + ".jpg",
          }))
    );
    return;
  }
  if (pathname === "/users") {
    send(
      res,
      200,
      mode === "empty"
        ? []
        : people.map(([fa, faLast, en, enLast, username, email, phone], index) => ({
            id: index + 1,
            name: {
              firstname: locale === "fa" ? fa : en,
              lastname: locale === "fa" ? faLast : enLast,
            },
            username,
            email,
            phone,
            password: "discard-this-demo-field",
          }))
    );
    return;
  }
  send(res, 404, { error: true });
}).listen(port, "127.0.0.1");
