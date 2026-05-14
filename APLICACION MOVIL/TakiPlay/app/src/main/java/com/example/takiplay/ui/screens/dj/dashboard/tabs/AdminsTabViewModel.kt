package com.example.takiplay.ui.screens.dj.dashboard.tabs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.takiplay.data.api.ApiClient
import com.example.takiplay.data.model.Admin
import com.example.takiplay.data.model.CreateAdminDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AdminsTabUiState(
    val admins: List<Admin> = emptyList(),
    val isLoading: Boolean = true,
    val actionError: String? = null,
    val actionSuccess: String? = null,
)

class AdminsTabViewModel : ViewModel() {

    private val _state = MutableStateFlow(AdminsTabUiState())
    val state: StateFlow<AdminsTabUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                val admins = ApiClient.auth.getAdmins()
                _state.value = _state.value.copy(admins = admins, isLoading = false)
            } catch (_: Exception) {
                _state.value = _state.value.copy(isLoading = false)
            }
        }
    }

    fun createAdmin(dto: CreateAdminDto, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                ApiClient.auth.createAdmin(dto)
                _state.value = _state.value.copy(actionSuccess = "Administrador creado")
                load(); onDone()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error al crear el administrador")
            }
        }
    }

    fun deleteAdmin(id: String) {
        viewModelScope.launch {
            try {
                ApiClient.auth.deleteAdmin(id)
                _state.value = _state.value.copy(actionSuccess = "Administrador eliminado")
                load()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error")
            }
        }
    }

    fun clearFeedback() { _state.value = _state.value.copy(actionError = null, actionSuccess = null) }
}
