package com.example.takiplay.ui.screens.dj.forgotpassword

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.takiplay.data.api.ApiClient
import com.example.takiplay.data.model.ForgotPasswordDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ForgotPasswordUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val sent: Boolean = false,
)

class DJForgotPasswordViewModel : ViewModel() {

    private val _state = MutableStateFlow(ForgotPasswordUiState())
    val state: StateFlow<ForgotPasswordUiState> = _state.asStateFlow()

    fun submit(email: String) {
        if (email.isBlank()) {
            _state.value = _state.value.copy(error = "El email es requerido")
            return
        }
        viewModelScope.launch {
            _state.value = ForgotPasswordUiState(isLoading = true)
            try {
                ApiClient.auth.forgotPassword(ForgotPasswordDto(email.trim()))
                _state.value = ForgotPasswordUiState(sent = true)
            } catch (e: Exception) {
                _state.value = ForgotPasswordUiState(error = e.message ?: "Error al enviar el correo")
            }
        }
    }

    fun clearError() { _state.value = _state.value.copy(error = null) }
}
