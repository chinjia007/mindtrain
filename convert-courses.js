const fs = require('fs');
const path = require('path');

// 课程转换器
class CourseConverter {
    constructor() {
        this.templatePath = 'course-template.html';
        this.outputDir = 'generated-courses';
        this.courseData = {};
    }

    // 扫描所有课程文件
    scanCourseFiles(dir = './') {
        const courseFiles = [];
        
        function scanDir(currentDir) {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'assets') {
                    scanDir(fullPath);
                } else if (item.endsWith('.md') && item.includes('第') && item.includes('课')) {
                    courseFiles.push({
                        path: fullPath,
                        name: item,
                        dir: currentDir
                    });
                }
            }
        }
        
        scanDir(dir);
        return courseFiles;
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

    // 生成HTML内容 - 重新设计清晰布局
    generateHtmlContent(courseData) {
        let html = '';

        // 生成课程头部 - 简洁明了
        html += `
        <section class="course-header" data-section="header">
            <div class="zen-container">
                <div class="header-card">
                    <div class="course-badge">${this.extractCourseNumber(courseData.title)}</div>
                    <h1 class="course-main-title">${this.cleanTitle(courseData.title)}</h1>
                    <p class="course-subtitle">${courseData.objective || '培养批判性思维，提升逻辑分析能力'}</p>
                    ${this.generateCourseMetaInfo(courseData)}
                </div>
            </div>
        </section>`;

        // 生成目录导航
        html += this.generateTableOfContents(courseData.sections);

        // 生成各个章节 - 清晰分离的布局
        courseData.sections.forEach((section, index) => {
            const sectionId = `section-${index}`;
            const sectionType = this.identifySectionType(section.title);

            html += `
        <section class="content-section ${sectionType}" data-section="${sectionId}" id="section-${index}">
            <div class="zen-container">
                <div class="section-wrapper">
                    <div class="section-header">
                        <div class="section-number">${String(index + 1).padStart(2, '0')}</div>
                        <div class="section-info">
                            <h2 class="section-title">${this.cleanSectionTitle(section.title)}</h2>
                            <div class="section-meta">
                                <span class="section-type">${this.getSectionTypeName(sectionType)}</span>
                                <span class="section-duration">${this.estimateDuration(section)} 分钟</span>
                            </div>
                        </div>
                    </div>

                    <div class="section-body">`;

            // 章节内容
            if (section.content.length > 0) {
                html += '<div class="main-content">';
                html += this.groupAndFormatContent(section.content, sectionType);
                html += '</div>';
            }

            // 子章节 - 作为内容块
            section.subsections.forEach((subsection, subIndex) => {
                html += `
                        <div class="content-block" data-block="${subIndex}">
                            <h3 class="block-title">${this.cleanSubsectionTitle(subsection.title)}</h3>
                            <div class="block-content">
                                ${this.groupAndFormatContent(subsection.content, sectionType)}
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

    // 提取课程编号
    extractCourseNumber(title) {
        const match = title.match(/第(\d+)课/);
        return match ? `第${match[1]}课` : '课程';
    }

    // 清理标题
    cleanTitle(title) {
        return title
            .replace(/^第\d+课[：:-]?\s*/, '')
            .replace(/^一叶知秋第\d+课[：:-]?\s*/, '')
            .replace(/^识人辨言第\d+课[：:-]?\s*/, '');
    }

    // 清理章节标题
    cleanSectionTitle(title) {
        return title
            .replace(/^##\s*/, '')
            .replace(/^\d+\.\s*/, '')
            .replace(/^[📖🎬🎯✅🚀📝🔍💫]\s*/, '');
    }

    // 清理子章节标题
    cleanSubsectionTitle(title) {
        return title
            .replace(/^###\s*/, '')
            .replace(/^\d+\.\s*/, '')
            .replace(/^[🎯🔍🛠️💡🤔💭✨]\s*/, '');
    }

    // 识别章节类型
    identifySectionType(title) {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('概念') || lowerTitle.includes('导入') || lowerTitle.includes('介绍')) return 'concept';
        if (lowerTitle.includes('案例') || lowerTitle.includes('实例') || lowerTitle.includes('例子')) return 'case';
        if (lowerTitle.includes('练习') || lowerTitle.includes('实践') || lowerTitle.includes('训练')) return 'practice';
        if (lowerTitle.includes('测试') || lowerTitle.includes('检验') || lowerTitle.includes('评估')) return 'test';
        if (lowerTitle.includes('应用') || lowerTitle.includes('运用') || lowerTitle.includes('实战')) return 'application';
        if (lowerTitle.includes('总结') || lowerTitle.includes('小结') || lowerTitle.includes('回顾')) return 'summary';
        if (lowerTitle.includes('拓展') || lowerTitle.includes('深入') || lowerTitle.includes('进阶')) return 'advanced';
        return 'content';
    }

    // 获取章节类型名称
    getSectionTypeName(type) {
        const typeNames = {
            'concept': '概念学习',
            'case': '案例分析',
            'practice': '实践练习',
            'test': '技能测试',
            'application': '应用实战',
            'summary': '总结回顾',
            'advanced': '拓展提升',
            'content': '内容学习'
        };
        return typeNames[type] || '学习内容';
    }

    // 估算章节时长
    estimateDuration(section) {
        const contentLength = section.content.join('').length +
                            section.subsections.reduce((sum, sub) => sum + sub.content.join('').length, 0);
        return Math.max(2, Math.ceil(contentLength / 500));
    }

    // 生成目录导航
    generateTableOfContents(sections) {
        return `
        <section class="table-of-contents">
            <div class="zen-container">
                <div class="toc-card">
                    <h3 class="toc-title">📋 课程目录</h3>
                    <div class="toc-list">
                        ${sections.map((section, index) => `
                            <a href="#section-${index}" class="toc-item ${this.identifySectionType(section.title)}">
                                <span class="toc-number">${String(index + 1).padStart(2, '0')}</span>
                                <span class="toc-text">${this.cleanSectionTitle(section.title)}</span>
                                <span class="toc-duration">${this.estimateDuration(section)}分钟</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        </section>`;
    }

    // 生成课程元信息
    generateCourseMetaInfo(courseData) {
        return `
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
            </div>`;
    }

    // 为标题添加合适的emoji
    addTitleEmoji(title) {
        if (title.includes('事实') || title.includes('观点')) return '🌸 ' + title;
        if (title.includes('逻辑')) return '🧠 ' + title;
        if (title.includes('系统')) return '🌐 ' + title;
        if (title.includes('设计')) return '🎨 ' + title;
        if (title.includes('批判')) return '🔍 ' + title;
        if (title.includes('创意') || title.includes('创新')) return '💡 ' + title;
        return '✨ ' + title;
    }

    // 获取章节图标
    getSectionIcon(title) {
        if (title.includes('概念') || title.includes('导入')) return '📖';
        if (title.includes('案例') || title.includes('实例')) return '🎬';
        if (title.includes('练习') || title.includes('实践')) return '🎯';
        if (title.includes('测试') || title.includes('检验')) return '✅';
        if (title.includes('应用') || title.includes('运用')) return '🚀';
        if (title.includes('总结') || title.includes('小结')) return '📝';
        if (title.includes('拓展') || title.includes('深入')) return '🔍';
        return '💫';
    }

    // 获取子章节图标
    getSubsectionIcon(title) {
        if (title.includes('测试') || title.includes('检测')) return '🎯';
        if (title.includes('分析') || title.includes('解析')) return '🔍';
        if (title.includes('技巧') || title.includes('方法')) return '🛠️';
        if (title.includes('例子') || title.includes('示例')) return '💡';
        if (title.includes('思考') || title.includes('反思')) return '🤔';
        if (title.includes('提示') || title.includes('建议')) return '💭';
        return '✨';
    }

    // 智能分组和格式化内容
    groupAndFormatContent(contentArray, sectionType = 'content') {
        if (!contentArray || contentArray.length === 0) return '';

        let html = '';
        let currentList = [];
        let listType = null;

        for (let i = 0; i < contentArray.length; i++) {
            const content = contentArray[i];
            if (!content || !content.trim()) continue;

            const isListItem = content.startsWith('- ') || content.startsWith('* ') || /^\d+\./.test(content);
            const currentListType = content.startsWith('- ') || content.startsWith('* ') ? 'ul' :
                                   /^\d+\./.test(content) ? 'ol' : null;

            if (isListItem && (listType === null || listType === currentListType)) {
                // 开始或继续列表
                if (listType === null) {
                    listType = currentListType;
                }
                currentList.push(this.formatContent(content, sectionType));
            } else {
                // 结束当前列表
                if (currentList.length > 0) {
                    html += `<${listType} class="content-list ${sectionType}-list">${currentList.join('')}</${listType}>`;
                    currentList = [];
                    listType = null;
                }

                // 处理非列表内容
                if (isListItem) {
                    listType = currentListType;
                    currentList.push(this.formatContent(content, sectionType));
                } else {
                    html += this.formatContent(content, sectionType);
                }
            }
        }

        // 处理最后的列表
        if (currentList.length > 0) {
            html += `<${listType} class="content-list ${sectionType}-list">${currentList.join('')}</${listType}>`;
        }

        return html;
    }

    // 格式化内容 - 简化版本
    formatContent(content, sectionType = 'content') {
        if (!content || !content.trim()) return '';

        let formattedContent = content.trim();

        // 处理列表项
        if (formattedContent.startsWith('- ') || formattedContent.startsWith('* ')) {
            const listContent = formattedContent.substring(2);
            return `<li class="content-list-item">${this.formatInlineContent(listContent)}</li>`;
        }

        // 处理编号列表
        if (/^\d+\./.test(formattedContent)) {
            const listContent = formattedContent.replace(/^\d+\.\s*/, '');
            return `<li class="content-list-item numbered">${this.formatInlineContent(listContent)}</li>`;
        }

        // 处理引用
        if (formattedContent.startsWith('> ')) {
            const quoteContent = formattedContent.substring(2);
            return `<blockquote class="content-quote">${this.formatInlineContent(quoteContent)}</blockquote>`;
        }

        // 处理特殊段落
        if (this.isSpecialParagraph(formattedContent)) {
            return this.formatSpecialParagraph(formattedContent, sectionType);
        }

        // 普通段落
        return `<p class="content-paragraph">${this.formatInlineContent(formattedContent)}</p>`;
    }

    // 格式化行内内容
    formatInlineContent(content) {
        // 处理粗体
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="content-bold">$1</strong>');

        // 处理斜体
        content = content.replace(/\*(.*?)\*/g, '<em class="content-italic">$1</em>');

        // 处理代码
        content = content.replace(/`(.*?)`/g, '<code class="content-code">$1</code>');

        // 处理链接
        content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="content-link">$1</a>');

        return content;
    }

    // 判断是否为特殊段落
    isSpecialParagraph(content) {
        return content.includes('**课程信息**') ||
               content.includes('**学习目标**') ||
               content.includes('**重要提示**') ||
               content.includes('**注意**') ||
               content.includes('案例') ||
               content.includes('练习') ||
               content.includes('测试');
    }

    // 格式化特殊段落
    formatSpecialParagraph(content, sectionType) {
        if (content.includes('**课程信息**')) {
            return `<div class="special-box info-box">${this.formatInlineContent(content)}</div>`;
        }
        if (content.includes('**学习目标**')) {
            return `<div class="special-box objective-box">${this.formatInlineContent(content)}</div>`;
        }
        if (content.includes('案例')) {
            return `<div class="special-box case-box">${this.formatInlineContent(content)}</div>`;
        }
        if (content.includes('练习') || content.includes('测试')) {
            return `<div class="special-box exercise-box">${this.formatInlineContent(content)}</div>`;
        }
        if (content.includes('**重要提示**') || content.includes('**注意**')) {
            return `<div class="special-box warning-box">${this.formatInlineContent(content)}</div>`;
        }

        return `<p class="content-paragraph special">${this.formatInlineContent(content)}</p>`;
    }

    // 格式化内容 - 增强美化
    formatContent(content, context = {}) {
        if (!content || !content.trim()) return '';

        let formattedContent = content.trim();

        // 处理特殊标记和emoji
        formattedContent = this.enhanceEmojis(formattedContent);

        // 处理列表项
        if (formattedContent.startsWith('- ') || formattedContent.startsWith('* ')) {
            const listContent = formattedContent.substring(2);
            return `<li class="zen-list-item">${this.formatInlineContent(listContent)}</li>`;
        }

        // 处理编号列表
        if (/^\d+\./.test(formattedContent)) {
            const listContent = formattedContent.replace(/^\d+\.\s*/, '');
            return `<li class="zen-numbered-item">${this.formatInlineContent(listContent)}</li>`;
        }

        // 处理引用
        if (formattedContent.startsWith('> ')) {
            const quoteContent = formattedContent.substring(2);
            return `<blockquote class="zen-quote">${this.formatInlineContent(quoteContent)}</blockquote>`;
        }

        // 处理标题级别的内容
        if (formattedContent.startsWith('####')) {
            const titleContent = formattedContent.replace(/^####\s*/, '');
            return `<h4 class="zen-subtitle">${this.formatInlineContent(titleContent)}</h4>`;
        }

        // 处理特殊格式的段落
        if (this.isSpecialParagraph(formattedContent)) {
            return this.formatSpecialParagraph(formattedContent);
        }

        // 普通段落
        return `<p class="zen-paragraph">${this.formatInlineContent(formattedContent)}</p>`;
    }

    // 格式化行内内容
    formatInlineContent(content) {
        // 处理粗体
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="zen-bold">$1</strong>');

        // 处理斜体
        content = content.replace(/\*(.*?)\*/g, '<em class="zen-italic">$1</em>');

        // 处理代码
        content = content.replace(/`(.*?)`/g, '<code class="zen-code">$1</code>');

        // 处理链接
        content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="zen-link">$1</a>');

        // 处理特殊标记
        content = content.replace(/【([^】]+)】/g, '<span class="zen-highlight">$1</span>');

        return content;
    }

    // 增强emoji显示
    enhanceEmojis(content) {
        // 为emoji添加特殊样式类
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        return content.replace(emojiRegex, '<span class="zen-emoji">$&</span>');
    }

    // 判断是否为特殊段落
    isSpecialParagraph(content) {
        return content.includes('**课程信息**') ||
               content.includes('**学习目标**') ||
               content.includes('**重要提示**') ||
               content.includes('**注意**') ||
               content.includes('案例') ||
               content.includes('练习') ||
               content.includes('测试');
    }

    // 格式化特殊段落
    formatSpecialParagraph(content) {
        if (content.includes('**课程信息**')) {
            return `<div class="course-info-box">${this.formatInlineContent(content)}</div>`;
        }
        if (content.includes('**学习目标**')) {
            return `<div class="learning-objective-box">${this.formatInlineContent(content)}</div>`;
        }
        if (content.includes('案例')) {
            return `<div class="case-study-box">${this.formatInlineContent(content)}</div>`;
        }
        if (content.includes('练习') || content.includes('测试')) {
            return `<div class="exercise-box">${this.formatInlineContent(content)}</div>`;
        }
        if (content.includes('**重要提示**') || content.includes('**注意**')) {
            return `<div class="important-notice">${this.formatInlineContent(content)}</div>`;
        }

        return `<p class="zen-paragraph special">${this.formatInlineContent(content)}</p>`;
    }

    // 创建完整的HTML页面
    createHtmlPage(courseData, htmlContent) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${courseData.title}</title>
    <link rel="stylesheet" href="assets/css/clean-course.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- 动态禅意背景 -->
    <div class="zen-background">
        <canvas id="zenCanvas"></canvas>
        <div class="floating-particles"></div>
    </div>

    <!-- 禅意导航 -->
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

    <!-- 主要内容流 -->
    <main class="wisdom-flow">
        ${htmlContent}
    </main>

    <!-- 交互脚本 -->
    <script src="assets/js/zen-course.js"></script>
</body>
</html>`;
    }

    // 转换所有课程
    convertAllCourses() {
        console.log('🚀 开始扫描课程文件...');
        const courseFiles = this.scanCourseFiles();
        console.log(`📚 找到 ${courseFiles.length} 个课程文件`);
        
        // 创建输出目录
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }
        
        courseFiles.forEach((file, index) => {
            try {
                console.log(`📖 正在处理: ${file.name}`);
                
                // 解析课程内容
                const courseData = this.parseCourseContent(file.path);
                
                // 生成HTML内容
                const htmlContent = this.generateHtmlContent(courseData);
                
                // 创建完整页面
                const fullHtml = this.createHtmlPage(courseData, htmlContent);
                
                // 生成文件名
                const fileName = `course-${String(index + 1).padStart(2, '0')}.html`;
                const outputPath = path.join(this.outputDir, fileName);
                
                // 写入文件
                fs.writeFileSync(outputPath, fullHtml, 'utf8');
                
                console.log(`✅ 生成成功: ${fileName}`);
                
            } catch (error) {
                console.error(`❌ 处理失败 ${file.name}:`, error.message);
            }
        });
        
        console.log(`🎉 转换完成！生成了 ${courseFiles.length} 个课程页面`);
        this.generateIndex(courseFiles);
    }

    // 生成美化的课程索引页面
    generateIndex(courseFiles) {
        // 按模块分组
        const moduleGroups = this.groupCoursesByModule(courseFiles);

        const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>课程索引 - 少儿思维训练</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/enhanced-course.css">
    <style>
        .course-index {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            background: var(--light-canvas);
        }
        .index-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .index-title {
            font-size: 2.5rem;
            font-weight: 700;
            background: var(--gradient-neural);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
        }
        .index-subtitle {
            font-size: 1.2rem;
            color: #86868b;
            margin-bottom: 20px;
        }
        .stats-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 40px;
        }
        .stat-item {
            text-align: center;
            background: rgba(255, 255, 255, 0.8);
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--neural-purple);
        }
        .stat-label {
            font-size: 0.9rem;
            color: #86868b;
            margin-top: 4px;
        }
        .module-section {
            margin-bottom: 40px;
        }
        .module-title {
            font-size: 1.8rem;
            font-weight: 600;
            color: var(--neural-purple);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .course-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .course-card {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .course-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        .course-card a {
            text-decoration: none;
            color: inherit;
            display: block;
        }
        .course-number {
            font-size: 0.8rem;
            color: var(--neural-blue);
            font-weight: 600;
            margin-bottom: 8px;
        }
        .course-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--zen-text);
            margin-bottom: 8px;
            line-height: 1.4;
        }
        .course-description {
            font-size: 0.9rem;
            color: #86868b;
            line-height: 1.5;
        }
        @media (max-width: 768px) {
            .stats-info { flex-direction: column; gap: 16px; }
            .course-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="course-index">
        <div class="index-header">
            <h1 class="index-title">🧠 少儿思维训练课程</h1>
            <p class="index-subtitle">培养批判性思维，提升逻辑分析能力，开启智慧之旅</p>

            <div class="stats-info">
                <div class="stat-item">
                    <div class="stat-number">${courseFiles.length}</div>
                    <div class="stat-label">总课程数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Object.keys(moduleGroups).length}</div>
                    <div class="stat-label">学习模块</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Math.round(courseFiles.length * 20 / 60)}</div>
                    <div class="stat-label">总学时(小时)</div>
                </div>
            </div>
        </div>

        ${Object.entries(moduleGroups).map(([module, courses]) => `
            <div class="module-section">
                <h2 class="module-title">${this.getModuleIcon(module)} ${module}</h2>
                <div class="course-grid">
                    ${courses.map((course, index) => `
                        <div class="course-card">
                            <a href="${this.outputDir}/course-${String(course.globalIndex + 1).padStart(2, '0')}.html">
                                <div class="course-number">第${course.globalIndex + 1}课</div>
                                <h3 class="course-title">${this.extractCourseTitle(course.file.name)}</h3>
                                <p class="course-description">点击开始学习 →</p>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

        fs.writeFileSync('course-index.html', indexHtml, 'utf8');
        console.log('📋 美化的课程索引页面已生成: course-index.html');
    }

    // 按模块分组课程
    groupCoursesByModule(courseFiles) {
        const groups = {};

        courseFiles.forEach((file, index) => {
            let module = '其他模块';

            if (file.dir.includes('入门模块')) module = '入门模块';
            else if (file.dir.includes('基础模块')) module = '基础模块';
            else if (file.dir.includes('进阶模块')) module = '进阶模块';
            else if (file.name.includes('批判性思维入门')) module = '批判性思维入门';
            else if (file.name.includes('逻辑思维入门')) module = '逻辑思维入门';
            else if (file.name.includes('系统思维入门')) module = '系统思维入门';
            else if (file.name.includes('设计思维入门')) module = '设计思维入门';
            else if (file.name.includes('批判性思维基础')) module = '批判性思维基础';
            else if (file.name.includes('逻辑思维基础')) module = '逻辑思维基础';
            else if (file.name.includes('系统思维基础')) module = '系统思维基础';
            else if (file.name.includes('设计思维基础')) module = '设计思维基础';
            else if (file.name.includes('批判性思维进阶')) module = '批判性思维进阶';
            else if (file.name.includes('逻辑思维进阶')) module = '逻辑思维进阶';
            else if (file.name.includes('系统思维进阶')) module = '系统思维进阶';
            else if (file.name.includes('设计思维进阶')) module = '设计思维进阶';
            else if (file.name.includes('一叶知秋')) module = '一叶知秋专题';
            else if (file.name.includes('识人辨言')) module = '识人辨言专题';

            if (!groups[module]) groups[module] = [];
            groups[module].push({ file, globalIndex: index });
        });

        return groups;
    }

    // 获取模块图标
    getModuleIcon(module) {
        if (module.includes('批判性思维')) return '🔍';
        if (module.includes('逻辑思维')) return '🧠';
        if (module.includes('系统思维')) return '🌐';
        if (module.includes('设计思维')) return '🎨';
        if (module.includes('一叶知秋')) return '🍃';
        if (module.includes('识人辨言')) return '👁️';
        if (module.includes('入门')) return '🌱';
        if (module.includes('基础')) return '🏗️';
        if (module.includes('进阶')) return '🚀';
        return '📚';
    }

    // 提取课程标题
    extractCourseTitle(fileName) {
        return fileName
            .replace('.md', '')
            .replace(/^第\d+课-/, '')
            .replace(/^一叶知秋第\d+课-/, '')
            .replace(/^识人辨言第\d+课-/, '')
            .replace(/-[^-]*$/, '');
    }
}

// 执行转换
if (require.main === module) {
    const converter = new CourseConverter();
    converter.convertAllCourses();
}

module.exports = CourseConverter;
