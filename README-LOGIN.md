# Sistema de Login con Firebase - ZenithSoft GO

## Descripción
Se ha implementado un sistema de autenticación completo para la aplicación ZenithSoft GO utilizando Firebase Authentication. El sistema incluye:

- Pantalla de login moderna y responsive
- Autenticación por correo electrónico y contraseña
- Protección de la aplicación principal
- Gestión de sesiones
- Interfaz de usuario intuitiva

## Características

### ✅ Implementado
- [x] Pantalla de login con diseño moderno
- [x] Autenticación con Firebase
- [x] Protección de rutas
- [x] Gestión de sesiones
- [x] Botón de cerrar sesión
- [x] Manejo de errores
- [x] Estados de carga
- [x] Diseño responsive

### 🔧 Configuración Requerida
- [ ] Configurar proyecto en Firebase
- [ ] Habilitar Authentication
- [ ] Crear usuarios manualmente

## Instrucciones de Configuración para GitHub Pages

### 1. Configurar Firebase para GitHub Pages

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En "Configuración del proyecto" > "Tus aplicaciones"
4. Haz clic en "Agregar app" y selecciona "Web"
5. Copia la configuración que aparece

### 2. Configurar Dominios Autorizados

**IMPORTANTE**: Para Firebase Hosting, los dominios se configuran automáticamente, pero puedes agregar más:

1. En Firebase Console, ve a "Authentication" > "Settings" > "Authorized domains"
2. Los dominios por defecto incluyen:
   - `zenithsoftgo.web.app` (dominio de Firebase Hosting)
   - `zenithsoftgo.firebaseapp.com` (dominio alternativo)
   - `localhost` (para desarrollo local)
3. Puedes agregar dominios personalizados si los tienes

### 3. Actualizar la Configuración

En el archivo `index.html`, reemplaza la configuración de Firebase:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-real",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

### 4. Configurar GitHub Pages

1. En tu repositorio de GitHub, ve a "Settings"
2. Scroll hasta "Pages" en el menú lateral
3. En "Source", selecciona "Deploy from a branch"
4. Selecciona "main" branch y "/ (root)" folder
5. Haz clic en "Save"
6. Tu sitio estará disponible en: `https://tu-usuario.github.io/tu-repositorio`

### 3. Habilitar Authentication

1. En Firebase Console, ve a "Authentication"
2. Haz clic en "Comenzar"
3. Ve a "Sign-in method"
4. Habilita "Correo electrónico/contraseña"

### 5. Habilitar Authentication

1. En Firebase Console, ve a "Authentication"
2. Haz clic en "Comenzar"
3. Ve a "Sign-in method"
4. Habilita "Correo electrónico/contraseña"

### 6. Crear Usuarios

Los usuarios se crean manualmente desde Firebase Console:

1. En "Authentication" > "Users"
2. Haz clic en "Agregar usuario"
3. Ingresa correo electrónico y contraseña
4. El usuario podrá iniciar sesión con estas credenciales

## Consideraciones de Seguridad para GitHub Pages

### ⚠️ IMPORTANTE: Seguridad en Repositorios Públicos

**Si tu repositorio es público**, considera estas opciones:

#### Opción 1: Usar Variables de Entorno (Recomendado)
1. Crea un archivo `config.js` (NO lo subas a GitHub)
2. Agrega `config.js` al `.gitignore`
3. Crea `config.example.js` con valores de ejemplo

#### Opción 2: Restringir API Key
1. En Firebase Console, ve a "Project Settings" > "General"
2. En "Web API Key", haz clic en "Restrict key"
3. Agrega restricciones por HTTP referrer:
   - `https://tu-usuario.github.io/*`
   - `http://localhost:*` (para desarrollo)

#### Opción 3: Usar Firebase Hosting (Alternativa)
Considera usar Firebase Hosting en lugar de GitHub Pages para mayor seguridad.

### Configuración de Seguridad Adicional

1. **Reglas de Firestore** (si usas base de datos):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

2. **Configurar CORS** si es necesario
3. **Monitorear uso** en Firebase Console

## Despliegue en Firebase Hosting

### Ventajas de Firebase Hosting

- ✅ **Integración nativa** con Firebase Authentication
- ✅ **SSL automático** y certificados HTTPS
- ✅ **CDN global** para carga rápida
- ✅ **Dominios personalizados** gratuitos
- ✅ **Despliegue automático** con GitHub Actions
- ✅ **Rollback fácil** a versiones anteriores
- ✅ **Monitoreo integrado** de rendimiento

### Pasos para Desplegar

1. **Instalar Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Iniciar sesión en Firebase**:
   ```bash
   firebase login
   ```

3. **Inicializar el proyecto**:
   ```bash
   firebase init hosting
   ```
   - Selecciona tu proyecto de Firebase
   - Public directory: `.` (punto)
   - Single-page app: `Yes`
   - Overwrite index.html: `No`

4. **Configurar el proyecto**:
   - El archivo `.firebaserc` ya está configurado con el proyecto `zenithsoftgo`
   - Edita `firebase.json` si necesitas ajustes

5. **Crear config.js** (Recomendado):
   ```bash
   cp config.example.js config.js
   # Edita config.js con tu configuración real
   ```

6. **Desplegar**:
   ```bash
   firebase deploy
   ```

### Comandos Útiles de Firebase

```bash
# Servir localmente
firebase serve

# Desplegar solo hosting
firebase deploy --only hosting

# Ver logs
firebase hosting:channel:list

# Crear canal de preview
firebase hosting:channel:deploy preview

# Configurar dominio personalizado
firebase hosting:sites:list
```

### URLs de Ejemplo
- **Desarrollo local**: `http://localhost:5000` (con `firebase serve`)
- **Firebase Hosting**: `https://zenithsoftgo.web.app`
- **Dominio alternativo**: `https://zenithsoftgo.firebaseapp.com`
- **Dominio personalizado**: `https://tu-dominio.com` (si lo configuras)

## Despliegue en GitHub Pages (Alternativa)

### Pasos para Desplegar

1. **Subir el Código a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit with login system"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/tu-repositorio.git
   git push -u origin main
   ```

2. **Configurar GitHub Pages**:
   - Ve a tu repositorio en GitHub
   - Settings > Pages
   - Source: "Deploy from a branch"
   - Branch: "main" / "/ (root)"
   - Save

3. **Configurar Firebase**:
   - Agrega tu dominio de GitHub Pages a los dominios autorizados
   - Ejemplo: `tu-usuario.github.io`

4. **Crear config.js** (Recomendado):
   ```bash
   cp config.example.js config.js
   # Edita config.js con tu configuración real
   ```

### URLs de Ejemplo
- **Desarrollo local**: `http://localhost:3000`
- **GitHub Pages**: `https://tu-usuario.github.io/tu-repositorio`

## Uso del Sistema

### Para el Usuario
1. Abre la aplicación en GitHub Pages
2. Ingresa tu correo electrónico y contraseña
3. Haz clic en "Iniciar Sesión"
4. Accede a la aplicación principal
5. Usa el botón "Cerrar Sesión" para salir

### Para el Administrador
- Los usuarios se crean desde Firebase Console
- No hay registro automático (como se solicitó)
- Puedes gestionar usuarios desde el panel de Firebase

## Características de Seguridad

- ✅ Autenticación requerida para acceder a la aplicación
- ✅ Sesiones persistentes
- ✅ Protección contra ataques de fuerza bruta (Firebase)
- ✅ Validación de entrada
- ✅ Manejo seguro de errores

## Estructura de Archivos

```
├── index.html              # Estructura HTML con login
├── style.css              # Estilos incluyendo login
├── javascript.js          # Lógica de autenticación
├── firebase-config-example.js  # Ejemplo de configuración
└── README-LOGIN.md        # Este archivo
```

## Personalización

### Cambiar Colores
Los colores del login se pueden personalizar en `style.css`:

```css
.login-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-login {
    background: linear-gradient(135deg, var(--accent) 0%, #1e40af 100%);
}
```

### Cambiar Textos
Los textos se pueden modificar directamente en `index.html`:

```html
<h1>ZenithSoft GO</h1>
<p>Sistemas de Gestión Odontológica</p>
```

## Solución de Problemas

### Error: "Firebase not initialized"
- Verifica que la configuración de Firebase esté correcta
- Asegúrate de que las claves API sean válidas
- Si usas `config.js`, verifica que el archivo exista y tenga la configuración correcta

### Error: "User not found"
- Verifica que el usuario exista en Firebase Console
- Confirma que el correo electrónico esté escrito correctamente

### Error de conexión
- Verifica tu conexión a internet
- Confirma que el proyecto Firebase esté activo

### Problemas Específicos de GitHub Pages

#### Error: "This domain is not authorized"
1. Ve a Firebase Console > Authentication > Settings
2. En "Authorized domains", agrega:
   - `tu-usuario.github.io`
   - `localhost` (para desarrollo)

#### Error: "CORS policy"
- Verifica que el dominio esté en los dominios autorizados
- Asegúrate de que la URL sea exacta (con/sin www)

#### La aplicación no carga en GitHub Pages
1. Verifica que GitHub Pages esté habilitado
2. Confirma que el archivo `index.html` esté en la raíz
3. Espera unos minutos para que se propague el cambio

#### Error: "config.js not found"
- Es normal si no usas archivo de configuración externa
- La aplicación usará la configuración por defecto del HTML

## Soporte

Para soporte técnico:
- Email: jhonnyatrix@gmail.com
- Tel: 3794-807949

---

**Desarrollado por ZenithSoft**  
© 2025 - Versión 1.0
