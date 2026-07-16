// 码支付 - 支付通知回调
const MERCHANT_KEY = '53Ys2FgVrCgU87KQnJlY';

function md5(str) {
  return require('crypto').createHash('md5').update(str).digest('hex');
}

// 简易内存存储（Vercel 无服务器函数中每个请求独立，实际用 KV 更好）
// 这里用全局变量，在同一实例的请求间可共享
const paidOrders = globalThis.__paidOrders || (globalThis.__paidOrders = {});

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  let data = {};
  if (req.method === 'POST') {
    if (typeof req.body === 'string') {
      try { data = JSON.parse(req.body); } catch(e) {
        const parts = req.body.split('&');
        for (const p of parts) {
          const [k, v] = p.split('=');
          if (k && v) data[k] = decodeURIComponent(v);
        }
      }
    } else {
      data = req.body || {};
    }
  } else {
    data = req.query || {};
  }

  // 验证签名
  const received_sign = data.sign;
  delete data.sign;
  delete data.sign_type;

  const keys = Object.keys(data).sort();
  let signStr = '';
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== '') {
      signStr += k + '=' + data[k] + '&';
    }
  }
  signStr += 'key=' + MERCHANT_KEY;
  const calcSign = md5(signStr).toLowerCase();

  if (data.out_trade_no && (calcSign === (received_sign || '').toLowerCase())) {
    // 支付成功
    paidOrders[data.out_trade_no] = { paid: true, time: Date.now() };
    res.json({ code: 1, msg: 'success' });
  } else {
    res.json({ code: 0, msg: 'fail' });
  }
};
