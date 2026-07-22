// src/lib/validators.js

/**
 * 1. Validar Nombres y Apellidos
 * Permite: Letras, tildes (á,é,í,ó,ú), eñes (ñ,Ñ), diéresis (ü,Ü) y espacios.
 * Prohíbe: Números y símbolos raros (@, #, $, %, &, *, +, =, _, etc.)
 */
export const validarNombre = (nombre) => {
  if (!nombre || !nombre.trim()) return "El campo es obligatorio"
  if (nombre.trim().length < 2) return "Debe tener al menos 2 caracteres"
  
  // RegEx con soporte completo para idioma español
  const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
  if (!regexNombre.test(nombre)) {
    return "No se permiten números ni caracteres especiales"
  }
  return null
}

/**
 * 2. Validar Teléfono (Perú / 9 dígitos)
 * Exige exactamente 9 dígitos numéricos y que empiece con 9.
 */
export const validarTelefono = (telefono) => {
  if (!telefono) return "El teléfono es obligatorio"
  const limpio = telefono.toString().trim()
  
  if (!/^\d+$/.test(limpio)) return "Solo se permiten números"
  if (limpio.length !== 9) return "El teléfono debe tener exactamente 9 dígitos"
  if (!limpio.startsWith('9')) return "El número de teléfono debe empezar con 9"
  
  return null
}

/**
 * 3. Validar Correo Electrónico
 * Obliga a que el correo termine únicamente en @gmail.com o @hotmail.com
 */
export const validarCorreo = (email) => {
  if (!email || !email.trim()) return "El correo es obligatorio"
  
  const regexCorreoRestringido = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i
  if (!regexCorreoRestringido.test(email.trim())) {
    return "El correo debe terminar en @gmail.com o @hotmail.com"
  }
  return null
}