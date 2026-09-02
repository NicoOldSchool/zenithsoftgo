// ================================
// CONFIGURACIÓN DE FIREBASE
// ================================
// 
// INSTRUCCIONES PARA CONFIGURAR FIREBASE:
//
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto o selecciona uno existente
// 3. En la configuración del proyecto, ve a "Configuración del proyecto"
// 4. En la sección "Tus aplicaciones", haz clic en "Agregar app" y selecciona "Web"
// 5. Copia la configuración que aparece y reemplaza los valores en el archivo index.html
//
// CONFIGURACIÓN DE AUTENTICACIÓN:
//
// 1. En el panel de Firebase, ve a "Authentication"
// 2. Haz clic en "Comenzar"
// 3. Ve a la pestaña "Sign-in method"
// 4. Habilita "Correo electrónico/contraseña"
// 5. Opcionalmente, puedes configurar dominios autorizados
//
// CREAR USUARIOS:
//
// 1. En "Authentication" > "Users"
// 2. Haz clic en "Agregar usuario"
// 3. Ingresa el correo electrónico y contraseña
// 4. El usuario podrá iniciar sesión con estas credenciales
//
// CONFIGURACIÓN REAL DE ZENITHSOFT GO:
//
const firebaseConfig = {
  apiKey: "AIzaSyAo-WnAXeohzlqTOA0dWJHCVvo8qsbriLU",
  authDomain: "zenithsoftgo.firebaseapp.com",
  projectId: "zenithsoftgo",
  storageBucket: "zenithsoftgo.appspot.com",
  messagingSenderId: "499909042803",
  appId: "1:499909042803:web:tu-app-id"
};

// NOTAS IMPORTANTES:
// - Mantén tu configuración de Firebase segura
// - No subas las claves API a repositorios públicos
// - Considera usar variables de entorno en producción
// - Los usuarios se crean manualmente desde la consola de Firebase
