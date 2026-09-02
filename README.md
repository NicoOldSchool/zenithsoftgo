# 🦷 ZenithSoft GO

**Sistema de Gestión Odontológica Profesional**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zenithsoft/zenithsoft-go)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Características

- **👥 Gestión de Pacientes**: Registro completo con datos personales, contacto y observaciones
- **📋 Historias Clínicas**: Seguimiento detallado de tratamientos y evoluciones
- **🦷 Odontograma Digital**: Visualización interactiva de piezas dentales (permanentes y temporales)
- **📊 Estadísticas**: Análisis de datos y reportes en tiempo real
- **🖼️ Gestión de Imágenes**: Adjuntar y visualizar radiografías y fotografías clínicas
- **⚙️ Configuración**: Personalización del profesional y gestión de sesiones
- **🚀 Modo Demo**: Prueba todas las características con datos de ejemplo

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Base de Datos**: IndexedDB (almacenamiento local)
- **Autenticación**: Firebase Authentication
- **Almacenamiento**: Local Storage + IndexedDB
- **Despliegue**: Vercel
- **Responsive**: Diseño adaptable a todos los dispositivos

## 🚀 Despliegue Rápido

### Opción 1: Vercel (Recomendado)

1. **Fork este repositorio**
2. **Ve a [vercel.com](https://vercel.com)**
3. **Conecta tu cuenta de GitHub**
4. **Importa el repositorio**
5. **Despliega automáticamente**

### Opción 2: GitHub Pages

1. **Fork este repositorio**
2. **Ve a Settings > Pages**
3. **Selecciona fuente: Deploy from a branch**
4. **Elige la rama main**
5. **Tu sitio estará disponible en `https://tu-usuario.github.io/zenithsoft-go`**

### Opción 3: Despliegue Local

```bash
# Clonar el repositorio
git clone https://github.com/zenithsoft/zenithsoft-go.git

# Navegar al directorio
cd zenithsoft-go

# Iniciar servidor local
python -m http.server 8080

# Abrir en navegador
open http://localhost:8080
```

## 🔧 Configuración

### Variables de Entorno (Opcional)

Si deseas usar tu propia configuración de Firebase, crea un archivo `config.js`:

```javascript
window.firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

## 📱 Uso

### Modo Demo
- **Acceso inmediato** sin registro
- **Datos de ejemplo** precargados
- **Todas las características** disponibles
- **Ideal para evaluación** del sistema

### Modo Profesional
- **Autenticación segura** con Firebase
- **Datos persistentes** en IndexedDB
- **Backup y restauración** de sesiones
- **Configuración personalizada**

## 🎯 Características Destacadas

### 🔍 Búsqueda Inteligente
- **Búsqueda flexible** por nombre, apellido, DNI, teléfono, email
- **Normalización automática** de texto (acentos, mayúsculas)
- **Búsqueda por iniciales** (ej: "JP" encuentra "Juan Pérez")
- **Búsqueda bidireccional** (apellido nombre / nombre apellido)

### 🦷 Odontograma Avanzado
- **Visualización FDI** estándar internacional
- **Piezas permanentes y temporales**
- **Vista combinada** (ambas denticiones)
- **Interfaz intuitiva** con colores y símbolos

### 📊 Estadísticas en Tiempo Real
- **Conteo de pacientes** por edad
- **Distribución por derivación**
- **Análisis de prácticas** más comunes
- **Gráficos interactivos**

## 🔒 Seguridad

- **Autenticación Firebase** para usuarios profesionales
- **Datos locales** en IndexedDB (no se envían a servidores externos)
- **HTTPS obligatorio** en producción
- **Headers de seguridad** configurados

## 📞 Soporte

- **📧 Email**: jhonnyatrix@gmail.com
- **📞 Teléfono**: 3794-807949
- **🌐 Web**: [ZenithSoft](https://zenithsoft.com)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. **Fork el proyecto**
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit tus cambios** (`git commit -m 'Add some AmazingFeature'`)
4. **Push a la rama** (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

## 📈 Roadmap

- [ ] **App móvil** (PWA)
- [ ] **Sincronización en la nube**
- [ ] **Reportes PDF** avanzados
- [ ] **Integración con sistemas** de facturación
- [ ] **API REST** para integraciones
- [ ] **Multi-usuario** con roles

---

**Desarrollado con ❤️ por ZenithSoft**

*© 2025 ZenithSoft. Todos los derechos reservados.*

