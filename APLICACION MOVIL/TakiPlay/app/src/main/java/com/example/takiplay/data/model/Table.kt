package com.example.takiplay.data.model

data class Table(
    val id: String,
    val number: Int,
    val qrCode: String,
    val isActive: Boolean,
    val pendingQueueCount: Int? = null,
    val createdAt: String,
)

data class CreateTableDto(val number: Int)

data class UpdateTableDto(
    val number: Int? = null,
    val isActive: Boolean? = null,
)
