// Copyright @2020 orzv. All rights reserved. MIT License.
// Author: orzv
// Email: orzv@outlook.com
// Github: https://github.com/orzv

import { serve } from "https://deno.land/std/http/server.ts";
import { Md5 } from "https://deno.land/std/hash/md5.ts";

const template = `<!DOCTYPE html>
<html lang="zh">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>{title}</title>
</head>

<body>
	<h2>{title}</h2>
	<p>原价：¥{price}</p>
	<p>优惠券：¥{coupon}</p>
	<p>佣金比率：{promotion}%</p>
	<p>实际消费：¥{final}</p>
	<p><a href="{link}">点击购买</a></p>
</body>

</html>`;

function _config() {
  try {
    let str = Deno.readTextFileSync(".env");
    let arr = str.split("\n");
    for (let line of arr) {
      let [k, v] = line.split("=");
      Deno.env.set(k, v);
    }
  } catch {
    console.log("no dotenv");
  }
  let client_id = Deno.env.get("client_id") || "";
  let secret = Deno.env.get("secret") || "";
  let pid = Deno.env.get("pid") || "";
  let port = Deno.env.get("FC_SERVER_PORT") || "9000";
  return { client_id, secret, pid, port: parseInt(port) };
}

async function fetchPddGoodsInfo({ client_id, id, secret, pid }: PddParams) {
  async function _get(data: any) {
    let obj = Object.assign({
      client_id,
      timestamp: Math.floor(Date.now() / 1000).toString(),
    }, data);
    let str = Object.keys(obj).sort().map((i) => `${i}${obj[i]}`).join("");
    let sign = new Md5().update(secret + str + secret)
      .toString().toUpperCase();
    obj.sign = sign;
    let body = new URLSearchParams(obj);
    return await (await fetch("https://gw-api.pinduoduo.com/api/router", {
      body,
      method: "POST",
    })).json();
  }

  let [res1, res2] = await Promise.all([
    _get({
      type: "pdd.ddk.goods.detail",
      goods_id_list: `[${id}]`,
      pid,
    }),
    _get({
      type: "pdd.ddk.goods.promotion.url.generate",
      goods_id_list: `[${id}]`,
      p_id: pid,
      generate_short_url: "true",
    }),
  ]);
  if (res1.error_response || res2.error_response) {
    console.error(res1.error_response.sub_msg);
    return null;
  }
  let arr1 = res1.goods_detail_response.goods_details;
  if (!arr1.length) return null;

  let arr2 =
    res2.goods_promotion_url_generate_response.goods_promotion_url_list;
  if (!arr2.length) return null;

  return {
    id,
    title: arr1[0].goods_name,
    price: arr1[0].min_group_price,
    coupon: arr1[0].coupon_discount,
    promotion: arr1[0].promotion_rate,
    link: arr2[0].short_url,
  };
}

async function start() {
  let config = _config();
  console.log("Listening on", config.port);

  for await (let req of serve({ port: config.port })) {
    if (req.method != "GET") {
      await req.respond({ status: 404 });
      continue;
    }

    let query = new URLSearchParams(req.url.split("?")[1] || "");
    let id = query.get("goods_id");
    if (!id) {
      await req.respond({ status: 400 });
      continue;
    }

    let goodsInfo = await fetchPddGoodsInfo({
      id,
      client_id: config.client_id,
      pid: config.pid,
      secret: config.secret,
    });

    if (!goodsInfo) {
      await req.respond({ status: 404 });
      continue;
    }

    let path = req.url.split("?")[0].split("/").pop() || "";
    if (/\.html$/.test(path)) {
      await req.respond({
        status: 302,
        headers: new Headers({
          location: goodsInfo.link,
        }),
      });
    } else {
      let data: { [p: string]: string } = {
        price: (goodsInfo.price / 100).toFixed(2),
        promotion: (goodsInfo.promotion / 10).toFixed(0),
        coupon: (goodsInfo.coupon / 100).toFixed(2),
        title: goodsInfo.title as string,
        final: (
          (goodsInfo.price - goodsInfo.coupon) *
          (1000 - goodsInfo.promotion) /
          100000
        ).toFixed(2),
        link: goodsInfo.link as string,
      };
      let body = template;
      Object.keys(data).forEach((k) => {
        body = body.replace(
          new RegExp("{" + k + "}", "gm"),
          data[k] as string,
        );
      });
      await req.respond({
        body: body,
        headers: new Headers({
          "content-type": "text/html",
        }),
      });
    }
  }
}

if (import.meta.main) start();

interface PddParams {
  pid: string;
  secret: string;
  client_id: string;
  id: string;
}
