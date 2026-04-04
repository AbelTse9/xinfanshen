/**
 * 欣翻身照明官网 - 交互脚本
 * 深圳宝安工程照明服务 · 品牌非标定制 · 智能照明
 */

(function () {
  'use strict';

  /* ========== 防闪白：DOM ready 后恢复 body 白色背景 ========== */
  // banner-section 自身有深色背景兜底，body 可以恢复白色供其他区块使用
  document.documentElement.addEventListener('DOMContentLoaded', function () {
    document.body.classList.remove('init-dark');
  });
  // 兜底：如果 DOMContentLoaded 已过，直接移除
  if (document.readyState !== 'loading') {
    document.body.classList.remove('init-dark');
  }



  /* ========== Banner 轮播 ========== */
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.dot');
  let current = 0;
  let autoTimer = null;

  function goToSlide(idx) {
    if (idx === current) return;
    const prevSlide = slides[current];
    current = (idx + slides.length) % slides.length;

    // 旧片左滑退出
    prevSlide.classList.remove('active');
    prevSlide.classList.add('exit');

    // 新片从右滑入
    slides[current].classList.remove('exit');
    slides[current].classList.add('active');

    // dot 同步切换
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // 过渡完成后把旧片重置到右侧（供下次复用）
    setTimeout(() => { prevSlide.classList.remove('exit'); }, 850);
  }

  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(nextSlide, 2000); // 每2秒切换
  }
  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  /* ========== 鼠标悬停暂停 + Touch滑动支持 ========== */
  const bannerSection = document.querySelector('.banner-section');
  if (bannerSection) {
    // 鼠标悬停暂停
    bannerSection.addEventListener('mouseenter', stopAuto);
    bannerSection.addEventListener('mouseleave', startAuto);
    // Touch 滑动
    let touchStartX = 0;
    bannerSection.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    bannerSection.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); startAuto(); }
    }, { passive: true });
  }

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAuto(); });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
      startAuto();
    });
  });

  startAuto();

  /* ========== 导航栏滚动效果 ========== */
  const header = document.getElementById('main-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ========== 移动端菜单 ========== */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      if (mobileMenu.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  /* ========== 导航激活状态跟踪 ========== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    let active = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        active = section.id;
      }
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + active || (active === '' && href === '#home'));
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ========== 产品分类标签 ========== */
  document.querySelectorAll('.ptab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  /* ========== 案例分类标签 ========== */
  document.querySelectorAll('.ctab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  /* ========== FAQ 答案始终显示 ========== */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const a = item.querySelector('.faq-a');
    const aInner = item.querySelector('.faq-a-inner');
    if (a && aInner) {
      // 答案始终显示
      a.style.maxHeight = 'none';
      a.style.overflow = 'visible';
      aInner.style.opacity = '1';
      aInner.style.transform = 'none';
    }
  });

  /* ========== 滚动显现动画 (IntersectionObserver) ========== */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
  }

  /* ========== 粒子背景 ========== */
  function createParticles(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 2.5 + 1;
      const x = Math.random() * 100;
      const delay = Math.random() * 6;
      const dur = Math.random() * 6 + 4;
      const opacity = Math.random() * 0.4 + 0.1;

      p.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        background:rgba(255,255,255,${opacity});
        border-radius:50%;
        left:${x}%;
        bottom:-${size}px;
        animation:particle-rise ${dur}s ${delay}s ease-in infinite;
      `;
      container.appendChild(p);
    }

    if (!document.getElementById('particle-style')) {
      const style = document.createElement('style');
      style.id = 'particle-style';
      style.textContent = `
        @keyframes particle-rise {
          0% { transform:translateY(0) scale(1); opacity:var(--op,0.2); }
          100% { transform:translateY(-100vh) scale(0.3); opacity:0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  createParticles('particles1', 40);

  /* ========== 平滑锚点滚动 ========== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
        const topbarH = document.querySelector('.top-bar') ? document.querySelector('.top-bar').offsetHeight : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  /* ========== 年份自动更新 ========== */
  const yearEls = document.querySelectorAll('.auto-year');
  yearEls.forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ========== 服务卡片磁性悬停 ========== */
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.service-card, .adv-card, .product-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  console.log('%c欣翻身照明官网 · 深圳宝安区新安街道翻身社区49区泰华锦绣城109', 'color:#FFB347;font-size:14px;font-weight:bold;');

})();
