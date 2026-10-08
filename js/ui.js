/* ==========================================================================
   UI RENDERING & MODAL CONTROLLERS - UI.JS
   Renders Projects with Multi-Screenshot Gallery, Certificates, Management Panel
   ========================================================================== */

const UI = {
  activeCategory: 'All',
  isAdminMode: false,
  uploadedProjectImages: [],
  uploadedCertImage: '',

  // Initialize UI components
  init() {
    this.renderProjects();
    this.renderCertificates();
    this.initCategoryFilters();
    this.initModals();
    this.initPdfViewerControls();
    this.initAdminForm();
    this.initBackupHandlers();
  },

  // --- 1. RENDER PROJECTS (Grid Showcase) ---
  renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    const allProjects = PortfolioStore.getProjects();
    const filtered = this.activeCategory === 'All' 
      ? allProjects 
      : allProjects.filter(p => p.category.toLowerCase() === this.activeCategory.toLowerCase());

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i data-lucide="folder-x" style="width: 48px; height: 48px; margin: 0 auto 1rem auto; opacity: 0.5;"></i>
          <p>No projects found in this domain.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map((proj, index) => {
      const images = (proj.images && proj.images.length > 0) ? proj.images : [proj.image];
      const thumbnail = images[0];
      const countBadge = images.length > 1
        ? `<div class="project-count-badge"><i data-lucide="images" style="width: 13px; height: 13px;"></i> ${images.length} Images</div>`
        : '';

      return `
        <article class="project-card reveal delay-${(index % 3) + 1}" data-id="${proj.id}">
          <div class="project-img-wrapper">
            <img src="${thumbnail}" alt="${proj.title}" class="project-img" loading="lazy">
            <span class="project-badge-overlay">${proj.category}</span>
            ${countBadge}
            <div class="project-zoom-indicator" title="Inspect Gallery & Architecture">
              <i data-lucide="maximize-2" style="width: 18px; height: 18px;"></i>
            </div>
          </div>

          <div class="project-content">
            <h3 class="project-title">${proj.title}</h3>
            <p class="project-desc">${proj.description}</p>
            
            <div class="project-tags">
              ${proj.tags.slice(0, 4).map(tag => `<span class="project-tag">${tag}</span>`).join('')}
              ${proj.tags.length > 4 ? `<span class="project-tag">+${proj.tags.length - 4}</span>` : ''}
            </div>

            <div class="project-footer">
              <span class="view-details-prompt">
                Inspect Gallery (${images.length}) & Architecture
                <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
              </span>

              <div class="manage-item-actions">
                <button class="btn-item-action edit-project" data-id="${proj.id}" title="Edit Project">
                  <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i>
                </button>
                <button class="btn-item-action delete delete-project" data-id="${proj.id}" title="Delete Project">
                  <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    this.attachProjectEvents();
    PortfolioAnimations.initScrollReveal();
  },

  attachProjectEvents() {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-item-action')) return;
        const id = card.getAttribute('data-id');
        this.openProjectModal(id);
      });
    });

    document.querySelectorAll('.edit-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.openEditProjectModal(id);
      });
    });

    document.querySelectorAll('.delete-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this project?')) {
          PortfolioStore.deleteProject(id);
          this.renderProjects();
          this.showToast('Project deleted successfully.', 'info');
        }
      });
    });
  },

  // --- 2. RENDER CERTIFICATES ---
  renderCertificates() {
    const container = document.getElementById('certs-grid');
    if (!container) return;

    const certs = PortfolioStore.getCertificates();

    if (certs.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i data-lucide="award" style="width: 48px; height: 48px; margin: 0 auto 1rem auto; opacity: 0.5;"></i>
          <p>No certificates or credentials added yet.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = certs.map((cert, index) => {
      const isPdf = this.isPdfFile(cert.image);
      const visualContent = isPdf ? `
        <div class="cert-img-wrapper cert-pdf-wrapper">
          <div class="cert-pdf-card-preview">
            <span class="cert-pdf-badge-tag">
              <i data-lucide="file-text" style="width: 13px; height: 13px;"></i> PDF DOCUMENT
            </span>
            <div class="cert-pdf-icon-center">
              <i data-lucide="file-check-2" style="width: 36px; height: 36px; color: var(--accent-violet);"></i>
            </div>
            <span class="cert-pdf-open-hint">
              <i data-lucide="zoom-in" style="width: 13px; height: 13px;"></i>
              Click to Inspect Document
            </span>
          </div>
          <div class="project-zoom-indicator" style="opacity: 1;" title="Open PDF Document">
            <i data-lucide="zoom-in" style="width: 18px; height: 18px;"></i>
          </div>
        </div>
      ` : `
        <div class="cert-img-wrapper">
          <img src="${cert.image}" alt="${cert.title}" class="cert-img" loading="lazy">
          <div class="project-zoom-indicator" style="opacity: 1;" title="Enlarge Certificate">
            <i data-lucide="zoom-in" style="width: 18px; height: 18px;"></i>
          </div>
        </div>
      `;

      return `
      <article class="cert-card reveal delay-${(index % 3) + 1}" data-id="${cert.id}">
        ${visualContent}

        <div class="cert-content">
          <span class="cert-issuer">${cert.issuer}</span>
          <h3 class="cert-title">${cert.title}</h3>
          
          <div class="cert-date">
            <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
            <span>Issued: ${cert.issueDate || 'Verified'}</span>
          </div>

          <div class="cert-footer">
            <span style="font-size: 0.78rem; font-family: monospace; color: var(--text-subtle);">
              ID: ${cert.credentialId || 'Verified'}
            </span>

            <div class="manage-item-actions">
              <button class="btn-item-action edit-cert" data-id="${cert.id}" title="Edit Certificate">
                <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i>
              </button>
              <button class="btn-item-action delete delete-cert" data-id="${cert.id}" title="Delete Certificate">
                <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </div>
        </div>
      </article>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    this.attachCertEvents();
    PortfolioAnimations.initScrollReveal();
  },

  attachCertEvents() {
    document.querySelectorAll('.cert-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-item-action')) return;
        const id = card.getAttribute('data-id');
        this.openCertLightbox(id);
      });
    });

    document.querySelectorAll('.edit-cert').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.openEditCertModal(id);
      });
    });

    document.querySelectorAll('.delete-cert').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this certificate?')) {
          PortfolioStore.deleteCertificate(id);
          this.renderCertificates();
          this.showToast('Certificate deleted successfully.', 'info');
        }
      });
    });
  },

  // --- 3. CATEGORY FILTERS ---
  initCategoryFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-category');
        this.renderProjects();
      });
    });
  },

  // --- 4. MODALS & LIGHTBOXES ---
  initModals() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop || e.target.closest('.modal-close-btn')) {
          this.closeAllModals();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.remove('active');
    });
    this.resetLightboxPdfViewer();
    document.body.style.overflow = '';
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  // --- VISUAL PROJECT MODAL (Interactive Multi-Image Gallery) ---
  openProjectModal(id) {
    const projects = PortfolioStore.getProjects();
    const proj = projects.find(p => p.id === id);
    if (!proj) return;

    const modalBody = document.getElementById('project-modal-content');
    const images = (proj.images && proj.images.length > 0) ? proj.images : [proj.image];
    let activeIndex = 0;

    const featuresHtml = (proj.features && proj.features.length > 0)
      ? `
        <h4 class="modal-features-title">
          <i data-lucide="check-circle-2" style="width: 20px; height: 20px; color: var(--accent-emerald);"></i>
          Core Architecture &amp; Key Features
        </h4>
        <ul class="modal-features-list">
          ${proj.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      `
      : '';

    modalBody.innerHTML = `
      <!-- Multi-Screenshot Gallery Header -->
      <div class="modal-gallery-wrapper">
        <div class="modal-gallery-stage">
          <img src="${images[activeIndex]}" alt="${proj.title}" class="modal-gallery-img" id="modal-active-img">
          
          <div class="gallery-counter-badge" id="modal-gallery-counter">
            <i data-lucide="image" style="width: 13px; height: 13px; vertical-align: middle; margin-right: 4px;"></i>
            Image 1 of ${images.length}
          </div>

          ${images.length > 1 ? `
            <button class="gallery-nav-btn prev" id="btn-gallery-prev" aria-label="Previous Image">
              <i data-lucide="chevron-left" style="width: 22px; height: 22px;"></i>
            </button>
            <button class="gallery-nav-btn next" id="btn-gallery-next" aria-label="Next Image">
              <i data-lucide="chevron-right" style="width: 22px; height: 22px;"></i>
            </button>
          ` : ''}
        </div>

        ${images.length > 1 ? `
          <div class="modal-thumb-strip">
            ${images.map((img, idx) => `
              <div class="modal-thumb-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
                <img src="${img}" alt="Screenshot ${idx + 1}">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Project Details Body -->
      <div class="modal-project-body">
        <div class="modal-project-tags">
          <span class="section-badge">${proj.category}</span>
          ${proj.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <h2 class="modal-project-title">${proj.title}</h2>
        <p class="modal-project-desc">${proj.description}</p>
        
        ${featuresHtml}

        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); font-size: 0.88rem;">
            <i data-lucide="layers" style="width: 18px; height: 18px; color: var(--accent-cyan);"></i>
            <span>Tech Stack: <strong>${proj.tags.join(' • ')}</strong></span>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-subtle); font-family: monospace;">Total: ${images.length} Attached Screenshots</span>
        </div>
      </div>
    `;

    // Interactive gallery navigation logic
    const updateActiveImage = (newIdx) => {
      activeIndex = (newIdx + images.length) % images.length;
      const imgEl = document.getElementById('modal-active-img');
      const counterEl = document.getElementById('modal-gallery-counter');

      if (imgEl) {
        imgEl.style.opacity = '0.3';
        setTimeout(() => {
          imgEl.src = images[activeIndex];
          imgEl.style.opacity = '1';
        }, 120);
      }

      if (counterEl) {
        counterEl.innerHTML = `
          <i data-lucide="image" style="width: 13px; height: 13px; vertical-align: middle; margin-right: 4px;"></i>
          Image ${activeIndex + 1} of ${images.length}
        `;
        if (window.lucide) lucide.createIcons();
      }

      document.querySelectorAll('.modal-thumb-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });
    };

    const prevBtn = document.getElementById('btn-gallery-prev');
    const nextBtn = document.getElementById('btn-gallery-next');
    if (prevBtn) prevBtn.addEventListener('click', () => updateActiveImage(activeIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => updateActiveImage(activeIndex + 1));

    document.querySelectorAll('.modal-thumb-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-idx'), 10);
        updateActiveImage(idx);
      });
    });

    if (window.lucide) lucide.createIcons();
    this.openModal('project-modal');
  },

  // --- PDF VIEWER CONTROLS & RENDERING (VIA MOZILLA PDF.JS CANVAS) ---
  currentPdfDoc: null,
  currentPdfPage: 1,
  currentPdfScale: 1.2,
  isRenderingPdf: false,

  initPdfViewerControls() {
    const prevBtn = document.getElementById('btn-pdf-prev');
    const nextBtn = document.getElementById('btn-pdf-next');
    const zoomInBtn = document.getElementById('btn-pdf-zoom-in');
    const zoomOutBtn = document.getElementById('btn-pdf-zoom-out');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPdfPage > 1 && !this.isRenderingPdf) {
          this.renderPdfPage(this.currentPdfPage - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentPdfDoc && this.currentPdfPage < this.currentPdfDoc.numPages && !this.isRenderingPdf) {
          this.renderPdfPage(this.currentPdfPage + 1);
        }
      });
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        if (this.currentPdfDoc && !this.isRenderingPdf && this.currentPdfScale < 3.0) {
          this.currentPdfScale += 0.25;
          this.renderPdfPage(this.currentPdfPage);
        }
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        if (this.currentPdfDoc && !this.isRenderingPdf && this.currentPdfScale > 0.6) {
          this.currentPdfScale -= 0.25;
          this.renderPdfPage(this.currentPdfPage);
        }
      });
    }
  },

  async renderPdfPage(pageNum) {
    if (!this.currentPdfDoc) return;
    this.isRenderingPdf = true;

    const canvas = document.getElementById('lightbox-pdf-canvas');
    const pageIndicator = document.getElementById('pdf-page-indicator');
    const loadingIndicator = document.getElementById('pdf-loading-indicator');
    const prevBtn = document.getElementById('btn-pdf-prev');
    const nextBtn = document.getElementById('btn-pdf-next');

    if (!canvas) {
      this.isRenderingPdf = false;
      return;
    }

    try {
      if (loadingIndicator) loadingIndicator.style.display = 'flex';
      const page = await this.currentPdfDoc.getPage(pageNum);

      // Skala responsif otomatis untuk layar ponsel vs desktop
      const isMobile = window.innerWidth < 768;
      const desiredWidth = isMobile ? (window.innerWidth * 0.82) : Math.min(880, window.innerWidth * 0.7);
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const baseScale = desiredWidth / unscaledViewport.width;
      const finalScale = baseScale * (this.currentPdfScale / 1.2);

      const viewport = page.getViewport({ scale: finalScale });
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;

      if (loadingIndicator) loadingIndicator.style.display = 'none';
      if (pageIndicator) {
        pageIndicator.textContent = `Page ${pageNum} of ${this.currentPdfDoc.numPages}`;
      }
      if (prevBtn) prevBtn.disabled = (pageNum <= 1);
      if (nextBtn) nextBtn.disabled = (pageNum >= this.currentPdfDoc.numPages);
      this.currentPdfPage = pageNum;
    } catch (err) {
      console.error('Failed to render PDF page:', err);
      if (loadingIndicator) {
        loadingIndicator.innerHTML = `<span style="color: #f87171;">Failed to load page: ${err.message}</span>`;
      }
    } finally {
      this.isRenderingPdf = false;
    }
  },

  async loadAndRenderPdf(pdfUrl, title) {
    this.resetLightboxPdfViewer();

    const loadingIndicator = document.getElementById('pdf-loading-indicator');
    const canvas = document.getElementById('lightbox-pdf-canvas');

    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
      loadingIndicator.innerHTML = '<div class="spinner"></div><span>Loading PDF Document...</span>';
    }
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    try {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin ? `${window.location.origin}/pdf.worker.js` : 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const absoluteUrl = new URL(pdfUrl, window.location.href).href;
      const response = await fetch(absoluteUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load PDF file`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      const loadingTask = window.pdfjsLib.getDocument({
        data: typedArray,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        enableXfa: true
      });

      loadingTask.onPassword = function (callback, reason) {
        if (reason === 1 /* NEED_PASSWORD */) {
          callback('');
        } else {
          const userPass = prompt('This PDF document is password-protected. Enter password:');
          callback(userPass || '');
        }
      };

      this.currentPdfDoc = await loadingTask.promise;
      this.currentPdfPage = 1;
      this.currentPdfScale = 1.2;
      await this.renderPdfPage(1);
    } catch (err) {
      console.error('Error saat membaca file PDF dengan PDF.js:', err);
      // Tampilkan notifikasi elegan tanpa tag <embed>/<object> yang memicu layar putih & download otomatis
      this.showPdfErrorMessage(pdfUrl, title, err.message);
    }
  },

  // Tampilkan pesan kesalahan yang elegan tanpa tag <embed>/<object> yang menyebabkan layar putih & download otomatis
  showPdfErrorMessage(pdfUrl, title, errorMsg) {
    const scrollWrapper = document.getElementById('lightbox-pdf-scroll');
    if (!scrollWrapper) return;

    scrollWrapper.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 420px; padding: 2.5rem 1.5rem; text-align: center; color: var(--text-muted);">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
          <i data-lucide="file-warning" style="width: 30px; height: 30px; color: #ef4444;"></i>
        </div>
        <h4 style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 0.5rem;">Direct Preview Unavailable</h4>
        <p style="font-size: 0.88rem; max-width: 440px; margin-bottom: 1.5rem; line-height: 1.5; color: var(--text-muted);">
          ${errorMsg || 'This PDF document uses specific encryption or formatting that cannot be rendered directly in the canvas viewer.'}
        </p>
        <a href="${pdfUrl}" target="_blank" rel="noopener" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1.25rem;">
          <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
          Open PDF Document in New Tab
        </a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  // Reset viewer lightbox kembali ke struktur canvas standar
  resetLightboxPdfViewer() {
    this.currentPdfDoc = null;
    const scrollWrapper = document.getElementById('lightbox-pdf-scroll');
    if (scrollWrapper) {
      scrollWrapper.innerHTML = `
        <div class="pdf-loading-state" id="pdf-loading-indicator" style="display: none;">
          <div class="spinner"></div>
          <span>Loading PDF Document...</span>
        </div>
        <canvas id="lightbox-pdf-canvas" class="lightbox-pdf-canvas"></canvas>
      `;
    }
  },

  // Render thumbnail PDF otomatis untuk kartu sertifikat di halaman depan
  async renderCardPdfThumbnail(certId, pdfUrl) {
    const canvas = document.getElementById(`cert-thumb-${certId}`);
    if (!canvas || !window.pdfjsLib) return;

    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const loadingTask = window.pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        enableXfa: true
      });

      // Tangani enkripsi izin sertifikat otomatis
      loadingTask.onPassword = function (callback, reason) {
        callback('');
      };

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const scale = 380 / unscaledViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;

      const placeholder = document.getElementById(`cert-placeholder-${certId}`);
      if (placeholder) placeholder.style.display = 'none';
      canvas.style.display = 'block';
    } catch (err) {
      console.warn('Thumbnail PDF fallback:', err);
    }
  },

  // Helper to detect if a file path or URL is a PDF
  isPdfFile(urlOrBase64) {
    if (!urlOrBase64) return false;
    const str = urlOrBase64.toLowerCase();
    return str.endsWith('.pdf') || str.includes('.pdf?') || str.startsWith('data:application/pdf');
  },

  // --- CERTIFICATE LIGHTBOX ---
  openCertLightbox(id) {
    const certs = PortfolioStore.getCertificates();
    const cert = certs.find(c => c.id === id);
    if (!cert) return;

    const img = document.getElementById('lightbox-img');
    const pdfContainer = document.getElementById('lightbox-pdf-container');
    const pdfTitle = document.getElementById('lightbox-pdf-title');
    const pdfOpenBtn = document.getElementById('lightbox-pdf-open-btn');
    const caption = document.getElementById('lightbox-caption');

    const isPdf = this.isPdfFile(cert.image);

    if (isPdf) {
      if (img) img.style.display = 'none';
      if (pdfContainer) pdfContainer.style.display = 'flex';
      if (pdfTitle) pdfTitle.textContent = cert.title;
      if (pdfOpenBtn) {
        pdfOpenBtn.href = cert.image;
        pdfOpenBtn.target = '_blank';
        pdfOpenBtn.removeAttribute('download');
      }
      this.loadAndRenderPdf(cert.image, cert.title);
    } else {
      if (pdfContainer) pdfContainer.style.display = 'none';
      this.currentPdfDoc = null;
      if (img) {
        img.style.display = 'block';
        img.src = cert.image;
      }
    }

    if (caption) {
      caption.innerHTML = `
        <div style="font-size: 1.15rem; font-weight: 700;">${cert.title}</div>
        <div style="color: var(--accent-cyan); font-size: 0.9rem; margin-top: 0.25rem;">${cert.issuer} • ${cert.issueDate || ''}</div>
      `;
    }

    if (window.lucide) lucide.createIcons();
    this.openModal('cert-lightbox-modal');
  },

  // --- 5. MANAGEMENT & FORM HANDLERS (Multi-Image Manager & Certificate Upload) ---
  initAdminForm() {
    // Tab buttons in admin modal
    const tabs = document.querySelectorAll('.admin-tab-btn');
    const sections = {
      'tab-projects': document.getElementById('admin-section-project'),
      'tab-certs': document.getElementById('admin-section-cert'),
      'tab-backup': document.getElementById('admin-section-backup')
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');

        Object.keys(sections).forEach(key => {
          if (sections[key]) {
            sections[key].style.display = (key === target) ? 'block' : 'none';
          }
        });
      });
    });

    // --- PROJECT MULTI-IMAGE UPLOADER (Tersimpan Otomatis ke assets/projects) ---
    const projDropzone = document.getElementById('proj-upload-trigger');
    const projFileInput = document.getElementById('proj-file-input');
    const projUrlInput = document.getElementById('proj-image-url-input');
    const projAddUrlBtn = document.getElementById('btn-add-proj-url');

    if (projDropzone && projFileInput) {
      projDropzone.addEventListener('click', () => projFileInput.click());
    }

    if (projFileInput) {
      projFileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          this.showToast(`Uploading ${files.length} screenshots to assets directory...`, 'info');
          
          for (const file of files) {
            const reader = new FileReader();
            const dataUrl = await new Promise(resolve => {
              reader.onload = evt => resolve(evt.target.result);
              reader.readAsDataURL(file);
            });

            // Kirim ke server agar file fisik tersimpan otomatis di assets/projects/
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'projects', filename: file.name, base64: dataUrl })
              });
              const json = await res.json();
              if (json.success && json.url) {
                this.uploadedProjectImages.push(json.url);
              } else {
                this.uploadedProjectImages.push(dataUrl);
              }
            } catch (err) {
              // Fallback aman jika berjalan statis tanpa server Node
              this.uploadedProjectImages.push(dataUrl);
            }
          }
          
          this.renderProjectImagesPreview();
          this.showToast(`${files.length} screenshots saved to assets/projects/ successfully!`, 'success');
          projFileInput.value = '';
        }
      });
    }

    if (projAddUrlBtn && projUrlInput) {
      projAddUrlBtn.addEventListener('click', () => {
        const url = projUrlInput.value.trim();
        if (url) {
          this.uploadedProjectImages.push(url);
          projUrlInput.value = '';
          this.renderProjectImagesPreview();
        }
      });

      projUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          projAddUrlBtn.click();
        }
      });
    }

    // --- CERTIFICATE UPLOADER (Tersimpan Otomatis ke assets/certificates) ---
    const certDropzone = document.getElementById('cert-upload-trigger');
    const certFileInput = document.getElementById('cert-file-input');
    const certUrlInput = document.getElementById('cert-image-url');
    const certRemoveBtn = document.getElementById('btn-remove-cert-img');

    if (certDropzone && certFileInput) {
      certDropzone.addEventListener('click', () => certFileInput.click());
    }

    if (certFileInput) {
      certFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
          this.showToast(isPdf ? 'Saving PDF certificate to assets directory...' : 'Saving certificate image to assets directory...', 'info');
          const reader = new FileReader();
          const dataUrl = await new Promise(resolve => {
            reader.onload = evt => resolve(evt.target.result);
            reader.readAsDataURL(file);
          });

          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'certificates', filename: file.name, base64: dataUrl })
            });
            const json = await res.json();
            if (json.success && json.url) {
              this.uploadedCertImage = json.url;
              this.showToast(isPdf ? 'PDF document saved to assets/certificates/!' : 'Certificate saved to assets/certificates/!', 'success');
            } else {
              this.uploadedCertImage = dataUrl;
            }
          } catch (err) {
            this.uploadedCertImage = dataUrl;
          }

          this.renderCertImagePreview();
        }
      });
    }

    if (certUrlInput) {
      certUrlInput.addEventListener('input', () => {
        const url = certUrlInput.value.trim();
        if (url.length > 8) {
          this.uploadedCertImage = url;
          this.renderCertImagePreview();
        }
      });
    }

    if (certRemoveBtn) {
      certRemoveBtn.addEventListener('click', () => {
        this.uploadedCertImage = '';
        this.renderCertImagePreview();
      });
    }

    // --- SAVE PROJECT FORM ---
    const projectForm = document.getElementById('form-project');
    if (projectForm) {
      projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('proj-id').value;
        const title = document.getElementById('proj-title').value.trim();
        const category = document.getElementById('proj-category').value;
        const description = document.getElementById('proj-desc').value.trim();
        const tags = document.getElementById('proj-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        const features = document.getElementById('proj-features').value.split('\n').map(f => f.trim()).filter(Boolean);

        if (!title) {
          alert('Project title is required.');
          return;
        }

        const images = this.uploadedProjectImages.length > 0 
          ? this.uploadedProjectImages 
          : ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'];

        PortfolioStore.saveProject({
          ...(id ? { id } : {}),
          title,
          category,
          description,
          tags: tags.length ? tags : ['Web Development'],
          features: features.length ? features : ['Interactive, high-performance responsive interface'],
          images,
          image: images[0]
        });

        projectForm.reset();
        this.uploadedProjectImages = [];
        this.renderProjectImagesPreview();
        document.getElementById('proj-id').value = '';
        this.renderProjects();
        this.closeAllModals();
        this.showToast('Project and gallery saved successfully!', 'success');
      });
    }

    // --- SAVE CERTIFICATE FORM ---
    const certForm = document.getElementById('form-cert');
    if (certForm) {
      certForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('cert-id').value;
        const title = document.getElementById('cert-title').value.trim();
        const issuer = document.getElementById('cert-issuer').value.trim();
        const issueDate = document.getElementById('cert-date').value.trim();
        const credentialId = document.getElementById('cert-credential-id').value.trim();
        const image = this.uploadedCertImage || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80';

        if (!title || !issuer) {
          alert('Certificate title and issuing organization are required.');
          return;
        }

        PortfolioStore.saveCertificate({
          ...(id ? { id } : {}),
          title,
          issuer,
          issueDate: issueDate || '2025',
          credentialId: credentialId || 'ID-' + Math.floor(100000 + Math.random() * 900000),
          image
        });

        certForm.reset();
        this.uploadedCertImage = '';
        this.renderCertImagePreview();
        document.getElementById('cert-id').value = '';
        this.renderCertificates();
        this.closeAllModals();
        this.showToast('Certificate saved successfully!', 'success');
      });
    }

    // Admin Mode Toggle (shows/hides edit and delete action buttons directly on cards)
    const adminToggleBtn = document.getElementById('btn-toggle-admin-mode');
    if (adminToggleBtn) {
      adminToggleBtn.addEventListener('click', () => {
        this.isAdminMode = !this.isAdminMode;
        document.body.classList.toggle('admin-mode', this.isAdminMode);
        adminToggleBtn.innerHTML = this.isAdminMode
          ? `<i data-lucide="check" style="width: 16px; height: 16px;"></i> Done Managing`
          : `<i data-lucide="sliders" style="width: 16px; height: 16px;"></i> Quick Edit Mode`;
        if (window.lucide) lucide.createIcons();
        this.showToast(this.isAdminMode ? 'Card edit mode enabled' : 'Card edit mode disabled', 'info');
      });
    }
  },

  // Helper render project screenshots preview grid in form
  renderProjectImagesPreview() {
    const container = document.getElementById('proj-preview-container');
    const countEl = document.getElementById('proj-image-count');
    const grid = document.getElementById('proj-preview-grid');
    if (!container || !grid) return;

    if (this.uploadedProjectImages.length === 0) {
      container.style.display = 'none';
      grid.innerHTML = '';
      return;
    }

    container.style.display = 'flex';
    if (countEl) {
      countEl.textContent = `${this.uploadedProjectImages.length} Screenshots Attached`;
    }

    grid.innerHTML = this.uploadedProjectImages.map((img, idx) => `
      <div class="screenshot-thumb-card">
        <img src="${img}" alt="Screenshot ${idx + 1}" class="screenshot-thumb-img">
        ${idx === 0 ? '<span class="thumb-main-badge">Primary</span>' : ''}
        <button type="button" class="btn-delete-thumb" data-idx="${idx}" title="Remove this screenshot">
          <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
        </button>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-delete-thumb').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.uploadedProjectImages.splice(idx, 1);
        this.renderProjectImagesPreview();
      });
    });

    if (window.lucide) lucide.createIcons();
  },

  // Helper render single certificate preview in form
  renderCertImagePreview() {
    const container = document.getElementById('cert-preview-container');
    const imgEl = document.getElementById('cert-file-preview');
    const pdfBox = document.getElementById('cert-preview-pdf-box');
    const nameEl = document.getElementById('cert-preview-name');
    const certUrlInput = document.getElementById('cert-image-url');

    if (!container) return;

    if (!this.uploadedCertImage) {
      container.style.display = 'none';
      if (imgEl) imgEl.src = '';
      if (certUrlInput) certUrlInput.value = '';
      return;
    }

    const isPdf = this.isPdfFile(this.uploadedCertImage);

    if (isPdf) {
      if (imgEl) imgEl.style.display = 'none';
      if (pdfBox) pdfBox.style.display = 'flex';
      if (nameEl) nameEl.innerHTML = '📄 Selected PDF Certificate Document';
    } else {
      if (pdfBox) pdfBox.style.display = 'none';
      if (imgEl) {
        imgEl.style.display = 'block';
        imgEl.src = this.uploadedCertImage;
      }
      if (nameEl) nameEl.textContent = 'Selected Certificate Image';
    }

    container.style.display = 'flex';
    if (certUrlInput && this.uploadedCertImage.startsWith('http')) {
      certUrlInput.value = this.uploadedCertImage;
    }
    if (window.lucide) lucide.createIcons();
  },

  // Open Edit Project Modal
  openEditProjectModal(id) {
    const projects = PortfolioStore.getProjects();
    const proj = projects.find(p => p.id === id);
    if (!proj) return;

    // Switch to project tab
    document.querySelector('[data-tab="tab-projects"]').click();
    document.getElementById('proj-id').value = proj.id;
    document.getElementById('proj-title').value = proj.title;
    document.getElementById('proj-category').value = proj.category;
    document.getElementById('proj-desc').value = proj.description;
    document.getElementById('proj-tags').value = proj.tags.join(', ');
    document.getElementById('proj-features').value = (proj.features || []).join('\n');

    // Load multiple images
    this.uploadedProjectImages = (proj.images && proj.images.length > 0) 
      ? [...proj.images] 
      : [proj.image];
    this.renderProjectImagesPreview();

    document.getElementById('btn-submit-project').textContent = 'Update Project';
    this.openModal('admin-modal');
  },

  // Open Edit Certificate Modal
  openEditCertModal(id) {
    const certs = PortfolioStore.getCertificates();
    const cert = certs.find(c => c.id === id);
    if (!cert) return;

    document.querySelector('[data-tab="tab-certs"]').click();
    document.getElementById('cert-id').value = cert.id;
    document.getElementById('cert-title').value = cert.title;
    document.getElementById('cert-issuer').value = cert.issuer;
    document.getElementById('cert-date').value = cert.issueDate || '';
    document.getElementById('cert-credential-id').value = cert.credentialId || '';

    this.uploadedCertImage = cert.image;
    this.renderCertImagePreview();

    document.getElementById('btn-submit-cert').textContent = 'Update Certificate';
    this.openModal('admin-modal');
  },

  // --- 6. BACKUP & RESTORE ---
  initBackupHandlers() {
    const exportBtn = document.getElementById('btn-export-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        PortfolioStore.exportAllData();
        this.showToast('Portfolio data exported to JSON successfully!', 'success');
      });
    }

    const importInput = document.getElementById('import-json-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const success = PortfolioStore.importData(event.target.result);
            if (success) {
              this.renderProjects();
              this.renderCertificates();
              this.showToast('Data restored from JSON successfully!', 'success');
              this.closeAllModals();
            } else {
              alert('Invalid JSON file format.');
            }
          };
          reader.readAsText(file);
        }
      });
    }

    const resetBtn = document.getElementById('btn-reset-defaults');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data back to default seeds?')) {
          PortfolioStore.resetToDefaults();
          this.renderProjects();
          this.renderCertificates();
          this.showToast('Data restored to default seeds.', 'info');
          this.closeAllModals();
        }
      });
    }
  },

  // Toast System
  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'info';
    let iconColor = 'var(--accent-cyan)';
    if (type === 'success') {
      icon = 'check-circle-2';
      iconColor = 'var(--accent-emerald)';
    } else if (type === 'warn') {
      icon = 'alert-triangle';
      iconColor = 'var(--accent-amber)';
    }

    toast.innerHTML = `
      <i data-lucide="${icon}" style="width: 18px; height: 18px; color: ${iconColor};"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

window.PortfolioUI = UI;
