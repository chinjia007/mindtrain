// 禅意课程交互脚本
class ZenCourse {
    constructor() {
        this.currentSection = 'intro';
        this.progress = 0;
        this.sections = ['intro', 'concept', 'case-study', 'core-wisdom', 'practice', 'test', 'emotional-wisdom', 'deep-insight', 'summary'];
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupProgressTracking();
        this.setupSectionTransitions();
        this.setupTabNavigation();
        this.setupInteractiveExercises();
        this.startBackgroundAnimation();
        this.initAllSections(); // 初始化显示所有章节
    }

    // 设置禅意背景画布
    setupCanvas() {
        const canvas = document.getElementById('zenCanvas');
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        this.canvas = canvas;
        this.ctx = ctx;
    }

    // 背景动画
    startBackgroundAnimation() {
        const particles = [];
        const particleCount = 50;
        
        // 创建粒子
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 200 // 蓝紫色调
            });
        }
        
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            particles.forEach(particle => {
                // 更新位置
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // 边界检测
                if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
                
                // 绘制粒子
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity})`;
                this.ctx.fill();
                
                // 连接线
                particles.forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(otherParticle.x, otherParticle.y);
                        this.ctx.strokeStyle = `hsla(${particle.hue}, 70%, 70%, ${0.1 * (1 - distance / 100)})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                });
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // 设置进度跟踪
    setupProgressTracking() {
        this.updateProgress();
    }

    // 更新进度
    updateProgress() {
        const progressIndex = this.sections.indexOf(this.currentSection);
        this.progress = (progressIndex / (this.sections.length - 1)) * 100;
        
        const progressCircle = document.getElementById('progressCircle');
        const progressText = document.getElementById('progressText');
        
        if (progressCircle && progressText) {
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (this.progress / 100) * circumference;
            
            progressCircle.style.strokeDashoffset = offset;
            progressText.textContent = Math.round(this.progress) + '%';
            
            if (this.progress === 0) {
                progressText.textContent = '开始';
            } else if (this.progress === 100) {
                progressText.textContent = '完成';
            }
        }
    }

    // 设置章节转换
    setupSectionTransitions() {
        // 添加滚动监听
        window.addEventListener('scroll', () => {
            this.checkSectionVisibility();
        });
    }

    // 检查章节可见性
    checkSectionVisibility() {
        const sections = document.querySelectorAll('[data-section]');
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollTop + windowHeight / 2 >= sectionTop && 
                scrollTop + windowHeight / 2 <= sectionTop + sectionHeight) {
                const sectionId = section.getAttribute('data-section');
                if (sectionId !== this.currentSection) {
                    this.currentSection = sectionId;
                    this.updateProgress();
                }
            }
        });
    }

    // 初始化所有章节显示
    initAllSections() {
        // 显示所有章节
        document.querySelectorAll('[data-section]').forEach(section => {
            section.classList.remove('hidden');
        });

        // 添加渐进式出现动画
        const sections = document.querySelectorAll('[data-section]');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 200); // 每个章节延迟200ms出现
        });
    }

    // 平滑滚动
    smoothScrollTo(element) {
        if (element) {
            const targetPosition = element.offsetTop - 100;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1000;
            let start = null;

            const animation = (currentTime) => {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = this.easeInOutQuart(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            };

            requestAnimationFrame(animation);
        }
    }

    // 缓动函数
    easeInOutQuart(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    }

    // 创建交互式练习
    createInteractiveExercise(containerId, questions) {
        const container = document.getElementById(containerId);
        if (!container) return;

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'interactive-question';
            questionDiv.innerHTML = `
                <div class="question-text">${question.text}</div>
                <div class="question-options">
                    ${question.options.map((option, optIndex) => `
                        <button class="option-btn" data-question="${index}" data-option="${optIndex}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                <div class="question-feedback hidden" id="feedback-${index}"></div>
            `;
            container.appendChild(questionDiv);
        });

        // 添加选项点击事件
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                this.handleOptionClick(e.target, questions);
            }
        });
    }

    // 处理选项点击
    handleOptionClick(button, questions) {
        const questionIndex = parseInt(button.dataset.question);
        const optionIndex = parseInt(button.dataset.option);
        const question = questions[questionIndex];
        
        // 禁用所有选项
        const questionDiv = button.closest('.interactive-question');
        const allOptions = questionDiv.querySelectorAll('.option-btn');
        allOptions.forEach(btn => btn.disabled = true);
        
        // 显示反馈
        const feedback = document.getElementById(`feedback-${questionIndex}`);
        const isCorrect = question.correct.includes(optionIndex);
        
        if (isCorrect) {
            button.classList.add('correct');
            feedback.innerHTML = `
                <div class="feedback-correct">
                    ✅ 正确！${question.explanation}
                </div>
            `;
        } else {
            button.classList.add('incorrect');
            // 高亮正确答案
            question.correct.forEach(correctIndex => {
                allOptions[correctIndex].classList.add('correct');
            });
            feedback.innerHTML = `
                <div class="feedback-incorrect">
                    ❌ 不正确。${question.explanation}
                </div>
            `;
        }
        
        feedback.classList.remove('hidden');
        
        // 添加动画效果
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(10px)';
        feedback.style.transition = 'all 0.5s ease';
        
        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        });
    }

    // 设置标签页导航
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // 移除所有活动状态
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // 激活当前标签
                button.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // 设置交互练习
    setupInteractiveExercises() {
        this.createQuickJudgmentExercise();
        this.createSkillTest();
    }

    // 创建快速判断练习
    createQuickJudgmentExercise() {
        const questions = [
            {
                text: '"我们班有30个学生"',
                correct: 'F',
                explanation: '可以通过点名验证，这是事实。'
            },
            {
                text: '"数学是最难的科目"',
                correct: 'O',
                explanation: '不同学生的感受不同，这是观点。'
            },
            {
                text: '"今天的午餐是米饭和青菜"',
                correct: 'F',
                explanation: '可以通过观察确认，这是事实。'
            },
            {
                text: '"学校的午餐很好吃"',
                correct: 'O',
                explanation: '每个人的口味不同，这是观点。'
            },
            {
                text: '"小红昨天请假了"',
                correct: 'F',
                explanation: '可以通过考勤记录确认，这是事实。'
            },
            {
                text: '"小红可能是生病了"',
                correct: 'O',
                explanation: '这是一种推测，属于观点。'
            }
        ];

        const container = document.getElementById('quickJudgment');
        if (!container) return;

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'judgment-question';
            questionDiv.innerHTML = `
                <div class="question-text">${index + 1}. ${question.text}</div>
                <div class="judgment-options">
                    <button class="judgment-btn" data-question="${index}" data-answer="F">
                        事实 (F)
                    </button>
                    <button class="judgment-btn" data-question="${index}" data-answer="O">
                        观点 (O)
                    </button>
                </div>
                <div class="question-feedback hidden" id="feedback-${index}"></div>
            `;
            container.appendChild(questionDiv);
        });

        // 添加点击事件
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('judgment-btn')) {
                this.handleJudgmentClick(e.target, questions);
            }
        });
    }

    // 处理判断题点击
    handleJudgmentClick(button, questions) {
        const questionIndex = parseInt(button.dataset.question);
        const userAnswer = button.dataset.answer;
        const question = questions[questionIndex];

        // 禁用所有选项
        const questionDiv = button.closest('.judgment-question');
        const allButtons = questionDiv.querySelectorAll('.judgment-btn');
        allButtons.forEach(btn => btn.disabled = true);

        // 显示反馈
        const feedback = document.getElementById(`feedback-${questionIndex}`);
        const isCorrect = userAnswer === question.correct;

        if (isCorrect) {
            button.classList.add('correct');
            feedback.innerHTML = `
                <div class="feedback-correct">
                    ✅ 正确！${question.explanation}
                </div>
            `;
        } else {
            button.classList.add('incorrect');
            // 高亮正确答案
            allButtons.forEach(btn => {
                if (btn.dataset.answer === question.correct) {
                    btn.classList.add('correct');
                }
            });
            feedback.innerHTML = `
                <div class="feedback-incorrect">
                    ❌ 不正确。正确答案是${question.correct === 'F' ? '事实' : '观点'}。${question.explanation}
                </div>
            `;
        }

        feedback.classList.remove('hidden');

        // 添加动画效果
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(10px)';
        feedback.style.transition = 'all 0.5s ease';

        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        });

        // 更新进度
        this.checkExerciseCompletion();
    }

    // 检查练习完成度
    checkExerciseCompletion() {
        const totalQuestions = document.querySelectorAll('.judgment-question').length;
        const answeredQuestions = document.querySelectorAll('.judgment-btn:disabled').length / 2;

        if (answeredQuestions === totalQuestions) {
            // 所有题目完成，显示继续按钮的特效
            const continueBtn = document.querySelector('.continue-journey');
            if (continueBtn) {
                continueBtn.style.animation = 'pulse 2s infinite';
                continueBtn.style.boxShadow = '0 0 20px var(--art-gold)';
            }
        }
    }

    // 创建技能测试
    createSkillTest() {
        const testQuestions = [
            {
                question: "下面哪个是事实？",
                options: ["春天是最美的季节", "今年春天比去年暖和", "今天的气温是18度", "这种天气很适合出游"],
                correct: "C",
                explanation: "气温18度是可以测量验证的具体数据，属于事实。"
            },
            {
                question: "观点的特点是：",
                options: ["可以被准确测量", "每个人的看法都相同", "反映个人的感受和判断", "不会发生变化"],
                correct: "C",
                explanation: "观点反映个人的感受和判断，不同的人可能有不同的观点。"
            },
            {
                question: "要验证一个事实，最好的方法是：",
                options: ["询问更多人的意见", "查找可靠的证据", "相信权威人士的话", "根据常识判断"],
                correct: "B",
                explanation: "查找可靠的证据是验证事实最科学的方法。"
            }
        ];

        const container = document.getElementById('skillTest');
        if (!container) return;

        // 添加点击事件
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('test-option')) {
                this.handleTestClick(e.target, testQuestions);
            }
        });
    }

    // 处理测试题点击
    handleTestClick(button, testQuestions) {
        const questionIndex = parseInt(button.dataset.question);
        const userAnswer = button.dataset.answer;
        const question = testQuestions[questionIndex];

        // 禁用所有选项
        const questionDiv = button.closest('.test-question');
        const allButtons = questionDiv.querySelectorAll('.test-option');
        allButtons.forEach(btn => btn.disabled = true);

        // 显示反馈
        const feedback = document.getElementById(`test-feedback-${questionIndex}`);
        const isCorrect = userAnswer === question.correct;

        if (isCorrect) {
            button.classList.add('correct');
            feedback.innerHTML = `
                <div class="feedback-correct">
                    ✅ 正确！${question.explanation}
                </div>
            `;
        } else {
            button.classList.add('incorrect');
            // 高亮正确答案
            allButtons.forEach(btn => {
                if (btn.dataset.answer === question.correct) {
                    btn.classList.add('correct');
                }
            });
            feedback.innerHTML = `
                <div class="feedback-incorrect">
                    ❌ 不正确。正确答案是${question.correct}。${question.explanation}
                </div>
            `;
        }

        feedback.classList.remove('hidden');

        // 添加动画效果
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(10px)';
        feedback.style.transition = 'all 0.5s ease';

        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        });

        // 检查测试完成度
        this.checkTestCompletion();
    }

    // 检查测试完成度
    checkTestCompletion() {
        const totalQuestions = document.querySelectorAll('.test-question').length;
        const answeredQuestions = document.querySelectorAll('.test-option:disabled').length / 4; // 每题4个选项

        if (answeredQuestions === totalQuestions) {
            // 计算得分
            const correctAnswers = document.querySelectorAll('.test-option.correct:not(.incorrect)').length;
            this.showTestResults(correctAnswers, totalQuestions);
        }
    }

    // 显示测试结果
    showTestResults(score, total) {
        const resultsDiv = document.getElementById('testResults');
        const scoreNumber = document.getElementById('scoreNumber');
        const evaluation = document.getElementById('evaluation');

        if (resultsDiv && scoreNumber && evaluation) {
            scoreNumber.textContent = score;

            let evaluationText = '';
            if (score === total) {
                evaluationText = '太棒了！你已经掌握了基本概念';
            } else if (score >= total - 1) {
                evaluationText = '很好！再复习一下就完美了';
            } else {
                evaluationText = '没关系，重新看一遍核心内容吧';
            }

            evaluation.textContent = evaluationText;
            resultsDiv.classList.remove('hidden');

            // 添加动画效果
            resultsDiv.style.opacity = '0';
            resultsDiv.style.transform = 'translateY(20px)';
            resultsDiv.style.transition = 'all 0.8s ease';

            requestAnimationFrame(() => {
                resultsDiv.style.opacity = '1';
                resultsDiv.style.transform = 'translateY(0)';
            });
        }
    }
}

// 全局函数 - 保留用于可能的扩展
// function startJourney() {
//     window.zenCourse.startJourney();
// }

// function nextSection(sectionId) {
//     window.zenCourse.nextSection(sectionId);
// }

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.zenCourse = new ZenCourse();
});

// 添加页面加载动画
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1s ease';
    
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});
