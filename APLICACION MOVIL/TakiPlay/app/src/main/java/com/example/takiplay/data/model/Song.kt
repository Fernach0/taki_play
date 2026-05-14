package com.example.takiplay.data.model

import com.google.gson.annotations.SerializedName

data class Song(
    val id: String,
    val title: String,
    val artist: String,
    val album: String? = null,
    val genre: String,
    val language: String,
    val duration: Int,
    val demoUrl: String,
    val fullUrl: String? = null,
    val coverUrl: String? = null,
    val lyrics: String? = null,
    @SerializedName("isActive") val isActive: Boolean = true,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)

data class CreateSongDto(
    val title: String,
    val artist: String,
    val album: String? = null,
    val genre: String,
    val language: String,
    val duration: Int,
    val demoUrl: String,
    val fullUrl: String,
    val coverUrl: String? = null,
    val lyrics: String? = null,
)

data class UpdateSongDto(
    val title: String? = null,
    val artist: String? = null,
    val album: String? = null,
    val genre: String? = null,
    val language: String? = null,
    val duration: Int? = null,
    val demoUrl: String? = null,
    val fullUrl: String? = null,
    val coverUrl: String? = null,
    val lyrics: String? = null,
    @SerializedName("isActive") val isActive: Boolean? = null,
)

// Language values matching the web app
object Language {
    const val SPANISH = "SPANISH"
    const val KICHWA  = "KICHWA"
    const val ACHUAR  = "ACHUAR"
    const val OTHER   = "OTHER"
    const val ALL     = "ALL"
}
