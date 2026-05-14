package com.example.takiplay.data.model

import com.google.gson.annotations.SerializedName

data class Admin(
    val id: String,
    val name: String,
    val email: String,
    val createdAt: String? = null,
)

data class LoginDto(
    val email: String,
    val password: String,
)

data class LoginResponse(
    @SerializedName("access_token") val accessToken: String,
    val admin: Admin,
)

data class CreateAdminDto(
    val name: String,
    val email: String,
    val password: String,
)

data class SessionData(
    val sessionId: String,
    val tableId: String,
    val tableNumber: Int,
    val clientName: String? = null,
    val createdAt: String,
)

data class JoinTableBody(
    val qrCode: String,
    val clientName: String? = null,
)

data class MessageResponse(
    val message: String,
    val id: String? = null,
)
