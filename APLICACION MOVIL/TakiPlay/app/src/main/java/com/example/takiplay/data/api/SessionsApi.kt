package com.example.takiplay.data.api

import com.example.takiplay.data.model.JoinTableBody
import com.example.takiplay.data.model.SessionData
import retrofit2.http.*

interface SessionsApi {
    @POST("sessions/join")
    suspend fun joinTable(@Body body: JoinTableBody): SessionData

    @GET("sessions/{id}")
    suspend fun getSession(@Path("id") id: String): SessionData
}
