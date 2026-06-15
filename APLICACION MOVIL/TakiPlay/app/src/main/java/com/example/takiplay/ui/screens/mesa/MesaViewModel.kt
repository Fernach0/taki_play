package com.example.takiplay.ui.screens.mesa

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.takiplay.data.api.ApiClient
import com.example.takiplay.data.model.*
import com.example.takiplay.util.PreferencesManager
import com.example.takiplay.util.retryWithBackoff
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

data class MesaUiState(
    val songs: List<Song> = emptyList(),
    val loadingSongs: Boolean = true,
    val songsError: String? = null,
    val search: String = "",
    val langFilter: String = Language.ALL,
    val sessionId: String? = null,
    val tableId: String? = null,
    val tableNumber: Int? = null,
    val sessionReady: Boolean = false,
    val queueItems: List<QueueItem> = emptyList(),
    val pendingCount: Int = 0,
    val joiningError: String? = null,
    val requestError: String? = null,
    val requestSuccess: String? = null,
    val isRequesting: Boolean = false,
)

class MesaViewModel(
    private val qrCode: String,
    private val prefs: PreferencesManager,
) : ViewModel() {

    private val _state = MutableStateFlow(MesaUiState())
    val state: StateFlow<MesaUiState> = _state.asStateFlow()

    private var pollingJob: Job? = null

    init {
        joinTable()
        loadSongs()
    }

    private fun joinTable() {
        viewModelScope.launch {
            _state.value = _state.value.copy(joiningError = null)
            try {
                val session = retryWithBackoff {
                    ApiClient.sessions.joinTable(JoinTableBody(qrCode))
                }
                prefs.saveSession(session)
                _state.value = _state.value.copy(
                    sessionId   = session.sessionId,
                    tableId     = session.tableId,
                    tableNumber = session.tableNumber,
                    sessionReady = true,
                )
                startQueuePolling(session.tableId)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    joiningError = "QR inválido o mesa no disponible",
                    sessionReady = false,
                )
            }
        }
    }

    fun retryJoinTable() = joinTable()

    fun loadSongs(search: String? = null, language: String? = null) {
        viewModelScope.launch {
            _state.value = _state.value.copy(loadingSongs = true, songsError = null)
            try {
                val songs = retryWithBackoff {
                    ApiClient.songs.getSongs(
                        search   = search?.ifBlank { null },
                        language = if (language == Language.ALL || language == null) null else language,
                    )
                }
                _state.value = _state.value.copy(songs = songs, loadingSongs = false, songsError = null)
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    loadingSongs = false,
                    songsError = "No se pudo cargar el catálogo. El servidor puede estar despertando, intenta de nuevo.",
                )
            }
        }
    }

    fun retryLoadSongs() {
        loadSongs(
            search = _state.value.search.ifBlank { null },
            language = _state.value.langFilter.takeIf { it != Language.ALL },
        )
    }

    fun setSearch(q: String) {
        _state.value = _state.value.copy(search = q)
        loadSongs(search = q, language = _state.value.langFilter.takeIf { it != Language.ALL })
    }

    fun setLangFilter(lang: String) {
        _state.value = _state.value.copy(langFilter = lang)
        loadSongs(search = _state.value.search.ifBlank { null }, language = lang.takeIf { it != Language.ALL })
    }

    fun requestSong(song: Song) {
        val s = _state.value
        if (!s.sessionReady || s.tableId == null || s.sessionId == null) return
        viewModelScope.launch {
            _state.value = _state.value.copy(isRequesting = true, requestError = null)
            try {
                ApiClient.queue.addToQueue(AddToQueueDto(
                    songId    = song.id,
                    tableId   = s.tableId,
                    sessionId = s.sessionId,
                ))
                _state.value = _state.value.copy(
                    isRequesting   = false,
                    requestSuccess = "\"${song.title}\" agregada a la cola",
                )
                refreshQueue()
            } catch (e: Exception) {
                val msg = e.message ?: "Error al agregar la canción"
                _state.value = _state.value.copy(isRequesting = false, requestError = msg)
            }
        }
    }

    private fun startQueuePolling(tableId: String) {
        pollingJob?.cancel()
        pollingJob = viewModelScope.launch {
            while (isActive) {
                refreshQueue()
                delay(5_000)
            }
        }
    }

    private suspend fun refreshQueue() {
        val tableId = _state.value.tableId ?: return
        try {
            val tq = ApiClient.queue.getTableQueue(tableId)
            _state.value = _state.value.copy(
                queueItems   = tq.items,
                pendingCount = tq.pendingCount,
            )
        } catch (_: Exception) {}
    }

    fun clearRequestFeedback() {
        _state.value = _state.value.copy(requestError = null, requestSuccess = null)
    }

    override fun onCleared() {
        pollingJob?.cancel()
        super.onCleared()
    }
}
