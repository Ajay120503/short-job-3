import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

export const signature = (body, secret) => crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function createHandler({ env = process.env, transport, now = Date.now } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!env.EMAIL_BRIDGE_SECRET || env.EMAIL_BRIDGE_SECRET.length < 32) return res.status(503).json({ error: 'Email service unavailable' });
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > 2048) return res.status(400).json({ error: 'Invalid request' });
    const supplied = typeof req.headers.authorization === 'string' ? req.headers.authorization.replace(/^Bearer /, '') : '';
    const expected = signature(body, env.EMAIL_BRIDGE_SECRET);
    if (!/^[a-f0-9]{64}$/.test(supplied) || !crypto.timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(expected, 'hex'))) return res.status(401).json({ error: 'Unauthorized' });
    const { email, purpose, token, name, timestamp, nonce } = body;
    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
        !['registration', 'password-reset', 'verification'].includes(purpose) ||
        typeof token !== 'string' || !(purpose === 'verification' ? /^[a-f0-9]{64}$/ : /^\d{6}$/).test(token) ||
        typeof name !== 'string' || name.length > 200 || /[\r\n]/.test(name) ||
        !Number.isSafeInteger(timestamp) || Math.abs(now() - timestamp) > 60000 ||
        typeof nonce !== 'string' || !/^[a-f0-9]{32}$/.test(nonce) ||
        Object.keys(body).some(key => !['email', 'purpose', 'token', 'name', 'timestamp', 'nonce'].includes(key))) return res.status(400).json({ error: 'Invalid request' });
    try {
      if (!env.SMTP_USER || !env.SMTP_PASS) throw new Error('Missing credentials');
      const subject = purpose === 'password-reset' ? 'Password Reset OTP - ShortJob' : purpose === 'verification' ? 'Verify Your Email - ShortJob' : 'Your ShortJob Verification Code';
      const expiry = purpose === 'registration' ? '10 minutes' : purpose === 'password-reset' ? '15 minutes' : '1 hour';
      let action = token;
      if (purpose === 'verification') {
        const base = new URL(env.APP_URL);
        if (base.protocol !== 'https:' || base.username || base.password) throw new Error('Invalid configuration');
        action = new URL(`/verify-email/${token}`, base.origin).href;
      }
      const text = `${name ? `Hello ${name},\n\n` : ''}${subject}\n\n${action}\n\nExpires in ${expiry}. If you did not request this email, ignore it.`;
      const content = purpose === 'verification' ? `<a href="${escape(action)}">Verify email</a>` : `<p style="font-size:32px;letter-spacing:6px;font-weight:bold">${token}</p>`;
      const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1 style="color:#0d9488">ShortJob</h1><h2>${subject}</h2>${name ? `<p>Hello ${escape(name)},</p>` : ''}${content}<p>Expires in ${expiry}. If you did not request this email, ignore it.</p></div>`;
      const mailer = transport || nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS.replaceAll(' ', '') },
        connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
        disableFileAccess: true, disableUrlAccess: true });
      // Await delivery: serverless invocations may freeze after responding.
      const result = await mailer.sendMail({ from: { name: 'ShortJob', address: env.SMTP_USER }, to: { address: email }, subject, text, html });
      if (result.rejected?.length || (result.accepted && !result.accepted.length)) throw new Error('Recipient rejected');
      return res.status(200).json({ accepted: true });
    } catch {
      return res.status(503).json({ error: 'Email delivery unavailable' });
    }
  };
}
