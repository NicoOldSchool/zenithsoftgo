// ================================
// CONFIGURACIÓN DE FIREBASE - EJEMPLO
// ================================
// 
// INSTRUCCIONES:
// 1. Copia este archivo como 'config.js'
// 2. Reemplaza los valores con tu configuración real de Firebase
// 3. NO subas 'config.js' a GitHub (agrégalo al .gitignore)
// 4. Este archivo de ejemplo SÍ se puede subir a GitHub

// Configuración de Firebase - ZenithSoft GO
const firebaseConfig = {
  apiKey: "AIzaSyAo-WnAXeohzlqTOA0dWJHCVvo8qsbriLU",
  authDomain: "zenithsoftgo.firebaseapp.com",
  projectId: "zenithsoftgo",
  storageBucket: "zenithsoftgo.appspot.com",
  messagingSenderId: "499909042803",
  appId: "1:499909042803:web:tu-app-id"
};

// Hacer disponible globalmente
window.firebaseConfig = firebaseConfig;
