// 课程页面JavaScript功能
class CourseApp {
    constructor() {
        this.currentProgress = 0;
        this.totalSections = 6; // 总共6个学习部分
        this.completedSections = 0;
        this.practiceScore = 0;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        
        this.init();
    }
    
    init() {
        this.initTabs();
        this.initPractice();
        this.initProgress();
        this.initScrollTracking();
        this.initNavigation();
    }
    
    // 初始化标签页功能
    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // 移除所有活动状态
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // 添加活动状态
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                // 添加切换动画
                this.animateTabSwitch(targetTab);
            });
        });
    }
    
    // 标签页切换动画
    animateTabSwitch(tabId) {
        const content = document.getElementById(tabId);
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            content.style.transition = 'all 0.3s ease';
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }, 50);
    }
    
    // 初始化交互练习
    initPractice() {
        const questionItems = document.querySelectorAll('.question-item');
        this.totalQuestions = questionItems.length;
        
        questionItems.forEach(item => {
            const buttons = item.querySelectorAll('.choice-btn');
            const correctType = item.getAttribute('data-type');
            const feedback = item.querySelector('.feedback');
            
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    this.handleAnswer(button, correctType, feedback, buttons);
                });
            });
        });
    }
    
    // 处理答题
    handleAnswer(clickedButton, correctType, feedback, allButtons) {
        const userChoice = clickedButton.getAttribute('data-choice');
        const isCorrect = userChoice === correctType;
        
        // 禁用所有按钮
        allButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
        
        // 显示结果
        if (isCorrect) {
            clickedButton.classList.add('correct');
            clickedButton.style.opacity = '1';
            feedback.textContent = '✅ 正确！你的判断很准确。';
            feedback.classList.add('correct');
            this.correctAnswers++;
        } else {
            clickedButton.classList.add('incorrect');
            clickedButton.style.opacity = '1';
            
            // 高亮正确答案
            allButtons.forEach(btn => {
                if (btn.getAttribute('data-choice') === correctType) {
                    btn.classList.add('correct');
                    btn.style.opacity = '1';
                }
            });
            
            feedback.textContent = `❌ 不正确。正确答案是"${correctType === 'fact' ? '事实' : '观点'}"。`;
            feedback.classList.add('incorrect');
        }
        
        feedback.classList.remove('hidden');
        
        // 更新练习进度
        this.updatePracticeProgress();
        
        // 添加完成动画
        this.animateAnswerFeedback(feedback);
    }
    
    // 答题反馈动画
    animateAnswerFeedback(feedback) {
        feedback.style.transform = 'scale(0.8)';
        feedback.style.opacity = '0';
        
        setTimeout(() => {
            feedback.style.transition = 'all 0.3s ease';
            feedback.style.transform = 'scale(1)';
            feedback.style.opacity = '1';
        }, 100);
    }
    
    // 更新练习进度
    updatePracticeProgress() {
        const answeredQuestions = document.querySelectorAll('.choice-btn:disabled').length / 2; // 每题2个按钮
        
        if (answeredQuestions === this.totalQuestions) {
            setTimeout(() => {
                this.showPracticeResults();
            }, 1000);
        }
    }
    
    // 显示练习结果
    showPracticeResults() {
        const score = Math.round((this.correctAnswers / this.totalQuestions) * 100);
        const practiceContainer = document.querySelector('.practice-container');
        
        const resultsHTML = `
            <div class="practice-results">
                <h3>🎉 练习完成！</h3>
                <div class="score-display">
                    <div class="score-circle">
                        <span class="score-number">${score}%</span>
                        <span class="score-label">正确率</span>
                    </div>
                </div>
                <div class="score-details">
                    <p>你答对了 <strong>${this.correctAnswers}</strong> 道题，共 <strong>${this.totalQuestions}</strong> 道题</p>
                    ${score >= 80 ? 
                        '<p class="score-message success">🌟 太棒了！你已经很好地掌握了事实与观点的区分方法。</p>' :
                        '<p class="score-message encourage">💪 继续努力！建议重新阅读核心内容，然后再次练习。</p>'
                    }
                </div>
                <div class="results-actions">
                    <button class="cta-button primary" onclick="location.reload()">重新练习</button>
                    <button class="cta-button secondary" onclick="courseApp.nextSection()">继续学习</button>
                </div>
            </div>
        `;
        
        practiceContainer.innerHTML = resultsHTML;
        
        // 添加结果显示动画
        const results = practiceContainer.querySelector('.practice-results');
        results.style.opacity = '0';
        results.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            results.style.transition = 'all 0.6s ease';
            results.style.opacity = '1';
            results.style.transform = 'translateY(0)';
        }, 100);
        
        // 更新总体进度
        this.completedSections++;
        this.updateOverallProgress();
    }
    
    // 初始化进度跟踪
    initProgress() {
        this.updateOverallProgress();
    }
    
    // 更新总体进度
    updateOverallProgress() {
        const progressPercentage = (this.completedSections / this.totalSections) * 100;
        const progressFill = document.querySelector('.course-progress-bar .progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        if (progressText) {
            if (progressPercentage === 0) {
                progressText.textContent = '开始学习';
            } else if (progressPercentage === 100) {
                progressText.textContent = '课程完成';
            } else {
                progressText.textContent = `进度 ${Math.round(progressPercentage)}%`;
            }
        }
    }
    
    // 初始化滚动跟踪
    initScrollTracking() {
        const sections = document.querySelectorAll('section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.markSectionAsViewed(entry.target);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    // 标记章节为已查看
    markSectionAsViewed(section) {
        if (!section.classList.contains('viewed')) {
            section.classList.add('viewed');
            
            // 如果是新查看的章节，增加完成进度
            if (!section.hasAttribute('data-counted')) {
                section.setAttribute('data-counted', 'true');
                
                // 排除练习部分，因为练习有单独的完成逻辑
                if (!section.classList.contains('interactive-practice')) {
                    this.completedSections++;
                    this.updateOverallProgress();
                }
            }
        }
    }
    
    // 初始化导航
    initNavigation() {
        const prevBtn = document.getElementById('prevCourse');
        const nextBtn = document.getElementById('nextCourse');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.navigateToPrevCourse();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.navigateToNextCourse();
            });
        }
    }
    
    // 导航到上一课
    navigateToPrevCourse() {
        // 这里可以实现实际的路由逻辑
        console.log('导航到上一课');
        this.showNavigationMessage('正在加载上一课...');
    }
    
    // 导航到下一课
    navigateToNextCourse() {
        // 检查是否完成当前课程
        if (this.completedSections < this.totalSections) {
            this.showIncompleteWarning();
            return;
        }
        
        console.log('导航到下一课');
        this.showNavigationMessage('正在加载下一课...');
    }
    
    // 显示未完成警告
    showIncompleteWarning() {
        const warning = document.createElement('div');
        warning.className = 'course-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <h4>⚠️ 课程未完成</h4>
                <p>建议完成当前课程的所有内容后再进入下一课。</p>
                <div class="warning-actions">
                    <button class="warning-btn cancel">继续学习</button>
                    <button class="warning-btn confirm">强制跳转</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(warning);
        
        // 添加事件监听
        warning.querySelector('.cancel').addEventListener('click', () => {
            document.body.removeChild(warning);
        });
        
        warning.querySelector('.confirm').addEventListener('click', () => {
            document.body.removeChild(warning);
            this.navigateToNextCourse();
        });
        
        // 点击背景关闭
        warning.addEventListener('click', (e) => {
            if (e.target === warning) {
                document.body.removeChild(warning);
            }
        });
    }
    
    // 显示导航消息
    showNavigationMessage(message) {
        const loader = document.createElement('div');
        loader.className = 'navigation-loader';
        loader.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
        `;
        
        document.body.appendChild(loader);
        
        // 模拟加载时间
        setTimeout(() => {
            document.body.removeChild(loader);
        }, 1500);
    }
    
    // 下一个章节（从练习结果调用）
    nextSection() {
        // 滚动到页面顶部，准备进入下一课
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            this.navigateToNextCourse();
        }, 500);
    }
}

// 添加相关CSS样式
const courseStyles = document.createElement('style');
courseStyles.textContent = `
    .practice-results {
        text-align: center;
        padding: 2rem;
    }
    
    .practice-results h3 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #333;
    }
    
    .score-display {
        margin: 2rem 0;
    }
    
    .score-circle {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--neural-purple), var(--neural-blue));
        color: white;
        margin: 0 auto;
    }
    
    .score-number {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
    }
    
    .score-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    .score-details {
        margin: 1.5rem 0;
    }
    
    .score-message {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 10px;
        font-weight: 500;
    }
    
    .score-message.success {
        background: rgba(39, 174, 96, 0.1);
        color: var(--neural-green);
        border: 1px solid rgba(39, 174, 96, 0.2);
    }
    
    .score-message.encourage {
        background: rgba(241, 196, 15, 0.1);
        color: #f39c12;
        border: 1px solid rgba(241, 196, 15, 0.2);
    }
    
    .results-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }
    
    .course-warning {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .warning-content {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .warning-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    }
    
    .warning-btn {
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .warning-btn.cancel {
        background: #f8f9fa;
        color: #666;
        border: 1px solid #ddd;
    }
    
    .warning-btn.confirm {
        background: var(--neural-purple);
        color: white;
    }
    
    .navigation-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(10px);
    }
    
    .navigation-loader p {
        margin-top: 20px;
        color: #666;
        font-size: 1.1rem;
    }
`;
document.head.appendChild(courseStyles);

// 初始化课程应用
let courseApp;
document.addEventListener('DOMContentLoaded', () => {
    courseApp = new CourseApp();
});
