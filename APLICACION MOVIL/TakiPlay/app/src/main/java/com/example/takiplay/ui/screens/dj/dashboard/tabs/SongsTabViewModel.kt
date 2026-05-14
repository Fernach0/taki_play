package com.example.takiplay.ui.screens.dj.dashboard.tabs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.takiplay.data.api.ApiClient
import com.example.takiplay.data.model.CreateSongDto
import com.example.takiplay.data.model.Song
import com.example.takiplay.data.model.UpdateSongDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class SongsTabUiState(
    val songs: List<Song> = emptyList(),
    val isLoading: Boolean = true,
    val search: String = "",
    val actionError: String? = null,
    val actionSuccess: String? = null,
)

class SongsTabViewModel : ViewModel() {

    private val _state = MutableStateFlow(SongsTabUiState())
    val state: StateFlow<SongsTabUiState> = _state.asStateFlow()

    init { load() }

    fun load(search: String? = null) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                val songs = ApiClient.songs.getSongs(
                    search = search?.ifBlank { null },
                    includeInactive = true,
                )
                _state.value = _state.value.copy(songs = songs, isLoading = false)
            } catch (_: Exception) {
                _state.value = _state.value.copy(isLoading = false)
            }
        }
    }

    fun setSearch(q: String) {
        _state.value = _state.value.copy(search = q)
        load(search = q)
    }

    fun createSong(dto: CreateSongDto, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                ApiClient.songs.createSong(dto)
                _state.value = _state.value.copy(actionSuccess = "Canción creada")
                load(_state.value.search.ifBlank { null })
                onDone()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error al crear la canción")
            }
        }
    }

    fun updateSong(id: String, dto: UpdateSongDto, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                ApiClient.songs.updateSong(id, dto)
                _state.value = _state.value.copy(actionSuccess = "Canción actualizada")
                load(_state.value.search.ifBlank { null })
                onDone()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error al actualizar")
            }
        }
    }

    fun deleteSong(id: String) {
        viewModelScope.launch {
            try {
                ApiClient.songs.deleteSong(id)
                _state.value = _state.value.copy(actionSuccess = "Canción desactivada")
                load(_state.value.search.ifBlank { null })
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error")
            }
        }
    }

    fun clearFeedback() { _state.value = _state.value.copy(actionError = null, actionSuccess = null) }
}
