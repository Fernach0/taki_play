package com.example.takiplay.data.api

import com.example.takiplay.data.model.*
import retrofit2.http.*

interface QueueApi {
    @POST("queue")
    suspend fun addToQueue(@Body dto: AddToQueueDto): QueueItem

    @GET("queue/table/{tableId}")
    suspend fun getTableQueue(@Path("tableId") tableId: String): TableQueue

    @GET("queue")
    suspend fun getAllQueues(): List<AllQueuesItem>

    @GET("queue/global")
    suspend fun getGlobalQueue(): List<GlobalQueueItem>

    @PATCH("queue/{id}")
    suspend fun updateItem(@Path("id") id: String, @Body dto: UpdateQueueItemDto): QueueItem

    @DELETE("queue/{id}")
    suspend fun removeItem(@Path("id") id: String): MessageResponse
}
