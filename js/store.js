/* ==========================================================================
   PORTFOLIO DATA STORE - STORE.JS
   Local Storage Management, CRUD Operations, JSON Export & Import
   Supports Multiple Screenshots per Project
   ========================================================================== */

const STORAGE_KEYS = {
  PROJECTS: 'porto_user_projects_v2', // Updated key for multi-image support
  CERTIFICATES: 'porto_user_certificates',
  PROFILE: 'porto_user_profile'
};

// Default high-quality visual sample projects with multiple screenshots
const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Nexus AI - Creative Workspace Dashboard',
    category: 'Web App',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['React', 'TypeScript', 'Tailwind', 'Node.js', 'PostgreSQL'],
    description: 'Platform dashboard all-in-one untuk manajemen alur kerja kreatif berbasis AI dengan analitik real-time, visualisasi data interaktif, dan kolaborasi tim terintegrasi.',
    features: [
      'Dashboard analitik performa dengan chart interaktif',
      'Manajemen kanban board dengan drag-and-drop',
      'Sistem autentikasi multi-tenant dengan role-based permission',
      'Mode gelap/terang otomatis yang responsif'
    ],
    createdAt: '2025-08-15'
  },
  {
    id: 'proj-2',
    title: 'PulseFit - Mobile Fitness & Health Tracker',
    category: 'Mobile App',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510519138195-068d828884bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['Flutter', 'Dart', 'Firebase', 'State Management'],
    description: 'Aplikasi mobile pelacak kebugaran dengan deteksi gerakan olahraga harian, pemantau asupan nutrisi, dan integrasi smartwatch dengan antarmuka yang sangat elegan.',
    features: [
      'Sinkronisasi data aktivitas harian dan kalori',
      'Grafik progres mingguan dan bulanan yang mendetail',
      'Reminder hidrasi dan latihan cerdas',
      'UI/UX clean dengan animasi mikro yang mulus'
    ],
    createdAt: '2025-06-20'
  },
  {
    id: 'proj-3',
    title: 'Aurora Design System & UI Kit',
    category: 'UI/UX',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['Figma', 'UI/UX', 'Design Token', 'Prototyping'],
    description: 'Sistem desain modular komprehensif yang dirancang untuk skala enterprise, mencakup lebih dari 120 komponen reusable, guidelines aksesibilitas, dan atomic tokens.',
    features: [
      'Desain token komprehensif (warna, tipografi, grid, spacing)',
      '120+ varian komponen interaktif untuk mobile dan web',
      'Dokumentasi pedoman aksesibilitas standar WCAG 2.1',
      'Prototipe interaktif fidelitas tinggi (high-fidelity)'
    ],
    createdAt: '2025-03-10'
  },
  {
    id: 'proj-4',
    title: 'Kryptos - DeFi Asset Management Interface',
    category: 'Web App',
    image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['Vue.js', 'Ethers.js', 'Chart.js', 'SCSS'],
    description: 'Antarmuka manajemen aset kripto dan portofolio desentralisasi dengan pembaruan harga live via WebSocket dan ringkasan riwayat transaksi.',
    features: [
      'Live streaming harga token menggunakan WebSocket API',
      'Perhitungan laba/rugi (P&L) portofolio otomatis',
      'Sistem peringatan lonjakan volatilitas harga kustom',
      'Tampilan tabel transaksi yang dapat difilter & disortir'
    ],
    createdAt: '2024-11-05'
  }
];

// Default sample certificates
const DEFAULT_CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'Meta Front-End Developer Specialization',
    issuer: 'Meta / Coursera',
    issueDate: 'Juli 2025',
    credentialId: 'META-FE-984210',
    image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cert-2',
    title: 'Google Professional Cloud Architect',
    issuer: 'Google Cloud',
    issueDate: 'April 2025',
    credentialId: 'GCP-PCA-415822',
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cert-3',
    title: 'Belajar Fundamental Aplikasi Web Modern',
    issuer: 'Dicoding Indonesia',
    issueDate: 'Januari 2025',
    credentialId: 'DCD-WEB-773419',
    image: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1200&q=80'
  }
];

const Store = {
  // --- PROJECTS ---
  getProjects() {
    let projects = DEFAULT_PROJECTS;
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      try {
        projects = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse projects from storage', e);
        projects = DEFAULT_PROJECTS;
      }
    } else {
      this.setProjects(DEFAULT_PROJECTS);
    }

    // Ensure all projects have normalized images array
    return projects.map(p => {
      let images = p.images && Array.isArray(p.images) && p.images.length > 0 
        ? p.images 
        : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80']);
      return {
        ...p,
        images,
        image: images[0]
      };
    });
  },

  setProjects(projects) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  saveProject(projectData) {
    const projects = this.getProjects();
    // Ensure images array is set
    const images = projectData.images && projectData.images.length > 0 
      ? projectData.images 
      : (projectData.image ? [projectData.image] : ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80']);
    
    const normalizedData = {
      ...projectData,
      images,
      image: images[0]
    };

    if (projectData.id) {
      // Update
      const index = projects.findIndex(p => p.id === projectData.id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...normalizedData };
      } else {
        projects.unshift(normalizedData);
      }
    } else {
      // Create new
      const newProject = {
        ...normalizedData,
        id: 'proj-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      projects.unshift(newProject);
    }
    this.setProjects(projects);
    this.syncWithServer();
    return projects;
  },

  deleteProject(id) {
    let projects = this.getProjects();
    projects = projects.filter(p => p.id !== id);
    this.setProjects(projects);
    this.syncWithServer();
    return projects;
  },

  // --- CERTIFICATES ---
  getCertificates() {
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (!raw) {
      this.setCertificates(DEFAULT_CERTIFICATES);
      return DEFAULT_CERTIFICATES;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse certificates from storage', e);
      return DEFAULT_CERTIFICATES;
    }
  },

  setCertificates(certs) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  },

  saveCertificate(certData) {
    const certs = this.getCertificates();
    if (certData.id) {
      const index = certs.findIndex(c => c.id === certData.id);
      if (index !== -1) {
        certs[index] = { ...certs[index], ...certData };
      } else {
        certs.unshift(certData);
      }
    } else {
      const newCert = {
        ...certData,
        id: 'cert-' + Date.now()
      };
      certs.unshift(newCert);
    }
    this.setCertificates(certs);
    this.syncWithServer();
    return certs;
  },

  deleteCertificate(id) {
    let certs = this.getCertificates();
    certs = certs.filter(c => c.id !== id);
    this.setCertificates(certs);
    this.syncWithServer();
    return certs;
  },

  // --- SINKRONISASI SERVER LOKAL & DISK ---
  async syncWithServer() {
    try {
      await fetch('/api/save-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: this.getProjects(),
          certificates: this.getCertificates()
        })
      });
    } catch (err) {
      // Abaikan jika server Node backend tidak aktif (fallback ke static)
    }
  },

  async loadFromServer() {
    try {
      let res = await fetch('/api/portfolio');
      if (!res.ok) {
        // Fallback untuk hosting statis seperti GitHub Pages
        res = await fetch('data/portfolio.json');
      }
      if (res.ok) {
        const data = await res.json();
        if (data.projects && Array.isArray(data.projects)) {
          this.setProjects(data.projects);
        }
        if (data.certificates && Array.isArray(data.certificates)) {
          this.setCertificates(data.certificates);
        }
        return true;
      }
    } catch (err) {
      try {
        const staticRes = await fetch('data/portfolio.json');
        if (staticRes.ok) {
          const data = await staticRes.json();
          if (data.projects && Array.isArray(data.projects)) this.setProjects(data.projects);
          if (data.certificates && Array.isArray(data.certificates)) this.setCertificates(data.certificates);
          return true;
        }
      } catch (e) {
        // Fallback ke localStorage
      }
    }
    return false;
  },

  // --- EXPORT & IMPORT ---
  exportAllData() {
    const exportData = {
      projects: this.getProjects(),
      certificates: this.getCertificates(),
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData(jsonContent) {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.projects && Array.isArray(parsed.projects)) {
        this.setProjects(parsed.projects);
      }
      if (parsed.certificates && Array.isArray(parsed.certificates)) {
        this.setCertificates(parsed.certificates);
      }
      return true;
    } catch (err) {
      console.error('Import parse error:', err);
      return false;
    }
  },

  resetToDefaults() {
    this.setProjects(DEFAULT_PROJECTS);
    this.setCertificates(DEFAULT_CERTIFICATES);
  }
};

window.PortfolioStore = Store;
