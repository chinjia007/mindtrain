const fs = require('fs');
const path = require('path');

// 简化的测试转换器
class TestConverter {
    constructor() {
        this.outputDir = 'test-courses';
    }

    // 解析课程内容
    parseCourseContent(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        const course = {
            title: '',
            module: '',
            grade: '',
            duration: '',
            objective: '',
            sections: []
        };

        let currentSection = null;
        let currentSubsection = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 解析课程标题
            if (line.startsWith('# 第') && line.includes('课')) {
                course.title = line.replace('# ', '');
            }
            
            // 解析课程信息
            if (line.includes('所属模块')) {
                course.module = line.split('：')[1] || line.split(':')[1] || '';
            }
            if (line.includes('适合年级')) {
                course.grade = line.split('：')[1] || line.split(':')[1] || '';
            }
            if (line.includes('预计用时')) {
                course.duration = line.split('：')[1] || line.split(':')[1] || '';
            }
            if (line.includes('学习目标')) {
                course.objective = line.split('：')[1] || line.split(':')[1] || '';
            }
            
            // 解析章节
            if (line.startsWith('## ')) {
                if (currentSection) {
                    course.sections.push(currentSection);
                }
                currentSection = {
                    title: line.replace('## ', ''),
                    content: [],
                    subsections: []
                };
                currentSubsection = null;
            }
            
            // 解析子章节
            if (line.startsWith('### ')) {
                if (currentSubsection) {
                    currentSection.subsections.push(currentSubsection);
                }
                currentSubsection = {
                    title: line.replace('### ', ''),
                    content: []
                };
            }
            
            // 解析内容
            if (line && !line.startsWith('#') && !line.startsWith('---')) {
                if (currentSubsection) {
                    currentSubsection.content.push(line);
                } else if (currentSection) {
                    currentSection.content.push(line);
                }
            }
        }
        
        // 添加最后一个章节
        if (currentSubsection) {
            currentSection.subsections.push(currentSubsection);
        }
        if (currentSection) {
            course.sections.push(currentSection);
        }
        
        return course;
    }

    // 生成简化的HTML
    generateSimpleHtml(courseData) {
        const title = courseData.title || '课程';
        const cleanTitle = title.replace(/^第\d+课[：:-]?\s*/, '');
        
        let html = `
        <!-- 课程头部 -->
        <section class="course-header">
            <div class="zen-container">
                <div class="header-card">
                    <div class="course-badge">第01课</div>
                    <h1 class="course-main-title">${cleanTitle}</h1>
                    <p class="course-subtitle">${courseData.objective || '培养批判性思维，提升逻辑分析能力'}</p>
                    <div class="course-meta-info">
                        <div class="meta-item">
                            <span class="meta-icon">📚</span>
                            <span class="meta-text">${courseData.module || '思维训练'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon">🎓</span>
                            <span class="meta-text">${courseData.grade || '4年级及以上'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon">⏰</span>
                            <span class="meta-text">${courseData.duration || '20分钟'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;

        // 生成目录
        html += `
        <section class="table-of-contents">
            <div class="zen-container">
                <div class="toc-card">
                    <h3 class="toc-title">📋 课程目录</h3>
                    <div class="toc-list">`;
        
        courseData.sections.forEach((section, index) => {
            const cleanSectionTitle = section.title.replace(/^##\s*/, '').replace(/^\d+\.\s*/, '');
            html += `
                        <a href="#section-${index}" class="toc-item">
                            <span class="toc-number">${String(index + 1).padStart(2, '0')}</span>
                            <span class="toc-text">${cleanSectionTitle}</span>
                            <span class="toc-duration">5分钟</span>
                        </a>`;
        });
        
        html += `
                    </div>
                </div>
            </div>
        </section>`;

        // 生成章节内容
        courseData.sections.forEach((section, index) => {
            const cleanSectionTitle = section.title.replace(/^##\s*/, '').replace(/^\d+\.\s*/, '');
            
            html += `
        <section class="content-section" id="section-${index}">
            <div class="zen-container">
                <div class="section-wrapper">
                    <div class="section-header">
                        <div class="section-number">${String(index + 1).padStart(2, '0')}</div>
                        <div class="section-info">
                            <h2 class="section-title">${cleanSectionTitle}</h2>
                            <div class="section-meta">
                                <span class="section-type">学习内容</span>
                                <span class="section-duration">5分钟</span>
                            </div>
                        </div>
                    </div>
                    <div class="section-body">`;
            
            // 章节内容
            if (section.content.length > 0) {
                html += '<div class="main-content">';
                section.content.forEach(content => {
                    if (content.trim()) {
                        html += this.formatSimpleContent(content);
                    }
                });
                html += '</div>';
            }
            
            // 子章节
            section.subsections.forEach((subsection, subIndex) => {
                const cleanSubTitle = subsection.title.replace(/^###\s*/, '');
                html += `
                        <div class="content-block">
                            <h3 class="block-title">${cleanSubTitle}</h3>
                            <div class="block-content">`;
                
                subsection.content.forEach(content => {
                    if (content.trim()) {
                        html += this.formatSimpleContent(content);
                    }
                });
                
                html += `
                            </div>
                        </div>`;
            });
            
            html += `
                    </div>
                </div>
            </div>
        </section>`;
        });
        
        return html;
    }

    // 简化的内容格式化
    formatSimpleContent(content) {
        if (!content || !content.trim()) return '';
        
        let formatted = content.trim();
        
        // 处理列表
        if (formatted.startsWith('- ') || formatted.startsWith('* ')) {
            const listContent = formatted.substring(2);
            return `<li class="content-list-item">${this.formatInline(listContent)}</li>`;
        }
        
        // 处理编号列表
        if (/^\d+\./.test(formatted)) {
            const listContent = formatted.replace(/^\d+\.\s*/, '');
            return `<li class="content-list-item numbered">${this.formatInline(listContent)}</li>`;
        }
        
        // 处理引用
        if (formatted.startsWith('> ')) {
            const quoteContent = formatted.substring(2);
            return `<blockquote class="content-quote">${this.formatInline(quoteContent)}</blockquote>`;
        }
        
        // 普通段落
        return `<p class="content-paragraph">${this.formatInline(formatted)}</p>`;
    }

    // 行内格式化
    formatInline(content) {
        // 处理粗体
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="content-bold">$1</strong>');
        // 处理斜体
        content = content.replace(/\*(.*?)\*/g, '<em class="content-italic">$1</em>');
        // 处理代码
        content = content.replace(/`(.*?)`/g, '<code class="content-code">$1</code>');
        return content;
    }

    // 创建完整页面
    createTestPage(courseData, htmlContent) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${courseData.title}</title>
    <link rel="stylesheet" href="assets/css/clean-course.css">
</head>
<body>
    <!-- 导航 -->
    <nav class="zen-nav">
        <div class="nav-essence">
            <div class="course-spirit">
                <h1 class="spirit-title">${courseData.title}</h1>
                <div class="journey-meta">
                    <span class="time-flow">⏳ ${courseData.duration || '20分钟'}</span>
                    <span class="wisdom-level">🌱 ${courseData.grade || '4年级及以上'}</span>
                </div>
            </div>
            <div class="progress-mandala">
                开始
            </div>
        </div>
    </nav>

    <!-- 主要内容 -->
    <main class="wisdom-flow">
        ${htmlContent}
    </main>
</body>
</html>`;
    }

    // 测试转换第一个课程
    testConvert() {
        try {
            console.log('🧪 开始测试转换...');
            
            const testFile = '02-入门模块/第01课-区分事实与观点-批判性思维入门.md';
            if (!fs.existsSync(testFile)) {
                console.error('❌ 测试文件不存在:', testFile);
                return;
            }
            
            // 解析课程
            const courseData = this.parseCourseContent(testFile);
            console.log('📖 课程解析完成:', courseData.title);
            
            // 生成HTML
            const htmlContent = this.generateSimpleHtml(courseData);
            const fullHtml = this.createTestPage(courseData, htmlContent);
            
            // 创建输出目录
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir);
            }
            
            // 写入文件
            const outputPath = path.join(this.outputDir, 'test-course.html');
            fs.writeFileSync(outputPath, fullHtml, 'utf8');
            
            console.log('✅ 测试页面生成成功:', outputPath);
            
        } catch (error) {
            console.error('❌ 测试转换失败:', error.message);
        }
    }
}

// 运行测试
if (require.main === module) {
    const converter = new TestConverter();
    converter.testConvert();
}
