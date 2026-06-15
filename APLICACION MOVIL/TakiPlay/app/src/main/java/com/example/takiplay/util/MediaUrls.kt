package com.example.takiplay.util

import com.example.takiplay.data.api.ApiClient

// El backend ya no devuelve coverUrl/demoUrl/fullUrl: las imágenes y audios
// se sirven como binarios desde estos endpoints, construidos a partir del id.
fun coverUrlFor(songId: String): String = "${ApiClient.BASE_URL}songs/$songId/cover"
fun demoUrlFor(songId: String): String = "${ApiClient.BASE_URL}songs/$songId/demo"
fun fullUrlFor(songId: String): String = "${ApiClient.BASE_URL}songs/$songId/full"
