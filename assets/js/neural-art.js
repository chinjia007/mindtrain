// AIGC神经网络艺术生成器 - 增强版
class AdvancedNeuralArt {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#e74c3c', '#3498db', '#f1c40f', '#27ae60', '#9b59b6', '#e67e22'];
        this.mouse = { x: 0, y: 0, isMoving: false };
        this.interactionRadius = 150;
        this.animationId = null;
        
        this.resize();
        this.setupEventListeners();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // 窗口大小改变
        window.addEventListener('resize', () => {
            this.resize();
        });
        
        // 鼠标移动交互
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.mouse.isMoving = true;
            
            // 清除移动状态
            clearTimeout(this.mouseTimeout);
            this.mouseTimeout = setTimeout(() => {
                this.mouse.isMoving = false;
            }, 100);
        });
        
        // 点击效果
        document.addEventListener('click', (e) => {
            this.createClickEffect(e.clientX, e.clientY);
        });
    }
    
    generateArt() {
        this.createParticles();
        this.animateArt();
    }
    
    createParticles() {
        this.particles = [];
        const particleCount = Math.min(180, Math.floor(this.canvas.width * this.canvas.height / 8000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 1.2,
                vy: (Math.random() - 0.5) * 1.2,
                originalVx: (Math.random() - 0.5) * 1.2,
                originalVy: (Math.random() - 0.5) * 1.2,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: Math.random() * 4 + 2,
                life: Math.random() * 200 + 100,
                maxLife: Math.random() * 200 + 100,
                pulsePhase: Math.random() * Math.PI * 2,
                isAffectedByMouse: false
            });
        }
    }
    
    createClickEffect(x, y) {
        // 创建点击爆炸效果
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = Math.random() * 3 + 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                originalVx: Math.cos(angle) * speed,
                originalVy: Math.sin(angle) * speed,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: Math.random() * 3 + 1,
                life: 60,
                maxLife: 60,
                pulsePhase: 0,
                isClickEffect: true,
                isAffectedByMouse: false
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            // 更新生命值
            particle.life--;
            
            // 鼠标交互效果
            if (this.mouse.isMoving) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.hypot(dx, dy);
                
                if (distance < this.interactionRadius) {
                    const force = (this.interactionRadius - distance) / this.interactionRadius;
                    const angle = Math.atan2(dy, dx);
                    
                    // 排斥效果
                    particle.vx = particle.originalVx - Math.cos(angle) * force * 2;
                    particle.vy = particle.originalVy - Math.sin(angle) * force * 2;
                    particle.isAffectedByMouse = true;
                } else if (particle.isAffectedByMouse) {
                    // 恢复原始速度
                    particle.vx = particle.originalVx;
                    particle.vy = particle.originalVy;
                    particle.isAffectedByMouse = false;
                }
            }
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 边界反弹
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
                particle.originalVx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
                particle.originalVy *= -1;
            }
            
            // 脉冲效果
            particle.pulsePhase += 0.02;
            
            // 移除死亡的粒子
            if (particle.life <= 0) {
                if (particle.isClickEffect) {
                    this.particles.splice(index, 1);
                } else {
                    // 重生粒子
                    particle.x = Math.random() * this.canvas.width;
                    particle.y = Math.random() * this.canvas.height;
                    particle.life = particle.maxLife;
                    particle.color = this.colors[Math.floor(Math.random() * this.colors.length)];
                    particle.vx = (Math.random() - 0.5) * 1.2;
                    particle.vy = (Math.random() - 0.5) * 1.2;
                    particle.originalVx = particle.vx;
                    particle.originalVy = particle.vy;
                }
            }
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            // 计算透明度
            const lifeRatio = particle.life / particle.maxLife;
            const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;
            const alpha = lifeRatio * pulse * 0.8;
            
            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fill();
            
            // 添加发光效果
            if (particle.isAffectedByMouse || particle.isClickEffect) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = particle.color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const particle1 = this.particles[i];
                const particle2 = this.particles[j];
                
                const distance = Math.hypot(particle1.x - particle2.x, particle1.y - particle2.y);
                const maxDistance = 250;
                
                if (distance < maxDistance) {
                    const alpha = (maxDistance - distance) / maxDistance * 0.3;
                    const lifeAlpha = Math.min(particle1.life / particle1.maxLife, particle2.life / particle2.maxLife);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle1.x, particle1.y);
                    this.ctx.lineTo(particle2.x, particle2.y);
                    this.ctx.strokeStyle = particle1.color;
                    this.ctx.globalAlpha = alpha * lifeAlpha;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animateArt() {
        // 半透明覆盖，产生拖尾效果
        this.ctx.fillStyle = 'rgba(250, 250, 250, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新和绘制粒子
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        
        // 重置全局透明度
        this.ctx.globalAlpha = 1;
        
        // 继续动画
        this.animationId = requestAnimationFrame(() => this.animateArt());
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    start() {
        if (!this.animationId) {
            this.animateArt();
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) {
        const neuralArt = new AdvancedNeuralArt(canvas);
        neuralArt.generateArt();
        
        // 将实例保存到全局，以便其他脚本使用
        window.neuralArt = neuralArt;
    }
});
