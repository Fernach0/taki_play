package com.example.takiplay.ui.screens.tableselection

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.takiplay.data.api.ApiClient
import com.example.takiplay.data.model.Table
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class TableSelectionUiState(
    val tables: List<Table> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
)

class TableSelectionViewModel : ViewModel() {

    private val _state = MutableStateFlow(TableSelectionUiState())
    val state: StateFlow<TableSelectionUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = TableSelectionUiState(isLoading = true)
            try {
                val all = ApiClient.tables.getTables()
                val active = all.filter { it.isActive }
                _state.value = TableSelectionUiState(tables = active, isLoading = false)
            } catch (e: Exception) {
                _state.value = TableSelectionUiState(
                    isLoading = false,
                    error = "No se pudieron cargar las mesas. Verifica tu conexión.",
                )
            }
        }
    }
}
