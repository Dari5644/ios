require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const { watchSettings, getCurrentSettings } = require('./utils/settingsWatcher');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// تحميل الأوامر (Slash Commands)
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(__dirname, 'commands', file));
  client.commands.set(command.name, command);
}

// تحميل الأحداث (Events)
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(__dirname, 'events', file));
  client.on(event.name, (...args) => event.execute(...args, client));
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true });
  }
});

client.once('ready', async () => {
  console.log(`✅ البوت متصل باسم ${client.user.tag}`);

  // تسجيل أوامر السلاش على السيرفر المحدد في لوحة التحكم
  const settings = getCurrentSettings();
  if (settings?.client_id && settings?.guild_id) {
    try {
      const rest = new REST({ version: '10' }).setToken(settings.bot_token);
      const commandsData = [...client.commands.values()].map(c => ({ name: c.name, description: c.description }));
      await rest.put(
        Routes.applicationGuildCommands(settings.client_id, settings.guild_id),
        { body: commandsData }
      );
      console.log('✅ تم تسجيل أوامر السلاش على السيرفر');
    } catch (err) {
      console.error('❌ فشل تسجيل أوامر السلاش:', err.message);
    }
  }
});

// دالة بدء تشغيل البوت: تقرأ التوكن من قاعدة البيانات (المُدخل من لوحة التحكم) لا من ملف env
async function bootstrap() {
  const settings = getCurrentSettings();

  if (!settings?.is_enabled || !settings?.bot_token) {
    console.log('⏸️  البوت متوقف: لم يتم إدخال/تفعيل توكن البوت من لوحة التحكم بعد.');
    console.log('   افتح لوحة التحكم → إعدادات البوت → أدخل Token وClient ID وGuild ID ثم فعّل البوت.');
  } else {
    await client.login(settings.bot_token);
  }

  // مراقبة مستمرة: أي تغيير للتوكن/التفعيل من لوحة التحكم يُطبَّق تلقائياً هنا بدون إعادة تشغيل يدوي
  watchSettings(client);
}

bootstrap();
