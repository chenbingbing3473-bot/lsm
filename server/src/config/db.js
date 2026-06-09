/**
 * MongoDB 连接
 * 本地无 MongoDB 时自动回退到内存数据库（开发用）
 */
const mongoose = require('mongoose');
const config = require('./env');

let memoryServer = null;

async function connectDB() {
  mongoose.set('strictQuery', true);

  if (config.useMemoryDb) {
    return connectMemoryDb();
  }

  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] 已连接: ${config.mongodbUri}`);
    return;
  } catch (err) {
    console.warn(`[MongoDB] 无法连接 ${config.mongodbUri}，回退到内存数据库`);
    console.warn(`  原因: ${err.message}`);
    return connectMemoryDb();
  }
}

async function connectMemoryDb() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri('lean_spinmeal');
  await mongoose.connect(uri);
  console.log('[MongoDB] 已连接: 内存数据库 (mongodb-memory-server)');
  console.log('  提示: 重启后数据会清空。生产环境请安装 MongoDB 或 Docker。');
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
