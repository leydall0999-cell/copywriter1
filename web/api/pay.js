// 码支付 - 创建支付订单
const MERCHANT_ID = '12115';
const MERCHANT_KEY = '53Ys2FgVrCgU87KQnJlY';
const API_URL = 'https://www.mazfu.com/xpay/epay/';

function md5(str) {
  return require('crypto').createHash('md5').update(str).digest('hex');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const out_trade_no = 'CP' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const notify_url = 'https://' + req.headers.host + '/api/notify';
  const return_url = 'https://' + req.headers.host + '/';

  const params = {
    pid: MERCHANT_ID,
    type: 'wechat',
    out_trade_no: out_trade_no,
    notify_url: notify_url,
    return_url: return_url,
    name: '文案生成器-永久解锁',
    money: '9.90',
    sign_type: 'MD5',
    format: 'json'
  };

  // 生成签名: 按参数名排序 + key
  const keys = Object.keys(params).sort();
  let signStr = '';
  for (const k of keys) signStr += k + '=' + params[k] + '&';
  signStr += 'key=' + MERCHANT_KEY;
  params.sign = md5(signStr);

  try {
    const https = require('https');
    const postData = new URLSearchParams(params).toString();
    const result = await new Promise((resolve, reject) => {
      const url = new URL(API_URL);
      const options = {
        hostname: url.hostname, path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
      };
      const r = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data }); }
        });
      });
      r.on('error', reject);
      r.write(postData);
      r.end();
    });

    if (result.code === 1 || result.code === '1') {
      res.json({ success: true, out_trade_no, qrcode: result.qrcode, pay_url: result.pay_url || result.url });
    } else if (result.qrcode) {
      res.json({ success: true, out_trade_no, qrcode: result.qrcode });
    } else {
      res.json({ success: false, msg: result.msg || '创建订单失败' + (result.raw ? ': ' + result.raw.slice(0,200) : '') });
    }
  } catch (e) {
    res.json({ success: false, msg: '服务器错误: ' + e.message });
  }
};
