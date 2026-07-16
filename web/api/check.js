// 码支付 - 查询支付状态
const MERCHANT_KEY = '53Ys2FgVrCgU87KQnJlY';

function md5(str) {
  return require('crypto').createHash('md5').update(str).digest('hex');
}

const paidOrders = globalThis.__paidOrders || (globalThis.__paidOrders = {});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const out_trade_no = req.query.out_trade_no;
  if (!out_trade_no) {
    return res.json({ success: false, paid: false, msg: '缺少订单号' });
  }

  // 检查内存中是否已有支付记录
  if (paidOrders[out_trade_no]) {
    return res.json({ success: true, paid: true });
  }

  // 尝试主动查询码支付
  try {
    const params = {
      act: 'order',
      pid: '12115',
      out_trade_no: out_trade_no,
      key: MERCHANT_KEY
    };
    const keys = Object.keys(params).sort();
    let signStr = '';
    for (const k of keys) signStr += k + '=' + params[k] + '&';
    signStr += 'key=' + MERCHANT_KEY;
    params.sign = md5(signStr).toLowerCase();

    const https = require('https');
    const postData = new URLSearchParams(params).toString();
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.mazfu.com', path: '/xpay/epay/',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      };
      const r = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch(e) { resolve({}); }
        });
      });
      r.on('error', () => resolve({}));
      r.write(postData);
      r.end();
    });

    if (result.status === 1 || result.status === '1') {
      paidOrders[out_trade_no] = { paid: true, time: Date.now() };
      return res.json({ success: true, paid: true });
    }
  } catch(e) {}

  res.json({ success: true, paid: false });
};
