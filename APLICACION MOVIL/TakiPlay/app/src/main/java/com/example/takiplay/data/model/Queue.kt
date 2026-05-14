package com.example.takiplay.data.model

data class QueueSong(
    val id: String,
    val title: String,
    val artist: String,
    val genre: String,
    val language: String,
    val coverUrl: String? = null,
    val fullUrl: String? = null,
)

data class QueueItem(
    val id: String,
    val tableId: String,
    val songId: String,
    val song: QueueSong,
    val requestedBy: String? = null,
    val status: String,
    val position: Int,
    val createdAt: String,
    val updatedAt: String,
)

data class TableQueue(
    val tableId: String,
    val tableNumber: Int,
    val items: List<QueueItem>,
    val pendingCount: Int,
)

data class GlobalQueueItem(
    val id: String,
    val tableId: String,
    val tableNumber: Int,
    val song: QueueSong,
    val requestedBy: String? = null,
    val position: Int,
    val createdAt: String,
    val status: String,
)

data class CurrentlyPlayingSong(
    val id: String,
    val title: String,
    val artist: String,
    val fullUrl: String? = null,
)

data class CurrentlyPlaying(
    val id: String,
    val song: CurrentlyPlayingSong,
)

data class AllQueuesItem(
    val tableId: String,
    val tableNumber: Int,
    val pendingCount: Int,
    val currentlyPlaying: CurrentlyPlaying? = null,
)

data class AddToQueueDto(
    val songId: String,
    val tableId: String,
    val sessionId: String,
    val requestedBy: String? = null,
)

data class UpdateQueueItemDto(
    val status: String? = null,
    val position: Int? = null,
)

// Status constants
object QueueStatus {
    const val PENDING   = "PENDING"
    const val PLAYING   = "PLAYING"
    const val PLAYED    = "PLAYED"
    const val CANCELLED = "CANCELLED"
}
