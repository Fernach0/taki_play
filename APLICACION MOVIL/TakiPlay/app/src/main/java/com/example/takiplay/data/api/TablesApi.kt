package com.example.takiplay.data.api

import com.example.takiplay.data.model.CreateTableDto
import com.example.takiplay.data.model.MessageResponse
import com.example.takiplay.data.model.Table
import com.example.takiplay.data.model.UpdateTableDto
import retrofit2.http.*

interface TablesApi {
    @GET("tables")
    suspend fun getTables(): List<Table>

    @GET("tables/{id}")
    suspend fun getTable(@Path("id") id: String): Table

    @POST("tables")
    suspend fun createTable(@Body dto: CreateTableDto): Table

    @PATCH("tables/{id}")
    suspend fun updateTable(@Path("id") id: String, @Body dto: UpdateTableDto): Table

    @DELETE("tables/{id}")
    suspend fun deleteTable(@Path("id") id: String): MessageResponse
}
