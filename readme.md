# 多多客自动转链工具

使用 Deno 开发，快速生成多多客推广链接

![](https://deno-art.u1qo.com/deno@0.25x.png)

## 使用方法

使用客户端或多多客网页端分享商品链接，如：

```
https://mobile.yangkeduo.com/goods.html?_wvx=10&refer_share_uid=8298247403&share_uin=55ON7V7472UIP3BP5C5UXZMGPE_GEXDA&page_from=0&_wv=41729&refer_share_channel=copy_link&refer_share_id=sUn8q8mFNb9jq7qODWgAnqmuhhwX2Cbr&share_uid=8298247403&pxq_secret_key=7YAEXNBQJGC7YY6UV5SLOTZYDK6VTPG36SNCLJRX37GAWIK4ILBA&goods_id=128131915616
```

将域名`mobile.yangkeduo.com`改为`pdd.u1qo.com`，如：

```
https://pdd.u1qo.com/goods.html?_wvx=10&refer_share_uid=8298247403&share_uin=55ON7V7472UIP3BP5C5UXZMGPE_GEXDA&page_from=0&_wv=41729&refer_share_channel=copy_link&refer_share_id=sUn8q8mFNb9jq7qODWgAnqmuhhwX2Cbr&share_uid=8298247403&pxq_secret_key=7YAEXNBQJGC7YY6UV5SLOTZYDK6VTPG36SNCLJRX37GAWIK4ILBA&goods_id=128131915616
```

也可以删掉其他参数留下`goods_id`这个参数：

```
https://pdd.u1qo.com/goods.html?goods_id=128131915616
```

直接访问这个链接就是生成的推广链接，购买后会获得佣金，但是如果这个商品没有参加多多客推广，会返回404

可以访问这个链接查看商品的信息，如佣金率和优惠券：

```
https://pdd.u1qo.com/?goods_id=128131915616
```

区别是没有`goods.html`

## 部署方法

### 设置环境变量

以下三个环境变量是必须的：

- `client_id` 多多客id
- `secret` 多多客secret
- `pid` 推广位ID

相关信息可以去开通[多多客开发者](https://jinbao.pinduoduo.com/)

### 裸部署

裸部署可以直接修改`FC_SERVER_PORT`环境变量来改变监听端口，然后运行：

```
deno bundle mod.ts bundle.js && deno run --allow-net --allow-env bundle.js
```

也可以直接使用`.env`文件设置环境变量，程序中有支持`.env`文件

### 阿里云函数计算

前提条件：

- 安装并登录`funcraft`
- 配置`template.yml`

大致流程：

- clone
- make && make deno
- fun init   然后选`http-trigger-nodejs12`
- 修改`template.yml`，`runtime`为`custom`，其他选项按需配置，超时可以设置较大一点，比如5秒
- fun deploy -y
- 根据需要绑定域名和ssl证书

## MIT LICENSE