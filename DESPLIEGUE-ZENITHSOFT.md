# Despliegue ZenithSoft GO - Firebase Hosting

## ✅ Configuración Completada

Tu proyecto está configurado con:
- **ID del Proyecto**: `zenithsoftgo`
- **Número del Proyecto**: `499909042803`
- **API Key**: `AIzaSyAo-WnAXeohzlqTOA0dWJHCVvo8qsbriLU`

### Archivos Configurados:
- ✅ `.firebaserc` - Proyecto configurado como `zenithsoftgo`
- ✅ `firebase.json` - Configuración de hosting optimizada
- ✅ `index.html` - Configuración de Firebase integrada
- ✅ `config.example.js` - Configuración de ejemplo actualizada
- ✅ `.github/workflows/firebase-hosting-merge.yml` - Despliegue automático
- ✅ `.gitignore` - Archivos de Firebase protegidos

## 🚀 Próximos Pasos para Desplegar

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Iniciar Sesión en Firebase
```bash
firebase login
```

### 3. Verificar Configuración
```bash
firebase projects:list
```
Deberías ver `zenithsoftgo` en la lista.

### 4. Configurar Seguridad de la API Key (Recomendado)
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto `zenithsoftgo`
3. Ve a "Project Settings" > "General"
4. En "Web API Key", haz clic en "Restrict key"
5. Agrega restricciones por HTTP referrer:
   - `https://zenithsoftgo.web.app/*`
   - `https://zenithsoftgo.firebaseapp.com/*`
   - `http://localhost:*` (para desarrollo)

### 5. Configurar Firebase Authentication
1. En Firebase Console, ve a "Authentication" > "Get started"
2. Habilita "Email/Password" en "Sign-in method"
3. Los dominios autorizados ya incluyen:
   - `zenithsoftgo.web.app`
   - `zenithsoftgo.firebaseapp.com`
   - `localhost`

### 6. Crear Usuarios
1. En Firebase Console > Authentication > Users
2. Haz clic en "Add user"
3. Ingresa email y contraseña
4. Repite para cada usuario que necesites

### 7. Configurar la Aplicación (Opcional)
```bash
# Crear archivo de configuración local
cp config.example.js config.js
# Editar config.js con tu configuración real de Firebase
```

### 8. Desplegar
```bash
firebase deploy
```

## 🌐 URLs de Acceso

Una vez desplegado, tu aplicación estará disponible en:
- **Principal**: https://zenithsoftgo.web.app
- **Alternativa**: https://zenithsoftgo.firebaseapp.com

## 🔧 Comandos Útiles

```bash
# Servir localmente
firebase serve

# Desplegar solo hosting
firebase deploy --only hosting

# Ver estado del proyecto
firebase projects:list

# Ver logs
firebase hosting:channel:list
```

## 📱 Prueba del Sistema

1. Abre https://zenithsoftgo.web.app
2. Deberías ver la pantalla de login
3. Usa las credenciales que creaste en Firebase Console
4. Accede a la aplicación principal

## 🆘 Si Algo Sale Mal

### Error: "Project not found"
- Verifica que el proyecto `zenithsoftgo` exista en Firebase Console
- Confirma que tengas permisos en el proyecto

### Error: "Authentication not configured"
- Ve a Firebase Console > Authentication
- Habilita "Email/Password" en Sign-in method

### Error: "Domain not authorized"
- Los dominios de Firebase Hosting se configuran automáticamente
- Si usas dominio personalizado, agrégalo en Authentication > Settings

## 📞 Soporte

- Email: jhonnyatrix@gmail.com
- Tel: 3794-807949

---

**¡Tu aplicación ZenithSoft GO está lista para desplegarse en Firebase Hosting!** 🎉
