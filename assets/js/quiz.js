// 题库游戏化系统
class QuizApp {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 10;
        this.selectedAnswers = [];
        this.correctAnswers = ['A', 'B', 'C']; // 当前题目的正确答案
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.startTime = Date.now();
        this.questionStartTime = Date.now();
        
        this.init();
    }
    
    init() {
        this.initEventListeners();
        this.initTimer();
        this.updateProgress();
        this.updateStats();
    }
    
    initEventListeners() {
        // 选项点击
        document.querySelectorAll('.option-item').forEach(option => {
            option.addEventListener('click', () => {
                this.selectOption(option);
            });
        });
        
        // 提交答案
        document.getElementById('submitAnswer').addEventListener('click', () => {
            this.submitAnswer();
        });
        
        // 跳过题目
        document.getElementById('skipQuestion').addEventListener('click', () => {
            this.skipQuestion();
        });
        
        // 下一题
        document.getElementById('nextQuestion').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        // 暂停/退出
        document.getElementById('pauseQuiz').addEventListener('click', () => {
            this.pauseQuiz();
        });
        
        document.getElementById('exitQuiz').addEventListener('click', () => {
            this.exitQuiz();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    selectOption(option) {
        const optionValue = option.getAttribute('data-option');
        
        if (option.classList.contains('selected')) {
            // 取消选择
            option.classList.remove('selected');
            this.selectedAnswers = this.selectedAnswers.filter(ans => ans !== optionValue);
        } else {
            // 选择选项
            option.classList.add('selected');
            this.selectedAnswers.push(optionValue);
        }
        
        // 更新提交按钮状态
        const submitBtn = document.getElementById('submitAnswer');
        submitBtn.disabled = this.selectedAnswers.length === 0;
        
        // 添加选择动画
        this.animateSelection(option);
    }
    
    animateSelection(option) {
        const effect = option.querySelector('.option-effect');
        effect.style.opacity = '0.2';
        setTimeout(() => {
            effect.style.opacity = '0';
        }, 200);
        
        // 添加粒子效果
        this.createParticleEffect(option);
    }
    
    createParticleEffect(element) {
        const rect = element.getBoundingClientRect();
        const particles = [];
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--neural-purple);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / 6;
            const distance = 30 + Math.random() * 20;
            const duration = 500 + Math.random() * 300;
            
            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                { 
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'ease-out'
            }).onfinish = () => {
                document.body.removeChild(particle);
            };
        }
    }
    
    submitAnswer() {
        this.pauseTimer();
        
        // 检查答案
        const isCorrect = this.checkAnswer();
        
        // 显示结果
        this.showAnswerFeedback(isCorrect);
        
        // 更新统计
        this.updateScore(isCorrect);
        this.updateStreak(isCorrect);
        
        // 禁用选项
        document.querySelectorAll('.option-item').forEach(option => {
            option.style.pointerEvents = 'none';
            
            const optionValue = option.getAttribute('data-option');
            if (this.correctAnswers.includes(optionValue)) {
                option.classList.add('correct');
            } else if (this.selectedAnswers.includes(optionValue)) {
                option.classList.add('incorrect');
            }
        });
        
        // 禁用提交按钮
        document.getElementById('submitAnswer').disabled = true;
    }
    
    checkAnswer() {
        // 检查选择的答案是否与正确答案完全匹配
        const sortedSelected = [...this.selectedAnswers].sort();
        const sortedCorrect = [...this.correctAnswers].sort();
        
        return JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    }
    
    showAnswerFeedback(isCorrect) {
        const feedback = document.getElementById('answerFeedback');
        const questionCard = document.getElementById('questionCard');
        
        // 更新反馈内容
        const icon = feedback.querySelector('.feedback-icon');
        const title = feedback.querySelector('.feedback-title');
        const score = feedback.querySelector('.feedback-score');
        
        if (isCorrect) {
            icon.textContent = '✅';
            title.textContent = '回答正确！';
            score.textContent = '+10 分';
            score.style.color = 'var(--neural-green)';
            
            // 添加成功音效（如果有的话）
            this.playSound('success');
        } else {
            icon.textContent = '❌';
            title.textContent = '回答错误';
            score.textContent = '+0 分';
            score.style.color = 'var(--neural-red)';
            
            // 添加失败音效
            this.playSound('error');
        }
        
        // 显示反馈
        questionCard.style.opacity = '0.3';
        feedback.classList.remove('hidden');
        
        // 添加显示动画
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            feedback.style.transition = 'all 0.6s ease';
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        }, 100);
    }
    
    skipQuestion() {
        this.showSkipConfirmation();
    }
    
    showSkipConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.className = 'skip-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <h4>⏭️ 确定要跳过这道题吗？</h4>
                <p>跳过的题目将不计分，且会影响连击数。</p>
                <div class="confirmation-actions">
                    <button class="confirm-btn cancel">继续答题</button>
                    <button class="confirm-btn skip">确定跳过</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        // 添加事件监听
        confirmation.querySelector('.cancel').addEventListener('click', () => {
            document.body.removeChild(confirmation);
        });
        
        confirmation.querySelector('.skip').addEventListener('click', () => {
            document.body.removeChild(confirmation);
            this.executeSkip();
        });
    }
    
    executeSkip() {
        this.streak = 0; // 重置连击
        this.updateStats();
        this.nextQuestion();
    }
    
    nextQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.showResults();
            return;
        }
        
        this.currentQuestion++;
        this.selectedAnswers = [];
        this.timeLeft = 60;
        this.questionStartTime = Date.now();
        
        // 重置界面
        this.resetQuestionInterface();
        
        // 加载下一题（这里应该从题库中获取）
        this.loadNextQuestion();
        
        // 更新进度
        this.updateProgress();
        
        // 重启计时器
        this.startTimer();
    }
    
    resetQuestionInterface() {
        const questionCard = document.getElementById('questionCard');
        const feedback = document.getElementById('answerFeedback');
        
        questionCard.style.opacity = '1';
        feedback.classList.add('hidden');
        
        // 重置选项状态
        document.querySelectorAll('.option-item').forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
            option.style.pointerEvents = 'auto';
        });
        
        // 重置按钮状态
        document.getElementById('submitAnswer').disabled = true;
    }
    
    loadNextQuestion() {
        // 这里应该从题库数据中加载下一题
        // 现在只是模拟
        console.log(`加载第 ${this.currentQuestion} 题`);
        
        // 更新题目编号显示
        document.getElementById('currentQuestion').textContent = this.currentQuestion;
    }
    
    updateProgress() {
        const progressPercentage = (this.currentQuestion / this.totalQuestions) * 100;
        document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    }
    
    updateScore(isCorrect) {
        if (isCorrect) {
            const timeBonus = Math.max(0, Math.floor((60 - (Date.now() - this.questionStartTime) / 1000) / 6));
            const streakBonus = Math.min(this.streak * 2, 10);
            this.score += 10 + timeBonus + streakBonus;
        }
    }
    
    updateStreak(isCorrect) {
        if (isCorrect) {
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
        } else {
            this.streak = 0;
        }
    }
    
    updateStats() {
        document.getElementById('streakCount').textContent = this.streak;
        
        const accuracy = this.currentQuestion > 1 ? 
            Math.round((this.score / ((this.currentQuestion - 1) * 10)) * 100) : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }
    
    initTimer() {
        this.startTimer();
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timeLeft').textContent = this.timeLeft;
            
            // 时间警告效果
            if (this.timeLeft <= 10) {
                document.getElementById('timeLeft').style.color = 'var(--neural-red)';
                document.getElementById('timeLeft').style.animation = 'pulse 1s infinite';
            }
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    pauseTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    timeUp() {
        this.pauseTimer();
        this.streak = 0;
        this.updateStats();
        
        // 显示超时提示
        this.showTimeUpMessage();
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    showTimeUpMessage() {
        const message = document.createElement('div');
        message.className = 'time-up-message';
        message.innerHTML = `
            <div class="message-content">
                <div class="message-icon">⏰</div>
                <h3>时间到！</h3>
                <p>自动进入下一题</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);
    }
    
    pauseQuiz() {
        this.pauseTimer();
        this.showPauseMenu();
    }
    
    showPauseMenu() {
        const menu = document.createElement('div');
        menu.className = 'pause-menu';
        menu.innerHTML = `
            <div class="menu-content">
                <h3>⏸️ 游戏暂停</h3>
                <div class="menu-actions">
                    <button class="menu-btn continue">继续答题</button>
                    <button class="menu-btn restart">重新开始</button>
                    <button class="menu-btn exit">退出训练</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // 添加事件监听
        menu.querySelector('.continue').addEventListener('click', () => {
            document.body.removeChild(menu);
            this.startTimer();
        });
        
        menu.querySelector('.restart').addEventListener('click', () => {
            document.body.removeChild(menu);
            location.reload();
        });
        
        menu.querySelector('.exit').addEventListener('click', () => {
            document.body.removeChild(menu);
            this.exitQuiz();
        });
    }
    
    exitQuiz() {
        if (confirm('确定要退出训练吗？当前进度将不会保存。')) {
            window.location.href = 'index.html';
        }
    }
    
    showResults() {
        this.pauseTimer();
        
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        
        // 更新结果数据
        document.querySelector('.score-number').textContent = this.score;
        document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = `${Math.floor(this.score / 10)}/10`;
        document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = this.maxStreak;
        document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // 计算等级
        const grade = this.calculateGrade();
        document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = grade;
        
        // 显示结果页面
        document.getElementById('quizResults').classList.remove('hidden');
        
        // 添加显示动画
        const results = document.getElementById('quizResults');
        results.style.opacity = '0';
        setTimeout(() => {
            results.style.transition = 'opacity 0.6s ease';
            results.style.opacity = '1';
        }, 100);
        
        // 动画显示技能条
        setTimeout(() => {
            this.animateSkillBars();
        }, 800);
    }
    
    calculateGrade() {
        const percentage = (this.score / 100) * 100;
        if (percentage >= 95) return 'S';
        if (percentage >= 90) return 'A+';
        if (percentage >= 85) return 'A';
        if (percentage >= 80) return 'A-';
        if (percentage >= 75) return 'B+';
        if (percentage >= 70) return 'B';
        if (percentage >= 65) return 'B-';
        if (percentage >= 60) return 'C+';
        if (percentage >= 55) return 'C';
        return 'D';
    }
    
    animateSkillBars() {
        document.querySelectorAll('.skill-fill').forEach((bar, index) => {
            setTimeout(() => {
                bar.style.width = bar.style.width; // 触发动画
            }, index * 200);
        });
    }
    
    handleKeyboard(e) {
        // 数字键选择选项
        if (e.key >= '1' && e.key <= '8') {
            const optionIndex = parseInt(e.key) - 1;
            const options = document.querySelectorAll('.option-item');
            if (options[optionIndex]) {
                this.selectOption(options[optionIndex]);
            }
        }
        
        // 空格键提交答案
        if (e.key === ' ' && !document.getElementById('submitAnswer').disabled) {
            e.preventDefault();
            this.submitAnswer();
        }
        
        // 回车键下一题
        if (e.key === 'Enter' && !document.getElementById('answerFeedback').classList.contains('hidden')) {
            this.nextQuestion();
        }
        
        // ESC键暂停
        if (e.key === 'Escape') {
            this.pauseQuiz();
        }
    }
    
    playSound(type) {
        // 这里可以添加音效播放逻辑
        console.log(`播放音效: ${type}`);
    }
}

// 添加相关CSS样式
const quizStyles = document.createElement('style');
quizStyles.textContent = `
    .skip-confirmation, .pause-menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .confirmation-content, .menu-content {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .confirmation-actions, .menu-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    }
    
    .confirm-btn, .menu-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .confirm-btn.cancel, .menu-btn.continue {
        background: #f8f9fa;
        color: #666;
        border: 1px solid #ddd;
    }
    
    .confirm-btn.skip, .menu-btn.restart, .menu-btn.exit {
        background: var(--neural-purple);
        color: white;
    }
    
    .time-up-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(231, 76, 60, 0.95);
        color: white;
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    }
    
    .message-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(quizStyles);

// 初始化题库应用
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
