// 写作页面组件
export class WritePage {
    constructor(onPublish, onImageUpload) {
        this.onPublish = onPublish;
        this.onImageUpload = onImageUpload;
        this.selectedMood = null;
    }

    render() {
        return `
            <section id="write" class="hidden">
                <div class="mb-10 flex flex-col gap-6">
                    <input id="in-title" type="text" placeholder="TITLE" class="bg-transparent text-4xl font-bold serif outline-none border-none w-full">
                    <input id="in-author" type="text" placeholder="Author Name" class="bg-transparent text-sm opacity-60 outline-none border-none w-full">
                    <div>
                        <p class="text-xs opacity-40 mb-3 uppercase tracking-widest">Space · 发布至</p>
                        <select id="in-space" class="bg-transparent text-lg serif opacity-80 outline-none border border-current px-4 py-3 rounded cursor-pointer hover:opacity-100 transition-opacity w-full">
                            <option value="此间">此间 · 氛围</option>
                            <option value="观市">观市 · 市场</option>
                            <option value="碎语">碎语 · 即时</option>
                            <option value="札记">札记 · 思考</option>
                            <option value="长文">长文 · 深度</option>
                            <option value="途中">途中 · 过程</option>
                            <option value="一隅">一隅 · 边角</option>
                        </select>
                    </div>
                    <div>
                        <p class="text-xs opacity-40 mb-3 uppercase tracking-widest">Mood</p>
                        <div class="mood-selector">
                            ${this.renderMoodOptions()}
                        </div>
                    </div>
                </div>
                <textarea id="in-content" rows="12" placeholder="Start recording..." class="w-full text-lg bg-transparent outline-none resize-none leading-relaxed border-none"></textarea>
                <div class="mt-6 flex items-center gap-4">
                    <input type="file" id="image-upload" accept="image/*" style="display:none">
                    <button id="add-image-btn" class="text-xs opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
                        <i class="fas fa-image"></i> Add Image
                    </button>
                    <span id="upload-status" class="text-xs opacity-40"></span>
                </div>
                <div class="mt-10 flex justify-end">
                    <button id="pub-btn" class="bg-black text-white dark:bg-white dark:text-black px-12 py-4 font-bold text-xs uppercase tracking-widest">Publish</button>
                </div>
            </section>
        `;
    }

    renderMoodOptions() {
        const moods = [
            '😊', '😢', '😌', '🤔', '😴', '🔥',
            '😄', '🥲', '😐', '😶', '🙃', '😮', '😤', '😞',
            '🫠', '🌙', '☁️', '🌧️', '🌿', '🍂', '🕯️', '📖',
            '🎧', '🍺', '🚶', '🧭', '⛰️', '🌊', '🌌'
        ];
        
        return moods.map(mood => 
            `<span class="mood-option" data-mood="${mood}">${mood}</span>`
        ).join('');
    }

    selectMood(mood) {
        this.selectedMood = mood;
        document.querySelectorAll('.mood-option').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`[data-mood="${mood}"]`)?.classList.add('selected');
    }

    getFormData() {
        return {
            title: document.getElementById('in-title').value.trim(),
            content: document.getElementById('in-content').value.trim(),
            author: document.getElementById('in-author').value.trim() || 'Sylvan',
            space: document.getElementById('in-space').value,
            mood: this.selectedMood
        };
    }

    clearForm() {
        document.getElementById('in-title').value = '';
        document.getElementById('in-content').value = '';
        document.getElementById('in-author').value = '';
        document.getElementById('in-space').value = '此间';
        this.selectedMood = null;
        document.querySelectorAll('.mood-option').forEach(el => el.classList.remove('selected'));
    }

    setSpace(spaceName) {
        const spaceSelect = document.getElementById('in-space');
        if (spaceSelect) {
            spaceSelect.value = spaceName;
        }
    }

    bindEvents() {
        // 心情选择
        document.querySelectorAll('.mood-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectMood(option.dataset.mood);
            });
        });

        // 发布按钮
        document.getElementById('pub-btn')?.addEventListener('click', () => {
            this.onPublish();
        });

        // 图片上传
        document.getElementById('add-image-btn')?.addEventListener('click', () => {
            document.getElementById('image-upload')?.click();
        });

        document.getElementById('image-upload')?.addEventListener('change', (e) => {
            this.onImageUpload(e);
        });
    }
}
