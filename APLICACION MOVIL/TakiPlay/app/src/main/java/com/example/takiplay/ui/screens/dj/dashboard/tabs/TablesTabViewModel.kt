package com.example.takiplay.ui.screens.dj.dashboard.tabs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.takiplay.data.api.ApiClient
import com.example.takiplay.data.model.CreateTableDto
import com.example.takiplay.data.model.Table
import com.example.takiplay.data.model.UpdateTableDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class TablesTabUiState(
    val tables: List<Table> = emptyList(),
    val isLoading: Boolean = true,
    val actionError: String? = null,
    val actionSuccess: String? = null,
)

class TablesTabViewModel : ViewModel() {

    private val _state = MutableStateFlow(TablesTabUiState())
    val state: StateFlow<TablesTabUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                val tables = ApiClient.tables.getTables()
                _state.value = _state.value.copy(tables = tables, isLoading = false)
            } catch (_: Exception) {
                _state.value = _state.value.copy(isLoading = false)
            }
        }
    }

    fun createTable(number: Int, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                ApiClient.tables.createTable(CreateTableDto(number))
                _state.value = _state.value.copy(actionSuccess = "Mesa creada")
                load(); onDone()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error")
            }
        }
    }

    fun toggleActive(table: Table) {
        viewModelScope.launch {
            try {
                ApiClient.tables.updateTable(table.id, UpdateTableDto(isActive = !table.isActive))
                _state.value = _state.value.copy(actionSuccess = "Mesa actualizada")
                load()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error")
            }
        }
    }

    fun deleteTable(id: String) {
        viewModelScope.launch {
            try {
                ApiClient.tables.deleteTable(id)
                _state.value = _state.value.copy(actionSuccess = "Mesa eliminada")
                load()
            } catch (e: Exception) {
                _state.value = _state.value.copy(actionError = e.message ?: "Error")
            }
        }
    }

    fun showSuccess(msg: String) { _state.value = _state.value.copy(actionSuccess = msg) }
    fun clearFeedback() { _state.value = _state.value.copy(actionError = null, actionSuccess = null) }
}
