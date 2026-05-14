package com.example.takiplay.util

fun formatDuration(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return "%d:%02d".format(m, s)
}

fun timeAgo(isoDate: String): String {
    return try {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US)
        sdf.timeZone = java.util.TimeZone.getTimeZone("UTC")
        val date = sdf.parse(isoDate) ?: return ""
        val diffSec = ((System.currentTimeMillis() - date.time) / 1000).toInt()
        when {
            diffSec < 60   -> "${diffSec}s"
            diffSec < 3600 -> "${diffSec / 60}min"
            else           -> "${diffSec / 3600}h"
        }
    } catch (_: Exception) { "" }
}

fun languageLabel(lang: String): String = when (lang) {
    "SPANISH" -> "ES"
    "KICHWA"  -> "KI"
    "ACHUAR"  -> "SH"
    "OTHER"   -> "+"
    else      -> lang.take(2)
}
