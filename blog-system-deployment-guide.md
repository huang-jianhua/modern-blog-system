# 现代化博客系统 - 部署运维指南

## 🚀 部署架构

### 生产环境架构图
```
                          ┌─────────────────┐
                          │   CDN (阿里云)   │
                          │  静态资源加速     │
                          └─────────┬───────┘
                                    │
                          ┌─────────▼───────┐
                          │  Load Balancer  │
                          │   (Nginx)       │
                          └─────────┬───────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼────────┬──────▼────────┬─────▼────────┐
            │   Web Server   │  Web Server   │ Web Server   │
            │  (Node.js)     │  (Node.js)    │ (Node.js)    │
            │   Port: 3001   │  Port: 3002   │ Port: 3003   │
            └────────┬───────┴──────┬────────┴─────┬────────┘
                     │              │              │
                     └──────────────┼──────────────┘
                                    │
                          ┌─────────▼───────┐
                          │   PostgreSQL    │
                          │   主从复制       │
                          └─────────┬───────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┬───────▼───────┬───────▼───────┐
            │     Redis     │ Elasticsearch │   监控服务     │
            │     缓存      │    搜索引擎    │ (Prometheus)  │
            └───────────────┴───────────────┴───────────────┘
```

### 容器化部署方案

#### Dockerfile - 后端服务
```dockerfile
# packages/backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# 构建应用
WORKDIR /app/packages/backend
RUN npm run build

# 生产镜像
FROM node:18-alpine AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# 复制构建结果
COPY --from=builder --chown=nextjs:nodejs /app/packages/backend/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/backend/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/backend/package.json ./package.json

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

USER nextjs

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
```

#### Dockerfile - 前端应用
```dockerfile
# packages/frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
COPY packages/shared/package*.json ./packages/shared/

# 安装依赖
RUN npm ci

# 复制源代码
COPY packages/frontend ./packages/frontend
COPY packages/shared ./packages/shared

# 构建应用
WORKDIR /app/packages/frontend
RUN npm run build

# Nginx 生产镜像
FROM nginx:alpine AS runner

# 复制构建结果
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 🔄 CI/CD 流水线

### GitHub Actions 配置
```yaml
# .github/workflows/deploy.yml
name: 部署流水线

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - name: 检出代码
      uses: actions/checkout@v4

    - name: 设置 Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: 安装依赖
      run: npm ci

    - name: 运行 ESLint
      run: npm run lint

    - name: 运行类型检查
      run: npm run type-check

    - name: 运行单元测试
      run: npm run test:unit
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: 运行集成测试
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: 生成测试覆盖率报告
      run: npm run test:coverage

    - name: 上传覆盖率到 Codecov
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        service: [frontend, backend]

    steps:
    - name: 检出代码
      uses: actions/checkout@v4

    - name: 设置 Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: 登录到 Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: 提取元数据
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha

    - name: 构建并推送 Docker 镜像
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./packages/${{ matrix.service }}/Dockerfile
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  security-scan:
    needs: build
    runs-on: ubuntu-latest
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4

    - name: 运行 Trivy 漏洞扫描
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: 上传扫描结果到 GitHub Security
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  deploy-staging:
    needs: [test, build, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    environment:
      name: staging
      url: https://staging.blog.example.com

    steps:
    - name: 部署到测试环境
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USERNAME }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          cd /opt/blog-system
          docker-compose -f docker-compose.staging.yml pull
          docker-compose -f docker-compose.staging.yml up -d
          docker system prune -f

    - name: 运行健康检查
      run: |
        sleep 30
        curl -f https://staging.blog.example.com/health || exit 1

    - name: 运行 E2E 测试
      run: npm run test:e2e
      env:
        BASE_URL: https://staging.blog.example.com

  deploy-production:
    needs: [deploy-staging]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://blog.example.com

    steps:
    - name: 部署到生产环境
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USERNAME }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /opt/blog-system
          
          # 备份当前版本
          docker tag ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:latest backup-$(date +%Y%m%d%H%M%S)
          
          # 拉取新镜像
          docker-compose -f docker-compose.prod.yml pull
          
          # 滚动更新
          docker-compose -f docker-compose.prod.yml up -d --no-deps backend
          
          # 等待健康检查
          sleep 30
          
          # 验证服务正常
          if curl -f http://localhost:3001/health; then
            echo "Backend deployment successful"
            docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
          else
            echo "Backend deployment failed, rolling back"
            docker-compose -f docker-compose.prod.yml rollback
            exit 1
          fi

    - name: 通知部署结果
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### Kubernetes 部署配置
```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: blog-system

---
# k8s/backend-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-backend
  namespace: blog-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-backend
  template:
    metadata:
      labels:
        app: blog-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/username/blog-system-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: blog-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: blog-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: blog-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/backend-service.yml
apiVersion: v1
kind: Service
metadata:
  name: blog-backend-service
  namespace: blog-system
spec:
  selector:
    app: blog-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP

---
# k8s/frontend-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-frontend
  namespace: blog-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: blog-frontend
  template:
    metadata:
      labels:
        app: blog-frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/username/blog-system-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
# k8s/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: blog-ingress
  namespace: blog-system
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - blog.example.com
    secretName: blog-tls
  rules:
  - host: blog.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: blog-backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: blog-frontend-service
            port:
              number: 80
```

## 📊 监控和日志

### Prometheus 监控配置
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  # 应用监控
  - job_name: 'blog-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # 系统监控
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  # 数据库监控
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis 监控
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Nginx 监控
  - job_name: 'nginx-exporter'
    static_configs:
      - targets: ['nginx-exporter:9113']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 告警规则配置
```yaml
# monitoring/alert_rules.yml
groups:
- name: blog-system-alerts
  rules:
  # 高错误率告警
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "高错误率检测到"
      description: "{{ $labels.instance }} 错误率超过 10%"

  # 响应时间告警
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "响应时间过长"
      description: "{{ $labels.instance }} 95% 响应时间超过 1 秒"

  # 内存使用告警
  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "内存使用率过高"
      description: "{{ $labels.instance }} 内存使用率超过 90%"

  # CPU 使用告警
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "CPU 使用率过高"
      description: "{{ $labels.instance }} CPU 使用率超过 80%"

  # 数据库连接告警
  - alert: DatabaseConnectionFail
    expr: up{job="postgres-exporter"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "数据库连接失败"
      description: "PostgreSQL 数据库连接失败"

  # 服务存活告警
  - alert: ServiceDown
    expr: up == 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "服务不可用"
      description: "{{ $labels.instance }} 服务已停止运行"
```

### 日志聚合配置
```yaml
# logging/fluentd.conf
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

# 应用日志
<filter blog.backend.**>
  @type parser
  key_name log
  reserve_data true
  <parse>
    @type json
    time_key timestamp
    time_format %Y-%m-%dT%H:%M:%S.%L%z
  </parse>
</filter>

# 错误日志特殊处理
<filter blog.backend.**>
  @type grep
  <regexp>
    key level
    pattern ^(error|fatal)$
  </regexp>
  @label @ERROR
</filter>

# 输出到 Elasticsearch
<match blog.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name blog-logs
  type_name _doc
  include_tag_key true
  tag_key @log_name
  <buffer>
    flush_interval 10s
  </buffer>
</match>

# 错误日志告警
<label @ERROR>
  <match blog.backend.**>
    @type slack
    webhook_url "#{ENV['SLACK_WEBHOOK_URL']}"
    channel "#alerts"
    username "FluentD"
    icon_emoji ":exclamation:"
    title "应用错误告警"
    message "错误详情: %s"
    message_keys log
  </match>
</label>
```

## 🔧 运维脚本

### 部署脚本
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "🚀 开始部署到 $ENVIRONMENT 环境，版本: $VERSION"

# 验证环境
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ 无效的环境: $ENVIRONMENT"
    echo "支持的环境: staging, production"
    exit 1
fi

# 设置环境变量
source config/$ENVIRONMENT.env

# 备份当前版本（仅生产环境）
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "📦 备份当前版本..."
    docker tag $DOCKER_REGISTRY/blog-backend:latest $DOCKER_REGISTRY/blog-backend:backup-$(date +%Y%m%d%H%M%S)
    docker tag $DOCKER_REGISTRY/blog-frontend:latest $DOCKER_REGISTRY/blog-frontend:backup-$(date +%Y%m%d%H%M%S)
fi

# 拉取新镜像
echo "📥 拉取最新镜像..."
docker pull $DOCKER_REGISTRY/blog-backend:$VERSION
docker pull $DOCKER_REGISTRY/blog-frontend:$VERSION

# 更新标签
docker tag $DOCKER_REGISTRY/blog-backend:$VERSION $DOCKER_REGISTRY/blog-backend:latest
docker tag $DOCKER_REGISTRY/blog-frontend:$VERSION $DOCKER_REGISTRY/blog-frontend:latest

# 数据库迁移
echo "🗄️ 执行数据库迁移..."
docker run --rm \
  --network blog_network \
  -e DATABASE_URL=$DATABASE_URL \
  $DOCKER_REGISTRY/blog-backend:latest \
  npm run migrate

# 滚动更新后端服务
echo "🔄 更新后端服务..."
docker-compose -f docker-compose.$ENVIRONMENT.yml up -d --no-deps backend

# 健康检查
echo "🩺 后端健康检查..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ 后端服务健康"
        break
    fi
    if [[ $i -eq 30 ]]; then
        echo "❌ 后端健康检查失败，回滚..."
        docker-compose -f docker-compose.$ENVIRONMENT.yml rollback backend
        exit 1
    fi
    sleep 10
done

# 更新前端服务
echo "🔄 更新前端服务..."
docker-compose -f docker-compose.$ENVIRONMENT.yml up -d --no-deps frontend

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f

# 发送通知
echo "📢 发送部署通知..."
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-type: application/json' \
  --data "{\"text\":\"✅ 博客系统已成功部署到 $ENVIRONMENT 环境，版本: $VERSION\"}"

echo "🎉 部署完成！"
```

### 备份脚本
```bash
#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="/opt/backups/blog-system"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

echo "📦 开始数据备份..."

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
echo "🗄️ 备份数据库..."
docker exec blog_postgres pg_dump -U blog_user blog_db | gzip > $BACKUP_DIR/database_$DATE.sql.gz

# Redis 备份
echo "💾 备份 Redis..."
docker exec blog_redis redis-cli --rdb /data/dump.rdb
docker cp blog_redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# 文件上传备份
echo "📁 备份上传文件..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/blog-system/uploads

# 配置文件备份
echo "⚙️ 备份配置文件..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/blog-system/config

# 清理过期备份
echo "🧹 清理过期备份..."
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.rdb" -mtime +$RETENTION_DAYS -delete

# 上传到云存储
echo "☁️ 上传到阿里云 OSS..."
ossutil cp -r $BACKUP_DIR oss://blog-backups/$(date +%Y%m%d)/

echo "✅ 备份完成！"
```

### 监控脚本
```bash
#!/bin/bash
# scripts/health-check.sh

set -e

SERVICES=("frontend" "backend" "postgres" "redis" "elasticsearch")
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}

echo "🩺 开始健康检查..."

for service in "${SERVICES[@]}"; do
    echo "检查 $service 服务..."
    
    case $service in
        "frontend")
            if curl -f http://localhost:3000 > /dev/null 2>&1; then
                echo "✅ $service 正常"
            else
                echo "❌ $service 异常"
                send_alert "$service 服务不可用"
            fi
            ;;
        "backend")
            if curl -f http://localhost:3001/health > /dev/null 2>&1; then
                echo "✅ $service 正常"
            else
                echo "❌ $service 异常"
                send_alert "$service 服务不可用"
            fi
            ;;
        "postgres")
            if docker exec blog_postgres pg_isready -U blog_user > /dev/null 2>&1; then
                echo "✅ $service 正常"
            else
                echo "❌ $service 异常"
                send_alert "$service 数据库连接失败"
            fi
            ;;
        "redis")
            if docker exec blog_redis redis-cli ping > /dev/null 2>&1; then
                echo "✅ $service 正常"
            else
                echo "❌ $service 异常"
                send_alert "$service 缓存服务异常"
            fi
            ;;
        "elasticsearch")
            if curl -f http://localhost:9200/_cluster/health > /dev/null 2>&1; then
                echo "✅ $service 正常"
            else
                echo "❌ $service 异常"
                send_alert "$service 搜索引擎异常"
            fi
            ;;
    esac
done

function send_alert() {
    local message=$1
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST $SLACK_WEBHOOK_URL \
          -H 'Content-type: application/json' \
          --data "{\"text\":\"🚨 告警: $message\"}"
    fi
}

echo "✅ 健康检查完成！"
```

## 📚 运维文档

### 故障排除指南

#### 常见问题及解决方案

**1. 服务启动失败**
```bash
# 检查日志
docker-compose logs -f backend

# 检查端口占用
netstat -tlnp | grep :3001

# 重启服务
docker-compose restart backend
```

**2. 数据库连接问题**
```bash
# 检查数据库状态
docker exec blog_postgres pg_isready -U blog_user

# 查看连接数
docker exec blog_postgres psql -U blog_user -d blog_db -c "SELECT count(*) FROM pg_stat_activity;"

# 重启数据库
docker-compose restart postgres
```

**3. Redis 缓存问题**
```bash
# 检查 Redis 状态
docker exec blog_redis redis-cli ping

# 查看内存使用
docker exec blog_redis redis-cli info memory

# 清空缓存
docker exec blog_redis redis-cli flushall
```

**4. 磁盘空间不足**
```bash
# 检查磁盘使用情况
df -h

# 清理 Docker 资源
docker system prune -a

# 清理日志文件
find /var/log -name "*.log" -mtime +7 -delete
```

### 性能优化指南

#### 数据库优化
```sql
-- 分析慢查询
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 创建必要索引
CREATE INDEX CONCURRENTLY idx_posts_published_at 
ON posts (published_at DESC) 
WHERE status = 'published';

-- 分析表统计信息
ANALYZE posts;
```

#### 缓存策略优化
```bash
# 监控缓存命中率
docker exec blog_redis redis-cli info stats | grep keyspace

# 设置合理的过期时间
# 热点数据: 1小时
# 用户会话: 24小时
# 静态内容: 1周
```

---

## 🎯 运维交付物

1. **部署架构图** ✅
2. **容器化配置** ✅
3. **CI/CD 流水线** ✅
4. **监控告警配置** ✅
5. **日志聚合方案** ✅
6. **运维脚本** ✅
7. **故障排除指南** ✅
8. **性能优化文档** ✅

通过这套完整的部署运维方案，博客系统已具备生产环境的高可用性、可扩展性和可维护性！🚀 