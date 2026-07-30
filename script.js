/* ============================================
   Scroll-driven frame animation + UI polish
   ============================================ */

const canvas = document.getElementById("animation-canvas");

// Guard: only run animation logic if canvas exists (projects.html has no canvas)
if (canvas) {
  const context = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const frameCount = 180;
  const currentFrame = index => (
    `ezgif-8845a933e04ecf3d-jpg/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
  );

  const images = [];
  let loadedCount = 0;

  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
      loadedCount++;
      if (loadedCount === 1) {
        drawImageProp(context, images[0]);
      }
    };
    images.push(img);
  }

  // Draw image covering entire canvas (object-fit: cover)
  function drawImageProp(ctx, img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.width;
    const ih = img.height;
    const scale = Math.max(cw / iw, ch / ih);
    const x = (cw / 2) - (iw / 2) * scale;
    const y = (ch / 2) - (ih / 2) * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, iw * scale, ih * scale);
  }

  let targetFrame = 0;
  let currentFrameIndex = 0;

  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScrollTop <= 0) return;
    const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScrollTop));
    targetFrame = scrollFraction * (frameCount - 1);
  });

  function animate() {
    currentFrameIndex += (targetFrame - currentFrameIndex) * 0.1;
    const frameToDraw = Math.min(frameCount - 1, Math.max(0, Math.floor(currentFrameIndex)));
    if (images[frameToDraw] && images[frameToDraw].complete) {
      drawImageProp(context, images[frameToDraw]);
    }
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const frameToDraw = Math.min(frameCount - 1, Math.max(0, Math.floor(currentFrameIndex)));
    if (images[frameToDraw] && images[frameToDraw].complete) {
      drawImageProp(context, images[frameToDraw]);
    }
  });
}

/* ============================================
   Scroll-reveal animations
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Add reveal class to sections
  const sections = document.querySelectorAll('section, .project-card, .stat-card, .stat-box, .step, .testimonial-content');
  sections.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Active nav link highlighting on scroll (only on index page)
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  if (navLinks.length > 0) {
    const sectionIds = [];
    navLinks.forEach(link => {
      const id = link.getAttribute('href').substring(1);
      const section = document.getElementById(id);
      if (section) sectionIds.push({ el: section, link });
    });

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY + 150;
      let current = sectionIds[0];
      for (const item of sectionIds) {
        if (item.el.offsetTop <= scrollY) {
          current = item;
        }
      }
      navLinks.forEach(l => l.classList.remove('active'));
      if (current) current.link.classList.add('active');
    });
  }

  // Animate skill progress bars on scroll
  const progressBars = document.querySelectorAll('.progress');
  if (progressBars.length > 0) {
    progressBars.forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            bar.style.width = width;
            barObserver.unobserve(bar);
          }
        });
      }, { threshold: 0.3 });
      barObserver.observe(bar);
    });
  }
});
