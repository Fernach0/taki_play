package com.example.takiplay.data.api

import com.example.takiplay.data.model.Admin
import com.example.takiplay.data.model.CreateAdminDto
import com.example.takiplay.data.model.LoginDto
import com.example.takiplay.data.model.LoginResponse
import com.example.takiplay.data.model.MessageResponse
import retrofit2.http.*

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body dto: LoginDto): LoginResponse

    @GET("admin")
    suspend fun getAdmins(): List<Admin>

    @POST("admin")
    suspend fun createAdmin(@Body dto: CreateAdminDto): Admin

    @DELETE("admin/{id}")
    suspend fun deleteAdmin(@Path("id") id: String): MessageResponse
}
