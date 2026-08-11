const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const BotSettings = require('../models/BotSettings');
const Activity = require('../models/Activity');
const { requireAuth } = require('../middleware/auth');

const DISCORD_API = 'https://discord.com/api';

// الخطوة 1: تحويل المستخدم لصفحة موافقة ديسكورد
router.get('/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_CALLBACK_URL,
    response_type: 'code',
    scope: 'identify guilds.members.read'
  });
  res.redirect(`${DISCORD_API}/oauth2/authorize?${params.toString()}`);
});

// الخطوة 2: استقبال الكود، تبديله بتوكن، جلب بيانات الحساب + اللقب داخل السيرفر
router.get('/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${process.env.CLIENT_URL}/login?error=missing_code`);

  try {
    // تبديل الكود بأكسس توكن
    const tokenRes = await axios.post(`${DISCORD_API}/oauth2/token`, new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_CALLBACK_URL
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    const { access_token } = tokenRes.data;

    // جلب بيانات الحساب الأساسية
    const profileRes = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const profile = profileRes.data;

    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number(profile.discriminator || 0) % 5}.png`;

    // جلب اللقب (Nickname) داخل السيرفر المعتمد إن وُجد Guild ID في إعدادات البوت
    const botSettings = BotSettings.get();
    let nickname = null;
    if (botSettings?.guild_id) {
      try {
        const memberRes = await axios.get(
          `${DISCORD_API}/users/@me/guilds/${botSettings.guild_id}/member`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        nickname = memberRes.data.nick || null;
      } catch (e) {
        nickname = null; // المستخدم ليس عضواً في السيرفر المعتمد
      }
    }

    // إنشاء أو تحديث المستخدم في قاعدة البيانات المحلية
    let user = User.findByDiscordId(profile.id);
    const isNewUser = !user;
    if (!user) {
      user = User.create({ discordId: profile.id, username: profile.username, nickname, avatar: avatarUrl });
      Activity.log({ userId: user.id, type: 'join', message: `${nickname || profile.username} انضم إلى المنصة 🎮` });
    } else {
      user = User.updateProfile(profile.id, { username: profile.username, nickname, avatar: avatarUrl });
    }

    // إصدار JWT وتخزينه في كوكي httpOnly
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // عندما يكون الفرونت إند على دومين مختلف عن الباك إند (سيرفر منفصل) يجب أن تكون
    // sameSite = 'none' مع secure = true حتى يقبل المتصفح إرسال الكوكي عبر النطاقات (Cross-Site).
    // في localhost نُبقي 'lax' لأن secure=false لا يعمل مع 'none' في أغلب المتصفحات.
    const isCrossSite = process.env.CROSS_SITE_COOKIES === 'true';
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: isCrossSite ? 'none' : 'lax',
      secure: isCrossSite || process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`${process.env.CLIENT_URL}/`);
  } catch (err) {
    console.error('خطأ في تسجيل الدخول عبر ديسكورد:', err.response?.data || err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

router.post('/logout', (req, res) => {
  const isCrossSite = process.env.CROSS_SITE_COOKIES === 'true';
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: isCrossSite ? 'none' : 'lax',
    secure: isCrossSite || process.env.NODE_ENV === 'production'
  });
  res.json({ success: true });
});

module.exports = router;
