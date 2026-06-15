package com.example.takiplay.util

import kotlinx.coroutines.delay
import kotlinx.coroutines.withTimeout

// El backend (Render) y la base de datos (Supabase) usan planes gratuitos que
// "duermen" tras inactividad: la primera petición tras un periodo inactivo
// puede tardar varios segundos en despertar o fallar de forma transitoria.
// Reintentamos un par de veces con backoff antes de mostrar un error.
private val RETRY_DELAYS_MS = listOf(3_000L, 8_000L)

// Tiempo máximo por intento. La resolución DNS en algunos emuladores puede
// "colgarse" indefinidamente sin respetar el connectTimeout de OkHttp, así
// que forzamos un límite a nivel de corrutina que sí cancela la llamada.
private const val ATTEMPT_TIMEOUT_MS = 25_000L

suspend fun <T> retryWithBackoff(block: suspend () -> T): T {
    var lastError: Exception? = null
    repeat(RETRY_DELAYS_MS.size + 1) { attempt ->
        try {
            return withTimeout(ATTEMPT_TIMEOUT_MS) { block() }
        } catch (e: Exception) {
            lastError = e
            if (attempt < RETRY_DELAYS_MS.size) delay(RETRY_DELAYS_MS[attempt])
        }
    }
    throw lastError ?: IllegalStateException("Unknown error")
}
