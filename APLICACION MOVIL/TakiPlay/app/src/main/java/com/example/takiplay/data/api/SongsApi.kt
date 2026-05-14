package com.example.takiplay.data.api

import com.example.takiplay.data.model.CreateSongDto
import com.example.takiplay.data.model.MessageResponse
import com.example.takiplay.data.model.Song
import com.example.takiplay.data.model.UpdateSongDto
import retrofit2.http.*

interface SongsApi {
    @GET("songs")
    suspend fun getSongs(
        @Query("search") search: String? = null,
        @Query("language") language: String? = null,
        @Query("includeInactive") includeInactive: Boolean? = null,
    ): List<Song>

    @GET("songs/{id}")
    suspend fun getSong(@Path("id") id: String): Song

    @POST("songs")
    suspend fun createSong(@Body dto: CreateSongDto): Song

    @PATCH("songs/{id}")
    suspend fun updateSong(@Path("id") id: String, @Body dto: UpdateSongDto): Song

    @DELETE("songs/{id}")
    suspend fun deleteSong(@Path("id") id: String): MessageResponse
}
