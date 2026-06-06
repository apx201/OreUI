// 音效 - 预加载
const clickSound = new Audio('btn.mp3');
clickSound.load();

// ========== Tab 切换功能 ==========
const tabButtons = document.querySelectorAll('.tab-2 .page_btn');
const panes = document.querySelectorAll('.tab_page-2');

// 默认显示第一个，并给第一个按钮添加 active 类
panes.forEach((pane, i) => {
  pane.style.display = i === 0 ? 'block' : 'none';
});
if (tabButtons[0]) {
  tabButtons[0].classList.add('active');
}

// 绑定点击事件
tabButtons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    // 移除所有按钮的 active 类
    tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    // 给当前按钮添加 active 类
    btn.classList.add('active');

    // 切换面板显示
    panes.forEach(pane => {
      pane.style.display = 'none';
    });
    if (panes[i]) {
      panes[i].style.display = 'block';
    }
  });
});

// ========== 音效功能 ==========
document.body.addEventListener('click', function(e) {
  // 监听所有需要音效的按钮类
  const button = e.target.closest('.btn, .sound, .func_btn, .header_btn, .page_btn, .tab_btn');
  if (!button) return;

  // 如果按钮有 active 类且点击的是 tab 按钮，仍然播放音效
  // 只有明确标记不播放的情况才跳过（可选）

  clickSound.currentTime = 0;
  clickSound.play().catch((err) => {
    // 静默处理自动播放策略错误
    console.log('音效播放失败:', err);
  });
}, true);