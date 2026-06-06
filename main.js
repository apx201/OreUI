// 音效
const clickSound = new Audio('btn.mp3');

// 使用事件委托修复所有按钮的音效问题
document.body.addEventListener('click', function(e) {
    const button = e.target.closest('.btn,.sound,.func_btn,.header_btn');
    if (!button) return;
    if (button.classList.contains('active')) return;
    
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
}, true);

// 记录每个页面是否已经加载过（使用 Map，以页面元素为 key）
const loadedPagesMap = new WeakMap();

// 为元素添加淡入动画
function fadeInElement(element) {
    if (!element) return;
    
    const children = element.children;
    Array.from(children).forEach(child => {
        child.style.opacity = '0';
        child.style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
            if (child) child.style.opacity = '1';
        }, 10);
    });
}

// 直接显示内容
function showContentDirectly(elem) {
    if (!elem.dataset.originalContent) return;
    elem.innerHTML = elem.dataset.originalContent;
    elem.style.position = '';
    elem.style.minHeight = '';
    delete elem.dataset.loading;
}

// 延迟加载功能
function applyLazyLoading(targetPage) {
    if (!targetPage) return;
    
    // 检查这个页面是否已经加载过
    if (loadedPagesMap.get(targetPage) === true) {
        return;
    }
    
    const elements = targetPage.querySelectorAll('.section, .section-2,.load');
    if (elements.length === 0) return;
    
    let allLoaded = true;
    
    elements.forEach(elem => {
        // 如果这个元素已经加载过，跳过
        if (elem.dataset.loaded === 'true') {
            return;
        }
        
        allLoaded = false;
        
        // 保存原始内容
        if (!elem.dataset.originalContent) {
            elem.dataset.originalContent = elem.innerHTML;
        }
        
        // 如果已经在加载中，跳过
        if (elem.dataset.loading === 'true') {
            return;
        }
        
        elem.dataset.loading = 'true';
        
        // 显示 loading
        elem.style.position = 'relative';
        elem.style.minHeight = '100px';
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-gif';
        loadingDiv.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; z-index:1;';
        loadingDiv.innerHTML = '<img src="load.gif" alt="加载中..." style="width:16px; height:16px;">';
        
        const originalContentBackup = elem.dataset.originalContent;
        elem.innerHTML = '';
        elem.appendChild(loadingDiv);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content-wrapper';
        contentDiv.style.cssText = 'position:relative; z-index:2; opacity:0; transition:opacity 0.4s ease;';
        contentDiv.innerHTML = originalContentBackup;
        elem.appendChild(contentDiv);
        
        setTimeout(() => {
            // 检查元素是否还存在
            if (!elem.isConnected) return;
            
            contentDiv.style.opacity = '1';
            
            setTimeout(() => {
                if (!elem.isConnected) return;
                
                if (loadingDiv && loadingDiv.parentNode) {
                    loadingDiv.remove();
                }
                
                elem.style.position = '';
                elem.style.minHeight = '';
                contentDiv.style.position = '';
                contentDiv.style.zIndex = '';
                contentDiv.style.opacity = '';
                contentDiv.style.transition = '';
                
                while (contentDiv.firstChild) {
                    elem.appendChild(contentDiv.firstChild);
                }
                contentDiv.remove();
                
                elem.dataset.loaded = 'true';
                delete elem.dataset.loading;
                
                fadeInElement(elem);
            }, 400);
        }, 500);
    });
    
    // 只有当所有元素都加载完成后，才标记整个页面为已加载
    if (allLoaded && elements.length > 0) {
        loadedPagesMap.set(targetPage, true);
    } else if (elements.length > 0) {
        // 延迟再次检查，确保所有元素最终都被加载
        setTimeout(() => {
            if (targetPage && targetPage.isConnected) {
                const stillLoading = targetPage.querySelectorAll('.section[data-loading="true"], .section-2[data-loading="true"]');
                if (stillLoading.length === 0) {
                    loadedPagesMap.set(targetPage, true);
                }
            }
        }, 1500);
    }
}

// 多个独立 Tab 组 - 标签页切换效果
document.querySelectorAll('.tab').forEach((tabContainer) => {
    const tabButtons = tabContainer.querySelectorAll('.tab_btn');
    const contentContainer = tabContainer.nextElementSibling;
    const panes = contentContainer ? contentContainer.querySelectorAll('.tab_page') : [];
    
    if (panes.length === 0) return;
    
    // 默认激活第一个按钮和第一个面板
    let hasActive = false;
    tabButtons.forEach((btn, idx) => {
        if (btn.classList.contains('active')) {
            hasActive = true;
            if (panes[idx]) {
                panes[idx].classList.add('active');
                applyLazyLoading(panes[idx]);
            }
        }
    });
    
    if (!hasActive && tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
        if (panes[0]) {
            panes[0].classList.add('active');
            applyLazyLoading(panes[0]);
        }
    }
    
    tabButtons.forEach((button, btnIndex) => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            if (this.classList.contains('active')) return;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (panes.length > 0) {
                panes.forEach(pane => pane.classList.remove('active'));
                const newActivePane = panes[btnIndex];
                if (newActivePane) {
                    newActivePane.classList.add('active');
                    applyLazyLoading(newActivePane);
                }
            }
        });
    });
});

//全屏
// 获取元素
const full_screen = document.getElementById('full_screen');

// 判断当前是否全屏
function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}

// 进入全屏
function enterFullscreen() {
  const docEl = document.documentElement;
  const request = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;

  if (request) {
    request.call(docEl).then(() => {
      // 全屏后尝试切换为横屏（不锁定，只是尝试）
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
      }
    }).catch(() => {});
  }
}

// 退出全屏
function exitFullscreen() {
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;

  if (exit) {
    exit.call(document).then(() => {
      // 退出后解锁方向
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      } else if (screen.unlockOrientation) {
        screen.unlockOrientation();
      }
    }).catch(() => {});
  }
}

// 点击切换
full_screen.addEventListener('click', () => {
  isFullscreen() ? exitFullscreen() : enterFullscreen();
});