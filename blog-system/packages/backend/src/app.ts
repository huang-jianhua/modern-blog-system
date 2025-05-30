import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// 路由导入
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import commentRoutes from './routes/comments';
import userRoutes from './routes/users';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import uploadRoutes from './routes/upload';
import searchRoutes from './routes/search';

const app = express();

// 基础中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// CORS 配置
app.use(cors({
  origin: config.client.url,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 全局限流
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 限制每个 IP 1000 次请求
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '请求过于频繁，请稍后再试',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.env,
  });
});

// API 版本信息
app.get('/api', (req, res) => {
  res.json({
    name: 'Modern Blog System API',
    version: '1.0.0',
    description: '现代化博客系统 REST API',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/comments',
      users: '/api/users',
      categories: '/api/categories',
      tags: '/api/tags',
      upload: '/api/upload',
      search: '/api/search',
    },
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);
app.use('/api/search', searchRoutes);

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路径 ${req.originalUrl} 不存在`,
    },
  });
});

// 全局错误处理
app.use(errorHandler);

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM 信号收到，开始优雅关闭');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT 信号收到，开始优雅关闭');
  process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

export default app; 