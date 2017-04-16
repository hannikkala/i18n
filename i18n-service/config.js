module.exports = {
  localeDir: process.env.LOCALES_FOLDER,
  port: process.env.PORT || 3000,
  persistence: process.env.PERSISTENCE || 'memory',
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/i18n',
  adminPassword: process.env.ADMIN_PASSWORD || 'password',
  jwtSecret: process.env.JWT_SECRET || 'somethingv3rys3cr3there'
};