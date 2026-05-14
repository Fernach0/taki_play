package com.example.takiplay.ui.screens.dj.dashboard.tabs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.takiplay.data.api.ApiClient
import com.example.takiplay.data.model.AllQueuesItem
import com.example.takiplay.data.model.GlobalQueueItem
import com.example.takiplay.data.model.QueueStatus
import com.example.takiplay.data.model.UpdateQueueItemDto
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

data class QueueTabUiState(
    val globalQueue: List<GlobalQueueItem> = emptyList(),
    val allQueues: List<AllQueuesItem> = emptyList(),
    val isLoading: Boolean = true,
    val actionError: String? = null,
    val actionSuccess: String? = null,
)

class QueueTabViewModel : ViewModel() {

    private val _state = MutableStateFlow(QueueTabUiState())
    val state: StateFlow<QueueTabUiState> = _state.asStateFlow()

    private var pollingJob: Job? = null

    init { startPolling() }

    private fun startPolling() {
        pollingJob?.cancel()
        pollingJob = viewModelScope.launch {
            while (isActive) {
                refresh()
                delay(4_000)
            }
        }
    }

    private suspend fun refresh() {
        try {
            val global = ApiClient.queue.getGlobalQueue()
            val all    = ApiClient.queue.getAllQueues()
            _state.value = _state.value.copy(globalQueue = global, allQueues = all, isLoading = false)
        } catch (_: Exception) {
            _state.value = _state.value.copy(isLoading = false)
        }
    }

    fun markPlaying(id: String) {
        viewModelScope.launch {
            try {
                ApiClient.queue.updateItem(id, UpdateQueueItemDto(status = QueueStatus.PLAYING))
                _state.value = _state.value.copy(actionSuccess = "Reproduciendo canción")
                refresh()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error")
            }
        }
    }

    fun markDone(id: String) {
        viewModelScope.launch {
            try {
                ApiClient.queue.updateItem(id, UpdateQueueItemDto(status = QueueStatus.PLAYED))
                _state.value = _state.value.copy(actionSuccess = "Canción marcada como terminada")
                refresh()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error")
            }
        }
    }

    fun removeItem(id: String) {
        viewModelScope.launch {
            try {
                ApiClient.queue.removeItem(id)
                _state.value = _state.value.copy(actionSuccess = "Canción eliminada de la cola")
                refresh()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error")
            }
        }
    }

    fun clearFeedback() {
        _state.value = _state.value.copy(actionError = null, actionSuccess = null)
    }

    override fun onCleared() {
        pollingJob?.cancel()
        super.onCleared()
    }
}
