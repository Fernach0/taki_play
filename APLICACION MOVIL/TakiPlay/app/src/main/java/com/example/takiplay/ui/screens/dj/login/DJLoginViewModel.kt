package com.example.takiplay.ui.screens.dj.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.takiplay.data.api.ApiClient
import com.example.takiplay.data.model.LoginDto
import com.example.takiplay.util.PreferencesManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class LoginUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false,
)

class DJLoginViewModel(private val prefs: PreferencesManager) : ViewModel() {

    private val _state = MutableStateFlow(LoginUiState())
    val state: StateFlow<LoginUiState> = _state.asStateFlow()

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _state.value = _state.value.copy(error = "Email y contraseña son requeridos")
            return
        }
        viewModelScope.launch {
            _state.value = LoginUiState(isLoading = true)
            try {
                val response = ApiClient.auth.login(LoginDto(email.trim(), password))
                prefs.saveAuth(response.accessToken, response.admin)
                _state.value = LoginUiState(success = true)
            } catch (e: Exception) {
                val msg = when {
                    e.message?.contains("401") == true -> "Email o contraseña incorrectos"
                    e.message?.contains("Unable to resolve") == true -> "Sin conexión al servidor"
                    else -> e.message ?: "Error al iniciar sesión"
                }
                _state.value = LoginUiState(error = msg)
            }
        }
    }

    fun clearError() { _state.value = _state.value.copy(error = null) }
}
