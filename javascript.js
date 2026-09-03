/* ================================
   Firebase Authentication
   ================================ */
let currentUser = null;

// Función para mostrar/ocultar pantallas
function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('main-app').style.display = 'none';
}

function showMainApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
}

// Función para manejar el login
async function handleLogin(email, password) {
  const loginBtn = document.getElementById('btn-login');
  const errorDiv = document.getElementById('login-error');
  
  try {
    // Mostrar estado de carga
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    errorDiv.style.display = 'none';
    
    // Intentar autenticación
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;
    
    // Mostrar aplicación principal
    showMainApp();
    // Actualizar nombre del usuario
    await loadProfessionalInfo();
    
  } catch (error) {
    // Mostrar error
    let errorMessage = 'Error al iniciar sesión';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Correo electrónico inválido';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Error de conexión. Verifica tu internet';
        break;
      default:
        errorMessage = error.message;
    }
    
    errorDiv.textContent = errorMessage;
    errorDiv.style.display = 'block';
    
  } finally {
    // Restaurar botón
    loginBtn.classList.remove('loading');
    loginBtn.disabled = false;
  }
}

// Función para cerrar sesión
async function handleLogout() {
  try {
    await signOut(auth);
    currentUser = null;
    showLoginScreen();
    // Limpiar formulario
    document.getElementById('login-form').reset();
    document.getElementById('login-error').style.display = 'none';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}

// Función para inicializar la autenticación
function initAuth() {
  // Escuchar cambios en el estado de autenticación
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Usuario autenticado
      currentUser = user;
      showMainApp();
      
      // Inicializar la aplicación si no está ya inicializada
      if (!window.appInitialized) {
        await initializeApp();
        window.appInitialized = true;
      } else {
        await loadProfessionalInfo();
      }
    } else {
      // Usuario no autenticado
      currentUser = null;
      showLoginScreen();
      window.appInitialized = false;
    }
  });
  
  // Event listeners para el formulario de login
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await handleLogin(email, password);
  });
  
  // Event listener para el botón de modo demo
  document.getElementById('btn-demo').addEventListener('click', async () => {
    await startDemoMode();
  });
  
  // Event listener para cerrar sesión
  document.getElementById('btn-logout').addEventListener('click', handleLogout);
}

// ================================
// Modo Demo
// ================================

let isDemoMode = false;

async function startDemoMode() {
  try {
    isDemoMode = true;
    
    // Inicializar la base de datos directamente para modo demo
    console.log('Inicializando base de datos para modo demo...');
    await openDB();
    
    // Limpiar cache y datos existentes
    await clearDemoCache();
    
    // Resetear estado de la aplicación
    resetApplicationState();
    
    // Cargar datos de demo
    await loadDemoData();
    
    // Simular usuario demo
    currentUser = {
      email: 'demo@zenithsoft.com',
      displayName: 'Usuario Demo'
    };
    
    // Mostrar aplicación principal
    showMainApp();
    
    // Cargar información del profesional demo
    await loadDemoProfessionalInfo();
    
    // Inicializar la aplicación
    if (!window.appInitialized) {
      await initializeApp();
      window.appInitialized = true;
    }
    
    // Mostrar notificación de modo demo
    showDemoNotification();
    
  } catch (error) {
    console.error('Error al iniciar modo demo:', error);
    alert('Error al iniciar el modo demo. Intenta recargar la página.');
  }
}

// Función auxiliar para esperar a que la base de datos esté disponible
async function waitForDatabase() {
  return new Promise((resolve) => {
    const checkDatabase = () => {
      if (db) {
        console.log('Base de datos disponible');
        resolve();
      } else {
        console.log('Esperando base de datos...');
        setTimeout(checkDatabase, 100);
      }
    };
    checkDatabase();
  });
}

async function clearDemoCache() {
  try {
    console.log('🧹 Iniciando limpieza completa de datos locales...');
    
    // Limpiar IndexedDB completamente
    if (db) {
      console.log('🗄️ Limpiando IndexedDB...');
      const stores = ['patients', 'practices', 'histories', 'images', 'odontograms', 'settings'];
      for (const storeName of stores) {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          await store.clear();
          console.log(`✅ Store ${storeName} limpiado`);
        } catch (error) {
          console.warn(`⚠️ No se pudo limpiar store ${storeName}:`, error);
        }
      }
    } else {
      console.warn('⚠️ Base de datos no disponible para limpieza');
    }
    
    // Limpiar localStorage completamente
    try {
      console.log('💾 Limpiando localStorage...');
      localStorage.clear();
      console.log('✅ localStorage limpiado');
    } catch (error) {
      console.warn('⚠️ Error al limpiar localStorage:', error);
    }
    
    // Limpiar sessionStorage completamente
    try {
      console.log('🔄 Limpiando sessionStorage...');
      sessionStorage.clear();
      console.log('✅ sessionStorage limpiado');
    } catch (error) {
      console.warn('⚠️ Error al limpiar sessionStorage:', error);
    }
    
    // Limpiar cookies relacionadas con la aplicación
    try {
      console.log('🍪 Limpiando cookies de la aplicación...');
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        // Limpiar cookies que puedan estar relacionadas con la aplicación
        if (name.includes('zenith') || name.includes('odonto') || name.includes('demo')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      }
      console.log('✅ Cookies limpiadas');
    } catch (error) {
      console.warn('⚠️ Error al limpiar cookies:', error);
    }
    
    // Limpiar cache del navegador si está disponible
    try {
      if ('caches' in window) {
        console.log('🗂️ Limpiando cache del navegador...');
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('zenith') || cacheName.includes('odonto') || cacheName.includes('demo')) {
            await caches.delete(cacheName);
            console.log(`✅ Cache ${cacheName} eliminado`);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error al limpiar cache del navegador:', error);
    }
    
    // Limpiar variables globales de la aplicación
    try {
      console.log('🌐 Limpiando variables globales...');
      if (window.currentPatient) window.currentPatient = null;
      if (window.currentUser) window.currentUser = null;
      if (window.appInitialized) window.appInitialized = false;
      console.log('✅ Variables globales limpiadas');
    } catch (error) {
      console.warn('⚠️ Error al limpiar variables globales:', error);
    }
    
    console.log('🎉 Limpieza completa de datos locales finalizada');
  } catch (error) {
    console.error('❌ Error durante la limpieza de cache:', error);
  }
}

// Función adicional para limpiar el estado de la aplicación
function resetApplicationState() {
  try {
    console.log('🔄 Reseteando estado de la aplicación...');
    
    // Limpiar variables globales
    currentPatient = null;
    currentUser = null;
    window.appInitialized = false;
    
    // Limpiar elementos del DOM que puedan tener estado
    const searchInput = document.getElementById('search-patient');
    if (searchInput) searchInput.value = '';
    
    const ageFilter = document.getElementById('filter-age');
    if (ageFilter) ageFilter.value = '';
    
    const professionalName = document.getElementById('professional-name');
    if (professionalName) professionalName.value = '';
    
    const professionalSpecialty = document.getElementById('professional-specialty');
    if (professionalSpecialty) professionalSpecialty.value = '';
    
    // Limpiar tablas
    const patientsTbody = document.getElementById('patients-tbody');
    if (patientsTbody) patientsTbody.innerHTML = '';
    
    const practicesTbody = document.getElementById('practices-tbody');
    if (practicesTbody) practicesTbody.innerHTML = '';
    
    // Limpiar formularios
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (form.id !== 'login-form') { // No limpiar el formulario de login
        form.reset();
      }
    });
    
    console.log('✅ Estado de la aplicación reseteado');
  } catch (error) {
    console.warn('⚠️ Error al resetear estado de la aplicación:', error);
  }
}

async function loadDemoData() {
  try {
    console.log('Cargando datos de demo...');
    
    // Verificar que la base de datos esté disponible
    if (!db) {
      throw new Error('Base de datos no disponible');
    }
    
    // Datos de pacientes demo
    const demoPatients = [
      {
        id: 'demo-patient-1',
        nombre: 'Juan',
        apellido: 'García',
        dni: '12345678',
        nacimiento: '1985-03-15',
        telefono: '3794-123456',
        email: 'juan.garcia@email.com',
        direccion: 'Av. Mitre 1234',
        derivadoPor: 'Dr. Pérez',
        observaciones: 'Paciente regular, buena higiene dental',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-patient-2',
        nombre: 'María',
        apellido: 'Rodríguez',
        dni: '87654321',
        nacimiento: '1992-07-22',
        telefono: '3794-654321',
        email: 'maria.rodriguez@email.com',
        direccion: 'San Martín 567',
        derivadoPor: 'Dr. López',
        observaciones: 'Primera consulta, necesita tratamiento de ortodoncia',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-patient-3',
        nombre: 'Carlos',
        apellido: 'López',
        dni: '11223344',
        nacimiento: '1978-11-08',
        telefono: '3794-789012',
        email: 'carlos.lopez@email.com',
        direccion: 'Belgrano 890',
        derivadoPor: 'Dr. Martínez',
        observaciones: 'Control periódico, prótesis dental',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-patient-4',
        nombre: 'Ana',
        apellido: 'Martínez',
        dni: '55667788',
        nacimiento: '1995-01-30',
        telefono: '3794-345678',
        email: 'ana.martinez@email.com',
        direccion: 'Sarmiento 234',
        derivadoPor: 'Dr. González',
        observaciones: 'Tratamiento de conducto en progreso',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-patient-5',
        nombre: 'Pedro',
        apellido: 'González',
        dni: '99887766',
        nacimiento: '1988-09-12',
        telefono: '3794-901234',
        email: 'pedro.gonzalez@email.com',
        direccion: 'Rivadavia 456',
        derivadoPor: 'Dr. Fernández',
        observaciones: 'Implante dental, seguimiento post-operatorio',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Datos de prácticas demo
    const demoPractices = [
      {
        id: 'demo-practice-1',
        nombre: 'Limpieza Dental',
        descripcion: 'Profilaxis y limpieza dental completa',
        precio: 15000,
        duracion: 45,
        categoria: 'Prevención',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-practice-2',
        nombre: 'Obturación Simple',
        descripcion: 'Restauración con resina compuesta',
        precio: 25000,
        duracion: 30,
        categoria: 'Restauración',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-practice-3',
        nombre: 'Endodoncia',
        descripcion: 'Tratamiento de conducto radicular',
        precio: 45000,
        duracion: 90,
        categoria: 'Endodoncia',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-practice-4',
        nombre: 'Exodoncia Simple',
        descripcion: 'Extracción dental simple',
        precio: 20000,
        duracion: 30,
        categoria: 'Cirugía',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-practice-5',
        nombre: 'Prótesis Parcial',
        descripcion: 'Prótesis removible parcial',
        precio: 80000,
        duracion: 120,
        categoria: 'Prótesis',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Guardar pacientes
    console.log('Guardando pacientes demo...');
    for (const patient of demoPatients) {
      await put('patients', patient);
    }
    
    // Guardar prácticas
    console.log('Guardando prácticas demo...');
    for (const practice of demoPractices) {
      await put('practices', practice);
    }
    
    console.log('Datos de demo cargados exitosamente:', { 
      pacientes: demoPatients.length, 
      practicas: demoPractices.length 
    });
    
  } catch (error) {
    console.error('Error al cargar datos de demo:', error);
    throw error; // Re-lanzar el error para que sea manejado por startDemoMode
  }
}

async function loadDemoProfessionalInfo() {
  try {
    console.log('Cargando información del profesional demo...');
    
    // Verificar que la base de datos esté disponible
    if (!db) {
      throw new Error('Base de datos no disponible');
    }
    
    // Información del profesional demo (datos del footer)
    await put('settings', {
      id: 'professional',
      name: 'ZenithSoft',
      specialty: 'Desarrollo de Software',
      updatedAt: new Date().toISOString()
    });
    
    // Actualizar nombre en el header
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
      userEmailElement.textContent = 'ZenithSoft';
    }
    
    console.log('Información del profesional demo cargada exitosamente');
  } catch (error) {
    console.error('Error al cargar información del profesional demo:', error);
    throw error; // Re-lanzar el error para que sea manejado por startDemoMode
  }
}

function showDemoNotification() {
  // Crear notificación de modo demo
  const notification = document.createElement('div');
  notification.id = 'demo-notification';
  notification.innerHTML = `
    <div class="demo-notification-content">
      <div class="demo-notification-icon">🚀</div>
      <div class="demo-notification-text">
        <strong>Modo Demo Activo</strong>
        <p>Estás probando ZenithSoft GO con datos de ejemplo. Los cambios no se guardarán permanentemente.</p>
      </div>
      <button class="demo-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Agregar estilos
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
    z-index: 1000;
    max-width: 350px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  // Agregar al DOM
  document.body.appendChild(notification);
  
  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

/* ================================
   IndexedDB Helper
   ================================ */
const DB_NAME = 'odontodb';
const DB_VERSION = 2; // Incrementado para agregar tabla settings
let db;

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      // Pacientes
      if(!db.objectStoreNames.contains('patients')){
        const s = db.createObjectStore('patients', { keyPath:'id', autoIncrement:true });
        s.createIndex('byName','apellido');
        s.createIndex('byDNI','dni',{unique:false});
      }
      // Prácticas
      if(!db.objectStoreNames.contains('practices')){
        db.createObjectStore('practices', { keyPath:'id', autoIncrement:true });
      }
      // Historia clínica
      if(!db.objectStoreNames.contains('histories')){
        const s = db.createObjectStore('histories', { keyPath:'id', autoIncrement:true });
        s.createIndex('byPatient','patientId');
        s.createIndex('byDate','fechaISO');
        s.createIndex('byPractice','practiceId');
      }
      // Imágenes (Blobs)
      if(!db.objectStoreNames.contains('images')){
        const s = db.createObjectStore('images', { keyPath:'id', autoIncrement:true });
        s.createIndex('byPatient','patientId');
      }
      // Odontograma por paciente
      if(!db.objectStoreNames.contains('odontograms')){
        db.createObjectStore('odontograms', { keyPath:'patientId' });
      }
      // Configuraciones del sistema
      if(!db.objectStoreNames.contains('settings')){
        db.createObjectStore('settings', { keyPath:'id' });
      }
    };
    req.onsuccess = ()=>{ db = req.result; resolve(db); };
    req.onerror = ()=>reject(req.error);
  });
}
function tx(store, mode='readonly'){
  return db.transaction(store, mode).objectStore(store);
}
function getAll(store){
  return new Promise((res,rej)=>{
    const r = tx(store).getAll();
    r.onsuccess = ()=>res(r.result);
    r.onerror = ()=>rej(r.error);
  });
}
function add(store, data){
  return new Promise((res,rej)=>{
    const r = tx(store,'readwrite').add(data);
    r.onsuccess = ()=>res(r.result);
    r.onerror = ()=>rej(r.error);
  });
}
function put(store, data){
  return new Promise((res,rej)=>{
    const r = tx(store,'readwrite').put(data);
    r.onsuccess = ()=>res(r.result);
    r.onerror = ()=>rej(r.error);
  });
}
function del(store, key){
  return new Promise((res,rej)=>{
    const r = tx(store,'readwrite').delete(key);
    r.onsuccess = ()=>res();
    r.onerror = ()=>rej(r.error);
  });
}
function indexGetAll(store, indexName, value){
  return new Promise((res,rej)=>{
    const idx = tx(store).index(indexName);
    const r = idx.getAll(value);
    r.onsuccess = ()=>res(r.result);
    r.onerror = ()=>rej(r.error);
  });
}
function getById(store, id){
  return new Promise((res,rej)=>{
    const r = tx(store).get(id);
    r.onsuccess = ()=>res(r.result);
    r.onerror = ()=>rej(r.error);
  });
}

/* ================================
   Configuración Regional y Utilidades (Buenos Aires, GMT-3)
   ================================ */
const TIMEZONE_BA = 'America/Argentina/Buenos_Aires';
const LOCALE_BA = 'es-AR';

// Obtiene la fecha actual en Buenos Aires en formato YYYY-MM-DD
function todayISO() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_BA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); // Formato YYYY-MM-DD
}

// Obtiene fecha y hora en Buenos Aires para inputs datetime-local (YYYY-MM-DDTHH:mm)
function nowDateTimeLocalBA(date = new Date()) {
  const dt = (typeof date === 'string' || typeof date === 'number') ? new Date(date) : date;
  if (isNaN(+dt)) return '';
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIMEZONE_BA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dt);
  return parts.replace(' ', 'T');
}

// Formatea fecha en DD/MM/AAAA según huso horario de Buenos Aires
function formatDateBA(dateOrStr) {
  if (!dateOrStr) return '—';
  if (typeof dateOrStr === 'string') {
    // Si viene DD-MM-AAAA
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateOrStr)) {
      return dateOrStr.replace(/-/g, '/');
    }
    // Si viene YYYY-MM-DD (fecha pura sin hora)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOrStr)) {
      const [y, m, d] = dateOrStr.split('-');
      return `${d}/${m}/${y}`;
    }
  }
  const dt = new Date(dateOrStr);
  if (isNaN(+dt)) return String(dateOrStr);
  return new Intl.DateTimeFormat(LOCALE_BA, {
    timeZone: TIMEZONE_BA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dt);
}

// Formatea fecha y hora DD/MM/AAAA HH:mm en Buenos Aires
function formatDateTimeBA(dateOrStr) {
  if (!dateOrStr) return '—';
  const dt = new Date(dateOrStr);
  if (isNaN(+dt)) return String(dateOrStr);
  return new Intl.DateTimeFormat(LOCALE_BA, {
    timeZone: TIMEZONE_BA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dt);
}

// Formatea mes y año (ej: "marzo de 2026") en Buenos Aires
function formatMonthYearBA(yearMonthStr) {
  if (!yearMonthStr) return '—';
  let dt;
  if (typeof yearMonthStr === 'string' && /^\d{4}-\d{2}$/.test(yearMonthStr)) {
    dt = new Date(`${yearMonthStr}-01T12:00:00-03:00`);
  } else {
    dt = new Date(yearMonthStr);
  }
  if (isNaN(+dt)) return String(yearMonthStr);
  return new Intl.DateTimeFormat(LOCALE_BA, {
    timeZone: TIMEZONE_BA,
    month: 'long',
    year: 'numeric'
  }).format(dt);
}

// Obtiene la fecha desglosada actual en Buenos Aires para cálculos de edad exactos
function getNowInBA() {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_BA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now); // Retorna "YYYY-MM-DD"
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function parseDOB(ddmmyyyy){
  if(!ddmmyyyy) return null;
  // Espera formato DD-MM-AAAA o DD/MM/AAAA
  let m = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(ddmmyyyy || '');
  if(m) {
    const [_, dd, mm, yyyy] = m;
    const dt = new Date(Number(yyyy), Number(mm)-1, Number(dd));
    return isNaN(+dt)? null : dt;
  }
  // Soporta formato YYYY-MM-DD
  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ddmmyyyy || '');
  if(m) {
    const [_, yyyy, mm, dd] = m;
    const dt = new Date(Number(yyyy), Number(mm)-1, Number(dd));
    return isNaN(+dt)? null : dt;
  }
  return null;
}

// Función para auto-formatear fecha con guiones
function autoFormatDateWithDashes(input) {
  let value = input.value.replace(/\D/g, ''); // Solo números
  
  // Agregar guiones automáticamente
  if (value.length >= 2) {
    value = value.substring(0, 2) + '-' + value.substring(2);
  }
  if (value.length >= 5) {
    value = value.substring(0, 5) + '-' + value.substring(5, 9); // Máximo 4 dígitos para año
  }
  
  input.value = value;
}

function calcAgeFromDOB(ddmmyyyy){
  const d = parseDOB(ddmmyyyy);
  if(!d) return '';
  const nowBA = getNowInBA();
  let age = nowBA.year - d.getFullYear();
  const mDiff = nowBA.month - d.getMonth();
  if (mDiff < 0 || (mDiff === 0 && nowBA.day < d.getDate())) age--;
  return String(age);
}
function formatMoney(n){
  if(n===undefined || n===null || isNaN(n)) return '—';
  return new Intl.NumberFormat(LOCALE_BA,{style:'currency', currency:'ARS', maximumFractionDigits:2}).format(n);
}
function ensure(val, fallback){ return val==null? fallback : val; }

/* ================================
   Estado global UI
   ================================ */
let currentPatient = null;              // objeto paciente actual
let currentTooth = null;                // id de pieza actual (ej. "11")
let editingPractice = null;             // práctica en edición

/* ================================
   Inicialización
   ================================ */
document.addEventListener('DOMContentLoaded', ()=>{
  // Inicializar autenticación
  initAuth();
});

// Función para inicializar la aplicación principal
async function initializeApp() {
  await openDB();
  await seedPracticesIfEmpty();
  await loadProfessionalInfo();
  bindNav();
  bindPatients();
  bindPractices();
  bindDetail();
  bindStats();
  bindBackupRestore();
  bindPrint();
  // bindHeaderScroll(); // Comentado - header siempre visible según CSS
  await refreshPracticesUI();
  await refreshPatientsUI();
  await refreshStats();
  
  // Event listeners para configuración del profesional
  document.getElementById('btn-save-professional').addEventListener('click', saveProfessionalInfo);
  document.getElementById('btn-clear-professional').addEventListener('click', clearProfessionalInfo);
  
  // Event listeners para pestañas de configuración
  bindConfigTabs();
}

/* ================================
   Pestañas de Configuración
   ================================ */
function bindConfigTabs() {
  const configTabBtns = document.querySelectorAll('.config-tab-btn');
  const configTabPanels = document.querySelectorAll('.config-tab-panel');
  
  // Función para mostrar solo el panel activo
  function showOnlyActivePanel() {
    configTabPanels.forEach(panel => {
      if (panel.classList.contains('active')) {
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.style.opacity = '1';
      } else {
        panel.style.display = 'none';
        panel.style.visibility = 'hidden';
        panel.style.opacity = '0';
      }
    });
  }
  
  // Inicializar mostrando solo el panel activo
  showOnlyActivePanel();
  
  configTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.configTab;
      
      // Remover clase active de todos los botones y paneles
      configTabBtns.forEach(b => b.classList.remove('active'));
      configTabPanels.forEach(p => p.classList.remove('active'));
      
      // Agregar clase active al botón clickeado
      btn.classList.add('active');
      
      // Mostrar el panel correspondiente
      const targetPanel = document.getElementById(`config-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
      
      // Forzar la actualización de la visibilidad
      showOnlyActivePanel();
    });
  });
}

/* ================================
   Semillas (prácticas)
   ================================ */
async function seedPracticesIfEmpty(){
  const list = await getAll('practices');
  if(list.length>0) return;
  const seeds = [
    {name:'Consulta inicial', cost:0, category:'General'},
    {name:'Limpieza (profilaxis)', cost:15000, category:'Profilaxis'},
    {name:'Radiografía periapical', cost:6000, category:'Imagen'},
    {name:'Obturación (amalgama)', cost:20000, category:'Restauración'},
    {name:'Obturación (composite)', cost:24000, category:'Restauración'},
    {name:'Endodoncia unirradicular', cost:60000, category:'Endodoncia'},
    {name:'Endodoncia multirradicular', cost:90000, category:'Endodoncia'},
    {name:'Extracción simple', cost:30000, category:'Cirugía'},
    {name:'Extracción compleja', cost:50000, category:'Cirugía'},
    {name:'Corona metal-porcelana', cost:180000, category:'Prótesis'}
  ];
  for(const s of seeds) await add('practices', {...s, description:''});
}

/* ================================
   Navegación
   ================================ */
function bindNav(){
  const tabs = document.querySelectorAll('.tab-btn[data-tab]');
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabs.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      showTab(tab);
    });
  });
  
  bindNavCollapse();
}

function showTab(t){
  document.querySelectorAll('main > section').forEach(s=>s.style.display='none');
  const section = document.querySelector('#tab-'+t);
  if (section) {
    section.style.display = '';
  }
}

// Función simplificada para manejar tabs horizontales
function bindNavCollapse() {
  // Ya no necesitamos funciones de colapso para tabs horizontales
  // Los tabs siempre están visibles
}

/* ================================
   Pacientes
   ================================ */
function bindPatients(){
  document.getElementById('btn-new-patient').addEventListener('click', ()=>{
    const d = document.getElementById('modal-patient');
    d.showModal();
  });
  document.getElementById('m-cancel').addEventListener('click', ()=>document.getElementById('modal-patient').close());
  document.getElementById('m-save').addEventListener('click', async ()=>{
    const p = {
      nombre: document.getElementById('m-nombre').value.trim(),
      apellido: document.getElementById('m-apellido').value.trim(),
      nacimiento: document.getElementById('m-nac').value.trim(),
      dni: document.getElementById('m-dni').value.trim(),
      telefono: document.getElementById('m-tel').value.trim(),
      direccion: document.getElementById('m-dir').value.trim(),
      derivadoPor: document.getElementById('m-derivado').value.trim(),
      createdAt: new Date().toISOString()
    };
    if(!p.nombre || !p.apellido){ alert('Nombre y apellido son obligatorios.'); return; }
    await add('patients', p);
    document.getElementById('modal-patient').close();
    clearModalPatient();
    await refreshPatientsUI();
  });

  document.getElementById('search-patient').addEventListener('input', refreshPatientsUI);
  document.getElementById('filter-age').addEventListener('change', refreshPatientsUI);
  
  // Auto-formatear fecha de nacimiento con guiones en modal
  document.getElementById('m-nac').addEventListener('input', (e) => {
    autoFormatDateWithDashes(e.target);
  });
}
function clearModalPatient(){
  ['m-nombre','m-apellido','m-nac','m-dni','m-tel','m-dir','m-derivado'].forEach(id=>document.getElementById(id).value='');
}
async function refreshPatientsUI(){
  const q = (document.getElementById('search-patient').value || '').toLowerCase();
  const range = document.getElementById('filter-age').value;
  const [aMin, aMax] = range? range.split('-').map(Number) : [null, null];
  const tb = document.getElementById('patients-tbody');
  tb.innerHTML = '';
  const list = await getAll('patients');
  list.sort((a,b)=> (a.apellido||'').localeCompare(b.apellido||'') || (a.nombre||'').localeCompare(b.nombre||''));
  for(const p of list){
    const age = Number(calcAgeFromDOB(p.nacimiento)) || null;
    // Búsqueda más permisiva: incluye más campos y normaliza texto
    const normalizeText = (text) => {
      if (!text) return '';
      return String(text)
        .toLowerCase()
        .normalize('NFD') // Normalizar caracteres especiales
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^\w\s]/g, '') // Remover caracteres especiales
        .trim();
    };
    
    const searchFields = [
      p.nombre,
      p.apellido, 
      p.dni,
      p.telefono,
      p.email,
      p.direccion,
      p.derivadoPor,
      p.observaciones
    ].filter(Boolean);
    
    const normalizedQuery = normalizeText(q);
    const matchesQ = !q || searchFields.some(field => {
      const normalizedField = normalizeText(field);
      
      // Búsqueda exacta
      if (normalizedField.includes(normalizedQuery)) return true;
      
      // Búsqueda por palabras individuales
      const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
      if (queryWords.length > 1) {
        // Verificar si todas las palabras están en el campo (sin importar orden)
        const fieldWords = normalizedField.split(/\s+/).filter(word => word.length > 0);
        const allWordsFound = queryWords.every(queryWord => 
          fieldWords.some(fieldWord => fieldWord.includes(queryWord))
        );
        
        if (allWordsFound) return true;
        
        // Búsqueda especial para nombre y apellido combinados
        // Crear combinaciones posibles: "apellido nombre" y "nombre apellido"
        const combinedName = `${p.apellido || ''} ${p.nombre || ''}`.trim();
        const combinedNameReversed = `${p.nombre || ''} ${p.apellido || ''}`.trim();
        
        const normalizedCombined = normalizeText(combinedName);
        const normalizedCombinedReversed = normalizeText(combinedNameReversed);
        
        // Verificar si la búsqueda coincide con cualquiera de las combinaciones
        if (normalizedCombined.includes(normalizedQuery) || 
            normalizedCombinedReversed.includes(normalizedQuery)) {
          return true;
        }
        
        // Verificar si todas las palabras están en cualquiera de las combinaciones
        const allWordsInCombined = queryWords.every(queryWord => 
          normalizedCombined.includes(queryWord) || normalizedCombinedReversed.includes(queryWord)
        );
        
        if (allWordsInCombined) return true;
      }
      
      // Búsqueda por iniciales (para casos como "jp" encontrando "juan perez")
      if (normalizedQuery.length <= 3) {
        const fieldWords = normalizedField.split(/\s+/).filter(word => word.length > 0);
        const initials = fieldWords.map(word => word.charAt(0)).join('');
        if (initials.includes(normalizedQuery)) return true;
      }
      
      return false;
    });
    const matchesA = !aMin? true : (age!=null && age>=aMin && age<=aMax);
    if(!matchesQ || !matchesA) continue;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${(p.apellido||'')}, ${(p.nombre||'')}</td>
      <td>${p.dni||'—'}</td>
      <td>${age!=null? age : '—'}</td>
      <td>${p.telefono||'—'}</td>
      <td>${p.derivadoPor||'—'}</td>
      <td style="text-align:right">
        <button class="btn" data-action="open">Ver</button>
        <button class="btn danger" data-action="del">Eliminar</button>
      </td>`;
    tr.querySelector('[data-action="open"]').addEventListener('click', ()=>openPatientDetail(p.id));
    tr.querySelector('[data-action="del"]').addEventListener('click', async ()=>{
      if(!confirm('¿Eliminar paciente y todos sus datos?')) return;
      await deletePatientCascade(p.id);
      await refreshPatientsUI();
      if(currentPatient && currentPatient.id===p.id){
        currentPatient=null; renderDetail();
      }
    });
    tb.appendChild(tr);
  }
}
async function deletePatientCascade(id){
  // Eliminar paciente
  await del('patients', id);
  // Historia
  const hs = await indexGetAll('histories','byPatient', id);
  for(const h of hs) await del('histories', h.id);
  // Imágenes
  const imgs = await indexGetAll('images','byPatient', id);
  for(const im of imgs) await del('images', im.id);
  // Odontograma
  await del('odontograms', id);
}
async function openPatientDetail(id){
  const p = (await getAll('patients')).find(x=>x.id===id);
  currentPatient = p || null;
  renderDetail();
  // Navega a la pestaña detalle
  document.querySelector('.tab-btn[data-tab="detalle"]').click();
}

/* ================================
   Detalle paciente (datos, historia, imágenes, odontograma)
   ================================ */
function bindDetail(){
  document.getElementById('btn-add-history').addEventListener('click', async ()=>{
    if(!currentPatient){ alert('Selecciona un paciente.'); return; }
    
    const fecha = document.getElementById('h-fecha').value || todayISO();
    const practiceName = document.getElementById('h-practica').value.trim();
    const practiceId = Number(document.getElementById('h-practica').dataset.selectedId) || null;
    const valor = parseFloat(document.getElementById('h-valor').value)||0;
    const abonado = parseFloat(document.getElementById('h-abonado').value)||0;
    const odonto = document.getElementById('h-odonto').value.trim();
    const obs = document.getElementById('h-obs').value.trim();
    const proximaCita = document.getElementById('h-proxima-cita').value.trim();
    
    if(!practiceName){ alert('Debes seleccionar una práctica.'); return; }
    
    const item = {
      patientId: currentPatient.id,
      fechaISO: fecha,
      practiceId, 
      practiceName: practiceId ? undefined : practiceName,
      valor, 
      abonado,
      saldo: +(valor - abonado).toFixed(2),
      odontologo: odonto,
      proximaCita,
      obs
    };
    
    // Verificar si estamos editando
    const addBtn = document.getElementById('btn-add-history');
    const editingId = addBtn.dataset.editingId;
    
    if(editingId) {
      item.id = Number(editingId);
      await put('histories', item);
      addBtn.textContent = 'Agregar entrada';
      delete addBtn.dataset.editingId;
      alert('Entrada actualizada correctamente.');
    } else {
      await add('histories', item);
      alert('Entrada agregada correctamente.');
    }
    
    clearHistoryForm();
    await refreshHistoryUI();
    await refreshStats();
  });

  // Guardar datos paciente
  document.getElementById('btn-save-patient').addEventListener('click', async ()=>{
    if(!currentPatient) return;
    currentPatient = {
      ...currentPatient,
      nombre: document.getElementById('pd-nombre').value.trim(),
      apellido: document.getElementById('pd-apellido').value.trim(),
      nacimiento: document.getElementById('pd-nac').value.trim(),
      dni: document.getElementById('pd-dni').value.trim(),
      telefono: document.getElementById('pd-tel').value.trim(),
      direccion: document.getElementById('pd-dir').value.trim(),
      derivadoPor: document.getElementById('pd-derivado').value.trim(),
    };
    await put('patients', currentPatient);
    alert('Paciente actualizado.');
    await refreshPatientsUI();
    renderDetail();
  });
  document.getElementById('btn-delete-patient').addEventListener('click', async ()=>{
    if(!currentPatient) return;
    if(!confirm('¿Eliminar paciente y todos sus datos?')) return;
    await deletePatientCascade(currentPatient.id);
    currentPatient=null;
    renderDetail();
    await refreshPatientsUI();
  });
  // Edad auto y auto-formatear fecha con guiones
  document.getElementById('pd-nac').addEventListener('input', (e)=>{
    autoFormatDateWithDashes(e.target);
    document.getElementById('pd-edad').value = calcAgeFromDOB(document.getElementById('pd-nac').value.trim());
  });

  // Historia: saldo auto
  function updateSaldo(){
    const v = parseFloat(document.getElementById('h-valor').value)||0;
    const a = parseFloat(document.getElementById('h-abonado').value)||0;
    document.getElementById('h-saldo').value = (v-a).toFixed(2);
  }
  document.getElementById('h-valor').addEventListener('input', updateSaldo);
  document.getElementById('h-abonado').addEventListener('input', updateSaldo);

  
  function clearHistoryForm(){
  document.getElementById('h-fecha').value = '';
  document.getElementById('h-practica').value = '';
  document.getElementById('h-practica').dataset.selectedId = '';
  document.getElementById('h-valor').value = '';
  document.getElementById('h-abonado').value = '';
  document.getElementById('h-odonto').value = '';
  document.getElementById('h-obs').value = '';
  document.getElementById('h-saldo').value = '';
  
  // Resetear botón de edición si estaba activo
  const addBtn = document.getElementById('btn-add-history');
  if(addBtn.dataset.editingId) {
    addBtn.textContent = 'Agregar entrada';
    delete addBtn.dataset.editingId;
  }
}

  // Imágenes
  const imgFileInput = document.getElementById('img-file');
  const btnAddImages = document.getElementById('btn-add-images');
  
  // Función para adjuntar imágenes
  async function attachImages(files) {
    if(!currentPatient){ alert('Selecciona un paciente.'); return; }
    if(!files || !files.length) return;
    
    // Mostrar estado de carga en el botón
    const originalText = btnAddImages.innerHTML;
    btnAddImages.innerHTML = '<span class="loading-spinner"></span> Adjuntando...';
    btnAddImages.disabled = true;
    
    try {
      for(const f of files){
        const blob = new Blob([await f.arrayBuffer()], {type:f.type});
        await add('images', {
          patientId: currentPatient.id,
          type: f.type,
          name: f.name,
          createdAt: new Date().toISOString(),
          blob
        });
      }
      await refreshImagesUI();
    } catch (error) {
      alert('Error al adjuntar imágenes: ' + error.message);
    } finally {
      btnAddImages.innerHTML = originalText;
      btnAddImages.disabled = false;
    }
  }
  
  // Función para abrir el selector de archivos
  function openFileSelector() {
    if(!currentPatient){ 
      alert('Selecciona un paciente primero.'); 
      return; 
    }
    imgFileInput.click();
  }
  
  // Event listener para el botón de adjuntar - abre selector de archivos
  btnAddImages.addEventListener('click', openFileSelector);
  
  // Event listener para cuando se seleccionan archivos - adjunta automáticamente
  imgFileInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if(files && files.length > 0) {
      await attachImages(files);
      // Limpiar el input para permitir seleccionar los mismos archivos nuevamente
      imgFileInput.value = '';
    }
  });

  // Odontograma
  document.getElementById('dentition-view').addEventListener('change', renderOdontogram);
  document.getElementById('btn-clear-odont').addEventListener('click', async ()=>{
    if(!currentPatient) return;
    if(!confirm('¿Limpiar por completo el odontograma del paciente?')) return;
    await put('odontograms', {patientId: currentPatient.id, data:{}});
    await renderOdontogram();
  });
  document.getElementById('btn-save-odont').addEventListener('click', async ()=>{
    if(!currentPatient) return;
    alert('Odontograma guardado.');
  });
}

function renderDetail(){
  const noSel = document.getElementById('no-patient');
  const detail = document.getElementById('patient-detail');
  if(!currentPatient){
    noSel.style.display = '';
    detail.style.display = 'none';
    return;
  }
  noSel.style.display = 'none';
  detail.style.display = '';
  // Cargar datos a form
  document.getElementById('pd-nombre').value = currentPatient.nombre || '';
  document.getElementById('pd-apellido').value = currentPatient.apellido || '';
  document.getElementById('pd-nac').value = currentPatient.nacimiento || '';
  document.getElementById('pd-edad').value = calcAgeFromDOB(currentPatient.nacimiento || '') || '';
  document.getElementById('pd-dni').value = currentPatient.dni || '';
  document.getElementById('pd-tel').value = currentPatient.telefono || '';
  document.getElementById('pd-dir').value = currentPatient.direccion || '';
  document.getElementById('pd-derivado').value = currentPatient.derivadoPor || '';

  refreshHistoryUI();
  refreshImagesUI();
  refreshPracticesInHistorySelect();
  renderOdontogram();
}

function historyPendingBalance(entry){
  const valor = parseFloat(entry.valor) || 0;
  const abonado = parseFloat(entry.abonado) || 0;
  if (entry.saldo != null && entry.saldo !== '') {
    return Math.max(0, +(parseFloat(entry.saldo) || 0).toFixed(2));
  }
  return Math.max(0, +(valor - abonado).toFixed(2));
}

async function registerHistoryPayment(entry){
  const saldo = historyPendingBalance(entry);
  if (saldo <= 0) {
    alert('Esta entrada no tiene saldo pendiente.');
    return;
  }

  const practs = await getAll('practices');
  const pr = entry.practiceId ? practs.find(p => p.id === entry.practiceId) : null;
  const practiceLabel = pr ? pr.name : (entry.practiceName || 'Práctica');

  const montoStr = prompt(
    `Registrar pago — ${practiceLabel}\nSaldo pendiente: ${formatMoney(saldo)}\n\nMonto a abonar:`,
    saldo.toFixed(2)
  );
  if (montoStr === null) return;

  const monto = parseFloat(String(montoStr).replace(',', '.'));
  if (isNaN(monto) || monto <= 0) {
    alert('Ingresa un monto válido.');
    return;
  }
  if (monto > saldo + 0.009) {
    alert('El monto no puede ser mayor al saldo pendiente.');
    return;
  }

  const valor = parseFloat(entry.valor) || 0;
  const abonado = (parseFloat(entry.abonado) || 0) + monto;
  entry.abonado = +abonado.toFixed(2);
  entry.saldo = +(valor - entry.abonado).toFixed(2);

  await put('histories', entry);
  await refreshHistoryUI();
  await refreshStats();
  alert('Pago registrado correctamente.');
}

async function refreshHistoryUI(){
  if(!currentPatient) return;
  const practs = await getAll('practices');
  const pmap = new Map(practs.map(p=>[p.id, p]));
  const hs = await indexGetAll('histories','byPatient', currentPatient.id);
  hs.sort((a,b)=> (a.fechaISO||'').localeCompare(b.fechaISO||''));
  const tb = document.getElementById('history-tbody');
  tb.innerHTML='';
  for(const h of hs){
    const pr = h.practiceId? pmap.get(h.practiceId) : null;
    const proximaCita = h.proximaCita ? formatDateTimeBA(h.proximaCita) : '—';
    const saldoPendiente = historyPendingBalance(h);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDateBA(h.fechaISO) || '—'}</td>
      <td>${pr? pr.name : h.practiceName || '—'}</td>
      <td>${formatMoney(h.valor)}</td>
      <td>${formatMoney(h.abonado)}</td>
      <td>${formatMoney(h.saldo)}</td>
      <td>${h.odontologo||'—'}</td>
      <td>${proximaCita}</td>
      <td class="observaciones-completa">${h.obs||'—'}</td>
      <td style="text-align:right; white-space:nowrap">
        <button class="btn ok" data-action="pay" data-id="${h.id}" ${saldoPendiente <= 0 ? 'disabled' : ''}>Pago</button>
        <button class="btn edit" data-action="edit" data-id="${h.id}">Editar</button>
        <button class="btn danger" data-action="del" data-id="${h.id}">Eliminar</button>
      </td>`;
    tr.querySelector('[data-action="pay"]').addEventListener('click', ()=>registerHistoryPayment(h));
    tr.querySelector('[data-action="edit"]').addEventListener('click', ()=>editHistoryEntry(h));
    tr.querySelector('[data-action="del"]').addEventListener('click', async ()=>{
      if(!confirm('¿Eliminar entrada de historia?')) return;
      await del('histories', h.id);
      await refreshHistoryUI();
      await refreshStats();
    });
    tb.appendChild(tr);
  }
}
async function editHistoryEntry(entry) {
  // Llenar el formulario con los datos existentes
  document.getElementById('h-fecha').value = entry.fechaISO || todayISO();
  document.getElementById('h-practica').value = entry.practiceName || '';
  document.getElementById('h-practica').dataset.selectedId = entry.practiceId || '';
  document.getElementById('h-valor').value = entry.valor || '';
  document.getElementById('h-abonado').value = entry.abonado || '';
  document.getElementById('h-odonto').value = entry.odontologo || '';
  document.getElementById('h-obs').value = entry.obs || '';
  document.getElementById('h-proxima').value = entry.proximaCita || '';
  document.getElementById('h-saldo').value = entry.saldo || '';
  
  // Cambiar el botón de agregar a actualizar
  const addBtn = document.getElementById('btn-add-history');
  addBtn.textContent = 'Actualizar entrada';
  addBtn.dataset.editingId = entry.id;
  
  // Desplazar la vista al formulario
  document.getElementById('h-fecha').focus();
}

// Modificar el evento click del botón para manejar edición

async function refreshImagesUI(){
  if(!currentPatient) return;
  const cont = document.getElementById('images-thumbs');
  cont.innerHTML = '';
  const imgs = await indexGetAll('images','byPatient', currentPatient.id);
  imgs.sort((a,b)=> (a.createdAt||'').localeCompare(b.createdAt||''));
  for(const im of imgs){
    const url = URL.createObjectURL(im.blob);
    const el = document.createElement('div');
    el.className='thumb';
    el.innerHTML = `<img src="${url}" alt="${im.name||''}"><div class="x">Eliminar</div>`;
    el.addEventListener('click', (ev)=>{
      if(ev.target.classList.contains('x')) return;
      openImgViewer(im);
    });
    el.querySelector('.x').addEventListener('click', async (ev)=>{
      ev.stopPropagation();
      if(!confirm('¿Eliminar imagen?')) return;
      await del('images', im.id);
      await refreshImagesUI();
    });
    cont.appendChild(el);
  }
}
// Variables globales para el visor de imágenes
let currentImageIndex = 0;
let currentImages = [];
let currentImageUrls = [];
let imageViewerOpen = false;

async function openImgViewer(im) {
  // Prevenir múltiples visores abiertos
  if (imageViewerOpen) {
    console.log('Visor ya está abierto, cerrando el anterior...');
    cleanupImageViewer();
  }
  
  // Marcar como abierto
  imageViewerOpen = true;
  
  // Obtener todas las imágenes del paciente
  const allImages = await indexGetAll('images', 'byPatient', currentPatient.id);
  allImages.sort((a,b) => (a.createdAt||'').localeCompare(b.createdAt||''));
  
  // Encontrar el índice de la imagen actual
  currentImageIndex = allImages.findIndex(img => img.id === im.id);
  currentImages = allImages;
  
  // Limpiar URLs anteriores
  currentImageUrls.forEach(url => URL.revokeObjectURL(url));
  currentImageUrls = [];
  
  // Crear URLs para todas las imágenes
  currentImages.forEach(img => {
    currentImageUrls.push(URL.createObjectURL(img.blob));
  });
  
  // Mostrar la imagen actual
  await showCurrentImage();
  
  // Mostrar el modal
  const d = document.getElementById('modal-img');
  d.showModal();
  
  // Configurar eventos
  setupImageViewerEvents();
}

// Función para limpiar el visor de imágenes
function cleanupImageViewer() {
  const d = document.getElementById('modal-img');
  
  // Marcar como cerrado
  imageViewerOpen = false;
  
  // Limpiar URLs
  currentImageUrls.forEach(url => URL.revokeObjectURL(url));
  currentImageUrls = [];
  currentImages = [];
  
  // Limpiar event listeners
  if (d._keyHandler) {
    document.removeEventListener('keydown', d._keyHandler);
    d._keyHandler = null;
  }
  
  if (d._clickHandler) {
    d.removeEventListener('click', d._clickHandler);
    d._clickHandler = null;
  }
  
  // Cerrar modal si está abierto
  if (d.open) {
    d.close();
  }
}

async function showCurrentImage() {
  if (currentImages.length === 0) return;
  
  const img = document.getElementById('viewer-img');
  const title = document.getElementById('img-title');
  const counter = document.getElementById('img-counter');
  const prevBtn = document.getElementById('img-prev');
  const nextBtn = document.getElementById('img-next');
  
  const currentImg = currentImages[currentImageIndex];
  const currentUrl = currentImageUrls[currentImageIndex];
  
  // Actualizar imagen
  img.src = currentUrl;
  img.alt = currentImg.name || 'Imagen';
  
  // Actualizar título y contador
  title.textContent = currentImg.name || `Imagen ${currentImageIndex + 1}`;
  counter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
  
  // Actualizar botones de navegación
  prevBtn.disabled = currentImageIndex === 0;
  nextBtn.disabled = currentImageIndex === currentImages.length - 1;
  
  // Mostrar/ocultar botones según la cantidad de imágenes
  if (currentImages.length <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
  }

  // Configurar zoom con clic que se hace donde haces clic
  img.onclick = (e) => {
    const rect = img.getBoundingClientRect();
    const containerRect = img.parentElement.getBoundingClientRect();
    
    // Calcular la posición del clic relativa a la imagen
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calcular el porcentaje de posición (0-1)
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    if (img.style.transform && img.style.transform.includes('scale(2)')) {
      // Zoom out - volver al tamaño normal
      img.style.transform = 'scale(1)';
      img.style.cursor = 'zoom-in';
      img.style.transformOrigin = 'center';
    } else {
      // Zoom in - hacer zoom donde hiciste clic
      img.style.transform = 'scale(2)';
      img.style.cursor = 'zoom-out';
      // Establecer el origen de transformación donde hiciste clic
      img.style.transformOrigin = `${xPercent * 100}% ${yPercent * 100}%`;
    }
  };
}

function setupImageViewerEvents() {
  const d = document.getElementById('modal-img');
  
  // Limpiar event listeners anteriores si existen
  const closeBtn = document.getElementById('img-close');
  const deleteBtn = document.getElementById('img-delete');
  const prevBtn = document.getElementById('img-prev');
  const nextBtn = document.getElementById('img-next');
  const maximizeBtn = document.getElementById('img-maximize');
  
  // Función de cierre
  const close = () => {
    console.log('Cerrando visor de imágenes...');
    d.close();
    // Limpiar todo el estado
    cleanupImageViewer();
  };

  // Limpiar listeners anteriores
  closeBtn.onclick = null;
  deleteBtn.onclick = null;
  prevBtn.onclick = null;
  nextBtn.onclick = null;
  maximizeBtn.onclick = null;
  
  // Remover listeners de clic en modal si existen
  d.removeEventListener('click', d._clickHandler);
  
  // Cerrar modal al hacer clic fuera de la imagen
  d._clickHandler = (e) => {
    if (e.target === d) {
      close();
    }
  };
  d.addEventListener('click', d._clickHandler);
  
  // Botón cerrar - usar addEventListener para mayor compatibilidad
  closeBtn.addEventListener('click', close);

  // Botón maximizar - abrir imagen en nueva pestaña
  maximizeBtn.addEventListener('click', () => {
    if (currentImages.length > 0 && currentImageIndex >= 0) {
      const currentUrl = currentImageUrls[currentImageIndex];
      
      // Abrir la imagen directamente en una nueva pestaña del navegador
      window.open(currentUrl, '_blank');
    }
  });
  
  // Botón eliminar
  deleteBtn.addEventListener('click', async () => {
    if (!confirm('¿Eliminar imagen?')) return;
    
    const currentImg = currentImages[currentImageIndex];
    await del('images', currentImg.id);
    
    // Remover la imagen de la lista
    currentImages.splice(currentImageIndex, 1);
    URL.revokeObjectURL(currentImageUrls[currentImageIndex]);
    currentImageUrls.splice(currentImageIndex, 1);
    
    if (currentImages.length === 0) {
      // No hay más imágenes, cerrar el modal
      close();
    } else {
      // Ajustar índice si es necesario
      if (currentImageIndex >= currentImages.length) {
        currentImageIndex = currentImages.length - 1;
      }
      await showCurrentImage();
    }
    
    await refreshImagesUI();
  });
  
  // Navegación
  prevBtn.addEventListener('click', async () => {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      await showCurrentImage();
    }
  });
  
  nextBtn.addEventListener('click', async () => {
    if (currentImageIndex < currentImages.length - 1) {
      currentImageIndex++;
      await showCurrentImage();
    }
  });
  
  // Navegación con teclado
  const handleKeyDown = async (e) => {
    if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
      currentImageIndex--;
      await showCurrentImage();
    } else if (e.key === 'ArrowRight' && currentImageIndex < currentImages.length - 1) {
      currentImageIndex++;
      await showCurrentImage();
    } else if (e.key === 'Escape') {
      close();
    }
  };
  
  // Remover listener anterior si existe
  if (d._keyHandler) {
    document.removeEventListener('keydown', d._keyHandler);
  }
  
  // Guardar referencia del handler para poder removerlo después
  d._keyHandler = handleKeyDown;
  
  // Agregar listener de teclado
  document.addEventListener('keydown', d._keyHandler);
  
  // Limpiar listener cuando se cierre el modal
  d.addEventListener('close', () => {
    if (d._keyHandler) {
      document.removeEventListener('keydown', d._keyHandler);
      d._keyHandler = null;
    }
  }, { once: true });
}

/* ================================
   Prácticas
   ================================ */
function bindPractices(){
  document.getElementById('btn-add-practice').addEventListener('click', addPractice);
  document.getElementById('btn-clear-practice').addEventListener('click', ()=>{
    ['p-name','p-cost','p-cat','p-desc'].forEach(id=>document.getElementById(id).value='');
  });

  // Botón de actualizar prácticas
  document.getElementById('btn-refresh-practices').addEventListener('click', async ()=>{
    await refreshPracticesUI();
    await refreshPracticesInHistorySelect();
  });

  // Modal edición
  document.getElementById('mp-cancel').addEventListener('click', ()=>{
    document.getElementById('modal-practice').close();
    editingPractice = null;
  });
  document.getElementById('mp-save').addEventListener('click', async ()=>{
    if(!editingPractice) return;
    editingPractice.name = document.getElementById('mp-name').value.trim();
    editingPractice.cost = parseFloat(document.getElementById('mp-cost').value)||0;
    editingPractice.category = document.getElementById('mp-cat').value.trim();
    editingPractice.description = document.getElementById('mp-desc').value.trim();
    await put('practices', editingPractice);
    document.getElementById('modal-practice').close();
    editingPractice = null;
    await refreshPracticesUI();
    await refreshPracticesInHistorySelect();
    await refreshStats();
  });
  
  document.getElementById('pdet-close').addEventListener('click', ()=>{
    document.getElementById('modal-practice-detail').close();
  });
}
async function addPractice(){
  const name = document.getElementById('p-name').value.trim();
  const cost = parseFloat(document.getElementById('p-cost').value)||0;
  const category = document.getElementById('p-cat').value.trim();
  const description = document.getElementById('p-desc').value.trim();
  if(!name){ alert('Nombre de práctica requerido.'); return; }
  await add('practices', {name, cost, category, description});
  ['p-name','p-cost','p-cat','p-desc'].forEach(id=>document.getElementById(id).value='');
  await refreshPracticesUI();
  await refreshPracticesInHistorySelect();
}
async function refreshPracticesUI(){
  const tb = document.getElementById('practices-tbody');
  const countEl = document.getElementById('practices-count');
  tb.innerHTML='';
  
  const list = await getAll('practices');
  list.sort((a,b)=> (a.name||'').localeCompare(b.name||''));
  
  // Actualizar contador
  countEl.textContent = `${list.length} práctica${list.length !== 1 ? 's' : ''}`;
  
  for(const p of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="practice-name" title="${p.name}">${p.name}</div>
        ${p.description ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${p.description}">${p.description}</div>` : ''}
      </td>
      <td><span class="practice-cost">${formatMoney(p.cost)}</span></td>
      <td><span class="practice-category" title="${p.category || 'Sin categoría'}">${p.category || '—'}</span></td>
      <td>
        <div class="practice-actions">
          <button class="btn-icon" data-action="view" data-id="${p.id}" title="Ver detalles">
            <span>👁️</span>
          </button>
          <button class="btn-icon" data-action="edit" title="Editar">
            <span>✏️</span>
          </button>
          <button class="btn-icon danger" data-action="del" title="Eliminar">
            <span>🗑️</span>
          </button>
        </div>
      </td>`;

    tr.querySelector('[data-action="view"]').addEventListener('click', async ()=>{
      const practiceId = Number(event.target.closest('[data-id]').dataset.id);
      const practice = await getById('practices', practiceId);
      if(practice) {
        document.getElementById('pdet-name').textContent = practice.name;
        document.getElementById('pdet-cost').textContent = formatMoney(practice.cost);
        document.getElementById('pdet-cat').textContent = practice.category || '—';
        document.getElementById('pdet-desc').textContent = practice.description || '—';
        document.getElementById('modal-practice-detail').showModal();
      }
    });
    
    tr.querySelector('[data-action="edit"]').addEventListener('click', ()=>{
      editingPractice = {...p};
      document.getElementById('mp-name').value = p.name||'';
      document.getElementById('mp-cost').value = p.cost||0;
      document.getElementById('mp-cat').value = p.category||'';
      document.getElementById('mp-desc').value = p.description||'';
      document.getElementById('modal-practice').showModal();
    });
    
    tr.querySelector('[data-action="del"]').addEventListener('click', async ()=>{
      if(confirm(`¿Eliminar la práctica "${p.name}"?`)){
        await del('practices', p.id);
        await refreshPracticesUI();
        await refreshPracticesInHistorySelect();
        await refreshStats();
      }
    });

    tb.appendChild(tr);
  }
}
async function refreshPracticesInHistorySelect(){
  const practs = await getAll('practices');
  const list = practs.sort((a,b)=> (a.name||'').localeCompare(b.name||''));
  
  // Actualizar el select de estadísticas (se mantiene igual)
  const selectStats = document.getElementById('f-practica');
  selectStats.innerHTML = `<option value="">Todos</option>` + list.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  
  // Configurar el buscador dinámico
  const searchInput = document.getElementById('h-practica');
  const resultsContainer = document.getElementById('practice-results');
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    resultsContainer.innerHTML = '';
    
    if(!query) {
      resultsContainer.style.display = 'none';
      return;
    }
    
    const filtered = list.filter(p => 
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
    
    if(filtered.length) {
      filtered.forEach(p => {
        const div = document.createElement('div');
        div.style.padding = '8px 12px';
        div.style.cursor = 'pointer';
        div.textContent = `${p.name} (${p.category || 'Sin categoría'}) - ${formatMoney(p.cost)}`;
        div.addEventListener('click', () => {
          searchInput.value = p.name;
          searchInput.dataset.selectedId = p.id;
          resultsContainer.style.display = 'none';
        });
        resultsContainer.appendChild(div);
      });
      resultsContainer.style.display = 'block';
    } else {
      resultsContainer.style.display = 'none';
    }
  });
  
  // Cerrar resultados al hacer clic fuera
  document.addEventListener('click', (e) => {
    if(e.target !== searchInput) {
      resultsContainer.style.display = 'none';
    }
  });
}

/* ================================
   Odontograma
   ================================ */

// Definición de piezas FDI: permanentes (2 filas × 16) y temporarias (2 filas × 10)
// Superior: 18,17,16…11 | 21…28
// Inferior: 48,47,46…41 | 31…38
const teethPermanentUpper = [
  "18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"
];
const teethPermanentLower = [
  "48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"
];
const teethPermanent = [...teethPermanentUpper, ...teethPermanentLower];
const teethPrimary = [
  "55","54","53","52","51","61","62","63","64","65",
  "85","84","83","82","81","71","72","73","74","75"
];
function isAnterior(tooth){ // incisivos/caninos aproximados por números relativos
  // Anteriores en permanente: 13-23 y 33-43 (caninos e incisivos)
  const n = Number(tooth);
  return [11,12,13,21,22,23,31,32,33,41,42,43].includes(n) ||
         [51,52,53,61,62,63,71,72,73,81,82,83].includes(n);
}

async function loadOdontogram(){
  if(!currentPatient) return {};
  const og = await (new Promise((res,rej)=>{
    const r = tx('odontograms').get(currentPatient.id);
    r.onsuccess = ()=>res(r.result || {patientId:currentPatient.id, data:{}});
    r.onerror = ()=>rej(r.error);
  }));
  // Asegura estructura
  og.data = og.data || {};
  return og;
}
async function saveOdontogram(og){
  await put('odontograms', og);
}

function blankTooth(){
  // Estado por superficie: v,l,m,d,o => '', 'caries-activa', 'caries-tratada', 'rest-amalgama', 'rest-composite'
  return {
    surfaces: {v:'', l:'', m:'', d:'', o:''},
    endodoncia:false,
    ausente:false,
    extraccion:false,
    fractura:'',           // '', 'corona', 'raiz'
    protesis:'',           // '', 'corona','puente','implante','removible'
    ortodoncia:'',         // texto
    anomalias:{retenido:false, diastema:false, formaTamano:false}
  };
}

async function renderOdontogram(){
  if(!currentPatient) return;
  const view = document.getElementById('dentition-view').value;
  const cont = document.getElementById('odontograma');
  const wrap = cont.parentElement; // Obtener el contenedor .odontograma-wrap
  cont.innerHTML='';

  let seq;
  
  // Limpiar clases anteriores
  cont.classList.remove('both-view');
  wrap.classList.remove('both-view');
  
  // Ajustar el grid según el tipo de dentición
  if(view==='permanent'){
    cont.style.gridTemplateColumns = 'repeat(16, 60px)';
    seq = teethPermanent;
  } else if(view==='primary'){
    cont.style.gridTemplateColumns = 'repeat(10, 60px)';
    seq = teethPrimary;
  } else {
    cont.classList.add('both-view');
    wrap.classList.add('both-view');
    cont.style.gridTemplateColumns = 'repeat(16, 60px)';
    seq = [...teethPermanent, ...teethPrimary];
  }

  const og = await loadOdontogram();

  for(const t of seq){
    const state = og.data[t] || blankTooth();
    const toothEl = createToothElement(t, state);
    cont.appendChild(toothEl);
  }
}

function createToothElement(code, state){
  const el = document.createElement('div');
  el.className='tooth';
  el.dataset.code = code;
  // superficies
  const sM = document.createElement('div'); sM.className='surf s-m';
  const sD = document.createElement('div'); sD.className='surf s-d';
  const sO = document.createElement('div'); sO.className='surf s-o';
  const sV = document.createElement('div'); sV.className='surf s-v';
  const sL = document.createElement('div'); sL.className='surf s-l';
  el.append(sM,sO,sD,sV,sL);
  // etiqueta
  const lbl = document.createElement('div');
  lbl.className='label';
  lbl.textContent = code;
  el.appendChild(lbl);
  // badges condiciones
  const badges = document.createElement('div'); badges.className='badges';
  el.appendChild(badges);

  function paintSurface(div, key){
    const v = state.surfaces[key] || '';
    div.style.background = '';
    if(v==='caries-activa') div.style.background = 'var(--caries-activa)';
    if(v==='caries-tratada') div.style.background = 'var(--caries-tratada)';
    if(v==='rest-amalgama') div.style.background = 'var(--rest-amalgama)';
    if(v==='rest-composite') div.style.background = 'var(--rest-composite)';
  }
  paintSurface(sM,'m'); paintSurface(sD,'d'); paintSurface(sO,'o'); paintSurface(sV,'v'); paintSurface(sL,'l');

  // condiciones: badges visuales minimalistas
  badges.innerHTML='';
  if(state.endodoncia) addBadge(badges,'ENDO','var(--endo)','Endodoncia');
  if(state.fractura==='corona') addBadge(badges,'F-C','var(--fractura)','Fractura en corona');
  if(state.fractura==='raiz') addBadge(badges,'F-R','var(--fractura)','Fractura en raíz');
  if(state.protesis==='corona') addBadge(badges,'CRO','var(--protesis)','Corona');
  if(state.protesis==='puente') addBadge(badges,'PTE','var(--protesis)','Puente');
  if(state.protesis==='implante') addBadge(badges,'IMP','var(--implante)','Implante');
  if(state.protesis==='removible') addBadge(badges,'REM','var(--protesis)','Prótesis removible');
  if(state.ortodoncia) addBadge(badges,'ORT','var(--ortodoncia)','Ortodoncia: '+state.ortodoncia);
  if(state.anomalias?.retenido) addBadge(badges,'RET','var(--anomalia)','Diente retenido');
  if(state.anomalias?.diastema) addBadge(badges,'DIA','var(--anomalia)','Diastema');
  if(state.anomalias?.formaTamano) addBadge(badges,'FT','var(--anomalia)','Forma/Tamaño anormal');
  if(state.ausente) addBadge(badges,'AUS','var(--ausente)','Pieza ausente');
  if(state.extraccion) addBadge(badges,'EXT','var(--extraccion)','Extracción');

  // Estilo especial si ausente/extracción: atenuar
  if(state.ausente || state.extraccion){
    [sM,sD,sO,sV,sL].forEach(d=>{ d.style.background = 'var(--ausente)'; d.style.opacity='0.6'; });
  }

  el.title = isAnterior(code)? 'Anterior (V,L,M,D,Incisal)' : 'Posterior (V,L,M,D,Oclusal)';
  el.addEventListener('click', ()=>openToothEditor(code));
  return el;
}
function addBadge(container, text, color, title){
  const b = document.createElement('span');
  b.className='badge';
  b.textContent = text;
  b.style.color = color;
  b.title = title;
  container.appendChild(b);
}

async function openToothEditor(code){
  if(!currentPatient) return;
  currentTooth = code;
  const og = await loadOdontogram();
  const state = og.data[code] || blankTooth();
  // Set modal values
  document.getElementById('tooth-title').textContent = `Pieza ${code} ${isAnterior(code)? '(Anterior)' : '(Posterior)'}`;
  const surfMap = {v:'',l:'',m:'',d:'',o:''};
  Object.assign(surfMap, state.surfaces||{});
  for(const sel of document.querySelectorAll('.surf-select')){
    const k = sel.dataset.surf;
    sel.value = surfMap[k] || '';
  }
  document.querySelector('.tc[data-key="endodoncia"]').checked = !!state.endodoncia;
  document.querySelector('.tc[data-key="ausente"]').checked = !!state.ausente;
  document.querySelector('.tc[data-key="extraccion"]').checked = !!state.extraccion;
  document.getElementById('t-fractura').value = state.fractura||'';
  document.getElementById('t-protesis').value = state.protesis||'';
  document.getElementById('t-ortodoncia').value = state.ortodoncia||'';
  document.querySelector('.an[data-key="retenido"]').checked = !!state.anomalias?.retenido;
  document.querySelector('.an[data-key="diastema"]').checked = !!state.anomalias?.diastema;
  document.querySelector('.an[data-key="formaTamano"]').checked = !!state.anomalias?.formaTamano;

  const d = document.getElementById('modal-tooth');
  d.showModal();

  document.getElementById('tooth-clear').onclick = async ()=>{
    const og2 = await loadOdontogram();
    og2.data[code] = blankTooth();
    await saveOdontogram(og2);
    await renderOdontogram();
    d.close();
  };
  document.getElementById('tooth-cancel').onclick = ()=>d.close();
  document.getElementById('tooth-save').onclick = async ()=>{
    const og3 = await loadOdontogram();
    const st = og3.data[code] || blankTooth();
    // Superficies
    for(const sel of document.querySelectorAll('.surf-select')){
      const k = sel.dataset.surf;
      st.surfaces[k] = sel.value || '';
    }
    // Condiciones
    st.endodoncia = document.querySelector('.tc[data-key="endodoncia"]').checked;
    st.ausente = document.querySelector('.tc[data-key="ausente"]').checked;
    st.extraccion = document.querySelector('.tc[data-key="extraccion"]').checked;
    st.fractura = document.getElementById('t-fractura').value || '';
    st.protesis = document.getElementById('t-protesis').value || '';
    st.ortodoncia = document.getElementById('t-ortodoncia').value.trim();

    st.anomalias = {
      retenido: document.querySelector('.an[data-key="retenido"]').checked,
      diastema: document.querySelector('.an[data-key="diastema"]').checked,
      formaTamano: document.querySelector('.an[data-key="formaTamano"]').checked
    };

    og3.data[code] = st;
    await saveOdontogram(og3);
    await renderOdontogram();
    d.close();
  };
}

/* ================================
   Estadísticas y reportes
   ================================ */
function bindStats(){
  document.getElementById('btn-apply-filters').addEventListener('click', refreshStats);
  document.getElementById('btn-clear-filters').addEventListener('click', ()=>{
    ['f-desde','f-hasta'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('f-age').value='';
    document.getElementById('f-practica').value='';
    refreshStats();
  });
}
async function refreshStats(){
  const desde = document.getElementById('f-desde')?.value || '';
  const hasta = document.getElementById('f-hasta')?.value || '';
  const rangeAge = document.getElementById('f-age')?.value || '';
  const practiceId = Number(document.getElementById('f-practica')?.value)||null;

  const patients = await getAll('patients');
  const ageMap = new Map(patients.map(p=>[p.id, Number(calcAgeFromDOB(p.nacimiento)) || null]));

  const hist = await getAll('histories');
  // Filtros
  const filtered = hist.filter(h=>{
    if(desde && h.fechaISO < desde) return false;
    if(hasta && h.fechaISO > hasta) return false;
    if(practiceId && h.practiceId !== practiceId) return false;
    if(rangeAge){
      const [aMin,aMax] = rangeAge.split('-').map(Number);
      const a = ageMap.get(h.patientId);
      if(a==null || a<aMin || a>aMax) return false;
    }
    return true;
  });

  const totalValor = filtered.reduce((s,h)=>s+(h.valor||0),0);
  const totalAbonado = filtered.reduce((s,h)=>s+(h.abonado||0),0);
  const totalSaldo = filtered.reduce((s,h)=>s+(h.saldo||0),0);

  document.getElementById('kpi-entradas').textContent = filtered.length;
  document.getElementById('kpi-valor').textContent = formatMoney(totalValor);
  document.getElementById('kpi-abonado').textContent = formatMoney(totalAbonado);
  document.getElementById('kpi-saldo').textContent = formatMoney(totalSaldo);

  // Detalle por práctica
  const practs = await getAll('practices');
  const pmap = new Map(practs.map(p=>[p.id, p]));
  const groups = new Map();
  for(const h of filtered){
    const k = h.practiceId || 0;
    if(!groups.has(k)) groups.set(k, {count:0, valor:0, abonado:0, saldo:0});
    const g = groups.get(k);
    g.count++; g.valor+=h.valor||0; g.abonado+=h.abonado||0; g.saldo+=h.saldo||0;
  }
  const tb = document.getElementById('stats-tbody');
  tb.innerHTML='';
  for(const [k, g] of groups){
    const pr = pmap.get(k);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pr? pr.name : '—'}</td>
      <td>${g.count}</td>
      <td>${formatMoney(g.valor)}</td>
      <td>${formatMoney(g.abonado)}</td>
      <td>${formatMoney(g.saldo)}</td>`;
    tb.appendChild(tr);
  }
}

/* ================================
   Backup / Restore
   ================================ */
function bindBackupRestore(){
  document.getElementById('btn-guardar').addEventListener('click', handleSaveSession);
  document.getElementById('btn-cargar').addEventListener('click', handleImportSession);
  document.getElementById('restore-file').addEventListener('change', handleRestoreFile);
}

async function handleSaveSession() {
  try {
    // Verificar si estamos en modo demo
    if (isDemoMode) {
      alert('🚀 Modo Demo\n\nLa función de guardar datos está disponible en la versión completa.\n\nPara más información:\n📧 Email: jhonnyatrix@gmail.com\n📞 Tel: 3794-807949\n\nDesarrollado por ZenithSoft');
      return;
    }
    
    // Verificar que la base de datos esté disponible
    if (!db) {
      console.error('Base de datos no disponible');
      alert('Error: Base de datos no disponible. Intenta recargar la página.');
      return;
    }

    console.log('Iniciando backup de sesión...');
    
    // Obtener todos los datos de forma segura
    const patients = await getAll('patients').catch(() => []);
    const practices = await getAll('practices').catch(() => []);
    const histories = await getAll('histories').catch(() => []);
    const odontograms = await getAll('odontograms').catch(() => []);
    const settings = await getAll('settings').catch(() => []);
    
    console.log('Datos obtenidos:', { 
      patients: patients.length, 
      practices: practices.length, 
      histories: histories.length, 
      odontograms: odontograms.length,
      settings: settings.length 
    });
    
    // Obtener imágenes de forma segura
    let imagesWithBase64 = [];
    try {
      const images = await getAll('images');
      if (images && images.length > 0) {
        imagesWithBase64 = await Promise.all(images.map(img => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                id: img.id,
                patientId: img.patientId,
                type: img.type,
                name: img.name,
                createdAt: img.createdAt,
                base64: reader.result
              });
            };
            reader.onerror = () => {
              console.warn('Error al leer imagen:', img.id);
              resolve(null);
            };
            reader.readAsDataURL(img.blob);
          });
        }));
        // Filtrar imágenes nulas
        imagesWithBase64 = imagesWithBase64.filter(img => img !== null);
      }
    } catch (error) {
      console.warn('Error al obtener imágenes:', error);
    }

    const data = {
      patients,
      practices,
      histories,
      images: imagesWithBase64,
      odontograms,
      settings,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    console.log('Creando archivo de backup...');
    
    // Convertir a JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    const formattedDate = todayISO();
    const filename = `ZenithSoft_GO-backup-${formattedDate}.json`;
    
    // Método alternativo: usar un elemento existente o crear uno de forma más segura
    let downloadLink = document.getElementById('download-link');
    if (!downloadLink) {
      downloadLink = document.createElement('a');
      downloadLink.id = 'download-link';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
    }
    
    // Crear blob y URL
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Configurar el enlace
    downloadLink.href = url;
    downloadLink.download = filename;
    
    // Intentar la descarga
    try {
      downloadLink.click();
      console.log('Descarga iniciada');
      
      // Limpiar después de un delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
      
      alert('Datos guardados correctamente');
    } catch (downloadError) {
      console.error('Error en la descarga:', downloadError);
      
      // Fallback: mostrar en nueva ventana
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${filename}</title>
              <style>
                body { font-family: monospace; padding: 20px; }
                pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
                button { margin: 10px 0; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
              </style>
            </head>
            <body>
              <h2>Backup de ZenithSoft GO</h2>
              <p>Archivo: ${filename}</p>
              <button onclick="navigator.clipboard.writeText(document.querySelector('pre').textContent)">Copiar al Portapapeles</button>
              <pre>${jsonString}</pre>
            </body>
          </html>
        `);
        alert('Archivo mostrado en nueva ventana. Puedes copiarlo y guardarlo manualmente.');
      } else {
        alert('No se pudo abrir nueva ventana. Los datos están en la consola del navegador.');
        console.log('Backup data:', data);
      }
    }
    
  } catch (error) {
    console.error('Error al guardar sesión:', error);
    alert('Error al guardar la sesión: ' + error.message);
  }
}

function handleImportSession() {
  if (isDemoMode) {
    alert('🚀 Modo Demo\n\nLa función de cargar datos está disponible en la versión completa.\n\nPara más información:\n📧 Email: jhonnyatrix@gmail.com\n📞 Tel: 3794-807949\n\nDesarrollado por ZenithSoft');
    return;
  }

  const fileInput = document.getElementById('restore-file');
  if (!fileInput) {
    console.error('Elemento restore-file no encontrado');
    alert('Error: elemento de archivo no encontrado');
    return;
  }

  fileInput.click();
}

async function handleRestoreFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!confirm('Esto importará datos en las tablas actuales. ¿Continuar?')) {
    e.target.value = '';
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.patients || !data.practices) {
      alert('El archivo no parece ser un backup válido');
      e.target.value = '';
      return;
    }

    await importStore('patients', data.patients || []);
    await importStore('practices', data.practices || []);
    await importStore('histories', data.histories || []);
    await importStore('odontograms', data.odontograms || []);
    await importStore('settings', data.settings || []);
    await importImages(data.images || []);

    alert('Datos cargados correctamente');

    await loadProfessionalInfo();
    await refreshPatientsUI();
    await refreshPracticesUI();
    await refreshPracticesInHistorySelect();
    await refreshStats();
    if (currentPatient) renderDetail();
    e.target.value = '';
  } catch (error) {
    console.error('Error al cargar datos:', error);
    alert('Error al cargar los datos');
    e.target.value = '';
  }
}

/* ================================
   Configuración del Profesional
   ================================ */
async function loadProfessionalInfo() {
  try {
    // Asegurar que la base de datos esté abierta
    if (!db) {
      await openDB();
    }
    
    const professionalInfo = await getById('settings', 'professional');
    if (professionalInfo) {
      const emailElement = document.getElementById('user-email');
      const nameElement = document.getElementById('professional-name');
      const specialtyElement = document.getElementById('professional-specialty');
      
      if (emailElement) {
        emailElement.textContent = professionalInfo.name || 'Usuario';
      }
      if (nameElement) {
        nameElement.value = professionalInfo.name || '';
      }
      if (specialtyElement) {
        specialtyElement.value = professionalInfo.specialty || '';
      }
    } else {
      // Usar email como nombre por defecto
      const emailElement = document.getElementById('user-email');
      if (emailElement) {
        emailElement.textContent = currentUser?.email?.split('@')[0] || 'Usuario';
      }
    }
  } catch (error) {
    console.log('Error al cargar información del profesional:', error);
    // Usar email como nombre por defecto en caso de error
    const emailElement = document.getElementById('user-email');
    if (emailElement) {
      emailElement.textContent = currentUser?.email?.split('@')[0] || 'Usuario';
    }
  }
}

async function saveProfessionalInfo() {
  const name = document.getElementById('professional-name').value.trim();
  const specialty = document.getElementById('professional-specialty').value.trim();
  
  if (!name) {
    alert('Por favor ingresa el nombre del profesional/consultorio');
    return;
  }
  
  try {
    await put('settings', {
      id: 'professional',
      name: name,
      specialty: specialty,
      updatedAt: new Date().toISOString()
    });
    
    // Actualizar nombre en el header
    document.getElementById('user-email').textContent = name;
    
    alert('Información del profesional guardada exitosamente');
  } catch (error) {
    console.error('Error al guardar información del profesional:', error);
    alert('Error al guardar la información');
  }
}

function clearProfessionalInfo() {
  document.getElementById('professional-name').value = '';
  document.getElementById('professional-specialty').value = '';
}


function handleOpenConfig() {
  // Abrir la pestaña de configuración
  showTab('configuracion');
}

async function importStore(store, items){
  for(const it of items){
    await put(store, it);
  }
}
/* ================================
   Funciones de Importación
   ================================ */
async function importImages(images){
  for(const img of images){
    try {
      // Convertir la cadena Base64 a Blob directamente
      const base64Data = img.base64;
      if (!base64Data) continue;
      
      // Limpiar y validar los datos base64
      let cleanBase64 = base64Data;
      
      // Si ya tiene el prefijo data:, extraer solo los datos
      if (base64Data.includes(',')) {
        const [header, data] = base64Data.split(',');
        cleanBase64 = data;
      }
      
      // Limpiar caracteres que pueden causar problemas de manera más agresiva
      cleanBase64 = cleanBase64.replace(/\s/g, ''); // Remover espacios
      cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, ''); // Solo caracteres base64 válidos
      
      // Verificar que tengamos datos después de la limpieza
      if (cleanBase64.length === 0) {
        console.warn('No hay datos base64 válidos después de la limpieza para imagen:', img.name);
        continue;
      }
      
      // Validar que solo contenga caracteres base64 válidos
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(cleanBase64)) {
        console.warn('Datos base64 contienen caracteres inválidos para imagen:', img.name);
        continue;
      }
      
      // Agregar padding si es necesario
      while (cleanBase64.length % 4 !== 0) {
        cleanBase64 += '=';
      }
      
      // Extraer el tipo MIME
      let mimeType = 'image/jpeg'; // Por defecto
      if (base64Data.includes(',')) {
        const header = base64Data.split(',')[0];
        const mimeMatch = header.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }
      
      // Convertir base64 a bytes con manejo de errores más robusto
      let byteCharacters;
      let success = false;
      
      // Método 1: Intentar decodificar directamente
      try {
        byteCharacters = atob(cleanBase64);
        success = true;
        console.log('Imagen decodificada exitosamente (método 1):', img.name);
      } catch (error) {
        console.warn('Método 1 falló para imagen:', img.name, 'Error:', error.message);
      }
      
      // Método 2: Limpieza más agresiva
      if (!success) {
        try {
          // Remover todos los caracteres no base64 y reconstruir
          let fallbackBase64 = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');
          
          // Si tiene prefijo data:, extraer solo los datos
          if (fallbackBase64.includes(',')) {
            fallbackBase64 = fallbackBase64.split(',')[1] || fallbackBase64;
          }
          
          // Asegurar padding correcto
          while (fallbackBase64.length % 4 !== 0) {
            fallbackBase64 += '=';
          }
          
          byteCharacters = atob(fallbackBase64);
          success = true;
          console.log('Imagen decodificada exitosamente (método 2):', img.name);
        } catch (fallbackError) {
          console.warn('Método 2 falló para imagen:', img.name, 'Error:', fallbackError.message);
        }
      }
      
      // Método 3: Reconstrucción completa
      if (!success) {
        try {
          // Extraer solo la parte de datos base64 más básica
          let rawData = base64Data;
          if (rawData.includes(',')) {
            rawData = rawData.split(',')[1];
          }
          
          // Limpieza extrema - solo caracteres alfanuméricos y algunos símbolos
          rawData = rawData.replace(/[^A-Za-z0-9+/=]/g, '');
          
          // Reconstruir padding
          const remainder = rawData.length % 4;
          if (remainder > 0) {
            rawData += '='.repeat(4 - remainder);
          }
          
          byteCharacters = atob(rawData);
          success = true;
          console.log('Imagen decodificada exitosamente (método 3):', img.name);
        } catch (reconstructionError) {
          console.warn('Método 3 falló para imagen:', img.name, 'Error:', reconstructionError.message);
        }
      }
      
      // Si todos los métodos fallaron, saltar esta imagen
      if (!success) {
        console.warn('No se pudo decodificar la imagen después de todos los métodos:', img.name);
        continue;
      }
      
      // Verificar que se generaron bytes válidos
      if (byteCharacters.length === 0) {
        console.warn('No se generaron bytes válidos para imagen:', img.name);
        continue;
      }
      
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Verificar que el blob tenga un tamaño mínimo
      if (blob.size < 100) {
        console.warn('Imagen demasiado pequeña, posiblemente corrupta:', img.name, 'Tamaño:', blob.size);
        continue;
      }
      
      await put('images', {
        id: img.id,
        patientId: img.patientId,
        type: img.type,
        name: img.name,
        createdAt: img.createdAt,
        blob: blob
      });
      
      console.log('Imagen importada exitosamente:', img.name, 'Tamaño:', blob.size, 'bytes');
    } catch (error) {
      console.error('Error al importar imagen:', img.name, error);
      // Continuar con la siguiente imagen en caso de error
    }
  }
}

/* ================================
   Impresión
   ================================ */
function bindPrint(){
  document.getElementById('btn-print').addEventListener('click', async ()=>{
    if(!currentPatient){ alert('Selecciona un paciente para imprimir.'); return; }
    
    // Obtener todos los datos necesarios
    const patient = currentPatient;
    const histories = await indexGetAll('histories','byPatient', currentPatient.id);
    const odontogram = await getById('odontograms', currentPatient.id);
    const images = await indexGetAll('images','byPatient', currentPatient.id);
    const practices = await getAll('practices');
    const practiceMap = new Map(practices.map(p => [p.id, p]));
    
    // Obtener información del profesional
    const professionalInfo = await getById('settings', 'professional');
    const professionalName = professionalInfo?.name || 'Profesional';
    
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    
    // Construir el contenido HTML
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ficha Paciente - ${patient.nombre} ${patient.apellido}</title>
        <link rel="stylesheet" href="print-style.css">
          <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .print-section { margin-bottom: 25px; }
    .print-header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .patient-data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    .images-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
    .print-image { max-width: 100%; height: auto; border: 1px solid #ddd; }
    .signature-area { margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; text-align: center; }
    .page-break { page-break-before: always; }
    
    /* Estilos para el odontograma en impresión - AUMENTADO */
    .odontograma-print { 
      display: grid; 
      grid-template-columns: repeat(16, 35px); /* Aumentado de 25px a 35px */
      gap: 10px 4px; /* Aumentar espacio entre dientes */
      justify-content: center;
      margin-bottom: 20px;
    }
    .temporal-odontograma-print { 
      display: grid; 
      grid-template-columns: repeat(10, 35px); /* Aumentado de 25px a 35px */
      gap: 10px 4px;
      justify-content: center;
      margin-bottom: 20px;
    }
    .tooth-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 15px;
    }
    .tooth-print {
      position: relative;
      width: 35px; /* Aumentado de 25px a 35px */
      height: 35px; /* Aumentado de 25px a 35px */
      border: 1px solid #b9b9b9;
      border-radius: 3px;
      background-color: #ffffff;
      display: grid;
      grid-template-areas:
          "m o d"
          "m v d"
          "m l d";
      grid-template-columns: 11px 13px 11px; /* Aumentado proporcionalmente */
      grid-template-rows: 11px 13px 11px; /* Aumentado proporcionalmente */
      margin-bottom: 5px;
    }
    .tooth-print .surf {
      border: 0.5px solid #616161;
    }
    .tooth-print .s-m {
      grid-area: m;
      border-right: none;
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
    }
    .tooth-print .s-d {
      grid-area: d;
      border-left: none;
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
    .tooth-print .s-o {
      grid-area: o;
      border-bottom: none;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }
    .tooth-print .s-v {
      grid-area: v;
      border-left: none;
      border-right: none;
    }
    .tooth-print .s-l {
      grid-area: l;
      border-top: none;
      border-bottom-left-radius: 3px;
      border-bottom-right-radius: 3px;
    }
    .tooth-label {
      font-size: 10px; /* Aumentado de 8px a 10px */
      font-weight: bold;
      margin-top: 5px;
    }
    .badges-container {
      position: absolute;
      top: -10px; /* Aumentado de -8px a -10px */
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      width: 40px; /* Aumentado de 30px a 40px */
      gap: 2px;
    }
    .badge-print {
      font-size: 6px; /* Aumentado de 5px a 6px */
      padding: 1px 2px; /* Aumentado de 0px 1px a 1px 2px */
      border-radius: 2px;
      border: 0.5px solid #d1d5db;
      background-color: #f3f4f6;
    }
    @media print {
      .odontograma-print, .temporal-odontograma-print {
        width: 100%;
        justify-content: space-between;
      }
    }
  </style>
      </head>
      <body>
        <div class="print-header">
          <h2>Ficha del Paciente</h2>
          <div class="subtitle">${professionalName}</div>
        </div>
        
        <div class="print-section">
          <h3>Datos Personales</h3>
          <div class="patient-data-grid">
            <div><strong>Nombre:</strong> ${patient.nombre || '—'} ${patient.apellido || '—'}</div>
            <div><strong>DNI:</strong> ${patient.dni || '—'}</div>
            <div><strong>Fecha de Nacimiento:</strong> ${patient.nacimiento || '—'}</div>
            <div><strong>Edad:</strong> ${calcAgeFromDOB(patient.nacimiento) || '—'}</div>
            <div><strong>Teléfono:</strong> ${patient.telefono || '—'}</div>
            <div><strong>Dirección:</strong> ${patient.direccion || '—'}</div>
            <div><strong>Derivado por:</strong> ${patient.derivadoPor || '—'}</div>
          </div>
        </div>
        
        <div class="print-section">
          <h3>Historial de Prácticas</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Práctica</th>                               
                <th>Profesional</th>                
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Agregar filas de historial
    histories.sort((a, b) => new Date(a.fechaISO) - new Date(b.fechaISO));
    histories.forEach(history => {
      const practice = history.practiceId ? practiceMap.get(history.practiceId) : null;
      
      content += `
        <tr>
          <td>${history.fechaISO ? formatDateBA(history.fechaISO) : '—'}</td>
          <td>${practice ? practice.name : history.practiceName || '—'}</td>
          <td>${history.odontologo || '—'}</td>
          <td>${history.obs || '—'}</td>
        </tr>
      `;
    });
    
    content += `
            </tbody>
          </table>
        </div>
        
        <div class="page-break"></div>
        
        <div class="print-section">
          <h3>Odontograma Permanente</h3>
          <div class="odontograma-print">
    `;
    
    // Renderizar odontograma permanente
    if (odontogram && odontogram.data) {
      // Verificar si hay datos de dientes permanentes
      const hasPermanentData = teethPermanent.some(t => odontogram.data[t]);
      
      if (hasPermanentData) {
        // Dientes superiores (primera fila)
        for (const t of teethPermanentUpper) {
          const state = odontogram.data[t] || blankTooth();
          content += createToothPrintElement(t, state);
        }
        
        content += `</div><div class="odontograma-print">`;
        
        for (const t of teethPermanentLower) {
          const state = odontogram.data[t] || blankTooth();
          content += createToothPrintElement(t, state);
        }
        
        content += `</div>`;
      } else {
        content += `<p>No hay odontograma permanente registrado para este paciente.</p></div>`;
      }
      
      // Leyenda del odontograma
      content += `
        <div style="margin-top: 20px; font-size: 12px;">
          <h4>Leyenda:</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">
            <div><span style="background:#ef4444; width:12px; height:12px; display:inline-block;"></span> Caries activa</div>
            <div><span style="background:#f59e0b; width:12px; height:12px; display:inline-block;"></span> Caries tratada</div>
            <div><span style="background:#6b7280; width:12px; height:12px; display:inline-block;"></span> Rest. amalgama</div>
            <div><span style="background:#3b82f6; width:12px; height:12px; display:inline-block;"></span> Rest. composite</div>
            <div><span style="background:#a855f7; width:12px; height:12px; display:inline-block;"></span> Endodoncia</div>
            <div><span style="background:#fde047; width:12px; height:12px; display:inline-block;"></span> Fractura</div>
            <div><span style="background:#14b8a6; width:12px; height:12px; display:inline-block;"></span> Implante</div>
            <div><span style="background:#f59e0b; width:12px; height:12px; display:inline-block;"></span> Prótesis</div>
            <div><span style="background:#ec4899; width:12px; height:12px; display:inline-block;"></span> Ortodoncia</div>
            <div><span style="background:#22c55e; width:12px; height:12px; display:inline-block;"></span> Anomalías</div>
            <div><span style="background:#888888; width:12px; height:12px; display:inline-block;"></span> Ausente/Extraído</div>
          </div>
        </div>
      `;
    } else {
      content += `<p>No hay odontograma permanente registrado para este paciente.</p>`;
    }
    
    content += `
          </div>
        </div>
    `;
    
    // Agregar odontograma temporario si existe
    if (odontogram && odontogram.data) {
      // Verificar si hay datos de dientes temporarios
      const hasTemporalData = teethPrimary.some(t => odontogram.data[t]);
      
      if (hasTemporalData) {
        content += `<div class="page-break"></div>`;
        content += `<div class="print-section"><h3>Odontograma Temporario</h3>`;
        
        // Odontograma temporario superior
        content += `<h4>Arco Superior</h4><div class="temporal-odontograma-print">`;
        const upperTemporal = teethPrimary.slice(0, 5).concat(teethPrimary.slice(5, 10));
        for (const t of upperTemporal) {
          const state = odontogram.data[t] || blankTooth();
          content += createToothPrintElement(t, state);
        }
        content += `</div>`;
        
        // Odontograma temporario inferior
        content += `<h4>Arco Inferior</h4><div class="temporal-odontograma-print">`;
        const lowerTemporal = teethPrimary.slice(10, 15).concat(teethPrimary.slice(15, 20));
        for (const t of lowerTemporal) {
          const state = odontogram.data[t] || blankTooth();
          content += createToothPrintElement(t, state);
        }
        content += `</div></div>`;
      }
    }
    
    // Agregar imágenes si existen
    if (images && images.length > 0) {
      content += `<div class="page-break"></div>`;
      content += `<div class="print-section"><h3>Imágenes Adjuntas</h3><div class="images-container">`;
      
      images.forEach(img => {
        const url = URL.createObjectURL(img.blob);
        content += `
          <div>
            <img class="print-image" src="${url}" alt="${img.name || 'Imagen'}">
            <div class="image-caption">${img.name || 'Imagen'} - ${formatDateTimeBA(img.createdAt)}</div>
          </div>
        `;
      });
      
      content += `</div></div>`;
    }
    
    // Firma y fecha
    content += `
        <div class="signature-area">
          <div>Firma del Profesional</div>
          <div style="margin-top: 40px;">_________________________________________</div>
          <div>Fecha: ${formatDateBA(new Date())}</div>
        </div>
      </body>
      </html>
    `;
    
    // Escribir el contenido y imprimir
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Esperar a que se carguen las imágenes antes de imprimir
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };    
  });
  // Nuevo botón para imprimir estadísticas
  document.getElementById('btn-print-stats').addEventListener('click', async ()=>{
    await printStatsReport();
  });
}


// Función auxiliar para crear elementos de diente para impresión
function createToothPrintElement(code, state) {
  // Determinar colores de superficies
  const surfaceColors = {
    'v': state.surfaces?.v ? getColorForSurface(state.surfaces.v) : '',
    'l': state.surfaces?.l ? getColorForSurface(state.surfaces.l) : '',
    'm': state.surfaces?.m ? getColorForSurface(state.surfaces.m) : '',
    'd': state.surfaces?.d ? getColorForSurface(state.surfaces.d) : '',
    'o': state.surfaces?.o ? getColorForSurface(state.surfaces.o) : ''
  };
  
  // Generar badges para condiciones
  let badges = '';
  if (state.endodoncia) badges += `<span class="badge-print" style="color: #a855f7;" title="Endodoncia">ENDO</span>`;
  if (state.fractura === 'corona') badges += `<span class="badge-print" style="color: #fde047;" title="Fractura en corona">F-C</span>`;
  if (state.fractura === 'raiz') badges += `<span class="badge-print" style="color: #fde047;" title="Fractura en raíz">F-R</span>`;
  if (state.protesis === 'corona') badges += `<span class="badge-print" style="color: #f59e0b;" title="Corona">CRO</span>`;
  if (state.protesis === 'puente') badges += `<span class="badge-print" style="color: #f59e0b;" title="Puente">PTE</span>`;
  if (state.protesis === 'implante') badges += `<span class="badge-print" style="color: #14b8a6;" title="Implante">IMP</span>`;
  if (state.protesis === 'removible') badges += `<span class="badge-print" style="color: #f59e0b;" title="Prótesis removible">REM</span>`;
  if (state.ortodoncia) badges += `<span class="badge-print" style="color: #ec4899;" title="Ortodoncia: ${state.ortodoncia}">ORT</span>`;
  if (state.anomalias?.retenido) badges += `<span class="badge-print" style="color: #22c55e;" title="Diente retenido">RET</span>`;
  if (state.anomalias?.diastema) badges += `<span class="badge-print" style="color: #22c55e;" title="Diastema">DIA</span>`;
  if (state.anomalias?.formaTamano) badges += `<span class="badge-print" style="color: #22c55e;" title="Forma/Tamaño anormal">FT</span>`;
  if (state.ausente) badges += `<span class="badge-print" style="color: #888888;" title="Pieza ausente">AUS</span>`;
  if (state.extraccion) badges += `<span class="badge-print" style="color: #1f2937;" title="Extracción">EXT</span>`;

  // Fondo general para piezas ausentes/extraídas
  const toothBackground = (state.ausente || state.extraccion) ? '#888888' : '#ffffff';
  const toothOpacity = (state.ausente || state.extraccion) ? '0.6' : '1';

  return `
    <div class="tooth-print" style="background-color: ${toothBackground}; opacity: ${toothOpacity};">
      <div class="surf s-m" style="background-color: ${surfaceColors.m}"></div>
      <div class="surf s-d" style="background-color: ${surfaceColors.d}"></div>
      <div class="surf s-o" style="background-color: ${surfaceColors.o}"></div>
      <div class="surf s-v" style="background-color: ${surfaceColors.v}"></div>
      <div class="surf s-l" style="background-color: ${surfaceColors.l}"></div>
      <div class="tooth-label">${code}</div>
      <div class="badges-container">${badges}</div>
    </div>
  `;
}

// Función auxiliar para obtener el color según el estado de la superficie
function getColorForSurface(surfaceState) {
  switch(surfaceState) {
    case 'caries-activa': return '#ef4444';
    case 'caries-tratada': return '#f59e0b';
    case 'rest-amalgama': return '#6b7280';
    case 'rest-composite': return '#3b82f6';
    default: return '';
  }
}
// Nueva función para imprimir el reporte de estadísticas
async function printStatsReport(){
  // Obtener los filtros actuales
  const desde = document.getElementById('f-desde')?.value || '';
  const hasta = document.getElementById('f-hasta')?.value || '';
  const rangeAge = document.getElementById('f-age')?.value || '';
  const practiceId = Number(document.getElementById('f-practica')?.value)||null;
  
  // Obtener los datos filtrados (usando la lógica existente de refreshStats)
  const patients = await getAll('patients');
  const ageMap = new Map(patients.map(p=>[p.id, Number(calcAgeFromDOB(p.nacimiento)) || null]));
  const hist = await getAll('histories');
  const practs = await getAll('practices');
  const pmap = new Map(practs.map(p=>[p.id, p]));
  
  // Aplicar filtros
  const filtered = hist.filter(h=>{
    if(desde && h.fechaISO < desde) return false;
    if(hasta && h.fechaISO > hasta) return false;
    if(practiceId && h.practiceId !== practiceId) return false;
    if(rangeAge){
      const [aMin,aMax] = rangeAge.split('-').map(Number);
      const a = ageMap.get(h.patientId);
      if(a==null || a<aMin || a>aMax) return false;
    }
    return true;
  });
  
  // Calcular totales
  const totalValor = filtered.reduce((s,h)=>s+(h.valor||0),0);
  const totalAbonado = filtered.reduce((s,h)=>s+(h.abonado||0),0);
  const totalSaldo = filtered.reduce((s,h)=>s+(h.saldo||0),0);
  
  // Agrupar por práctica
  const groups = new Map();
  for(const h of filtered){
    const k = h.practiceId || 0;
    if(!groups.has(k)) groups.set(k, {count:0, valor:0, abonado:0, saldo:0});
    const g = groups.get(k);
    g.count++; g.valor+=h.valor||0; g.abonado+=h.abonado||0; g.saldo+=h.saldo||0;
  }
  
  // Obtener información del profesional
  const professionalInfo = await getById('settings', 'professional');
  const professionalName = professionalInfo?.name || 'Profesional';
  
  // Crear ventana de impresión
  const printWindow = window.open('', '_blank');
  
  // Construir el contenido HTML
  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte de Estadísticas - ZenithSoft GO</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333;
        }
        .print-header { 
          text-align: center; 
          margin-bottom: 20px; 
          border-bottom: 2px solid #000; 
          padding-bottom: 10px; 
        }
        .filters-info {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .kpi-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }
        .kpi-card {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
          text-align: center;
          background-color: #f9f9f9;
        }
        .kpi-value {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
          color: #2563eb;
        }
        .kpi-label {
          font-size: 14px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          font-size: 14px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .total-row {
          font-weight: bold;
          background-color: #e5e7eb;
        }
        .signature-area {
          margin-top: 50px;
          border-top: 1px solid #000;
          padding-top: 10px;
          text-align: center;
        }
        .page-break {
          page-break-before: always;
        }
        @media print {
          .kpi-container {
            page-break-inside: avoid;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h2>Reporte de Estadísticas</h2>
        <div class="subtitle">${professionalName}</div>
        <div>Fecha de generación: ${formatDateTimeBA(new Date())}</div>
      </div>
      
      <div class="filters-info">
        <h3>Filtros aplicados:</h3>
        <p><strong>Período:</strong> ${desde || 'Inicio'} - ${hasta || 'Actual'}</p>
        <p><strong>Rango de edad:</strong> ${rangeAge ? rangeAge.replace('-', ' a ') : 'Todos'}</p>
        <p><strong>Práctica:</strong> ${practiceId ? pmap.get(practiceId)?.name : 'Todas'}</p>
      </div>
      
      <div class="kpi-container">
        <div class="kpi-card">
          <div class="kpi-label">Total Entradas</div>
          <div class="kpi-value">${filtered.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Valor Total</div>
          <div class="kpi-value">${formatMoney(totalValor)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Abonado</div>
          <div class="kpi-value">${formatMoney(totalAbonado)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Saldo Pendiente</div>
          <div class="kpi-value">${formatMoney(totalSaldo)}</div>
        </div>
      </div>
      
      <h3>Detalle por Práctica</h3>
      <table>
        <thead>
          <tr>
            <th>Práctica</th>
            <th>Cantidad</th>
            <th>Valor Total</th>
            <th>Total Abonado</th>
            <th>Saldo Pendiente</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // Agregar filas para cada práctica
  let practiceCount = 0;
  let practiceValor = 0;
  let practiceAbonado = 0;
  let practiceSaldo = 0;
  
  for(const [k, g] of groups){
    const pr = pmap.get(k);
    practiceCount += g.count;
    practiceValor += g.valor;
    practiceAbonado += g.abonado;
    practiceSaldo += g.saldo;
    
    content += `
      <tr>
        <td>${pr ? pr.name : 'Práctica no catalogada'}</td>
        <td>${g.count}</td>
        <td>${formatMoney(g.valor)}</td>
        <td>${formatMoney(g.abonado)}</td>
        <td>${formatMoney(g.saldo)}</td>
      </tr>
    `;
  }
  
  // Agregar fila de totales
  content += `
      <tr class="total-row">
        <td><strong>TOTAL</strong></td>
        <td><strong>${practiceCount}</strong></td>
        <td><strong>${formatMoney(practiceValor)}</strong></td>
        <td><strong>${formatMoney(practiceAbonado)}</strong></td>
        <td><strong>${formatMoney(practiceSaldo)}</strong></td>
      </tr>
    </tbody>
  </table>
  `;
  
  // Agregar distribución por meses si hay datos en un rango de tiempo
  if (desde && hasta) {
    content += `
      <div class="page-break"></div>
      <h3>Distribución Mensual</h3>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th>Cantidad</th>
            <th>Valor Total</th>
            <th>Total Abonado</th>
            <th>Saldo Pendiente</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Agrupar por mes
    const monthlyGroups = new Map();
    filtered.forEach(h => {
      const month = h.fechaISO ? h.fechaISO.substring(0, 7) : '0000-00'; // Formato YYYY-MM
      if (!monthlyGroups.has(month)) {
        monthlyGroups.set(month, {count:0, valor:0, abonado:0, saldo:0});
      }
      const g = monthlyGroups.get(month);
      g.count++;
      g.valor += h.valor || 0;
      g.abonado += h.abonado || 0;
      g.saldo += h.saldo || 0;
    });
    
    // Ordenar por mes
    const sortedMonths = Array.from(monthlyGroups.keys()).sort();
    
    // Agregar filas para cada mes
    for (const month of sortedMonths) {
      const g = monthlyGroups.get(month);
      const monthName = formatMonthYearBA(month);
      
      content += `
        <tr>
          <td>${monthName}</td>
          <td>${g.count}</td>
          <td>${formatMoney(g.valor)}</td>
          <td>${formatMoney(g.abonado)}</td>
          <td>${formatMoney(g.saldo)}</td>
        </tr>
      `;
    }
    
    content += `</tbody></table>`;
  }
  
  // Firma y fecha
  content += `
      <div class="signature-area">
        <div>Firma del Responsable</div>
        <div style="margin-top: 40px;">_________________________________________</div>
        <div>Fecha: ${formatDateBA(new Date())}</div>
      </div>
    </body>
    </html>
  `;
  
  // Escribir el contenido y imprimir
  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
  
  // Esperar a que se cargue el contenido antes de imprimir
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}